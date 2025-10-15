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

// 1-5. 품질기준관리 검색
router.get("/inspMaster/search", async (req, res) => {
  const list = await qualityService.searchInspMaster(req.query);
  res.json(list);
});

// 1-6. 품질기준관리 수정
router.put("/inspMaster/:id", async (req, res) => {
  const { id } = req.params;
  const result = await qualityService
    .updateInspMaster(id, req.body)
    .catch((err) => ({ ok: false, message: "서버 오류" }));
  res.status(result.ok ? 200 : 400).json(result);
});

// 1-7. 품질기준관리 삭제
router.delete("/inspMaster/:id", async (req, res) => {
  const { id } = req.params;
  const result = await qualityService.deleteInspMaster(id).catch((err) => {
    console.error(err);
    return { ok: false, message: "서버 오류" };
  });
  res.status(result.ok ? 200 : 400).json(result);
});

// 1-8. 품질기준관리 상세조회
router.get("/inspMaster/:id", async (req, res) => {
  const { id } = req.params;
  const result = await qualityService.findInspMasterDetail(id);
  res.status(result.ok ? 200 : 400).json(result);
});

// 2. 자재입고검사
// 2-1. 자재입고검사 타겟(가입고) 조회(모달)
router.get("/matInspTarget", async (req, res) => {
  let result = await qualityService
    .findMatInspTarget()
    .catch((err) => console.error(err));
  res.send(result);
});

// 2-2. 자재입고검사 타겟 조회 선택시 -> 해당 품질기준관리 조회 + 불량조회
router.get("/matInspQcMasternNG/:matCode", async (req, res) => {
  const { matCode } = req.params;
  let result = await qualityService
    .getMatInspWithQcMasternNG(matCode)
    .catch((err) => console.error(err));
  res.send(result);
});

module.exports = router;
