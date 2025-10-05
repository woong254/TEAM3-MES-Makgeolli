// 영업 라우팅 설정
const express = require("express");
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const salesService = require("../services/sales_service.js");

// 실제 라우팅 등록 영역
// 주문서조회에서 주문서조회검색-조회 기능
router.get("/ordFormView", async (req, res) => {
  // 나중에 로그인 기능 구현 후 변경예정
  // let empId = req.body.empId;
  // let empId = 'EMP-20250616-0002';

  let prodOrdList = await salesService
    .viewList()
    .catch((err) => console.error(err));

  res.send(prodOrdList);
});

router.get("/ordFormManageView", async (req, res) => {
  const {
    ord_name,
    due_start_date,
    due_end_date,
    ord_start_date,
    ord_end_date,
  } = req.query;

  console.log("검색 조건:", req.query); // 확인용 로그
  const ordFormInfo = await salesService
    .ordFormInfoView({
      ord_name,
      due_start_date,
      due_end_date,
      ord_start_date,
      ord_end_date,
    })
    .catch((err) => console.error(err));
  res.send(ordFormInfo);
});

module.exports = router;
