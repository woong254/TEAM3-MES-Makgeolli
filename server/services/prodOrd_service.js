// 생산 지시 서비스
const mariadb = require('../database/mapper.js');

const {
  selectMakeForm,
  addInfoToMakeForm,
  addProdToMakeDetail,
  addMakeList,
  selectBomByDetail,
  selectFlowByMake,
  genMkOrdNo,
  genMkListNo,
} = require('../database/sqlList.js');


// 생산 지시 목록
const findByEmpId = async(empId) => {
  let list = await mariadb
    .query('selectMakeForm', empId)
    .catch(err => console.error(err));
  return list;
}

// 생산 지시 추가
const addNewMake = async (header, details) => {
  let conn = null;

  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // 지시서 기본 정보 기본키
    const mkOrdRows = await conn.query(genMkOrdNo);
    const mk_ord_no = mkOrdRows[0].mk_ord_no;
    if (!mk_ord_no) throw new Error('mk_ord_no 생성 실패');
    console.log("mk_ord_no", mk_ord_no);

    // 지시서 목록 기본키
    const mkListRow = await conn.query(genMkListNo);
    const mk_list = mkListRow[0].mk_list;
    if (!mk_list) throw new Error('mk_list 생성 실패');
    console.log("mk_list", mk_list);

    // 지시서 상세 - BOM
    const bomCodeRow = await conn.query(selectBomByDetail);

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
      mk_ord_no,
      d.no,
      d.prod_code,
      d.mk_num,
      d.mk_priority,
      d.remark || null,
      bomCodeRow(d.prod_code),
      d.pld_no || null
    ]);
    await conn.batch(addProdToMakeDetail, params);
    
    // makelist에 들어갈 flow_id
    const flowRows = await conn.query(selectFlowByMake, [mk_ord_no]); 
    console.log(flowRows);
      
    const listParams = flowRows.map(r => [
      mk_list,         // 지시서별 동일 mk_list 코드 사용
      mk_ord_no,
      r.flow_id,
      r.prod_code
    ]);
    await conn.batch(addMakeList, listParams);

    await conn.commit();
    return {mk_ord_no, mkd_no, mk_list}
    
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