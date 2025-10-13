// 생산 지시 서비스
const mariadb = require('../database/mapper.js');

// 생산 지시 목록
const findByEmpId = async(empId) => {
  let list = await mariadb
    .query('selectMakeForm', empId)
    .catch(err => console.error(err));
  return list;
}

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


// 생산 지시 추가
const addNewMake = async (header, details, listRow) => {
  let conn = null;

  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    const info_row = await conn.query(`
      SELECT CONCAT('MK-', CONCAT(DATE_FORMAT(NOW(), '%Y%m%d'),CONCAT('-',LPAD(IFNULL(MAX(SUBSTR(mk_ord_no, -3)),0) + 1, 3, '0')))) AS mk_ord_no
      FROM makeform
      WHERE SUBSTR(mk_ord_no, 4, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
      FOR UPDATE;   
    `);
    
    const detail_row = await conn.query(`
      SELECT CONCAT('MKD-', CONCAT(DATE_FORMAT(NOW(), '%Y%m%d'),CONCAT('-',LPAD(IFNULL(MAX(SUBSTR(mkd_no, -3)),0) + 1, 3, '0')))) AS mkd_no
      FROM makedetail
      WHERE SUBSTR(mkd_no, 4, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
      FOR UPDATE; 
    `);

    const list_row = await conn.query(`
      SELECT CONCAT('MKL-', CONCAT(DATE_FORMAT(NOW(), '%Y%m%d'),CONCAT('-',LPAD(IFNULL(MAX(SUBSTR(mk_list, -3)),0) + 1, 3, '0')))) AS mk_list
      FROM makelist
      WHERE SUBSTR(mk_list, 4, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
      FOR UPDATE;   
    `);

    
    const mk_ord_no = info_row[0].mk_ord_no;
    const mkd_no = detail_row[0].mkd_no;
    const mk_list = list_row[0].mk_list;
    
    
    // 기본 정보
    await conn.query(addInfoToMakeForm, [
      mk_ord_no,  
      header.mk_name,
      header.mk_bgnde,
      header.mk_ende,
      header.writing_date,
      header.remark || null,
      header.emp_id
    ]);
    
    // 상제 정보
    const params = details.map(d => [
      mkd_no,
      d.mk_ord_no,
      d.no,
      d.prod_code,
      d.mk_num,
      d.mk_priority,
      d.remark || null,
      d.bom_code,
      d.pld_no
    ]);
    
    await conn.batch(addProdToMakeDetail, params);
    
    // makelist에 들어갈 flow_id
    const flow_row = await conn.query(`
      SELECT d.prod_code, b.flow_id
      FROM makedetail d
      JOIN prod_master p  ON d.prod_code = p.prod_code
      JOIN bom_master  b  ON p.bom_code = b.bom_code
      WHERE d.mk_ord_no = ?
    `, [mk_ord_no]);
      
    console.log(flow_row);
      
    // 지시 목록
    // await conn.query(addMakeList, [
    //   mk_list,
    //   mk_ord_no,
    //   list_row.flow_id
    // ]);

    // const listParams = flow_row.map(r => [])

    await conn.commit();
    
  } catch(err) {
    console.error(err);
    if(conn) await conn.rollback();
  } finally {
    if(conn) conn.release();
  }
}

module.exports = {
  findByEmpId,
  addNewMake,
}