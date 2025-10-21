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
const activeProcesses = {};

// 공정 번호에 해당하는 시뮬레이션 중지 함수
const stopProcessSimulation = (procs_no) => {
  if (activeProcesses[procs_no]) {
    clearInterval(activeProcesses[procs_no]);
    delete activeProcesses[procs_no];
    console.log(`[Simulation] Process ${procs_no} stopped.`);
    return true;
  }
  return false;
};
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

/**
 * selectProcessControlData: 공정제어 처음에 화면에 보여주기 위한 데이터를 조회합니다.
 * **기투입량(prev_input_qty) 및 미투입량(remain_qty) 계산 로직 추가.**
 */
const selectProcessControlData = async (data) => {
  const { emp_id, equip_code, mkd_no } = data;
  console.log("data:", data);

  try {
    const result = await mariadb.query("selectProcessControlData", [
      emp_id,
      equip_code,
      mkd_no,
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
      UPDATE processform
      SET procs_bgntm = Now(),
          procs_st = 't2'
      WHERE procs_no = ?`,
      [params.procs_no]
    );

    // 2. 업데이트된 레코드와 최대 생산량을 가져옴
    const updatedRecordResult = await mariadb.query(
      `SELECT pf.procs_no,
              pf.inpt_qty,
              DATE_FORMAT(pf.procs_bgntm, '%Y-%m-%d %H:%i:%s') AS procs_bgntm
        FROM processform pf
        WHERE pf.procs_no = ?`,
      [params.procs_no]
    );

    // 쿼리 결과에서 단일 행 데이터 추출
    const updatedRecord =
      Array.isArray(updatedRecordResult) &&
      Array.isArray(updatedRecordResult[0]) &&
      updatedRecordResult[0].length > 0
        ? updatedRecordResult[0][0]
        : Array.isArray(updatedRecordResult) && updatedRecordResult.length > 0
        ? updatedRecordResult[0]
        : null;

    if (!updatedRecord) {
      throw new Error("작업 시작 후 업데이트된 레코드를 찾을 수 없습니다.");
    }

    // ------------------------------------------------------------------
    // 3. 서버 측에서 생산량(mk_qty) 자동 증가 시뮬레이션 시작
    // ------------------------------------------------------------------
    const procs_no = updatedRecord.procs_no;
    const maxQty = updatedRecord.inpt_qty; // 현 투입량 = 최대 생산량

    if (activeProcesses[procs_no]) {
      stopProcessSimulation(procs_no); // 혹시 모를 중복 실행 방지
    }

    // 0.5초마다 1개씩 증가 시뮬레이션 (실제 환경에 맞게 시간 조정 필요)
    activeProcesses[procs_no] = setInterval(async () => {
      try {
        // 현재 DB의 mk_qty 값을 가져옴
        const result = await mariadb.query(
          "SELECT mk_qty FROM processform WHERE procs_no = ?",
          [procs_no]
        );

        // DB 결과에서 mk_qty가 있는 row 객체를 안전하게 추출
        const current =
          Array.isArray(result) &&
          Array.isArray(result[0]) &&
          result[0].length > 0
            ? result[0][0] // [rows, fields] 형식 처리
            : Array.isArray(result) && result.length > 0
            ? result[0]
            : null; // rows 형식 처리

        if (!current) {
          stopProcessSimulation(procs_no);
          return;
        }

        const oldQty = Number(current.mk_qty) || 0;

        if (oldQty < maxQty) {
          let newQty = oldQty + 1;

          // 최대 생산량을 초과하지 않도록 제한
          if (newQty > maxQty) {
            newQty = maxQty;

            // 생산 완료 시 서버 시뮬레이션 중지
            stopProcessSimulation(procs_no);
          }

          // 생산량 증가
          await mariadb.query(
            "UPDATE processform SET mk_qty = ? WHERE procs_no = ?",
            [newQty, procs_no]
          );
          // console.log(`[Simulation] Procs ${procs_no}: ${newQty}/${maxQty} updated.`);
        } else {
          // 이미 maxQty에 도달했으면 시뮬레이션 중지
          stopProcessSimulation(procs_no);
        }
      } catch (simErr) {
        console.error(`[Simulation] Error updating ${procs_no}:`, simErr);
        stopProcessSimulation(procs_no);
      }
    }, 500); // 0.5초로 바꿈

    return {
      isSuccessed: true,
      message: `작업 시작 및 생산 시뮬레이션이 시작되었습니다. (Procs No: ${procs_no})`,
      result: updatedRecord,
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
  try {
    // 1. 서버 측 생산 시뮬레이션 중지 (가장 중요)
    stopProcessSimulation(procs_no);

    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // 2. 현투입량(inpt_qty) 조회 (최대 생산 가능 수량)
    const processRowResult = await conn.query(
      "SELECT inpt_qty FROM processform WHERE procs_no = ?",
      [procs_no]
    );

    // 단일 행 데이터 추출 (안정성 강화)
    const processRow =
      Array.isArray(processRowResult) &&
      Array.isArray(processRowResult[0]) &&
      processRowResult[0].length > 0
        ? processRowResult[0][0]
        : Array.isArray(processRowResult) && processRowResult.length > 0
        ? processRowResult[0]
        : null;

    if (!processRow) {
      await conn.rollback();
      return {
        isSuccessed: false,
        message: "유효한 공정 번호를 찾을 수 없습니다.",
      };
    }

    const maxInputQty = processRow.inpt_qty; // 현투입량 (최대값)

    // 요구사항: 작업자가 종료를 누르면, 최종 생산량은 현투입량(maxInputQty)과 같아야 함.
    const finalQty = maxInputQty;

    // 3. 작업종료 행 업데이트 (최종 생산량 확정 및 상태 변경)
    // 요청에 따라 pass_qty를 0으로 설정합니다.
    await conn.query(
      "UPDATE processform SET mk_qty = ?, procs_endtm = Now(), procs_st = 't3', pass_qty = 0, fail_qty = 0 WHERE procs_no = ?",
      [finalQty, procs_no] // pass_qty를 쿼리에서 0으로 설정했으므로 매개변수 제거
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
    const procRowResult = await conn.query(
      `SELECT pm.proc_name
      FROM proc_master pm JOIN equip_master em 
      ON pm.equip_type = em.equip_type
      WHERE em.equip_code = ?`,
      [params.equip_code]
    );

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
              now_procs, 
              mk_qty
      FROM processform
      WHERE mk_list = ?
      AND equip_code = ?
      AND emp_no = ?
      AND procs_st <> 't3'`,
      [params.mk_list, params.equip_code, params.emp_no]
    );

    if (checkResult.length > 0) {
      await conn.commit(); // 모든 쿼리가 성공하면 최종 반영
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
                                now_procs, 
                                mk_qty)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`, // mk_qty를 0으로 명시적 초기화
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
const getCurrentProcessQty = async (procs_no) => {
  try {
    const result = await mariadb.query(
      `SELECT mk_qty, procs_st, 
                    DATE_FORMAT(procs_endtm, '%Y-%m-%d %H:%i:%s') AS procs_endtm,
                    fail_qty,
                    pass_qty,
                    DATE_FORMAT(procs_bgntm, '%Y-%m-%d %H:%i:%s') AS procs_bgntm
              FROM processform
              WHERE procs_no = ?`,
      [procs_no]
    );

    // 단일 행 데이터 추출 (안정성 강화)
    const row =
      Array.isArray(result) && Array.isArray(result[0]) && result[0].length > 0
        ? result[0][0]
        : Array.isArray(result) && result.length > 0
        ? result[0]
        : null;

    return row;
  } catch (err) {
    console.error("[getCurrentProcessQty] Error:", err);
    throw err;
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
  getCurrentProcessQty,
};
