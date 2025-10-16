// services/equipment.service.js (예시)

// DB 호출 유틸(당신 프로젝트 기준)
const mariadb = require("../database/mapper.js");

// SQL 템플릿 모음 (당신 파일 경로 기준)
const {
  searchEquipList,
  insertEquip, // INSERT INTO equipment(11개 컬럼) VALUES (?,?,?,?,?,?,?,?,?,?,?)
  updateEquip, // UPDATE ... SET equip_name=?, equip_type=?, manager=?, equip_status=?, insp_cycle=? WHERE equip_code=?
  deleteEquip, // DELETE FROM equipment WHERE equip_code=?
  selectEquipByCode, // SELECT * FROM equipment WHERE equip_code=?
  selectEquipType,
  insertDowntime,
  updateDowntimeEnd,
} = require("../database/sqls/equipform.js");

/* =========================
 * 공통 유틸 영역 (설명하기 쉬운 이름/주석)
 * ========================= */

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
    toNullTrim(pick(payload, "equip_status", "equipStatus")) || "비가동";
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
    equipType,
    manager,
    inspCycle,
    installDate,
    modelName,
    equipImage,
    mfgDt,
    maker,
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
    equip_status, // ① JOIN용 상태코드
    equip_name, // ②
    equip_type, // ③
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

// 시작 = CREATE
async function startDowntime(payload = {}) {
  const equipCode = toNullTrim(pick(payload, "equip_code", "equipCode"));
  const equipName = toNullTrim(pick(payload, "equip_name", "equipName"));
  const downtimeType =
    toNullTrim(pick(payload, "downtime_type", "downtimeType")) || "비계획정지";
  const description = toNullTrim(pick(payload, "description", "description"));
  const workerId = toNullTrim(pick(payload, "worker_id", "workerId"));
  const startAt =
    toYmdHmsOrNull(pick(payload, "downtime_start", "downtimeStart")) ||
    toYmdHmsOrNull(new Date());

  // 필수값 체크
  const missing = [];
  if (!equipCode) missing.push("equip_code");
  if (!startAt) missing.push("downtime_start");
  if (missing.length) {
    const e = new Error(`필수값: ${missing.join(", ")}`);
    e.status = 400;
    throw e;
  }

  // 비가동코드 (서버 생성 권장)
  const code =
    toNullTrim(pick(payload, "downtime_code", "downtimeCode")) ||
    makeDowntimeCode();

  // 스키마 순서에 맞춰 9개 파라미터 준비
  // downtime_end: 시작 시 보통 null
  // progress_status: 시작 시 "진행중"
  const params = [
    code, // downtime_code
    equipName, // equip_name
    downtimeType, // downtime_type
    startAt, // downtime_start
    null, // downtime_end
    description, // description
    workerId, // emp_id
    "진행중", // progress_status
    equipCode, // equip_code
  ];

  // 분리해둔 SQL 변수 사용 (예: import { insertDowntime } from "../sql/..." )
  const r = await mariadb.query(insertDowntime, params);
  return { downtime_code: code, affectedRows: r.affectedRows };
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

  const r = await mariadb.query(updateDowntimeEnd, [
    endAt,
    remark,
    status,
    code,
  ]);
  return { affectedRows: r.affectedRows };
}

module.exports = {
  list,
  create,
  update,
  remove,
  getOne,
  viewList,
  startDowntime,
  endDowntime,
};
