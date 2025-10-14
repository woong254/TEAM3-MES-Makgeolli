// Table : edcts

// 완제품 출고 관리 검색 조회 쿼리문
const selectEpOsManage = `
SELECT 
    od.ofd_no,
    o.ord_name,
    bm.bcnc_name,
    od.prod_code,
    pm.prod_name,
    pm.prod_spec,
    pm.prod_unit,
    od.op_qty,
    o.due_date,
    e.ep_lot,
    e.epep_dt,
    e.ep_qty,
    cd.comncode_dtnm
FROM orderdetail od
JOIN orderform o ON od.ord_id = o.ord_id
JOIN bcnc_master bm ON o.bcnc_code = bm.bcnc_code
JOIN prod_master pm ON od.prod_code = pm.prod_code
JOIN comncode_dt cd ON od.ofd_st = cd.comncode_detailid
JOIN (
    SELECT prod_code, MIN(epep_dt) AS min_epep_dt
    FROM epis
    WHERE ep_qty > 0
    GROUP BY prod_code
) em ON em.prod_code = od.prod_code
JOIN epis e ON e.prod_code = em.prod_code AND e.epep_dt = em.min_epep_dt
WHERE 1=1
`;

// 완제품 출고 관리 - 출고 버튼 쿼리문
const insertEpOsManage = `
INSERT INTO edcts(ofd_no, ep_lot, ord_epos_qty, remark)
VALUES (?,?,?,?)`;

module.exports = {
  // 사용할 쿼리문의 이름을 여기에 적으세요
  selectEpOsManage,
  insertEpOsManage,
};
