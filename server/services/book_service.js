// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
// 실제 제공할 서비스 등록 영역

//1. 도서 전체 조회 서비스
const findAll = async () => {
  let list = await mariadb
    .query("selectBookList")
    .catch((err) => console.log(err));
  return list;
};

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

// 북번호를 기준으로 단건조회
const findByBookNo = async (bookNo) => {
  // bookNo : 사용자가 전달한 북번호, Number 타입
  let list = await mariadb
    .query("selectBookOne", bookNo)
    .catch((err) => console.log(err));
  // mariadb 모듈의 경우 SELECT문의 결과는 갯수와 상관없이 배열로 반환
  // -> 서비스의 결과로 값이 하나일 경우 변환이 필요함.
  let info = list[0];
  return info;
};

// 북정보(name, writer, publisher, publication_date, info)를 기반으로 등록
const addNewBook = async (bookInfo) => {
  // bookInfo : 사용자가 전달한 북정보, Object 타입

  // t_book_01 테이블에 등록하는 insert문에 정의된 컬럼들
  let insertColumns = [
    "name",
    "writer",
    "publisher",
    "publication_date",
    "info",
  ];
  // 사용자가 전달한 북정보 중 insert문에 정의된 컬럼들 기준으로 값을 선별 : 객체 -> 배열
  let data = convertObjToAry(bookInfo, insertColumns);

  let resInfo = await mariadb
    .query("bookInsert", data)
    .catch((err) => console.log(err));
  // mariadb 모듈은 DML(insert, update, delete)의 결과를 { affectedRows: 1, insertId: 1, warningStatus: 0 } 로 반환
  // affectedRows : 실제 실행된 행수 (default : 0)
  // insertId     : AUTO_INCREMENT를 사용하는 경우 자동 부여된 PRIMARY KEY를 가짐, 무조건 Number 타입 (default : 0)

  let result = null;
  if (resInfo.insertId > 0) {
    // 정상적으로 등록된 경우
    result = {
      isSuccessed: true,
      bookNo: resInfo.insertId,
    };
  } else {
    // 등록되지 않은 경우
    result = {
      isSuccessed: false,
    };
  }
  return result;
};

module.exports = {
  findAll,
  findByBookNo,
  addNewBook,
};
