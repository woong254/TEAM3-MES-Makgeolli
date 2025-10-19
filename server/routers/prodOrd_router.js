// 생산 라우팅 설정
const express = require("express");

const router = express.Router();

const prodOrdService = require("../services/prodOrd_service.js");

const { saveProcessData, getProcessData } = require("../utils/processStorage");

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
router.post("/addProcessForm", async (req, res) => {
  try {
    const processform = req.body;
    const data = await prodOrdService.insertProcessForm(processform);
    res.json(data);
  } catch (err) {
    console.error(err);
  }
});

// 공정제어 페이지가 켜질때 데이터를 가져오는 라우터
router.get("/getSavedProcessData", async (req, res) => {
  let data = getProcessData();
  let dumnyData = {};

  // 가져온 데이터 각각의 코드가 어떤건지 실체 확인
  const param = {
    mkd_no: data.make.mkd_no,
    prod_code: data.make.prod_code,
    equip_code: data.equip.equip_code,
    emp_id: data.emp.emp_id,
  };

  const result = await prodOrdService.selectProcessControlData(param);
  // 저장된 실제 데이터가 있는 경우
  return res.status(200).json({
    processData: data,
    dbResult: result,
  });
});

// 공정실적관리에서 서버로 보낸 데이터
router.get("/goToProcess", async (req, res) => {
  try {
    const { makePayload, equipPayload, empPayload } = req.query;

    const make = makePayload ? JSON.parse(makePayload) : null;
    const equip = equipPayload ? JSON.parse(equipPayload) : null;
    const emp = empPayload ? JSON.parse(empPayload) : null;

    calculateRemainingQty(make.prod_code, make.inpt_qty);
    saveProcessData(make, equip, emp);
  } catch (err) { 
    console.error(err);
  }
});


module.exports = router;
