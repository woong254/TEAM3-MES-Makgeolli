// 기준 정보
// const reference = require("./sqls/reference.js");

// 영업
// require는 하나만 받을 수 있음
const orderform = require("./sqls/orderform.js");
const orderdetail = require("./sqls/orderdetail.js");
const bcncMaster = require("./sqls/bcncMaster.js");
const prodMaster = require("./sqls/prodMaster.js");
const sales = {
  ...orderform,
  ...orderdetail,
  ...bcncMaster,
  ...prodMaster,
};

// 생산
const prodOrd = require("./sqls/prodOrd.js");

// 자재
const materials = require("./sqls/materials.js");

// 품질
const quality = require("./sqls/qualityInsp.js");

// 설비
const equipment = require("./sqls/equipform.js");

module.exports = {
  // 기준 정보
  // ...reference,

  // 영업
  ...sales,

  // 생산
  ...prodOrd, // 생산지시

  // 자재
  ...materials,

  // 품질
  ...quality,

  // 설비
  ...equipment,
};
