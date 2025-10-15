const express = require("express");
const router = express.Router();
const materialsService = require("../services/materials_service.js");

// ----- 목록/검색 -----
router.get("/purList", async (req, res) => {
  let purList = await materialsService
    .findPurList()
    .catch((err) => console.error(err));
  res.send(purList);
});
router.get("/purTarget", async (req, res) => {
  let pur_name = req.query.pur_name;
  let purList = await materialsService
    .findPurTarget(pur_name)
    .catch((err) => console.error(err));
  res.send(purList);
});

// ----- 단건 조회 (모달 선택 시 사용) -----
router.get("/pur/header", async (req, res) => {
  const pur_code = req.query.pur_code;
  if (!pur_code)
    return res.status(400).send({ ok: false, message: "NO_PUR_CODE" });
  const header = await materialsService
    .findPurHeaderByCode(pur_code)
    .catch((err) => {
      console.error(err);
      return null;
    });
  res.send(header || null);
});

router.get("/pur/lines", async (req, res) => {
  const pur_code = req.query.pur_code;
  if (!pur_code)
    return res.status(400).send({ ok: false, message: "NO_PUR_CODE" });
  const lines = await materialsService
    .findPurLinesByCode(pur_code)
    .catch((err) => {
      console.error(err);
      return [];
    });
  res.send(lines || []);
});

// ----- 자재 목록/검색 -----
router.get("/purMatList", async (req, res) => {
  let matList = await materialsService
    .findPurMatList()
    .catch((err) => console.error(err));
  res.send(matList);
});
router.get("/purMatTarget", async (req, res) => {
  let mat_name = req.query.mat_name;
  let matList = await materialsService
    .findPurMatTarget(mat_name)
    .catch((err) => console.error(err));
  res.send(matList);
});

// ----- 매입처 목록/검색 -----
router.get("/bcncList", async (req, res) => {
  let bcncList = await materialsService
    .findBcncList()
    .catch((err) => console.error(err));
  res.send(bcncList);
});
router.get("/bcncTarget", async (req, res) => {
  let bcnc_name = req.query.bcnc_name;
  let bcncList = await materialsService
    .findBcncTarget(bcnc_name)
    .catch((err) => console.error(err));
  res.send(bcncList);
});

// ----- 발주서코드 생성 -----
router.get("/purManagement", async (req, res) => {
  let pur_code = await materialsService.makePurCode().catch((err) => {
    console.error(err);
    return null;
  });
  res.send({ pur_code });
});

// ----- 저장 (헤더+라인 동기화) -----
router.post("/pur/save", async (req, res) => {
  const { header, lines } = req.body || {};
  if (!header?.pur_code) {
    return res.status(400).send({ ok: false, message: "NO_PUR_CODE" });
  }
  const result = await materialsService
    .savePurchase(header, lines)
    .catch((e) => {
      console.error(e);
      return { ok: false };
    });
  res.send(result);
});

//발주서 삭제
router.post("/pur/delete", async (req, res) => {
  const { pur_code } = req.body || {};
  if (!pur_code) return res.status(400).send({ ok: false });

  const out = await materialsService
    .deletePurList(pur_code)
    .catch((err) => (console.error(err), { ok: false }));

  res.send(out);
});

// ----- 가입고 등록 (조건 만족 시 1행 삽입, 아니면 0행) -----
router.post("/iis/insert", async (req, res) => {
  const {
    prod_date,
    exp_date,
    pre_receipt_date,
    bcnc_code,
    mat_code,
    receipt_qty,
  } = req.body || {};

  const out = await materialsService
    .insertIisOne({
      prod_date,
      exp_date,
      pre_receipt_date,
      bcnc_code,
      mat_code,
      receipt_qty,
    })
    .catch((err) => {
      console.error(err);
      return { ok: false };
    });

  res.send(out); // { ok: true } 또는 { ok: false }
});

// GET /api/iis/list?status=검사대기
router.get("/iis/list", async (req, res) => {
  const status = req.query.status || "검사대기"; // 기본값
  const list = await materialsService
    .findIisList(status)
    .catch((err) => (console.error(err), []));
  res.send(list);
});

// POST /api/iis/delete  { ids: number[] }
router.post("/iis/delete", async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (!ids.length) return res.status(400).json({ ok: false, msg: "EMPTY_IDS" });
  try {
    const out = await materialsService.deleteIisList(ids);
    return res.status(200).json(out); // { ok: true, deleted: n } 등
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, msg: "DELETE_FAILED" });
  }
});
module.exports = router;
