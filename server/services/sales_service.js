// 영업 서비스
// const mariadb = require("../database/mapper.js");
import mariadb from "../database/mapper.js";
// const sqlList = require("../database/sqlList.js");
import sqlList from "../database/sqlList.js";

const selectOrderDetail = sqlList.selectOrderDetail;
const selectOrderDetailProducts = sqlList.selectOrderDetailProducts;
const selectBcnc = sqlList.selectBcnc;
const selectProd = sqlList.selectProd;
const insertOrd = sqlList.insertOrd;
const deleteOrder = sqlList.deleteOrder;
const selectOrdId = sqlList.selectOrdId;
const updateOrd = sqlList.updateOrd;
const deleteDetail = sqlList.deleteDetail;
const selectEpIsManage = sqlList.selectEpIsManage;

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
      params.push(ord_name);
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
      sql += ` AND Date(o.ord_date) >= ?`;
      sql1 += ` AND Date(o.ord_date) >= ?`;
      params.push(ord_start_date);
    }
    if (ord_end_date) {
      sql += ` AND Date(o.ord_date) <= ?`;
      sql1 += ` AND Date(o.ord_date) <= ?`;
      params.push(ord_end_date);
    }

    console.log("실제 SQL:", sql);
    console.log("실제 product SQL:", sql1);
    console.log("파라미터:", params);

    const list = await mariadb.query(sql, params);
    const list1 = await mariadb.query(sql1, params);
    list.map((item) => {
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

    console.log("list1조회 : ", list1);
    console.log("list조회 : ", list);

    return { list, list1 };
  } catch (err) {
    console.error("DB조회 오류", err);
    return { list: [], list1: [] };
  }
};

// 주문제품 저장버튼 기능
const ordDetail = async (orderForm) => {
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();

    const result = await conn.query(insertOrd, [
      orderForm.ord_id || null,
      orderForm.ord_name,
      orderForm.user_id,
      orderForm.bcnc_name,
      orderForm.due_date,
      orderForm.ord_knd,
      orderForm.remark,
      JSON.stringify(orderForm.products),
    ]);

    const orderinfoRaw = result[0][0];
    const products = result[1];

    const orderinfo = {
      ...orderinfoRaw,
      due_date: formatDate(new Date(orderinfoRaw.due_date)),
    };

    await conn.commit();
    return { isSuccessed: true, ord_id: orderinfo.ord_id, orderinfo, products };
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return { isSuccessed: false, message: err.message };
  } finally {
    conn.release();
  }
};

// 주문서관리-주문서상세정보-거래처명-거래처선택 조회
const bcncInfoView = async (bcncData) => {
  const { bcnc_name, pic } = bcncData;
  let sql = selectBcnc;
  let params = [];

  if (bcnc_name) {
    sql += ` AND bcnc_name LIKE ?`;
    params.push(`%${bcnc_name}%`);
  }
  if (pic) {
    sql += ` AND pic LIKE ?`;
    params.push(`%${pic}%`);
  }
  try {
    const list = await mariadb.query(sql, params);
    return list;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 주문서관리-주문서상세정보-주문제품-행추가-제품조회
const productsView = async (prodData) => {
  const { prod_name, prod_spec, prod_unit } = prodData;
  console.log("prodData: ", prodData);

  let sql = selectProd;
  let params = [prod_name || null, prod_spec || null, prod_unit || null];

  try {
    const result = await mariadb.query(sql, params);
    const list = result[0];
    console.log(list);
    return list;
  } catch (err) {
    console.error(err);
    return [];
  }
};
// 주문 삭제
const removeOrder = async (ord_id) => {
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(deleteDetail, ord_id);
    await conn.query(deleteOrder, ord_id);

    await conn.commit();
    return { isSuccessed: true };
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return { isSuccessed: false, message: err.message };
  } finally {
    conn.release();
  }
};

// 선택된 주문서의 제품 목록 조회
const getOrderProducts = async (ord_id) => {
  try {
    const rows = await mariadb.query("selectOrderProducts", ord_id);
    return rows;
  } catch (err) {
    console.error("getOrderProducts 쿼리 오류:", err);
    throw err;
  }
};

// 제품선택에서 단위 조회
const getProdUnit = async () => {
  try {
    const result = await mariadb.query("selectProdUnit");
    return result;
  } catch (err) {
    console.error("getProdUnit 오류", err);
  }
};

// 완제품 입고 관리 조회
const getEpIsManage = async (data) => {
  const { insp_name, prod_name, ep_start_date, ep_end_date, Is, Pass } = data;
  try {
    let sql = selectEpIsManage;
    let params = [];

    if (insp_name) {
      sql += ` AND pi.insp_name LIKE ?`;
      params.push(`%${insp_name}%`);
    }
    if (prod_name) {
      sql += ` AND pm.prod_name LIKE ?`;
      params.push(`%${prod_name}%`);
    }
    if (ep_start_date) {
      sql += ` AND pi.epep_dt >= ?`;
      params.push(ep_start_date);
    }
    if (ep_end_date) {
      sql += ` AND pi.epep_dt <= ?`;
      params.push(ep_end_date);
    }
    if (Is && Pass) {
      // 입고완료 OR 입고 안 된 검사완료
      sql += ` AND (ep.eps = ? OR ep.ep_lot IS NULL)`;
      params.push(Is);
    } else if (Is) {
      sql += ` AND ep.eps = ?`;
      params.push(Is);
    } else if (Pass) {
      // 검사완료만 → 아직 입고 안 된 것
      sql += ` AND ep.ep_lot IS NULL`;
    }

    const result = await mariadb.query(sql, params);
    const formatted = result.map((row) => ({
      ...row,
      epep_dt: formatDate(new Date(row.epep_dt)),
    }));
    return formatted;
  } catch (err) {
    console.error("getEpIsManage", err);
  }
};
// 완제품 입고 관리 입고 버튼 기능
const insertEpIs = async (orderForm) => {
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();

    for (const item of orderForm) {
      await conn.query("CALL insert_epis(?,?,?,?,?)", [
        item.insp_id,
        item.prod_code,
        item.pass_qty,
        item.epep_dt,
        item.remark,
      ]);
    }

    await conn.commit();
    return { isSuccessed: true };
  } catch (err) {
    await conn.rollback();
    console.error("insertEpIs 오류:", err);
    return { isSuccessed: false, message: err.message };
  } finally {
    conn.release();
  }
};

// export
export {
  viewList,
  ordFormInfoView,
  ordDetail,
  bcncInfoView,
  productsView,
  removeOrder,
  getOrderProducts,
  getProdUnit,
  getEpIsManage,
  insertEpIs,
};
