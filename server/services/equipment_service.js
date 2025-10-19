// services/equipment.service.js (예시)

// DB 호출 유틸(당신 프로젝트 기준)
const mariadb = require("../database/mapper.js");
const { EQUIP_STATUS } = require("../constants/equipment");

// SQL 템플릿 모음 (당신 파일 경로 기준)
const {
  searchEquipList,
  insertEquip, // INSERT INTO equipment(11개 컬럼) VALUES (?,?,?,?,?,?,?,?,?,?,?)
  updateEquip, // UPDATE ... SET equip_name=?, equip_type=?, manager=?, equip_status=?, insp_cycle=? WHERE equip_code=?
  deleteEquip, // DELETE FROM equipment WHERE equip_code=?
  selectEquipByCode, // SELECT * FROM equipment WHERE equip_code=?
  selectEquipType,
  insertDowntime,
} = require("../database/sqls/equipform.js");

/* =========================
 * 공통 유틸 영역 (설명하기 쉬운 이름/주석)
 * ========================= */

// 'YYYY-MM-DD HH:mm:ss' 포맷 허용 헬퍼
function toYmdHmsOrNull(v) {
  if (!v) return null;
  const pad = (n) => String(n).padStart(2, "0");
  if (v instanceof Date) {
    const d = v;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  const s = toNullTrim(v);
  return typeof s === "string" &&
    /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(s)
    ? s
    : null;
}
function makeDowntimeCode() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const hms = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(
    d.getSeconds()
  )}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DT-${ymd}-${hms}-${rnd}`;
}

// 1) 공백/빈문자 → null (DB에 깔끔하게 저장하기 위함)
function toNullTrim(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
}

// 2) camelCase/snake_case 둘 다 허용해서 값 꺼내기
//    - payload.equip_code 가 있으면 그걸 쓰고, 없으면 payload.equipCode 를 씁니다.
function pick(obj, snakeKey, camelKey) {
  if (!obj) return null;
  return obj[snakeKey] ?? obj[camelKey] ?? null;
}

// 3) 상태값/주기처럼 숫자형이 필요한 입력 처리
//    - 프론트가 "RUN/STOP/MAINT" 같은 문자열을 보낼 수도 있으니 매핑 테이블 지원
const STATUS_MAP = { RUN: 1, STOP: 0, MAINT: 2 };
function toNumOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  // 문자열 상태코드 지원
  if (typeof v === "string" && STATUS_MAP[v] !== undefined)
    return STATUS_MAP[v];
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// 4) 'YYYY-MM-DD' 형식만 허용(선택) — DB DATE 컬럼 가드용
const isYMD = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
function toYmdOrNull(v) {
  const s = toNullTrim(v);
  return s && isYMD(s) ? s : null;
}

async function viewList() {
  try {
    const result = await mariadb.query(selectEquipType);
    return result;
  } catch (err) {
    console.error("viewList 오류", err);
  }
}

// 단건 상세
async function getOne(equip_code) {
  const code = (equip_code ?? "").trim();
  if (!code) {
    const err = new Error("equip_code가 필요합니다");
    err.status = 400;
    throw err;
  }
  const rows = await mariadb.query(selectEquipByCode, [code]);
  if (!rows || rows.length === 0) {
    const err = new Error("설비를 찾을 수 없습니다");
    err.status = 404;
    throw err;
  }
  return rows[0]; // snake_case 그대로 반환(프론트에서 toCamel 사용)
}

/* =========================
 * 다건 조회
 * ========================= */
async function list(filters = {}) {
  const {
    equipCode, // 부분 검색
    equipName, // 부분 검색
    equipType, // 정확 일치
    equipStatus, // 숫자 또는 문자열 상태
    limit, // 페이지 사이즈(옵션)
    offset, // 시작 위치(옵션)
  } = filters;

  let sql = searchEquipList;

  const params = [];

  const _equipCode = toNullTrim(equipCode);
  const _equipName = toNullTrim(equipName);
  const _equipType = toNullTrim(equipType);
  const _equipStatus = toNullTrim(equipStatus);

  if (_equipCode) {
    sql += ` AND e.equip_code LIKE ?`;
    params.push(`%${_equipCode}%`);
  }
  if (_equipName) {
    sql += ` AND e.equip_name LIKE ?`;
    params.push(`%${_equipName}%`);
  }
  if (_equipType) {
    sql += ` AND e.equip_type = ?`;
    params.push(_equipType);
  }
  if (_equipStatus) {
    sql += ` AND e.equip_status = ?`;
    params.push(_equipStatus);
  }

  sql += ` ORDER BY e.equip_code`;

  // 페이지네이션 (옵션)
  if (Number.isInteger(Number(limit)) && Number.isInteger(Number(offset))) {
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
  }

  return await mariadb.query(sql, params);
}

/* =========================
 * 등록 (11개 컬럼 모두)
 * - 프론트가 camelCase로 보내도 되고, 서버가 snake_case로 받아도 됩니다.
 * - pick()으로 둘 다 지원합니다.
 * ========================= */
async function create(payload = {}) {
  // 1) 입력 매핑 + 정리
  const equipCode = toNullTrim(pick(payload, "equip_code", "equipCode"));
  const equipName = toNullTrim(pick(payload, "equip_name", "equipName"));
  const equipType = toNullTrim(pick(payload, "equip_type", "equipType"));
  const manager = toNullTrim(pick(payload, "manager", "manager"));

  const equipStatus =
    toNullTrim(pick(payload, "equip_status", "equipStatus")) || "j2";
  const inspCycle = toNullTrim(pick(payload, "insp_cycle", "inspCycle"));

  const installDate = toYmdOrNull(pick(payload, "install_date", "installDate")); // 'YYYY-MM-DD'
  const modelName = toNullTrim(pick(payload, "model_name", "modelName"));
  const equipImage = toNullTrim(pick(payload, "equip_image", "equipImage")); // URL/경로 (파일업로드면 라우터에서 req.file로 경로 생성)
  const mfgDt = toYmdOrNull(pick(payload, "mfg_dt", "mfgDt")); // 'YYYY-MM-DD'
  const maker = toNullTrim(pick(payload, "maker", "maker"));

  // 2) 필수값 가드 — 왜 필요한지 설명하기 쉬움
  //    최소한의 기준(코드/이름/타입)이 없으면 등록 자체를 막습니다.
  const missing = [];
  if (!equipCode) missing.push("equip_code");
  if (!equipName) missing.push("equip_name");
  if (!equipType) missing.push("equip_type");
  if (missing.length) {
    const err = new Error(`필수값 누락: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  // 3) INSERT 파라미터 — SQL의 컬럼 순서와 반드시 일치해야 합니다.
  const params = [
    equipCode,
    equipName,
    manager,
    inspCycle,
    installDate,
    modelName,
    equipImage,
    mfgDt,
    maker,
    equipType,
    equipStatus,
  ];

  console.log(params);

  // 4) DB 실행 + 에러 매핑(중복코드 등)
  try {
    const result = await mariadb.query(insertEquip, params);
    return { id: result.insertId, affectedRows: result.affectedRows };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const e = new Error("이미 존재하는 설비코드입니다.");
      e.status = 409;
      throw e;
    }
    throw err;
  }
}

/* =========================
 * 수정
 * - 현재 updateEquip SQL이 핵심 컬럼만 SET한다고 가정(이름/타입/담당자/상태/주기)
 * - 필요하면 이 함수도 동적 UPDATE로 확장 가능
 * ========================= */
async function update(equip_code, payload = {}) {
  const code = toNullTrim(equip_code);
  if (!code) {
    const err = new Error("equip_code가 필요합니다");
    err.status = 400;
    throw err;
  }

  const equip_name = toNullTrim(pick(payload, "equip_name", "equipName"));
  const equip_type = toNullTrim(pick(payload, "equip_type", "equipType"));
  const manager = toNullTrim(pick(payload, "manager", "manager"));
  const equip_status =
    toNullTrim(pick(payload, "equip_status", "equipStatus")) || "j2";
  const insp_cycle = toNullTrim(pick(payload, "insp_cycle", "inspCycle")); // DB varchar
  const maker = toNullTrim(pick(payload, "maker", "maker"));
  const model_name = toNullTrim(pick(payload, "model_name", "modelName"));
  const equip_image = toNullTrim(pick(payload, "equip_image", "equipImage"));

  if (!equip_name || !equip_type) {
    const err = new Error("수정 시 equip_name, equip_type은 필요합니다");
    err.status = 400;
    throw err;
  }

  const params = [
    equip_status, // ① 상태코드
    equip_type, // ② 설비유형코드
    equip_name, // ③
    manager, // ④
    insp_cycle, // ⑤
    maker, // ⑥
    model_name, // ⑦
    equip_image, // ⑧
    code, // ⑨
  ];

  const result = await mariadb.query(updateEquip, params);
  return { affectedRows: result.affectedRows };
}

/* =========================
 * 삭제
 * ========================= */
async function remove(equip_code) {
  const code = toNullTrim(equip_code);
  if (!code) {
    const err = new Error("equip_code가 필요합니다");
    err.status = 400;
    throw err;
  }
  const result = await mariadb.query(deleteEquip, [code]);
  return { affectedRows: result.affectedRows };
}

// 비가동 목록 조회: status = 'running' | 'history' | (생략=전체)
async function listDowntimes(status) {
  let sql = `
    SELECT
      d.downtime_code   AS downtimeCode,
      d.equip_code      AS equipCode,
      e.equip_name      AS equipName,
      d.downtime_type   AS downtimeType,
      e.manager         AS manager,
      d.worker_id       AS workerId, 
      d.downtime_start  AS downtimeStart,
      d.downtime_end    AS downtimeEnd,
      d.progress_status AS progressStatus
    FROM equip_downtime d
    LEFT JOIN equip_master e ON d.equip_code = e.equip_code
  `;

  const where = [];
  if (status === "running") where.push(`d.downtime_end IS NULL`);
  else if (status === "history") where.push(`d.downtime_end IS NOT NULL`);
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;

  sql += ` ORDER BY d.downtime_start DESC`;

  // 단순 조회는 트랜잭션 불필요
  const rows = await mariadb.query(sql);
  return rows; // 프런트에서 바로 사용 가능 (camelCase)
}

// 비가동 단건 상세
async function getDowntimeByCode(code) {
  const sql = `
    SELECT
      d.downtime_code   AS downtimeCode,
      d.equip_code      AS equipCode,
      e.equip_name      AS equipName,
      d.downtime_type   AS downtimeType,
      e.manager         AS manager,
      d.worker_id       AS workerId, 
      d.description     AS description,
      d.downtime_start  AS downtimeStart,
      d.downtime_end    AS downtimeEnd,
      d.progress_status AS progressStatus
    FROM equip_downtime d
    LEFT JOIN equip_master e ON d.equip_code = e.equip_code
    WHERE d.downtime_code = ?
    LIMIT 1
  `;
  const rows = await mariadb.query(sql, [code]);
  return rows[0] || null;
}

// 시작 = CREATE (트랜잭션 적용)
async function startDowntime(payload = {}) {
  const equipCode = toNullTrim(pick(payload, "equip_code", "equipCode"));
  const downtimeType =
    toNullTrim(pick(payload, "downtime_type", "downtimeType")) || "비계획정지";
  const description = toNullTrim(pick(payload, "description", "description"));
  const workerId = toNullTrim(pick(payload, "worker_id", "workerId"));
  const downtimeStart =
    toYmdHmsOrNull(pick(payload, "downtime_start", "downtimeStart")) ||
    toYmdHmsOrNull(new Date());

  // 필수값 체크
  const missing = [];
  if (!equipCode) missing.push("equip_code");
  if (!downtimeStart) missing.push("downtime_start");
  if (missing.length) {
    const e = new Error(`필수값: ${missing.join(", ")}`);
    e.status = 400;
    throw e;
  }

  // 비가동코드 (서버 생성 권장)
  const code =
    toNullTrim(pick(payload, "downtime_code", "downtimeCode")) ||
    makeDowntimeCode();

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction(); // START TRANSACTION

    // 1) 설비 행 잠금 + '가동중'만 허용
    const equipRows = await conn.query(
      `SELECT equip_code, equip_name, equip_status,manager
         FROM equip_master
        WHERE equip_code = ? AND equip_status = ?
        FOR UPDATE`,
      [equipCode, EQUIP_STATUS.RUN]
    );
    const equip = Array.isArray(equipRows) ? equipRows[0] : equipRows; // mariadb 드라이버 반환 형태 보정
    if (!equip) {
      const e = new Error("가동 중인 설비가 아니거나 존재하지 않습니다.");
      e.status = 409;
      throw e;
    }

    // 2) 요청에 worker_id가 없으면 equip.manager를 사용
    const worker = workerId || equip.manager || null;

    // 2) 동일 설비의 진행중 비가동 중복 방지 (잠금)
    const dupRows = await conn.query(
      `SELECT downtime_code
         FROM equip_downtime
        WHERE equip_code = ?
          AND progress_status = '진행중'
          AND downtime_end IS NULL
        FOR UPDATE`,
      [equipCode]
    );
    if ((dupRows?.length ?? 0) > 0) {
      const e = new Error("이미 진행중 비가동이 존재합니다.");
      e.status = 409;
      throw e;
    }

    // 3) 비가동 INSERT (equip_name은 DB 값 사용)
    const params = [
      code, // downtime_code
      equip.equip_name, // equip_name (DB 신뢰)
      downtimeType, // downtime_type
      downtimeStart, // downtime_start
      null, // downtime_end (시작 시 NULL)
      description, // description
      worker, // worker_id
      "진행중", // progress_status
      equipCode, // equip_code
    ];
    await conn.query(insertDowntime, params);

    // 4) 설비 상태 DOWN 전환
    await conn.query(
      `UPDATE equip_master
          SET equip_status = ?
        WHERE equip_code = ?`,
      [EQUIP_STATUS.DOWN, equipCode]
    );

    await conn.commit();
    return { ok: true, downtime_code: code };
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// 종료 = UPDATE
async function endDowntime(code, payload = {}) {
  if (!code) {
    const e = new Error("downtime_code 필요");
    e.status = 400;
    throw e;
  }

  const endAt =
    toYmdHmsOrNull(pick(payload, "downtime_end", "downtimeEnd")) ||
    toYmdHmsOrNull(new Date());
  const remark = toNullTrim(pick(payload, "description", "description")); // 옵션
  const status =
    toNullTrim(pick(payload, "progress_status", "progressStatus")) || "완료";

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // 1) 종료 대상 잠금 + 설비코드 확보 (이미 끝난 건 중복 종료 방지)
    const rows = await conn.query(
      `SELECT downtime_code, equip_code
         FROM equip_downtime
        WHERE downtime_code = ?
          AND downtime_end IS NULL
        FOR UPDATE`,
      [code]
    );
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) {
      const e = new Error("진행중 다운타임이 없거나 이미 종료되었습니다.");
      e.status = 409;
      throw e;
    }
    const equipCode = row.equip_code;

    // 2) 종료 처리
    await conn.query(
      `
      UPDATE equip_downtime
         SET downtime_end    = COALESCE(?, NOW()),
             description     = COALESCE(?, description),
             progress_status = ?
       WHERE downtime_code   = ?
         AND downtime_end IS NULL
      `,
      [endAt, remark, status, code]
    );

    // (선택) 총 소요시간 컬럼이 있다면 여기서 계산/업데이트 가능
    // 예: total_minutes = TIMESTAMPDIFF(MINUTE, downtime_start, downtime_end)

    // 3) 해당 설비에 '진행중'이 더 남아있는지 확인
    const remain = await conn.query(
      `SELECT 1
         FROM equip_downtime
        WHERE equip_code = ?
          AND progress_status = '진행중'
          AND downtime_end IS NULL
        LIMIT 1`,
      [equipCode]
    );

    // 4) 남은 진행중이 없다면 설비 상태를 RUN으로 복귀
    if ((remain?.length ?? 0) === 0) {
      await conn.query(
        `UPDATE equip_master
            SET equip_status = ?
          WHERE equip_code = ?`,
        [EQUIP_STATUS.RUN, equipCode]
      );
    }

    await conn.commit();
    return { ok: true, downtime_code: code };
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
  getOne,
  viewList,
  listDowntimes,
  getDowntimeByCode,
  startDowntime,
  endDowntime,
};
