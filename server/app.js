require("dotenv").config({ path: "./database/dbConfig.env" });
const express = require("express");
const app = express();
const puppeteer = require("puppeteer");

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
const prodOrdRouter = require("./routers/prodOrd_router.js");

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
app.use("/", prodOrdRouter); // 생산지시서

// 3. 자재
app.use("/", materialsRouter);

// 4. 품질
app.use("/", qualityRouter);

// 5. 장비
app.use("/", equipmentRouter);

// pdf 출력
app.post("/download-order-pdf", async (req, res) => {
  // 1. 프론트엔드에서 POST 요청의 본문(body)으로 보낸 데이터를 받습니다.
  const { html, filename } = req.body;

  if (!html) {
    // HTML 내용이 없으면 에러 응답
    return res.status(400).send("HTML content is required.");
  }
  const safeFilename = encodeURIComponent(filename);

  try {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage(); // 2. 페이지에 HTML 삽입 // 여기서 받은 html 변수(프론트에서 보낸 주문서 템플릿 전체)를 사용합니다. // networkidle0: 네트워크 활동이 없을 때까지 기다림 (모든 리소스 로드 보장)

    await page.setContent(html, { waitUntil: "networkidle0" }); // 3. PDF로 변환 (가장 중요한 부분: 브라우저 인쇄 옵션 사용)

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true, // 배경색/이미지 출력
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close(); // 4. PDF를 클라이언트에게 전송

    res.setHeader("Content-Type", "application/pdf"); // 프론트엔드에서 보낸 filename 변수를 사용합니다.
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${safeFilename}`
    );
    res.send(pdf);
  } catch (error) {
    // Puppeteer나 서버 내부 오류를 잡고 에러 응답을 보냅니다.
    console.error("PDF 생성 중 백엔드 오류 발생:", error);
    // 500 오류 메시지에도 filename 오류 메시지가 포함되지 않도록 명확하게 처리합니다.
    res.status(500).send(`PDF Generation Failed: ${error.message}`);
  }
});
