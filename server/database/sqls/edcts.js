// Table : edcts

const selectEpOsManage = `
SELECT	od.ofd_no,
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
FROM	  orderdetail od
		    JOIN orderform o
        ON od.ord_id = o.ord_id
        JOIN bcnc_master bm
        ON o.bcnc_code = bm.bcnc_code
        JOIN prod_master pm
        ON od.prod_code = pm.prod_code
        JOIN epis e
        ON od.prod_code = e.prod_code
        JOIN comncode_dt cd
        ON od.ofd_st = cd.comncode_detailid`;

module.exports = {
  // 사용할 쿼리문의 이름을 여기에 적으세요
  selectEpOsManage,
};
