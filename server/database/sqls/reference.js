// 기준 정보 SQL
// table : emp_master
const selectemp = `
SELECT emp_id,
       emp_name,
       emp_phone
FROM  emp_master
WHERE 1=1`;
module.exports = {
  selectemp,
};
