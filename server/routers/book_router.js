const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();
// 해당 라우터를 통해 제공할 서비스를 가져옴
const bookService = require("../services/book_service.js");
// 라우팅  = 사용자의 요청(URL+METHOD) + Service + 응답형태(View or Data)

// 실제 라우팅 등록 영역

// 1. 도서 전체 조회

// REST API를 활용해서 라우팅 등록
// 1) 라우팅  = Endpoint(사용자의 요청, URL+METHOD) + Service + 응답형태(View or Data)
// 2) REST API
//  -1. URL : 자원(데이터)만 정의
//  -2. METHOD : 기능을 의미(GET : 조회, POST : 등록, PUT : 수정, DELETE : 삭제)
//  -3. AJAX   : 페이지가 아닌 데이터 위주로 반환
//  -4. 데이터 포맷 중 JSON을 주로 사용
// 전체조회 : 자원(데이터) -> books / 조회 -> GET
router.get("/books", async (req, res) => {
  // 해당 엔드포인트(URL+METHOD)로 접속할 경우 제공되는 서비스를 실행
  // -> 서비스가 DB에 접속하므로 비동기 작업, await/async를 활용해서 동기식으로 동작하도록 진행
  let bookList = await bookService.findAll().catch((err) => console.log(err));
  // res(Http Response에 대응되는 변수)의 응답메소드를 호출해 데이터를 반환하거나 통신을 종료
  // 주의) res(Http Response에 대응되는 변수)의 응답메소드를 호출하지 않으면
  //       통신이 종료되지 않음
  // res.send()는 데이터를 반환하는 응답 메소드며 객체를 반환하므로 JSON으로 자동 변환
  res.send(bookList);
});

// 단건조회 : 자원(데이터) -> books / 조회 -> GET
router.get("/books/:no", async (req, res) => {
  // 특정 조건을 기반으로 조회하는 경우 URL에 조건을 함께 받음 -> 자원/조건
  // 이때 조건은 실제 URL이 아닌 해당 위치에 존재하는 동적인 값이므로 ':변수명'으로 표기
  // -> URL에 :(콜론)으로 표기된 모든 변수는 req(Http Request에 대응되는 변수)의 params 속성에 등록됨

  // URL('/books/:no') 중 :(콜론)으로 표기된 변수 no를 가져옴
  // URL이 '/books/100'인 경우 마지막 위치에 존재하는 100이 변수 no의 실제 값임
  let bookNo = req.params.no;
  let bookInfo = await bookService
    .findByBookNo(bookNo)
    .catch((err) => console.log(err));
  res.send(bookInfo);
});

// 등록    : 자원(데이터) -> books / 등록 -> POST
router.post("/books", async (req, res) => {
  // METHOD 중 POST와 PUT은 Http Request의 Body 영역을 가지며 req(Http Request에 대응되는 변수)의 body 속성에 등록됨
  let bookInfo = req.body;
  let result = await bookService
    .addNewBook(bookInfo)
    .catch((err) => console.log(err));
  res.send(result);
});

// 해당 javascript 파일의 마지막 코드, 모듈화
// 위에 선언한 기능(변수, 함수 등)들 중 외부로 노출할 대상을 설정
// => 다른 파일에서 require()을 통해 가져옴
module.exports = router;
