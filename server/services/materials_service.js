const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");
// import mariadb from "../database/mapper.js";
// import sqlList from "../database/sqlList.js";

const iisModalBcnc = sqlList.iisModalBcnc;
const iisModalMat = sqlList.iisModalMat;
const purPagePurList = sqlList.purPagePurList;
const matPageBase = sqlList.matPageList;

const toYYYYMMDD = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
};

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

const purIisList = async () => {
  try {
    const r = await mariadb.query("selectIisMatList");
    return r || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const findPurIisList = async (mat_name = "") => {
  try {
    const like = `%${mat_name}%`;
    const rows = await mariadb.query("selectIisMatTarget", like);
    return rows || [];
  } catch (err) {
    console.error("[findPurIisList] ERROR:", err?.code, err?.message);
    return [];
  }
};

const findIisBcncList = async (bcncData) => {
  const { mat_code, bcnc_name } = bcncData;
  let sql = iisModalBcnc;
  let params = [];

  if (mat_code) {
    sql += ` AND pm.mat_code = ?`;
    params.push(mat_code);
  }
  if (bcnc_name) {
    sql += ` AND b.bcnc_name LIKE ?`;
    params.push(`%${bcnc_name}%`);
  }
  sql += ` GROUP BY pf.bcnc_code, b.bcnc_name, b.bcnc_category ORDER BY pf.bcnc_code`;
  try {
    const list = await mariadb.query(sql, params);
    return list;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const findIisMatList = async (matData) => {
  const { bcnc_code, mat_name } = matData;
  let sql = iisModalMat;
  let params = [];

  if (bcnc_code) {
    sql += ` AND pf.bcnc_code = ?`;
    params.push(bcnc_code);
  }
  if (mat_name) {
    sql += ` AND m.mat_name LIKE ?`;
    params.push(`%${mat_name}%`);
  }
  sql += ` GROUP BY  pm.mat_code, m.mat_name, m.safe_stock, m.mat_spec, m.mat_unit ORDER BY pm.mat_code`;

  try {
    const list = await mariadb.query(sql, params);
    return list;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// (B) 검사완료 다건 → 입고등록
const registerIisBatch = async (ids = []) => {
  if (!Array.isArray(ids) || !ids.length)
    return { ok: false, message: "EMPTY_IDS" };

  try {
    // 1) 대상 로딩
    const rows = await mariadb.query("selectIisForRegister", [ids]);
    if (!rows?.length) return { ok: false, message: "NO_MATCHED_ROWS" };

    // 2) 트랜잭션
    await mariadb.query("START TRANSACTION");

    let inserted = 0;
    const doneIds = [];

    for (const r of rows) {
      const { iis_id, pur_code, mat_code, exp_date, prod_date } = r;
      const pass_qty = Number(r.pass_qty || 0); // ✅ LOT/입고이력
      const receipt_qty = Number(r.receipt_qty || 0); // ✅ 발주 누적

      if (pass_qty <= 0) continue;

      // 2-1) 같은 자재+같은 유통기한 LOT 재사용
      const re = await mariadb.query("selectLotForReuse", [mat_code, exp_date]);
      let lotNo = re?.[0]?.mat_lot;

      // 2-2) 없으면 전역 시퀀스로 채번해서 LOT 생성
      if (!lotNo) {
        await mariadb.query("nextLotSeqByDate", [exp_date]); // LAST_INSERT_ID() 세팅
        const seqRow = await mariadb.query(
          `SELECT LPAD(LAST_INSERT_ID(), 3, '0') AS seq`
        );
        const seq = seqRow?.[0]?.seq || "001";

        const base = String(mat_code).split("-")[0];
        lotNo = `${base}-${toYYYYMMDD(exp_date)}-${seq}`;

        // 동시성 대비 IGNORE (이미 누가 만들었으면 0행)
        await mariadb.query("insertLotIgnore", [
          lotNo,
          mat_code,
          exp_date,
          prod_date,
        ]);
      }

      // 2-3) 입고이력 인서트: pass_qty (합격량) ✅
      const ins = await mariadb.query("insertMatReceipt", [
        iis_id,
        lotNo,
        pass_qty,
      ]);
      const affected = ins?.affectedRows ?? ins?.affected_rows ?? 0;
      if (affected !== 1) continue; // 멱등(이미 처리된 iis_id) 보호

      // 2-4) 발주 누적: receipt_qty (가입고 시 기입) ✅
      if (receipt_qty < 0) throw new Error(`INVALID_RECEIPT_QTY:${iis_id}`);
      await mariadb.query("updatePurMatOnReceipt", [
        receipt_qty,
        pur_code,
        mat_code,
      ]);

      doneIds.push(iis_id);
      inserted++;
    }

    // 2-5) 실제 처리된 iis_id만 '입고완료'
    if (doneIds.length) {
      await mariadb.query("updateIisStatusDone", [doneIds]);
    }

    await mariadb.query("COMMIT");
    return { ok: true, inserted, updated: doneIds.length };
  } catch (err) {
    await mariadb.query("ROLLBACK").catch(() => {});
    console.error("[registerIisBatch] ERROR:", err);
    return {
      ok: false,
      message: err?.sqlMessage || err?.message || "REGISTER_FAILED",
    };
  }
};

const findPurPagePurList = async (purData) => {
  const {
    pur_name,
    bcnc_name,
    receipt_status, // '입고대기' | '입고완료' | ...
    start_pur, // 'YYYY-MM-DD'
    end_pur, // 'YYYY-MM-DD'
    start_receipt, // 'YYYY-MM-DD'
    end_receipt, // 'YYYY-MM-DD'
  } = purData || {};

  let sql = purPagePurList + ` WHERE 1=1`;
  let params = [];

  if (pur_name) {
    sql += ` AND pf.pur_name LIKE ?`;
    params.push(`%${pur_name}%`);
  }

  if (bcnc_name) {
    sql += ` AND b.bcnc_name LIKE ?`;
    params.push(`%${bcnc_name}%`);
  }

  if (receipt_status) {
    sql += ` AND pf.pur_status = ?`;
    params.push(receipt_status);
  }

  // 발주일자 구간
  if (start_pur && end_pur) {
    sql += ` AND pf.pur_date BETWEEN ? AND ?`;
    params.push(start_pur, end_pur);
  } else {
    if (start_pur) {
      sql += ` AND pf.pur_date >= ?`;
      params.push(start_pur);
    }
    if (end_pur) {
      sql += ` AND pf.pur_date <= ?`;
      params.push(end_pur);
    }
  }

  // 입고요청일자 구간
  if (start_receipt && end_receipt) {
    sql += ` AND pf.receipt_date BETWEEN ? AND ?`;
    params.push(start_receipt, end_receipt);
  } else {
    if (start_receipt) {
      sql += ` AND pf.receipt_date >= ?`;
      params.push(start_receipt);
    }
    if (end_receipt) {
      sql += ` AND pf.receipt_date <= ?`;
      params.push(end_receipt);
    }
  }

  sql += ` ORDER BY pf.pur_code DESC, pm.mat_code`;

  try {
    const list = await mariadb.query(sql, params);
    return list;
  } catch (err) {
    console.error("[findPurPagePurList] ERROR:", err);
    return [];
  }
};

// 자재페이지 목록 (필터: mat_name, mat_item_code)
const findMatPageList = async (filters = {}) => {
  const { mat_name, mat_item_code } = filters || {};
  let sql = matPageBase + ` WHERE 1=1`;
  const params = [];

  if (mat_name) {
    sql += ` AND m.mat_name LIKE ?`;
    params.push(`%${mat_name}%`);
  }
  if (mat_item_code) {
    sql += ` AND m.mat_item_code = ?`;
    params.push(mat_item_code);
  }

  sql += `
    GROUP BY m.mat_code, m.mat_name, m.safe_stock, m.mat_spec, m.mat_unit
    ORDER BY m.mat_code
  `;

  try {
    const rows = await mariadb.query(sql, params);
    return rows || [];
  } catch (err) {
    console.error("[findMatPageList] ERROR:", err?.code, err?.message);
    return [];
  }
};

const findLotMatList = async (mat_code) => {
  try {
    const rows = await mariadb.query("lotMatList", [mat_code]);
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

module.exports = {
  // 목록/검색
  findPurList,
  findMatPageList,
  findPurTarget,
  findIisList,
  purIisList,
  findIisBcncList,
  findIisMatList,
  findPurPagePurList,
  findLotMatList,
  // 단건 조회
  findPurHeaderByCode,
  findPurLinesByCode,
  // 자재 목록/검색
  findPurMatList,
  findPurMatTarget,
  findPurIisList,
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
  registerIisBatch,
};
