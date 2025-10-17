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
router.get("/prodOrdManage", async (req, res, next) => {
  try {
    const data = await prodOrdService.findAllMakeList();
    res.json(data);
  } catch (e) {
    next(e);
  }
});


router.get('/prodOrdManage/equipments', async (req, res, next) => {
  try {
    const procName = String(req.query.procName ?? '');
    const data = await prodOrdService.chooseAboutEquip(procName);
    res.json(data);
  } catch (e) {
    next(e);
  }
});


// 공정제어 작업시작 버튼 누르면 공정실적관리 테이블에 등록
router.post("/addProcessForm", async (req, res, next) => {
  try {
    const processform = req.body;
    const data = await prodOrdService.insertProcessForm(processform);
    res.json(data);
  } catch (err) {
    console.error("addProcessForm 오류:", err);
  }
});

// 공정실적관리에서 공정제어로 데이터 보내는 쿼리
router.get('/goToProcess', async (req, res) => {
  const { makePayload, equipPayload, empPayload } = req.query;

  const make = makePayload ? JSON.parse(makePayload) : null;
  const equip = equipPayload ? JSON.parse(equipPayload) : null;
  const emp = empPayload ? JSON.parse(empPayload) : null;

  console.log('make', make);
  console.log('equip', equip);
  console.log('emp', emp);

  return res.status(200).json({ ok: true });
})


module.exports = router;
