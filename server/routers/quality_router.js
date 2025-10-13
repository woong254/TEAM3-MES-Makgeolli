// 품질 라우팅 설정
const express = require("express");
const router = express.Router();
const qualityService = require("../services/quality_service.js");

// 1. 품질 기준관리
// 1-1. 검사대상 조회(모달)
router.get("/inspTarget", async (req, res) => {
  let inspTargetList = await qualityService
    .findInspTarget()
    .catch((err) => console.error(err));
  res.send(inspTargetList);
});

// 1-2. 검사대상 검색(모달)
router.get("/inspTargetSearch", async (req, res) => {
  const param = req.query;
  const searchResults = await qualityService
    .findInspTargetSearch(param)
    .catch((err) => console.error(err));
  res.send(searchResults);
});

// 1-3. 품질기준관리 등록
router.post("/inspMaster", async (req, res) => {
  const result = await qualityService
    .registerInspMaster(req.body)
    .catch((err) => {
      console.error(err);
      return { ok: false, message: "서버 오류" };
    });
  res.status(result.ok ? 200 : 400).json(result);
});

// 1-4. 품질기준관리 조회
router.get("/inspFindMaster", async (req, res) => {
  let inspTargetList = await qualityService
    .findInspMaster()
    .catch((err) => console.error(err));
  res.send(inspTargetList);
});

module.exports = router;
