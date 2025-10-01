// 생산 지시 서비스
const mariadb = require('../database/mapper.js');


const findByEmpId = async(empId) => {
  let list = await mariadb
    .query('selectMakeForm', empId)
    .catch(err => console.error(err));
  return list;
}

module.exports = {
  findByEmpId,
}