// 설비 서비스
const mariadb = require("../database/mapper.js");

const findAll = async () => {
  const list = await mariadb
    .query("searchEquipList", params)
    .catch((err) => console.log(err));
  return list;
};

module.exports = { findAll };
