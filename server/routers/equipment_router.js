// 설비 라우팅 설정
const express = require("express");

const router = express.Router();

const equipmentService = require("../services/equipment_service.js");

//전체 조회
router.get("/equipment", async (req, res) => {
  try {
    const params = req.query;
    const equipList = await equipmentService.findAll(params);
    res.send(equipList);
  } catch (err) {
    console.error("DB 조회 실패:", err);
    res.status(500).send({ message: "서버 조회 중 오류 발생" });
  }
});

module.exports = router;
