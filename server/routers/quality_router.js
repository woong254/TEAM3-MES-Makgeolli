// 품질 라우팅 설정
const express = require('express');

const router = express.Router();

const qualityService = require('../services/quality_service.js');

// 모달: 검사대상 조회
router.get('/inspTarget', async(req, res)=> {
  // 나중에 로그인 기능 구현 후 변경예정
  // let empId = req.body.empId;
  // let empId = 'EMP-20250616-0002';

  let inspTargetList = await qualityService
    .findInspTarget()
    .catch(err => console.error(err));
    
  res.send(inspTargetList);
});

module.exports = router;