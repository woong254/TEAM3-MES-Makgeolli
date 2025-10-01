// 영업 라우팅 설정
const express = require("express");

const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const salesService = require("../services/sales_service.js");

// 실제 라우팅 등록 영역

module.exports = router;
