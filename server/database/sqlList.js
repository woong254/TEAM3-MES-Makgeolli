// 기준 정보 
const books = require("./sqls/reference.js");

// 영업
const books = require("./sqls/sales.js");

// 생산
const books = require("./sqls/production.js");

// 자재
const books = require("./sqls/materials.js");

// 품질
const books = require("./sqls/quality.js");

// 설비
const books = require("./sqls/equipment.js");

module.exports = {
  // 펼침연산자(spread operator, ...)을 활용해 객체의 필드를 다른 객체로 쉽게 복사
  ...books,
};
