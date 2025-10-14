// 기준 정보 서비스
const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqls/equipform.js");

// SQL 템플릿 모음 (당신 파일 경로 기준)
const { selectemp } = require("../database/sqls/reference.js");

// 주문서관리-주문서상세정보-거래처명-거래처선택 조회
const empRefView = async (empData) => {
  const { emp_name } = empData;
  let sql = selectemp;
  let params = [];

  if (emp_name) {
    sql += ` AND emp_name LIKE ?`;
    params.push(`%${emp_name}%`);
  }
  try {
    const list = await mariadb.query(sql, params);
    return list;
  } catch (err) {
    console.error(err);
    return [];
  }
};

module.exports = { empRefView };
