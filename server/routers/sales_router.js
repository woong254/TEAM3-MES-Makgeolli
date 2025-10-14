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

// 주문서관리 주문서상세정보 조회
router.get("/ordFormManageView", async (req, res) => {
  const {
    ord_name,
    due_start_date,
    due_end_date,
    ord_start_date,
    ord_end_date,
  } = req.query;

  console.log("검색 조건:", req.query); // 확인용
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

// 영업-주문서관리-주문서상세정보-저장버튼
router.post("/insertOrderFormProducts", async (req, res) => {
  const orderform = req.body;
  console.log("받은 데이터: ", orderform);

  const ordDetail = await salesService
    .ordDetail(orderform)
    .catch((err) => console.error(err));
  res.send(ordDetail);
});

// 거래처선택 모달창에서 거래처 조회
router.get("/bcncView", async (req, res) => {
  const bcncInfo = await salesService
    .bcncInfoView(req.query)
    .catch((err) => console.error(err));
  res.send(bcncInfo);
});

// 행추가 모달창에서 제품 조회
router.get("/productsView", async (req, res) => {
  const prodInfo = await salesService
    .productsView(req.query)
    .catch((err) => console.error(err));
  res.send(prodInfo);
});
// 주문서삭제
router.delete("/removeOrder/:ord_id", async (req, res) => {
  const { ord_id } = req.params;
  const result = await salesService.removeOrder(ord_id);
  res.json(result);
});
// 주문서중복 제품조회
router.get("/orderProducts", async (req, res) => {
  try {
    const { ord_id } = req.query;
    if (!ord_id) {
      return res.status(400).json({ error: "ord_id는 필수입니다." });
    }
    const orderProducts = await salesService.getOrderProducts(ord_id);
    res.json(orderProducts);
  } catch (err) {
    console.error("orderProducts 조회 오류:", err);
  }
});
// 제품선택 단위 조회
router.get("/viewProdUnit", async (req, res) => {
  try {
    const result = await salesService.getProdUnit();
    res.send(result);
    console.log(result);
  } catch (err) {
    console.error("viewProdUnit 조회 오류", err);
  }
});

// 완제품 입고 관리 검색
router.get("/viewEpIsManage", async (req, res) => {
  try {
    const { insp_name, prod_name, ep_start_date, ep_end_date, Is, Pass } =
      req.query;

    const result = await salesService.getEpIsManage({
      insp_name,
      prod_name,
      ep_start_date,
      ep_end_date,
      Is,
      Pass,
    });
    res.send(result);
    console.log(result);
  } catch (err) {
    console.error("viewEpIsManage 조회 오류", err);
  }
});
// 완제품 입고 처리
router.post("/insertEpIs", async (req, res) => {
  try {
    const orderform = req.body;
    console.log("insertEpIs받은 데이터: ", orderform);

    const result = await salesService.insertEpIs(orderform);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.send({ isSuccessed: false, message: err.message });
  }
});

// 완제품 출고 관리 검색
router.get("/viewEpOsManage", async (req, res) => {
  try {
    const {
      ord_name,
      bcnc_name,
      prod_name,
      Is,
      Os,
      OsIP,
      due_start_date,
      due_end_date,
      ep_start_date,
      ep_end_date,
    } = req.query;

    const result = await salesService.getEpOsManage({
      ord_name,
      bcnc_name,
      prod_name,
      Is,
      Os,
      OsIP,
      due_start_date,
      due_end_date,
      ep_start_date,
      ep_end_date,
    });
    res.send(result);
    console.log(result);
  } catch (err) {
    console.error("viewEpOsManage 조회 오류", err);
  }
});

// 완제품 출고 처리
router.post("/insertEpOs", async (req, res) => {
  try {
    const orderform = req.body;
    console.log("insertEpOs받은 데이터: ", orderform);

    const result = await salesService.insertEpOs(orderform);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.send({ isSuccessed: false, message: err.message });
  }
});

module.exports = router;
