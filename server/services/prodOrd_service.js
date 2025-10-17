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
    // 1) 커넥션 획득
    conn = await mariadb.getConnection();

    // 2) 파라미터 준비 (JSON 배열 변환 필수!)
    const params = [
      header.mk_name,
      header.mk_bgnde,
      header.mk_ende,
      header.writing_date,
      header.remark || null,
      header.emp_id,
      JSON.stringify(details),
    ];

    // 3) 프로시저 호출
    const rows = await conn.query("CALL add_makeForm(?,?,?,?,?,?,?)", params);

    /**
     * 결과 rows 형태: [ [ { mk_ord_no: ..., mk_list: ... } ], ... ]
     * 프로시저의 SELECT 결과는 rows[0][0]에 첫 결과가 담긴다
     */
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

module.exports = {
  findByEmpId,
  addMakeForm,
  findAllMakeList,
  chooseAboutEquip,
  insertProcessForm,
};
