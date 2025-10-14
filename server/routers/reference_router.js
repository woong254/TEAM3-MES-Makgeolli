// 기준 정보 라우팅 설정
const express = require("express");

const router = express.Router();

const referenceService = require("../services/reference_service.js");

// 사원기준정보 모달창에서 사원 조회
router.get("/empView", async (req, res) => {
  const empInfoView = await referenceService
    .empRefView(req.query)
    .catch((err) => console.error(err));
  res.send(empInfoView);
});
module.exports = router;
