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

// 2-3. 자재입고검사 관리 등록
router.post("/matInsp", async (req, res) => {
  let result = await qualityService
    .registerMatInsp(req.body)
    .catch((err) => console.error(err));
  res.send(result);
});

// 2-4. 자재입고검사 관리 검색
router.post("/matInspSearch", async (req, res) => {
  let result = await qualityService
    .searchMatInsp(req.body)
    .catch((err) => console.error(err));
  res.send(result);
});

// 2-5. 자재입고검사 관리 상세조회
router.get("/matInspDetail/:inspId", async (req, res) => {
  const { inspId } = req.params;
  let result = await qualityService
    .matInspDetail(inspId)
    .catch((err) => ({ ok: false, message: err?.message || "서버 오류" }));
  res.send(result);
});

// 2-6. 자재입고검사 관리 수정
router.put("/matInsp/:id", async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body, insp_id: id };
  let result = await qualityService
    .updateMatInsp(payload)
    .catch((err) => ({ ok: false, message: err?.message || "서버 오류" }));
  res.send(result);
});

// 2-7. 자재입고검사 관리 삭제
router.delete("/matInsp/:id", async (req, res) => {
  const { id } = req.params;
  let result = await qualityService
    .deleteMatInsp(id)
    .catch((err) => console.error(err));
  res.send(result);
});

// 3. 자재입고검사 조회
// 3-1. 자재입고검사 리스트 조회
router.get("/matInspList", async (req, res) => {
  let result = await qualityService
    .matInspectSelect()
    .catch((err) => console.error(err));
  res.send(result);
});

// 3-2. 자재입고검사 조회 검색
router.post("/matInspListSearch", async (req, res) => {
  let result = await qualityService
    .searchMatInspList(req.body)
    .catch((err) => console.error(err));
  res.send(result);
});

// 4. 완제품검사 관리
// 4-1. 완제품검사 타겟(공정실적관리) 조회
router.get("/prodInspTargetSearch", async (req, res) => {
  let result = await qualityService
    .findProdInspTarget()
    .catch((err) => console.error(err));
  res.send(result);
  console.log("완제품검사 타겟 조회: ", result);
});

// 4-2. 완제품검사 타겟 조회 선택시 -> 해당 품질기준관리 조회 + 불량조회
router.get("/prodInspQcMasternNg/:prodCode", async (req, res) => {
  const { prodCode } = req.params;
  let result = await qualityService
    .getProdInspWithQcMasternNG(prodCode)
    .catch((err) => console.error(err));
  res.send(result);
});

// 4-3. 완제품검사 관리 등록
router.post("/prodInsp", async (req, res) => {
  let result = await qualityService
    .registerProdInsp(req.body)
    .catch((err) => console.error(err));
  res.send(result);
});

// 4-4. 완제품 관리 검색
router.post("/prodInspSearch", async (req, res) => {
  let result = await qualityService
    .searchProdInsp(req.body)
    .catch((err) => console.error(err));
  res.send(result);
});

// 4-5. 완제품 관리 상세조회
router.get("/prodInspDetail/:insp_id", async (req, res) => {
  const { insp_id } = req.params;
  let result = await qualityService
    .prodInspDetail(req.params.insp_id)
    .catch((err) => ({ ok: false, message: err?.message || "서버 오류" }));
  res.send(result);
});

// 4-6. 완제품 관리 수정
router.put("/prodInsp/:insp_id", async (req, res) => {
  const insp_id = req.params.insp_id;
  const payload = { ...req.body, insp_id };
  let result = await qualityService
    .updateProdInsp(payload)
    .catch((err) => ({ ok: false, message: err?.message || "서버 오류" }));
  res.send(result);
});

// 4-7. 완제품 관리 삭제
router.delete("/prodInsp/:insp_id", async (req, res) => {
  const { insp_id } = req.params;
  let result = await qualityService
    .deleteProdInsp(insp_id)
    .catch((err) => console.error(err));
  res.send(result);
});

// 5. 완제품검사 조회
// 5-1. 완제품검사 조회 리스트
router.get("/prodInspList", async (req, res) => {
  let result = await qualityService
    .prodInspectSelect()
    .catch((err) => console.error(err));
  res.send(result);
});

// 5-2. 완제품검사 조회 검색
router.post("/prodInspListSearch", async (req, res) => {
  let result = await qualityService
    .searchProdInspList(req.body)
    .catch((err) => console.error(err));
  res.send(result);
});

//6. 공정검사 관리
//6-1. 공정검사관리 검사대상 조회
router.get("/procInspTargetSearch", async (req, res) => {
  let result = await qualityService
    .findProcInspTarget()
    .catch((err) => console.error(err));
  res.send(result);
  console.log("공정검사 타겟 조회: ", result);
});

// 6-2. 공정검사관리 등록
router.post("/procInsp", async (req, res) => {
  let result = await qualityService
    .registerProcInsp(req.body)
    .catch((err) => console.error(err));
  res.send(result);
});

// 6-3. 공정검사관리 검색
router.post("/procInspSearch", async (req, res) => {
  let result = await qualityService
    .searchProcInsp(req.body)
    .catch((err) => console.error(err));
  res.send(result);
});

// 6-3. 공정검사관리 상세조회
router.get("/procInspDetail/:insp_id", async (req, res) => {
  const { insp_id } = req.params;
  let result = await qualityService
    .procInspDetail(req.params.insp_id)
    .catch((err) => ({ ok: false, message: err?.message || "서버 오류" }));
  res.send(result);
});

module.exports = router;
