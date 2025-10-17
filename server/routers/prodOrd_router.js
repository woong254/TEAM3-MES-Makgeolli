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


router.get('/prodOrdManage/equipments', async (req, res) => {
  try {
    const procName = String(req.query.procName ?? '');
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

// 공정실적관리에서 서버로 보낸 데이터
router.get('/goToProcess', async (req, res) => {
  try {
    const { makePayload, equipPayload, empPayload } = req.query;

    const make = makePayload ? JSON.parse(makePayload) : null;
    const equip = equipPayload ? JSON.parse(equipPayload) : null;
    const emp = empPayload ? JSON.parse(empPayload) : null;

    console.log('make', make);
    console.log('equip', equip);
    console.log('emp', emp);

    return res.status(200).json({ ok: true });
  } catch (err) { 
    console.error(err);
  }
})

/*
// 
router.post('/goToProcess/remaining', async (req, res) => {
  const { prod_code, target_qty } = req.body;
  const result = await calculateRemainingQty(item_code, target_qty);
  res.json(result);
});
*/

module.exports = router;
