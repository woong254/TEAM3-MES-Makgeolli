// 생산 지시 서비스
const mariadb = require("../database/mapper.js");
const {
  selectMakeAll,
  selectEquipAll,
  selectWorkerAll,
} = require("../database/sqls/prodOrdManage");

// 생산 지시 목록
const findByEmpId = async (empId) => {
  let list = await mariadb
    .query("selectMakeForm", empId)
    .catch((err) => console.error(err));
  return list;
};

// 생산 지시 추가
const addMakeForm = async (header, details) => {
  let conn = null;
  try {
    conn = await mariadb.getConnection();

    const params = [
      header.mk_name,
      header.mk_bgnde,
      header.mk_ende,
      header.writing_date,
      header.remark || null,
      header.emp_id,
      JSON.stringify(details),
    ];

    const rows = await conn.query("CALL add_makeForm(?,?,?,?,?,?,?)", params);

    const result =
      Array.isArray(rows) && Array.isArray(rows[0]) && rows[0][0]
        ? rows[0][0]
        : { mk_ord_no: null, mk_list: null };

    return result;
  } catch (e) {
    console.error("[addMakeForm] Error:", e);
    throw e;
  } finally {
    if (conn) conn.release();
  }
};

// 지시 목록, 작업자 조회
const findAllMakeList = async () => {
  const [makeRows, empRows] = await Promise.all([
    mariadb.query("selectMakeAll").catch((err) => console.error(err)),
    mariadb.query("selectEmpAll").catch((err) => console.error(err)),
  ]);
  return { makeRows, empRows };
};

// 설비 선택
const chooseAboutEquip = async (procName) => {
  const equipRows = await mariadb
    .query("selectEquipAll", procName)
    .catch((err) => console.error(err));
  return equipRows;
};

// 공저제어 작업시작 버튼
const insertProcessForm = async (params) => {
  try {
    await mariadb.query(
      "INSERT INTO processform(mk_list, equip_code, emp_no, prod_code, inpt_qty, procs_bgntm, prog, procs_st, now_procs) VALUES(?,?,?,?,?,Now(),0,?,?);",
      [
        params.mk_list,
        params.equip_code,
        params.emp_no,
        params.prod_code,
        params.inpt_qty,
        params.procs_bgntm,
        params.prog,
        params.procs_st,
        params.now_procs,
      ]
    );
    return { isSuccessed: true };
  } catch (err) {
    console.error("insertProcessForm 오류 : ", err);
    return { isSuccessed: false };
  }
};

/*
// 공정실적에서 입력한 값이 공정 제어에 값이 있는지 비교
const calculateRemainingQty = async (prod_code, target_qty) => {
  try {
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(inpt_qty), 0) AS total_inpt_qty
       FROM processform
       WHERE prod_code = ?`,
      [prod_code]
    );

    const total_inpt_qty = rows[0].total_inpt_qty;

    // 2️⃣ 남은 생산 가능 수량 계산
    const remaining_qty = target_qty - total_inpt_qty;

    let message;
    if (remaining_qty > 0) {
      message = `이미 ${total_inpt_qty}개가 생산 지시됨. ${remaining_qty}개만 추가 생산 필요.`;
    } else {
      message = `이미 ${total_inpt_qty}개가 생산 지시되어 추가 지시 불필요.`;
    }

    return {
      success: true,
      total_inpt_qty,
      remaining_qty: remaining_qty > 0 ? remaining_qty : 0,
      message,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
*/

module.exports = {
  findByEmpId,
  addMakeForm,
  findAllMakeList,
  chooseAboutEquip,
  insertProcessForm,
};
