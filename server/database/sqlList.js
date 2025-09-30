// 기준 정보 
const books = require("./sqls/reference.js");

// 영업
const books = require("./sqls/sales.js");

// 생산
const books = require("./sqls/prodord.js");

// 자재
const books = require("./sqls/materials.js");

// 품질
const books = require("./sqls/quality.js");

// 설비
const books = require("./sqls/equipment.js");


module.exports = {
  // 기준 정보 
  ...reference,

  // 영업
  ...sales,

  // 생산
  ...prodord,       // 생산지시

  // 자재
  ...materials,

  // 품질
  ...quality,

  // 설비
  ...equipment,
};
