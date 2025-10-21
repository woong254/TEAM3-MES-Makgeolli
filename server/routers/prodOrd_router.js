// 생산 라우팅 설정
const express = require("express");

const router = express.Router();

const prodOrdService = require("../services/prodOrd_service.js");

// 본인이 작성한 지시서 조회
router.get("/makeList", async (req, res) => {
  // 나중에 로그인 기능 구현 후 변경예정
  // let empId = req.body.empId;
  let empId = "EMP-20250616-0002";

  const prodOrdList = await prodOrdService
    .findByEmpId(empId)
    .catch((err) => console.error(err));

  res.send(prodOrdList);
});

// 작업지시관리
router.post("/prodOrd", async (req, res) => {
  const { header, details } = req.body || {};
  const prodOrd = await prodOrdService
    .addMakeForm(header, details)
    .catch((err) => console.error(err));
  res.json(prodOrd);
});

// 목록 조회
router.get("/prodOrdManage", async (req, res) => {
  try {
    const data = await prodOrdService.findAllMakeList();
    res.json(data);
  } catch (e) {
    console.error(e);
  }
});

router.get("/prodOrdManage/equipments", async (req, res) => {
  try {
    const procName = String(req.query.procName ?? "");
    const data = await prodOrdService.chooseAboutEquip(procName);
    res.json(data);
  } catch (e) {
    console.error(e);
  }
});

// 공정제어 작업시작 버튼 누르면 공정실적관리 테이블에 등록
router.post("/processStart", async (req, res) => {
  try {
    const processformData = req.body;
    const data = await prodOrdService.processStart(processformData);
    res.json(data);
  } catch (err) {
    console.error(err);
  }
});

// 공정제어 - 작업종료 버튼 누르면 공정실적관리 테이블 업데이트
router.post("/modifyProcessForm", async (req, res) => {
  try {
    const processformData = req.body;
    const data = await prodOrdService.updateProcessForm(processformData);
    console.log(data);

    res.json(data);
  } catch (error) {
    console.error(error);
  }
});

// 공정제어 페이지가 켜질때 데이터를 가져오는 라우터
router.get("/getProcessData", async (req, res) => {
  // 가져온 데이터 각각의 코드가 어떤건지 실체 확인
  const emp_id = req.query.emp_id;
  const equip_code = req.query.equip_code;
  const mkd_no = req.query.mkd_no;
  const param = { emp_id, equip_code, mkd_no };
  console.log("param:", param);

  try {
    const result = await prodOrdService.selectProcessControlData(param);
    return res.json({ result });
  } catch (err) {
    return console.error(
      "prodOrd_router.js - selectProcessControlData 오류:",
      err
    );
  }
});

// ====================================================================
// [추가] 공정제어 - 실시간 생산량 폴링을 위한 라우터
// ====================================================================
router.get("/getCurrentProcessQty", async (req, res) => {
  const procs_no = req.query.procs_no;
  if (!procs_no) {
    // 공정 번호가 없으면 400 Bad Request 응답
    return res.status(400).json({
      isSuccessed: false,
      message: "공정 번호(procs_no)가 필요합니다.",
    });
  }

  try {
    // prodOrdService의 새로운 함수 호출 (실시간 데이터 조회 및 업데이트 역할)
    const result = await prodOrdService.getCurrentProcessQty(procs_no);

    // Vue 컴포넌트가 기대하는 형식에 맞게 isSuccessed: true와 result를 반환
    return res.json({ isSuccessed: true, result: result });
  } catch (err) {
    console.error("getCurrentProcessQty 라우터 오류:", err);
    return res.status(500).json({
      isSuccessed: false,
      message: "서버 내부 오류",
      detail: err.message,
    });
  }
});
// ====================================================================

// 공정실적관리에서 서버로 보낸 데이터
router.post("/startProcess", async (req, res) => {
  // 1. 요청 본문(req.body)에서 필요한 '평면적인' 데이터를 직접 구조 분해 할당으로 가져옵니다.
  // 클라이언트가 보낸 실제 필드 이름: mkd_no, prod_code, inpt_qty, equip_code, emp_id
  const { mkd_no, prod_code, inpt_qty, equip_code, emp_id, proc_id, seq_no } = req.body;

  try {
    // 2. 필수 데이터 누락 체크 (주요 필드만 검사)
    // 이전의 make, equip, emp 객체 대신, 핵심 ID 필드들을 직접 확인합니다.
    if (!mkd_no || !prod_code || !equip_code || !emp_id || !proc_id || !seq_no) {
      console.error("필수 요청 데이터 누락:", req.body);
      return res.status(400).json({
        error: "Bad Request",
        message:
          "제조 지시 번호(mkd_no), 제품 코드, 설비 코드, 작업자 ID(emp_id)는 필수입니다.",
      });
    } // 3. DB에 저장할 객체 구성 (클라이언트 필드를 DB 필드로 매핑)

    const processObj = {
      // 클라이언트의 mkd_no (제조 상세 번호)를 DB의 mk_list 필드에 매핑
      mk_list: mkd_no,
      equip_code: equip_code, // 클라이언트의 emp_id (작업자 ID)를 DB의 emp_no 필드에 매핑
      emp_no: emp_id,
      prod_code: prod_code,
      inpt_qty: inpt_qty,
      proc_id: proc_id,
      seq_no: seq_no, // 우선 순위
      mk_qty: 0, // 초기 생산량 0
      procs_st: "t1", // 실적상태: 생산대기
    }; // 4. DB에 작업시작 행 등록

    const result = await prodOrdService.insertProcessForm(processObj); // 5. 성공 응답 (HTTP 201 Created 권장)

    return res.status(201).json({
      message: "작업이 성공적으로 시작 및 등록되었습니다.",
      data: result, // DB Insert 결과 (예: 삽입된 ID)를 포함할 수 있음
    });
  } catch (err) {
    // 6. 에러 처리 및 응답
    console.error("작업 시작 처리 중 오류 발생:", err); // 클라이언트에게 500 상태 코드와 함께 오류 메시지를 전달
    return res.status(500).json({
      error: "Internal Server Error",
      message: "작업 등록 중 서버 내부 오류가 발생했습니다.",
      detail: err.message,
    });
  }
});

// 이미 공정 들어간 정보 찾기
router.get("/findProcess", async (req, res) => {
  const { mkd_no, equip_code, emp_id } = req.body;
  const result = await calculateRemainingQty(item_code, target_qty);
  res.json(result);
});

// 다음 공정 가능 수량 체크
// routes/prodOrd_router.js
router.post("/getPreviousQty", async (req, res) => {
  try {
    const { mkd_no, now_procs } = req.body;
    const qty = await prodOrdService.getNextProcessQty(mkd_no, now_procs);
    res.json({ previousQty: qty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "합격량 조회 실패" });
  }
});

module.exports = router;
