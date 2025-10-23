require("dotenv").config({ path: "./database/configs/dbConfig.env" });
const express = require("express");
const app = express();

const path = require("path");

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
const prodOrdRouter = require("./routers/prodOrd_router.js");

// 3. 자재
const materialsRouter = require("./routers/materials_router.js");

// 4. 품질
const qualityRouter = require("./routers/quality_router.js");

// 5. 장비
const equipmentRouter = require("./routers/equipment_router.js");

// 6. 파일업로드
const uploadsRouter = require("./routers/upload_router.js");

// 7. pdf 내보내기
const pdfRouter = require("./routers/pdf_router.js");

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
// 기본 라우팅
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

// 라우팅 영역

// 0. 기준정보
app.use("/api", referenceRouter);

// 1. 영업
app.use("/api", salesRouter);

// 2. 생산
app.use("/api", prodOrdRouter); // 생산지시서

// 3. 자재
app.use("/api", materialsRouter);

// 4. 품질
app.use("/api", qualityRouter);

// 5. 장비
app.use("/api", equipmentRouter);

// 6. 업로드
app.use("/", uploadsRouter);

// pdf 출력
app.use("/api", pdfRouter);

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "./public", "index.html"));
});
