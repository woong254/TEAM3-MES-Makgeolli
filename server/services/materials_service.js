// 자재 서비스
const mariadb = require("../database/mapper.js");

// 매입처 조회
const findBcncList = async () => {
  let list = await mariadb
    .query("selectBcncList")
    .catch((err) => console.error(err));
  return list;
};

// 매입처 이름으로 검색
const findBcncTarget = async (bcnc_name) => {
  let param = [`%${bcnc_name}%`];
  let list = await mariadb.query("searchBcncTarget", param).catch((err) => {
    console.error(err);
    return [];
  });
  return list;
};

// 발주서코드 생성
const makePurCode = async () => {
  let result = await mariadb.query("purCode").catch((err) => {
    console.error(err);
    return null;
  });
  return result ? result[0].pur_code : null;
};

module.exports = {
  findBcncList,
  findBcncTarget,
  makePurCode,
};
