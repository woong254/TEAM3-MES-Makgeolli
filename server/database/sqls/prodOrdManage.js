// 공정실적관리

// 작업지시목록
const selectMakeAll = `
SELECT
    ROW_NUMBER() OVER (
        ORDER BY mkf.mk_ord_no ASC, mkd.mk_priority ASC, pfd.seq_no ASC
    ) AS no,
    mkd.mkd_no, 
    mkf.mk_ord_no, 
    DATE_FORMAT(mkf.writing_date, '%Y-%m-%d') AS writing_date, 
    mkf.mk_name, 
    mkd.prod_code, 
    prod.prod_name, 
    comn1.comncode_dtnm, 
    prod.prod_spec, 
    CASE
        -- 공정 순서 1: 총 지시량 - (1번 공정에 이미 투입된 총량) = 잔여 지시 수량
        WHEN pfd.seq_no = 1 THEN mkd.mk_num - COALESCE(
            (SELECT SUM(inpt_qty) 
             FROM processform 
             WHERE mk_list = mkd.mkd_no 
             AND now_procs = pm.proc_name), 0)
        -- 공정 순서 2: 1번 공정에서 생산 완료된 수량 (p_prev.mk_qty)
        WHEN pfd.seq_no = 2 THEN (
            SELECT COALESCE(SUM(mk_qty), 0) -- 👈 1번 공정의 완료 수량
            FROM processform
        )
        -- 공정 순서 3 이상: 0
        ELSE 0 
    END AS mk_num, -- 지시수량
    pfd.seq_no, 
    pfd.proc_id, 
    pm.proc_name, 
    mkd.mk_priority, 
    pm.equip_type, 
    CASE
        WHEN pf_sum.total_qty IS NULL THEN '생산대기'
        WHEN pf_sum.total_qty = mkd.mk_num THEN '생산완료'
        ELSE '생산 중'
    END AS total_inpt_qty 
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
-- processform과의 직접적인 조인(RIGHT JOIN -> LEFT JOIN으로 변경)
LEFT JOIN processform p 
    ON pm.proc_name = p.now_procs 
    AND mkf.mk_ord_no = p.mk_list
LEFT JOIN (
    -- 전체 투입량을 계산하는 서브쿼리는 그대로 LEFT JOIN 유지
    SELECT mk_list, SUM(inpt_qty) AS total_qty
    FROM processform
    GROUP BY mk_list
) pf_sum
    ON pf_sum.mk_list = mkf.mk_ord_no
WHERE mkf.mk_st <> 'p3';
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
