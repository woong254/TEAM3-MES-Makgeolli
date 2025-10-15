const mariadb = require("../database/mapper.js");

// ----- 목록/검색 -----
const findPurList = async () => {
  let list = await mariadb
    .query("selectPurList")
    .catch((err) => console.error(err));
  return list;
};
const findPurTarget = async (pur_name) => {
  let param = [`%${pur_name}%`];
  let list = await mariadb.query("selectPurTarget", param).catch((err) => {
    console.error(err);
    return [];
  });
  return list;
};

// ----- 단건 조회 (모달 선택 시 사용) -----
const findPurHeaderByCode = async (pur_code) => {
  let list = await mariadb
    .query("selectPurHeaderByCode", [pur_code])
    .catch((err) => {
      console.error(err);
      return [];
    });
  return list?.[0] || null;
};
const findPurLinesByCode = async (pur_code) => {
  let list = await mariadb
    .query("selectPurLinesByCode", [pur_code])
    .catch((err) => {
      console.error(err);
      return [];
    });
  return list || [];
};

// ----- 자재 목록/검색 -----
const findPurMatList = async () => {
  let list = await mariadb
    .query("selectPurMatList")
    .catch((err) => console.error(err));
  return list;
};

const findPurMatTarget = async (mat_name) => {
  let param = [`%${mat_name}%`];
  let list = await mariadb.query("selectPurMatTarget", param).catch((err) => {
    console.error(err);
    return [];
  });
  return list;
};

// ----- 매입처 목록/검색 -----
const findBcncList = async () => {
  let list = await mariadb
    .query("selectBcncList")
    .catch((err) => console.error(err));
  return list;
};
const findBcncTarget = async (bcnc_name) => {
  let param = [`%${bcnc_name}%`];
  let list = await mariadb.query("searchBcncTarget", param).catch((err) => {
    console.error(err);
    return [];
  });
  return list;
};

// ----- 코드 생성 -----
const makePurCode = async () => {
  let result = await mariadb.query("purCode").catch((err) => {
    console.error(err);
    return null;
  });
  return result ? result[0].pur_code : null;
};

// ----- 저장 (헤더+라인 동기화) -----
const savePurchase = async (header, lines) => {
  try {
    // 0) 등록/수정 모드 판정
    const row = await mariadb.query("existsPurForm", [header.pur_code]);
    const existed = (row?.[0]?.cnt || 0) > 0;

    // 1) 헤더 UPSERT
    await mariadb.query("upsertPurForm", [
      header.pur_code,
      header.emp_id,
      header.bcnc_code,
      header.pur_name,
      header.pur_date,
      header.receipt_date,
      header.remark ?? null,
    ]);

    // 2) 현재 DB 라인 목록
    const exist = await mariadb.query("selectMatCodesByPurCode", [
      header.pur_code,
    ]);
    const dbCodes = new Set((exist || []).map((r) => r.mat_code));

    // 3) 페이로드 라인 집합
    const payload = Array.isArray(lines) ? lines : [];
    const payloadCodes = new Set(payload.map((l) => l.mat_code));

    // 4) 화면에서 삭제된 라인만 DELETE
    for (const code of dbCodes) {
      if (!payloadCodes.has(code)) {
        await mariadb.query("deleteOnePurMat", [header.pur_code, code]);
      }
    }

    // 5) 나머지 UPSERT
    for (const line of payload) {
      const qty = Number(line.pur_qty || 0);
      await mariadb.query("upsertOnePurMat", [
        header.pur_code,
        line.mat_code,
        qty,
        line.remark ?? null,
      ]);
    }

    return {
      ok: true,
      pur_code: header.pur_code,
      mode: existed ? "update" : "create",
    };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      message: err?.sqlMessage || err?.message || "SAVE_FAILED",
    };
  }
};

// services/materials_service.js
const deletePurList = async (pur_code) => {
  let r = await mariadb
    .query("deletePur", [pur_code])
    .catch((err) => (console.error(err), null)); // 에러 -> null 반환

  if (!r) return { ok: false, message: "DB_ERROR" }; // 쿼리 자체 실패

  const affected = r.affectedRows ?? r.affected_rows ?? 0;
  return { ok: affected > 0 }; // 실제로 삭제됐는지 여부만 반환
};

// 가입고 1행 등록: 조건 맞으면 1행 삽입, 아니면 0행
const insertIisOne = async ({
  prod_date,
  exp_date,
  pre_receipt_date,
  bcnc_code,
  mat_code,
  receipt_qty,
}) => {
  try {
    const params = [
      // SELECT 자리
      prod_date,
      exp_date,
      pre_receipt_date,
      receipt_qty,
      // WHERE 필터 자리
      pre_receipt_date,
      bcnc_code,
      mat_code,
      receipt_qty,
    ];

    const r = await mariadb.query("insertIis", params);
    const affected = r?.affectedRows ?? r?.affected_rows ?? 0;
    return { ok: affected === 1 };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      message: err?.sqlMessage || err?.message || "INSERT_IIS_FAILED",
    };
  }
};

// 가입고 목록 조회 (검사대기/검사완료 등 상태별)
const findIisList = async (insp_status) => {
  try {
    const rows = await mariadb.query("iisList", [insp_status]);
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const deleteIisList = async (ids = []) => {
  if (!ids.length) return { ok: false, deleted: 0 };
  const r = await mariadb.query("deleteIis", [ids]).catch(() => null);
  const deleted = r?.affectedRows ?? r?.affected_rows ?? 0;
  return { ok: deleted > 0, deleted };
};

const purMatList = async () => {
  try {
    const r = await mariadb.query("selectPurList"[receipt_date]);
  } catch (err) {
    console.error(err);
  }
  return r;
};

module.exports = {
  // 목록/검색
  findPurList,
  findPurTarget,
  findIisList,
  purMatList,
  // 단건 조회
  findPurHeaderByCode,
  findPurLinesByCode,
  // 자재 목록/검색
  findPurMatList,
  findPurMatTarget,
  // 매입처 목록/검색
  findBcncList,
  findBcncTarget,
  // 코드
  makePurCode,
  // 저장
  savePurchase,
  deletePurList,
  insertIisOne,
  deleteIisList,
};
