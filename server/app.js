const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.listen(3000, () => {
  console.log("Server Start");
  console.log("http://localhost:3000");
});

// 라우터 영역

// 0. 기준정보
const referenceRouter = require("./routers/reference_router.js");

// 1. 영업
const salesRouter = require("./routers/sales_router.js");

// 2. 생산
const productionRouter = require("./routers/production_router.js");

// 3. 자재
const materialsRouter = require("./routers/materials_router.js");

// 4. 품질
const qualityRouter = require("./routers/quality_router.js");

// 5. 장비
const equipmentRouter = require("./routers/equipment_router.js");

// 기본 라우팅
app.get("/", (req, res) => {
  res.send("Welcome!!");
});

// 라우터 모듈 등록
app.use("/", referenceRouter);
