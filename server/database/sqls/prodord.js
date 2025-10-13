// Table : makeform, makedetail

// 작성한 지시서 불러오기 (모달창에서 사용)
const selectMakeForm = `
  SELECT  mk_name,
          writing_date,
          mk_bgnde,
          mk_ende
  FROM    makeform
  WHERE   emp_id = ?
  ORDER BY writing_date DESC
`;

// 생산 지시 정보 추가
const addInfoToMakeForm = `
  INSERT INTO makeform (mk_ord_no,
                        mk_name,
                        mk_bgnde,
                        mk_ende,
                        writing_date,
                        remark,
                        emp_id)
  values (?, ?, ?, ?, ?, ?, ?)                         
`;

// 생산 지시 상세정보(제품) 추가
const addProdToMakeDetail = `
  INSERT INTO makedetail (mkd_no,
                          mk_ord_no,
                          no,
                          prod_code,
                          mk_num,
                          mk_priority,
                          remark,
                          bom_code,
                          pld_no)
  values (?, ?, ?, ?, ?, ?, ?, ?, ?)                          
`;

// 생산 지시 등록시 목록에 추가 (공정실적에 사용)
const addMakeList = `
  INSERT INTO makelist (mk_list,
                        mk_ord_no,
                        flow_id)
  values (?, ?, ?)                        
`;

module.exports = {
  selectMakeForm,
}