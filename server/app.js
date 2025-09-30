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

// 라우팅 영역

// 0. 기준정보
app.use("/", referenceRouter);

// 1. 영업
app.use("/", salesRouter);

// 2. 생산
app.use("/", productionRouter);

// 3. 자재
app.use("/", materialsRouter);

// 4. 품질
app.use("/", qualityRouter);

// 5. 장비
app.use("/", equipmentRouter);
