// 생산 지시 서비스
const mariadb = require("../database/mapper.js");
const {
  selectMakeAll,
  selectEquipAll,
  selectWorkerAll,
} = require("../database/sqls/prodOrdManage");

// ----------------------------------------------------------------------
// 서버 메모리에 실행 중인 공정 시뮬레이션을 관리하는 맵
// 키: procs_no, 값: setInterval ID
// *참고: 로드 밸런싱 환경에서는 Redis/Message Queue 등으로 대체해야 함*
// const activeProcesses = {};

// 공정 번호에 해당하는 시뮬레이션 중지 함수
// const stopProcessSimulation = (procs_no) => {
//   if (activeProcesses[procs_no]) {
//     clearInterval(activeProcesses[procs_no]);
//     delete activeProcesses[procs_no];
//     console.log(`[Simulation] Process ${procs_no} stopped.`);
//     return true;
//   }
//   return false;
// };
// ----------------------------------------------------------------------

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
    console.log(params);

    const rows = await conn.query("CALL add_makeForm(?,?,?,?,?,?,?)", params);

    const result =
      Array.isArray(rows) && Array.isArray(rows[0]) && rows[0][0]
        ? rows[0][0]
        : { mk_ord_no: null, mk_list: null };
    console.log(result);

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

/**
 * selectProcessControlData: 공정제어 처음에 화면에 보여주기 위한 데이터를 조회합니다.
 * **기투입량(prev_input_qty) 및 미투입량(remain_qty) 계산 로직 추가.**
 */
const selectProcessControlData = async (data) => {
  const { emp_id, equip_code, mkd_no, now_procs } = data;
  console.log("data:", data);

  try {
    const result = await mariadb.query("selectProcessControlData", [
      emp_id,
      equip_code,
      mkd_no,
      now_procs,
    ]);
    console.log("result1", result);
    // 대부분의 DB 라이브러리가 [rows, fields] 형태로 반환하는 경우를 대비해 rows만 추출
    if (Array.isArray(result) && Array.isArray(result[0])) {
      return result[0];
    }
    console.log("result2", result);

    // 이미 rows만 반환되거나, 데이터가 없는 경우 (e.g. [] 또는 null)
    return result;
  } catch (err) {
    console.error(
      `[selectProcessControlData] Error fetching data for emp_id ${emp_id}:`,
      err
    );
    throw err; // 에러를 상위로 전파
  }
};

/**
 * processStart: 작업 시작 버튼을 누르면 DB 상태를 업데이트하고 생산 시뮬레이션을 시작합니다.
 */
const processStart = async (params) => {
  try {
    // 1. DB 상태를 't2' (진행 중)로 업데이트
    await mariadb.query(
      `
      UPDATE  processform pf
              JOIN makedetail md
              ON pf.mk_list = md.mkd_no
              JOIN makeform mf
              ON md.mk_ord_no = mf.mk_ord_no
      SET     pf.procs_bgntm = Now(),
              pf.procs_st = 't2',
              md.mkd_st = CASE WHEN md.mkd_st = 'q1' THEN 'q2' ELSE md.mkd_st END,
              mf.mk_st = CASE WHEN mf.mk_st = 'p1' THEN 'p2' ELSE mf.mk_st END
      WHERE   procs_no = ?`,
      [params.procs_no]
    );

    // 2. 업데이트된 공정실적번호, 현투입량, 작업시작시간을 가져옴
    const updatedRecord = await mariadb.query(
      `SELECT pf.procs_no,
              pf.inpt_qty,
              DATE_FORMAT(pf.procs_bgntm, '%Y-%m-%d %H:%i:%s') AS procs_bgntm
        FROM processform pf
        WHERE pf.procs_no = ?`,
      [params.procs_no]
    );

    return {
      isSuccessed: true,
      message: `작업이 시작되었습니다. (Procs No: ${params.procs_no})`,
      result: updatedRecord?.[0] || null,
    };
  } catch (err) {
    console.error(err);
    return { isSuccessed: false, message: "작업 시작 중 DB 오류 발생." };
  }
};

/**
 * updateProcessForm: 공정제어 작업종료 버튼
 */
const updateProcessForm = async (params) => {
  let conn = null;
  const procs_no = params.procs_no; // 공정 번호
  const mk_qty = params.mk_qty; // 생산량
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // 2. 현투입량(inpt_qty) 조회 (최대 생산 가능 수량)
    const processRow = await conn.query(
      "SELECT inpt_qty FROM processform WHERE procs_no = ?",
      [procs_no]
    );

    if (!processRow || processRow.length === 0) {
      await conn.rollback();
      return {
        isSuccessed: false,
        message: "해당 공정 번호의 데이터를 찾을 수 없습니다.",
      };
    }

    const inpt_qty = processRow.inpt_qty; // 현투입량

    // 3. 작업종료 행 업데이트 (최종 생산량 확정 및 상태 변경)
    // 요청에 따라 pass_qty를 0으로 설정합니다.
    await conn.query(
      `
      UPDATE  processform 
      SET     mk_qty = ?,
              procs_endtm = Now(),
              procs_st = 't3'              
      WHERE   procs_no = ?`,
      [mk_qty, procs_no] // pass_qty를 쿼리에서 0으로 설정했으므로 매개변수 제거
    );

    // 작업종료 버튼을 눌렀을때 "포장"공정이고 그에 해당하는 실적상태값이"t3"일 경우 지시서의 마지막 공정을 했다는 의미니까 지시서의 상태를 t3으로 바꾸는 코드
    await conn.query(
      `
      UPDATE makedetail md
      JOIN processform pf
      ON pf.mk_list = md.mkd_no
      SET md.mkd_st = 'q3'
      WHERE pf.now_procs = '포장'
      AND pf.procs_st = 't3'`
    );
    // 작업종료 버튼을 눌렀을때 지시서상세상태가 모두 q3일경우 지시서상태가 p3으로
    await conn.query(
      `UPDATE makeform mf
JOIN makedetail md
  ON md.mk_ord_no = mf.mk_ord_no
SET mf.mk_st = 'p3'
WHERE mf.mk_st <> 'p3'
  AND (
      SELECT MIN(mkd_st)
      FROM makedetail
      WHERE mk_ord_no = mf.mk_ord_no
  ) = 'q3'`
    );

    // 4. 업데이트된 행 다시 조회
    const updatedRowResult = await conn.query(
      "SELECT DATE_FORMAT(procs_endtm, '%Y-%m-%d %H:%i:%s') AS procs_endtm, mk_qty, fail_qty, pass_qty, procs_no FROM processform WHERE procs_no = ?",
      [procs_no]
    );

    const updatedRow =
      Array.isArray(updatedRowResult) &&
      Array.isArray(updatedRowResult[0]) &&
      updatedRowResult[0].length > 0
        ? updatedRowResult[0][0]
        : Array.isArray(updatedRowResult) && updatedRowResult.length > 0
        ? updatedRowResult[0]
        : null;

    await conn.commit(); // 최종 반영

    return {
      isSuccessed: true,
      result: updatedRow,
      message: "작업이 성공적으로 종료되고 최종 생산량이 저장되었습니다.",
    };
  } catch (error) {
    console.error("updateProcessForm 트랜잭션 오류:", error);
    if (conn) await conn.rollback(); // 시스템 오류 시 롤백
    throw error; // 라우터에서 500 오류 처리
  } finally {
    if (conn) conn.release();
  }
};

/**
 * insertProcessForm: 공정실적관리 테이블에 작업 시작 정보를 입력합니다.
 * **[보강] mk_qty를 0으로 명시적으로 초기화하도록 수정.**
 */
const insertProcessForm = async (params) => {
  let conn = null; // 커넥션 객체 선언
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction(); // 트랜잭션 시작

    // 1. 현재 공정명 가져오기 (conn 객체 사용)
    const procRowResult = params.now_procs;

    const procRow =
      Array.isArray(procRowResult) &&
      Array.isArray(procRowResult[0]) &&
      procRowResult[0].length > 0
        ? procRowResult[0][0]
        : Array.isArray(procRowResult) && procRowResult.length > 0
        ? procRowResult[0]
        : null;

    const now_procs = procRow ? procRow.proc_name : null;

    // 2-0. 잔여 투입량 계산
    console.log(`[로그] ${params.mk_list}에 ${params.inpt_qty}개 투입 시도`);
    console.log(params.mk_list);

    const requestedInput = Number(params.inpt_qty) || 0;

    // 지시서에 있는 상품별 상세 주문량 (총 지시량)
    const orderResult = await conn.query(
      `SELECT mk_num
      FROM makedetail
      WHERE mkd_no = ?`,
      [params.mk_list]
    );

    console.log(orderResult); // [ { mk_num: '50' } ]

    // 공정 실적에 이미 들어간 (누적) 투입 수량
    const alreadyResult = await conn.query(
      `
      SELECT SUM(inpt_qty) AS total_input
      FROM processform
      WHERE mk_list = ?
         AND now_procs = ?`,
      [params.mk_list, now_procs]
    );

    console.log("total_input : ", alreadyResult); // [ { total_input: '230' } ]

    // DB 결과를 숫자로 변환
    const orderRow =
      Array.isArray(orderResult) &&
      Array.isArray(orderResult[0]) &&
      orderResult[0].length > 0
        ? orderResult[0][0]
        : Array.isArray(orderResult) && orderResult.length > 0
        ? orderResult[0]
        : null;

    console.log(orderRow); // { mk_num: '50' }

    const alreadyRow =
      Array.isArray(alreadyResult) &&
      Array.isArray(alreadyResult[0]) &&
      alreadyResult[0].length > 0
        ? alreadyResult[0][0]
        : Array.isArray(alreadyResult) && alreadyResult.length > 0
        ? alreadyResult[0]
        : null;

    console.log(alreadyRow); // { total_input: '230' }

    // 총 지시량 (orderTotal)
    const orderTotal = Number(orderRow?.mk_num) ?? 0;

    // 이미 투입된 누적량
    const alreadyTotal = Number(alreadyRow?.total_input) ?? 0;

    console.log(`[로그] 총 지시량: ${orderTotal}, 기투입량: ${alreadyTotal}`);

    // 로직 계산 (예상 총 투입량)
    const sumQty = alreadyTotal + requestedInput;

    // 3. 지시량 초과 여부 확인 및 최종 inpt_qty 결정 (핵심 수정)
    let finalInputQty;

    if (orderTotal < sumQty) {
      // **[Case 1: 초과]** 요청한 수량이 남은 양을 초과함
      // 남은 양만 계산하여 할당해야 함
      let remainingQty = orderTotal - alreadyTotal;
      finalInputQty = Math.max(0, remainingQty);

      console.log(
        `[로그] 지시량 초과! 투입량을 남은 수량인 ${finalInputQty}(으)로 조정합니다.`
      );
    } else {
      // **[Case 2: 정상]** 요청한 수량이 남은 양보다 적거나 같음
      // 요청한 수량 그대로 할당
      finalInputQty = requestedInput; // <<< 요청하신 수량(40)이 여기에 들어감
      console.log("[로그] 정상 투입.");
    }

    // 최종적으로 params.inpt_qty에 확정된 값을 할당
    params.inpt_qty = finalInputQty;

    const checkResult = await conn.query(
      `SELECT procs_no,
              mk_list, 
              equip_code, 
              emp_no, 
              prod_code, 
              inpt_qty, 
              procs_st, 
              seq_no,
              now_procs, 
              mk_qty
      FROM processform
      WHERE mk_list = ?
      AND equip_code = ?
      AND emp_no = ?
      AND now_procs = ?
      AND procs_st <> 't3'`,
      [params.mk_list, params.equip_code, params.emp_no, params.now_procs]
    );

    if (checkResult.length > 0) {
      await conn.commit(); // 모든 쿼리가 성공하면 최종 반영
      console.log("checkResult", {
        mk_list: params.mk_list,
        equip_code: params.equip_code,
        emp_no: params.emp_no,
      });
      return { isSuccessed: true };
    } else {
      // 2. 공정실적관리 테이블에 삽입 (conn 객체 사용)
      const insertResult = await conn.query(
        `INSERT INTO processform (mk_list, 
                                equip_code, 
                                emp_no, 
                                prod_code, 
                                inpt_qty, 
                                procs_st,
                                seq_no,
                                now_procs, 
                                mk_qty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`, // mk_qty를 0으로 명시적 초기화
        [
          params.mk_list,
          params.equip_code,
          params.emp_no,
          params.prod_code,
          params.inpt_qty,
          params.procs_st,
          params.seq_no,
          params.now_procs,
        ]
      );
      console.log("insertResult:", {
        mk_list: params.mk_list,
        equip_code: params.equip_code,
        emp_no: params.emp_no,
        prod_code: params.prod_code,
        inpt_qty: params.inpt_qty,
        procs_st: params.procs_st,
        seq_no: params.seq_no,
        now_procs: params.now_procs,
      });

      await conn.commit(); // 모든 쿼리가 성공하면 최종 반영
      return { isSuccessed: true, result: insertResult };
    }
  } catch (err) {
    console.error("insertProcessForm 오류 : ", err);
    if (conn) await conn.rollback(); // 에러 발생 시 롤백 (데이터 원상 복구)
    throw err; // 에러를 상위(라우터)로 다시 던져서 500 응답 처리하도록 함
  } finally {
    if (conn) conn.release(); // 커넥션 반환
  }
};

/**
 * getCurrentProcessQty: 특정 공정 번호의 현재 생산량, 상태 및 완료 데이터를 조회합니다.
 */
// const getCurrentProcessQty = async (procs_no) => {
//   try {
//     const result = await mariadb.query(
//       `SELECT mk_qty, procs_st,
//                     DATE_FORMAT(procs_endtm, '%Y-%m-%d %H:%i:%s') AS procs_endtm,
//                     fail_qty,
//                     pass_qty,
//                     DATE_FORMAT(procs_bgntm, '%Y-%m-%d %H:%i:%s') AS procs_bgntm
//               FROM processform
//               WHERE procs_no = ?`,
//       [procs_no]
//     );

//     // 단일 행 데이터 추출 (안정성 강화)
//     const row =
//       Array.isArray(result) && Array.isArray(result[0]) && result[0].length > 0
//         ? result[0][0]
//         : Array.isArray(result) && result.length > 0
//         ? result[0]
//         : null;

//     return row;
//   } catch (err) {
//     console.error("[getCurrentProcessQty] Error:", err);
//     throw err;
//   }
// };

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

    // DB 조회: DB 연결이 필요하므로 mariadb.query를 사용
    const rowsResult = await mariadb.query(
      `SELECT COALESCE(SUM(inpt_qty), 0) AS total_inpt_qty
FROM processform
WHERE prod_code = ?`,
      [prod_code]
    );

    // 단일 행 데이터 추출 (안정성 강화)
    const rows =
      Array.isArray(rowsResult) &&
      Array.isArray(rowsResult[0]) &&
      rowsResult[0].length > 0
        ? rowsResult[0]
        : Array.isArray(rowsResult)
        ? rowsResult
        : [];

    console.log(rows); // console.log로 수정

    const total_inpt_qty = rows.length > 0 ? rows[0].total_inpt_qty : 0;

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

// 현재 공정에 투입된 수량
const nowProcessQty = async (mk_list, seq_no) => {
  try {
    const sql = `
      SELECT SUM(inpt_qty) AS total_input
      FROM processform
      WHERE mk_list = ?
      AND seq_no = ?
    `;

    // 숫자로 변환 후 전달
    const rows = await mariadb.query(sql, [Number(mk_list), Number(seq_no)]);
    const totalInput = rows[0]?.total_input || 0;

    return totalInput;
  } catch (err) {
    console.error("[getNextProcessQty] Error:", err);
    return 0;
  }
};

const getNextProcessQty = async (mk_list, seq_no) => {
  try {
    const sql = `
      SELECT SUM(pass_qty) AS total_pass
      FROM processform
      WHERE mk_list = ?
      AND seq_no = ?
      AND insp_status = 'u2'
    `;

    // 숫자로 변환 후 전달
    const rows = await mariadb.query(sql, [Number(mk_list), Number(seq_no)]);
    const totalPass = rows[0]?.total_pass || 0;

    return totalPass;
  } catch (err) {
    console.error("[getNextProcessQty] Error:", err);
    return 0;
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
  nowProcessQty,
  getNextProcessQty,
};
