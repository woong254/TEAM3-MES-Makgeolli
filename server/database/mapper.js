const mariadb = require("mariadb");

const sqlList = require("./sqlList.js");

const connectionPool = mariadb.createPool({
  host: "localhost",
  port: 3306,
  user: "team3",
  password: "team3",
  database: "mes",
  connectionLimit: 10,
  permitSetMultiParamEntries: true,
  insertIdAsNumber: true,
  bigIntAsNumber: true,
  logger: {
    query: console.log,
    error: console.log,
  },
  // allowPublicKeyRetrieval: true,
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
