// 품질 서비스 

const mariadb = require('../database/mapper.js');

// 1. 품질 기준 관리
// 1-1. 검사대상 조회
const findInspTarget = async() => {
  let list = await mariadb
    .query('selectInspTargetList')
    .catch((err) => console.log(err));
  return list;
}


module.exports = {
  findInspTarget,
};

