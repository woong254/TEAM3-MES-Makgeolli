// 영업 서비스
const mariadb = require("../database/mapper.js");

const viewList = async () => {
  let list = await mariadb
    .query("selectOrderForm")
    .catch((err) => console.error(err));
  return list;
};

module.exports = {
  viewList,
};
