// 기준 정보 
// const reference = require("./sqls/reference.js");

// 영업
 const sales = require("./sqls/orderform.js");

// 생산
const prodord = require("./sqls/prodord.js");

// 자재
// const materials = require("./sqls/materials.js");

// 품질
const quality = require("./sqls/qualityInsp.js");

// 설비
// const equipment = require("./sqls/equipment.js");


module.exports = {
  // 기준 정보 
  // ...reference,

  // 영업
   ...sales,

  // 생산
  ...prodord,       // 생산지시

  // 자재
  // ...materials,

  // 품질
  ...quality,

  // 설비
  // ...equipment,
};
