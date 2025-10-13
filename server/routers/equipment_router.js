// 설비 라우팅 설정
const express = require("express");

const router = express.Router();

const equipmentService = require("../services/equipment_service.js");

//다건 조회
router.get("/equipment", async (req, res) => {
  try {
    // const params = req.query;
    const data = await equipmentService.list(req.query);
    res.status(200).json(data);
  } catch (err) {
    console.error("[equipment][list] error:", err);
    res.status(err.status || 500).json({ message: err.message || "조회 오류" });
  }
});

// [등록] POST /api/equipment
// body: { equip_code, equip_name, equip_type, manager, equip_status, insp_cycle }
router.post("/equipment", async (req, res) => {
  try {
    const result = await equipmentService.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("[equipment][create] error:", err);
    res.status(err.status || 500).json({ message: err.message || "등록 오류" });
  }
});

// [수정] PUT /api/equipment/:equip_code
router.put("/equipment/:equip_code", async (req, res) => {
  try {
    const result = await equipmentService.update(
      req.params.equip_code,
      req.body
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("[equipment][update] error:", err);
    res.status(err.status || 500).json({ message: err.message || "수정 오류" });
  }
});

// 단건 상세: GET /api/equipment/:code
router.get("/equipment/:code", async (req, res) => {
  try {
    const row = await equipmentService.getOne(req.params.code);
    res.json(row); // 프론트에서 toCamel()로 변환
  } catch (err) {
    console.error("[equipment][detail] error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "상세 조회 오류" });
  }
});

// [삭제] DELETE /api/equipment/:equip_code
router.delete("/equipment/:equip_code", async (req, res) => {
  try {
    const result = await equipmentService.remove(req.params.equip_code);
    res.status(200).json(result);
  } catch (err) {
    console.error("[equipment][delete] error:", err);
    res.status(err.status || 500).json({ message: err.message || "삭제 오류" });
  }
});

module.exports = router;
