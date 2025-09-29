// MariaDB에 접속할 모듈
const mariadb = require("mariadb");
// DB에서 실행할 SQL문을 별도 파일로 작성
const sqlList = require("./sqlList.js");
// ConnectionPool 생성
const connectionPool = mariadb.createPool({
  // DB에 접속하는 정보
  host: "localhost",
  port: 3306,
  user: "dev01",
  password: "dev01",
  database: "dev",
  connectionLimit: 10,
  // Object의 필드정보(Entiry)를 Query문에 있는 '?'에 자동변환 설정
  permitSetMultiParamEntries: true,
  // DML(insert, update, delete)를 실행할 경우
  // 반환되는 Object의 insertId 속성을 Number 타입으로 자동 변환
  insertIdAsNumber: true,
  // MariaDB의 데이터 타입 중 bigInt 타입을 Javascript의 Number 타입으로 자동 변환
  // 해당 타입을 Javascript에선 자동으로 변환하지 못함
  bigIntAsNumber: true,
  // logger 등록
  logger: {
    // 실제 실행되는 SQL문이 console.log로 출력되도록 설정
    query: console.log,
    // error 발생 시 처리함수
    error: console.log,
  },
});

const query = async (alias, values) => {
  let conn = null;
  try {
    conn = await connectionPool.getConnection();
    const sql = sqlList[alias];
    const result = await conn.query(sql, values);
    return result;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { query };
