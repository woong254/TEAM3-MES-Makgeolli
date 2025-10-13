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
  INSERT INTO makedetail (mk_ord_no,
                          no,
                          prod_code,
                          mk_num,
                          mk_priority,
                          remark,
                          bom_code,
                          pld_no)
  values (?, ?, ?, ?, ?, ?, ?, ?)                          
`;

// 생산 지시 등록시 목록에 추가 (공정실적에 사용)
const addMakeList = `
  INSERT INTO makelist (mk_list,
                        mk_ord_no,
                        flow_id)
  values (?, ?, ?)                        
`;

// 지시서 상세 - bom_code 불러오기
const selectBomByDetail = `
  SELECT 	b.bom_code,
          p.prod_code
  FROM bom_master b JOIN prod_master p 
                      ON b.prod_code = p.prod_code
  WHERE p.prod_code = ?
`;

// 지시서 목록 - 공정 흐름 번호 불러오기
const selectFlowByMake = `
  
`;

// 지시서 기본 정보 기본키
const genMkOrdNo = `
  SELECT  CONCAT('MK-', CONCAT(DATE_FORMAT(NOW(), '%Y%m%d'),
          CONCAT('-',LPAD(IFNULL(MAX(SUBSTR(mk_ord_no, -3)),0) + 1, 3, '0')))) AS mk_ord_no
  FROM makeform
  WHERE SUBSTR(mk_ord_no, 4, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
  FOR UPDATE
`;

// 지시서 목록 기본키
const genMkListNo = `
  SELECT  CONCAT('MKL-', CONCAT(DATE_FORMAT(NOW(), '%Y%m%d'),
          CONCAT('-',LPAD(IFNULL(MAX(SUBSTR(mk_list, -3)),0) + 1, 3, '0')))) AS mk_list
  FROM makelist
  WHERE SUBSTR(mk_list, 4, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
  FOR UPDATE
`;

module.exports = {
  selectMakeForm,
  addInfoToMakeForm,
  addProdToMakeDetail,
  addMakeList,
  selectBomByDetail,
  selectFlowByMake,
  genMkOrdNo,
  genMkListNo,
}