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
// 1-2. 검사대상 검색
const findInspTargetSearch = async(param) => {
  const { name ='', type ='' } = param;
  const tName = name ? `%${name}%` : '%';
  const tType = type || '';

  const params = [tName, tType, tType, tName, tType, tType]

  let list = await mariadb
    .query('searchInspTarget', params)
    .catch((err) => {
      console.log(err)
      return [];
    });
  return list;
}


module.exports = {
  findInspTarget,
  findInspTargetSearch
};

