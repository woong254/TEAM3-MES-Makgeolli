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
    cd_pu.comncode_dtnm as prod_unit,
    od.op_qty AS ord_qty,
    IFNULL(SUM(ed.ord_epos_qty), 0) AS shipped_qty,                 
    (od.op_qty - IFNULL(SUM(ed.ord_epos_qty), 0)) AS remain_qty,    
    o.due_date,
    cd.comncode_dtnm
FROM orderdetail od
    JOIN orderform o 
        ON od.ord_id = o.ord_id
    JOIN bcnc_master bm 
        ON o.bcnc_code = bm.bcnc_code
    JOIN prod_master pm 
        ON od.prod_code = pm.prod_code
    JOIN comncode_dt cd 
        ON od.ofd_st = cd.comncode_detailid
	JOIN comncode_dt cd_pu
		ON pm.prod_unit = cd_pu.comncode_detailid
    LEFT JOIN edcts ed                   
        ON od.ofd_no = ed.ofd_no
WHERE 1=1
`;

// 완제품 출고 관리 - 출고 버튼 쿼리문
const insertEpOsManage = `
INSERT INTO edcts(ofd_no, ep_lot, ord_epos_qty, remark)
VALUES (?,?,?,?)`;

// 완제품 출고 eplot제품 조회
const selectEpLot = `
SELECT	ep_lot,
		epep_dt,
        ep_qty
FROM	epis
WHERE	prod_code = ?
AND     ep_qty <> 0`;

module.exports = {
  // 사용할 쿼리문의 이름을 여기에 적으세요
  selectEpOsManage,
  insertEpOsManage,
  selectEpLot,
};
