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

// 공정제어 처음에 화면에 보여주기 위한 데이터 이름들 확인하는(코드만 보내줘서 select해서 찾아봐야함)
const selectProcessControlData = async (data) => {
  const { emp_id } = data;

  const result = await mariadb.query(
    `SELECT	pf.procs_no,
	    	pm.prod_name,
        now_procs,
        em.equip_name,
        empm.emp_name,
        DATE_FORMAT(mf.writing_date, '%Y-%m-%d') AS writing_date,
        md.mk_num,
        pf.inpt_qty
FROM	  processform pf
		    JOIN prod_master pm 
        ON pf.prod_code = pm.prod_code
        JOIN makedetail md
        ON pf.mk_list = md.mkd_no
        JOIN makeform mf 
        ON md.mk_ord_no = mf.mk_ord_no
        JOIN equip_master em 
        ON pf.equip_code = em.equip_code
        JOIN emp_master empm
        ON pf.emp_no = empm.emp_id
WHERE	  empm.emp_id = ?
AND     pf.procs_st = 't1'`,
    [emp_id]
  );
  return result;
};
// 작업시작 버튼
const processStart = async (params) => {
  try {
    const insertResult = await mariadb.query(
      `UPDATE	processform
SET		procs_bgntm = Now(),
        procs_st = 't2'
WHERE	procs_no = ?`,
      [params.procs_no]
    );

    const [updatedRecord] = await mariadb.query(
      `SELECT DATE_FORMAT(pf.procs_bgntm, '%Y-%m-%d %H:%i:%s') AS procs_bgntm,
              sum(pf.inpt_qty) AS prev_input_qty,	
              (md.mk_num - sum(pf.inpt_qty)) AS remain_qty	              
       FROM processform pf
            JOIN makedetail md
            ON pf.mk_list = md.mkd_no
       WHERE pf.procs_no = ?`,
      [params.procs_no]
    );
    return { isSuccessed: true, result: updatedRecord };
  } catch (err) {
    console.error(err);
  }
};

// 공정제어 작업종료 버튼
const updateProcessForm = async (params) => {
  try {
    // 작업종료 행 업데이트
    const updateResult = await mariadb.query(
      "UPDATE	processform SET	mk_qty = ?,	procs_endtm = Now(), procs_st = 't3' WHERE	procs_no = ?",
      [params.mk_qty, params.procs_no]
    );
    console.log("updateResult:", updateResult);

    // 업데이트된 행 다시 조회
    const [updatedRow] = await mariadb.query(
      "SELECT DATE_FORMAT(procs_endtm, '%Y-%m-%d %H:%i:%s') AS procs_endtm, mk_qty, fail_qty, pass_qty FROM processform WHERE procs_no = ?",
      [params.procs_no]
    );
    console.log("updatedRow:", updatedRow);

    return { isSuccessed: true, result: updatedRow };
  } catch (error) {
    console.error(error);
  }
};

/**
 * [수정] insertProcessForm: 공정실적관리 테이블에 작업 시작 정보를 입력합니다.
 * 두 개의 DB 쿼리가 연속적으로 실행되므로 트랜잭션을 적용하여 데이터 무결성을 보장합니다.
 */
const insertProcessForm = async (params) => {
  let conn = null; // 커넥션 객체 선언
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction(); // 트랜잭션 시작 // 1. 현재 공정명 가져오기 (conn 객체 사용)

    const [procRow] = await conn.query(
      `SELECT pm.proc_name
FROM proc_master pm
JOIN equip_master em ON pm.equip_type = em.equip_type
WHERE em.equip_code = ?`,
      [params.equip_code]
    ); // 공정명이 없을 경우 null 처리 (DB에 "" 대신 NULL 저장 권장)

    const now_procs = procRow ? procRow.proc_name : null; // 2. 공정실적관리 테이블에 삽입 (conn 객체 사용)

    const insertResult = await conn.query(
      `INSERT INTO processform
(mk_list, equip_code, emp_no, prod_code, inpt_qty, procs_st, now_procs)
VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        params.mk_list,
        params.equip_code,
        params.emp_no,
        params.prod_code,
        params.inpt_qty,
        params.procs_st,
        now_procs,
      ]
    );

    await conn.commit(); // 모든 쿼리가 성공하면 최종 반영

    console.log("insertResult:", insertResult);
    return { isSuccessed: true, result: insertResult };
  } catch (err) {
    console.error("insertProcessForm 오류 : ", err);
    if (conn) await conn.rollback(); // 에러 발생 시 롤백 (데이터 원상 복구)
    throw err; // 에러를 상위(라우터)로 다시 던져서 500 응답 처리하도록 함
  } finally {
    if (conn) conn.release(); // 커넥션 반환
  }
};

// 공정실적에서 입력한 값이 공정 제어에 값이 있는지 비교
const calculateRemainingQty = async (prod_code, target_qty) => {
  try {
    // 입력값 검증
    if (!prod_code || typeof target_qty !== "number") {
      return {
        success: false,
        error: "Invalid input: prod_code and target_qty are required",
      };
    }

    // DB 조회
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(inpt_qty), 0) AS total_inpt_qty
FROM processform
WHERE prod_code = ?`,
      [prod_code]
    );

    const total_inpt_qty = rows[0].total_inpt_qty;

    // 남은 생산 가능 수량 계산
    const remaining_qty = target_qty - total_inpt_qty;

    // 메시지 구성
    let message;
    if (remaining_qty > 0) {
      message = `현재 ${total_inpt_qty}개가 이미 생산되었습니다. ${remaining_qty}개 추가 생산이 필요합니다.`;
    } else if (total_inpt_qty === 0) {
      message = `아직 생산이 시작되지 않았습니다. 전체 ${target_qty}개 생산이 필요합니다.`;
    } else {
      message = `이미 ${total_inpt_qty}개가 생산되어 추가 생산 지시가 필요하지 않습니다.`;
    }

    return {
      success: true,
      status: remaining_qty > 0 ? "incomplete" : "complete",
      total_inpt_qty,
      remaining_qty,
      message,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err.message,
    };
  }
};

module.exports = {
  findByEmpId,
  addMakeForm,
  findAllMakeList,
  chooseAboutEquip,
  insertProcessForm,
  selectProcessControlData,
  calculateRemainingQty,
  updateProcessForm,
  processStart,
};
