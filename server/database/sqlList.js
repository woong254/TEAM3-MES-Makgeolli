// 영업
// require는 하나만 받을 수 있음
const orderform = require("./sqls/orderform.js");
const orderdetail = require("./sqls/orderdetail.js");
const bcncMaster = require("./sqls/bcncMaster.js");
const prodMaster = require("./sqls/prodMaster.js");
const epis = require("./sqls/epis.js");
const edcts = require("./sqls/edcts.js");

// 생산
const prodOrd = require("./sqls/prodOrd.js");
const prodOrdManage = require("./sqls/prodOrdManage.js");
const processForm = require("./sqls/processForm.js");

// 자재
const materials = require("./sqls/materials.js");

// 품질
const quality = require("./sqls/qualityInsp.js");

// 설비
const equipment = require("./sqls/equipform.js");

// 기준정보
const reference = require("./sqls/reference.js");

module.exports = {
  // 기준 정보
  // ...reference,

  // 영업
  ...orderform,
  ...orderdetail,
  ...bcncMaster,
  ...prodMaster,
  ...epis,
  ...edcts,

  // 생산
  ...prodOrd,
  ...prodOrdManage,
  ...processForm,

  // 자재
  ...materials,

  // 품질
  ...quality,

  // 설비
  ...equipment,
};
