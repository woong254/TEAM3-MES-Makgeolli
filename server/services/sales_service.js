// 영업 서비스
const mariadb = require("../database/mapper.js");
const {
  selectOrderDetail,
  selectOrderDetailProducts,
} = require("../database/sqls/orderdetail.js");

// const testService = ()=>{
//   let conn = null;
//   try {
//     conn = await mariadb.getConnection();
//     await conn.beginTransaction();
//     await conn.query("INSERT INTO testTransaction values ('test')");
//     await conn.query("INSERT INTO testTransaction values ('test2')");
//     await conn.commit();

//   } catch(err){
//     if(conn) conn.rollback();
//   } finally {
//     if(conn) conn.release();
//   }
// }

// 날짜 객체를 'YYYY-MM-DD' 문자열로 변환하는 헬퍼 함수
const formatDate = (date) => {
  // Date 객체가 아니면 그대로 반환하거나, 에러 처리
  if (!(date instanceof Date)) {
    return date;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth()는 0부터 시작하므로 1을 더합니다.
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 주문서조회에서 실행하는 함수 및 쿼리문
const viewList = async () => {
  let list = await mariadb.query("selectOrdersForm").catch((err) => {
    console.error("DB 조회 오류:", err);
    // 오류 발생 시 빈 배열 반환하여 이후 로직이 멈추지 않도록 처리
    return [];
  });
  const formattedList = list.map((item) => {
    const dateFieldName = "due_date";
    if (item[dateFieldName]) {
      // Node.js가 DB에서 가져온 Date 객체를 포맷팅
      item[dateFieldName] = formatDate(item[dateFieldName]);
    }
    const ordDateFieldName = "ord_date";
    if (item[ordDateFieldName]) {
      item[ordDateFieldName] = formatDate(item[ordDateFieldName]);
    }
    return item;
  });
  return formattedList; // 포맷팅된 데이터 리스트 반환
};

// 주문서관리-주문서조회검색-조회버튼
// const ordFormInfoView = async (filters) => {
//   const params = filters.ord_name;
//   try {
//     const list = await mariadb.query("selectOrderDetail", params);
//     return list;
//   } catch (err) {
//     console.error("DB조회 오류", err);
//     return [];
//   }
// };
const ordFormInfoView = async (filters) => {
  const {
    ord_name,
    due_start_date,
    due_end_date,
    ord_start_date,
    ord_end_date,
  } = filters;

  try {
    let sql = selectOrderDetail; // 기존 SELECT ... FROM ... WHERE 1=1
    let sql1 = selectOrderDetailProducts;
    let params = [];

    if (ord_name) {
      sql += ` AND o.ord_name = ?`; // 테이블명 포함
      sql1 += ` AND o.ord_name = ?`; // 테이블명 포함
      params.push(ord_name); // LIKE 검색
    }
    if (due_start_date) {
      sql += ` AND o.due_date >= ?`;
      sql1 += ` AND o.due_date >= ?`;
      params.push(due_start_date);
    }
    if (due_end_date) {
      sql += ` AND o.due_date <= ?`;
      sql1 += ` AND o.due_date <= ?`;
      params.push(due_end_date);
    }
    if (ord_start_date) {
      sql += ` AND o.ord_date >= ?`;
      sql1 += ` AND o.ord_date >= ?`;
      params.push(ord_start_date);
    }
    if (ord_end_date) {
      sql += ` AND o.ord_date <= ?`;
      sql1 += ` AND o.ord_date <= ?`;
      params.push(ord_end_date);
    }

    console.log("실제 SQL:", sql);
    console.log("실제 product SQL:", sql1);
    console.log("파라미터:", params);

    const list = await mariadb.query(sql, params);
    const list1 = await mariadb.query(sql1, params);
    const formattedList = list.map((item) => {
      const dateFieldName = "due_date";
      if (item[dateFieldName]) {
        // Node.js가 DB에서 가져온 Date 객체를 포맷팅
        item[dateFieldName] = formatDate(item[dateFieldName]);
      }
      const ordDateFieldName = "ord_date";
      if (item[ordDateFieldName]) {
        item[ordDateFieldName] = formatDate(item[ordDateFieldName]);
      }
      return item;
    });
    console.log(list);
    console.log(list1);

    return { list, list1 };
  } catch (err) {
    console.error("DB조회 오류", err);
    return { list: [], list1: [] };
  }
};

// export
module.exports = {
  viewList,
  ordFormInfoView,
};
