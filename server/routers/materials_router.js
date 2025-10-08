// 자재 라우팅 설정
const express = require("express");

const router = express.Router();

const materialsService = require("../services/materials_service.js");

// 매입처 조회
router.get("/bcncList", async (req, res) => {
  let bcncList = await materialsService
    .findBcncList()
    .catch((err) => console.error(err));

  res.send(bcncList);
});

// 매입처 이름으로 검색
router.get("/bcncTarget", async (req, res) => {
  let bcnc_name = req.query.bcnc_name;
  let bcncList = await materialsService
    .findBcncTarget(bcnc_name)
    .catch((err) => console.error(err));
  res.send(bcncList);
});

// 발주서코드 생성
router.get("/purManagement", async (req, res) => {
  let pur_code = await materialsService.makePurCode().catch((err) => {
    console.error(err);
    return null;
  });
  res.send({ pur_code });
});

module.exports = router;
