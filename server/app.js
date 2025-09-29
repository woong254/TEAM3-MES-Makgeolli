const express = require("express");
const app = express();
// 미들웨어 등록 영역
// 1. body parser
// content-type : application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// content-type : application/json
app.use(express.json());
// Server 실행
app.listen(3000, () => {
  console.log("Server Start");
  console.log("http://localhost:3000");
});
// 라우팅 등록 영역
const bookRouter = require("./routers/book_router.js");
// 기본 라우팅
app.get("/", (req, res) => {
  res.send("Welcome!!");
});
// 라우터 모듈 등록
app.use("/", bookRouter);
