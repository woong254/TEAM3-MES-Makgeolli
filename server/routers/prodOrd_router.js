// 생산 라우팅 설정
const express = require('express');

const router = express.Router();

const prodOrdService = require('../services/prodOrd_service.js');

// 본인이 작성한 지시서 조회
router.get('/makeList', async(req, res) => {
  // 나중에 로그인 기능 구현 후 변경예정
  // let empId = req.body.empId;
  let empId = 'EMP-20250616-0002';
  
  let prodOrdList = await prodOrdService
    .findByEmpId(empId)
    .catch(err => console.error(err));

  res.send(prodOrdList);
})

router.post('/prodOrd', async(req, res) => {
  const { header, details, listRow } = req.body;
  const prodOrd = await prodOrdService
    .addNewMake(header, details, listRow)
    .catch(err => console.err(err));
  res.json(prodOrd);
});



module.exports = router;