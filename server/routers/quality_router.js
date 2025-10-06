// 품질 라우팅 설정
const express = require('express');
const router = express.Router();
const qualityService = require('../services/quality_service.js');

// 1. 품질 기준관리
// 1-1. 검사대상 조회(모달)
router.get('/inspTarget', async(req, res)=> {
  let inspTargetList = await qualityService
    .findInspTarget()
    .catch(err => console.error(err));    
  res.send(inspTargetList);
});

// 1-2. 검사대상 검색(모달)
router.get('/inspTargetSearch', async(req, res) => {
  const param = req.query;
  const searchResults = await qualityService
    .findInspTargetSearch(param)
    .catch(err => console.error(err));
  res.send(searchResults);
})

module.exports = router;