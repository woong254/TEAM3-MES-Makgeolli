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
  const param = { emp_id };
  try {
    const result = await prodOrdService.selectProcessControlData(param);
    // 저장된 실제 데이터가 있는 경우
    return res.json({ result });
  } catch (err) {
    return console.error(
      "prodOrd_router.js - selectProcessControlData 오류:",
      err
    );
  }
});

// 공정실적관리에서 서버로 보낸 데이터
router.get("/goToProcess", async (req, res) => {
  try {
    const { makePayload, equipPayload, empPayload } = req.query;

    const make = makePayload ? JSON.parse(makePayload) : null;
    const equip = equipPayload ? JSON.parse(equipPayload) : null;
    const emp = empPayload ? JSON.parse(empPayload) : null;

    console.log("make", make);
    console.log(make.mkd_no);
    console.log(make.prod_code);
    console.log(make.inpt_qty);
    console.log("equip", equip);
    console.log("emp", emp);

    // DB에 작업시작 행 등록
    const processObj = {
      mk_list: make.mkd_no,
      equip_code: equip.equip_code,
      emp_no: emp.emp_id,
      prod_code: make.prod_code,
      inpt_qty: make.inpt_qty,
      mk_qty: 0, // 초기 생산량 0
      procs_st: "t1", // 실적상태: 생산대기
    };

    const result = await prodOrdService.insertProcessForm(processObj);
  } catch (err) {
    console.error(err);
  }
});

// 실제 투입수량 비교 후 공정제어로 데이터 넘김
router.post("/goToProcess/remaining", async (req, res) => {
  const { prod_code, target_qty } = req.body;
  const result = await calculateRemainingQty(item_code, target_qty);
  res.json(result);
});

module.exports = router;
