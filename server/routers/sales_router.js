// 영업 라우팅 설정
const express = require("express");

const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const salesService = require("../services/sales_service.js");

// 실제 라우팅 등록 영역
router.get('/ordFormView', async(req, res) => {
  // 나중에 로그인 기능 구현 후 변경예정
  // let empId = req.body.empId;
  // let empId = 'EMP-20250616-0002';
  
  let prodOrdList = await salesService
    .viewList()
    .catch(err => console.error(err));

  res.send(prodOrdList);
})

module.exports = router;
