// 공정실적관리

// 작업지시목록
const selectMakeAll = `
  SELECT  ROW_NUMBER() OVER (
            ORDER BY mkf.mk_ord_no ASC, mkd.mk_priority ASC, pfd.seq_no ASC
          ) AS no,
          mkd.mkd_no, -- 생산지시상세번호
          mkf.mk_ord_no, -- 작업지시코드
          DATE_FORMAT(mkf.writing_date, '%Y-%m-%d') AS writing_date, -- 작업일자
          mkf.mk_name, -- 작업지시명
          mkd.prod_code, -- 제품코드
          prod.prod_name, -- 제품명
          comn1.comncode_dtnm, -- 규격
          prod.prod_spec, -- 단위
          mkd.mk_num, -- 지시수량
          pfd.seq_no, -- 공정순서
          pfd.proc_id, -- 공정코드
          pm.proc_name, -- 공정이름
          mkd.mk_priority, -- 우선순위
          pm.equip_type, -- 설비유형
          CASE
            WHEN pf_sum.total_qty IS NULL THEN '생산대기'
            WHEN pf_sum.total_qty = mkd.mk_num THEN '생산완료'
            ELSE '생산 중'
          END AS total_inpt_qty -- 해당 지시건을 기반으로 총 투입량
  FROM makeform mkf
      JOIN makedetail mkd
      ON mkf.mk_ord_no = mkd.mk_ord_no
      JOIN proc_flow_master pfm
      ON mkd.prod_code = pfm.prod_code
      JOIN prod_master prod
      ON pfm.prod_code = prod.prod_code
      JOIN comncode_dt comn1
      ON prod.prod_unit = comn1.comncode_detailid
      JOIN proc_flow_detail pfd
      ON pfm.flow_id = pfd.flow_id
      JOIN proc_master pm
      ON pfd.proc_id = pm.proc_id
      -- processform의 inpt_qty의 값을 비교
      LEFT JOIN (SELECT mk_list, 
                  SUM(inpt_qty) AS total_qty
            FROM processform
            GROUP BY mk_list) pf_sum 
      ON pf_sum.mk_list = mkf.mk_ord_no
  WHERE mkf.mk_st <> 'p3'
`;

// 설비 선택
const selectEquipAll = `
  SELECT  em.equip_code,
          em.equip_name,
          comn.comncode_dtnm
  FROM proc_master pm JOIN equip_master em
                        ON em.equip_type = pm.equip_type
                      JOIN comncode_dt comn
                        ON em.equip_status = comn.comncode_detailid
  WHERE pm.proc_name = ?
    AND em.equip_status <> 'j2'
`;

// 작업자 선택
const selectEmpAll = `
  SELECT  emp_id,
          emp_name
  FROM emp_master
  WHERE role = (SELECT  comncode_detailid
                FROM comncode_dt
                WHERE comncode_dtnm = '작업자')
`;

module.exports = {
  selectMakeAll,
  selectEquipAll,
  selectEmpAll,
}
