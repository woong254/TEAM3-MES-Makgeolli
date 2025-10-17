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

// 공정실적관리
router.get("/prodOrdManage2", async (req, res) => {
  let params = req.query;
  console.log(params);

  const prodOrdManage = await prodOrdService.chooseAboutWork.catch((err) =>
    console.error(err)
  );
  res.json(prodOrdManage);
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

// 행 선택 후 설비/작업자만 조회
router.post("/prodOrdManage/selection", async (req, res, next) => {
  try {
    const { procName } = req.params;
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

module.exports = router;
