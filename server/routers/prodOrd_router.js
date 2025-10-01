// 생산 라우팅 설정
const express = require('express');

const router = express.Router();

const prodOrdService = require('../services/prodOrd_service.js');

// 1. 등록
router.get('/prodOrd', async(req, res) => {
  let empId = 'EMP-20250616-0002';
  let prodOrdList = await prodOrdService
    .findByEmpId(empId)
    .catch(err => console.error(err));

  res.send(prodOrdList);
})

module.exports = router;