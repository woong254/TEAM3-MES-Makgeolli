const mariadb = require("mariadb");
const sqlList = require("./sqlList.js");

const connectionPool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_DB,
  connectionLimit: process.env.DB_LIMIT,
  permitSetMultiParamEntries: true,
  insertIdAsNumber: true,
  bigIntAsNumber: true,
  logger: {
    query: console.log,
    error: console.log,
  },
  // 프로시저 사용할 경우 변수 선언해서 가지고 와야할 때 필요한 코드들을 위한 설정
  multipleStatements: true,
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

// const getConnection = async ()=>{
//   return await connectionPool.getConnection();
// }
// module.exports = { query, getConnection };
module.exports = { query };
