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
  const data = getProcessData();
  if (data) {
    // 응답의 상태 코드를 200(OK)로 설정 이는 요청이 성공적으로 처리되었음을 의미합니다.
    // json(data) JSON 형식 데이터 전송 data 변수에 담겨 있는 JavaScript 객체(공정 정보)를 JSON 형식의 문자열로 변환하여 클라이언트에게 응답 본문(Body)으로 전송합니다.
    return res.status(200).json(data);
  } else {
    return res.status(404).json({ message: "저장된 공정 데이터가 없습니다." });
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
    console.log("equip", equip);
    console.log("emp", emp);

    saveProcessData(make, equip, emp);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
  }
});

/*
// 
router.post('/goToProcess/remaining', async (req, res) => {
  const { prod_code, target_qty } = req.body;
  const result = await calculateRemainingQty(item_code, target_qty);
  res.json(result);
});
*/

module.exports = router;
