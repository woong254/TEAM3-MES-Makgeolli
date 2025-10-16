// Table : orderdetail

const selectOrderDetail = `
SELECT o.ord_id,
	o.ord_name,
       b.bcnc_name,
       b.pic,
       o.ord_date,
       o.due_date,
       e.emp_name,
       o.remark
FROM   orderform o
	JOIN bcnc_master b
       ON   o.bcnc_code = b.bcnc_code
       JOIN emp_master e
       ON   o.emp_id = e.emp_id
WHERE  1=1`;

const selectOrderDetailProducts = `
SELECT od.no,
       od.prod_code,
       p.prod_name,
       p.prod_spec,
       cd_pu.comncode_dtnm AS prod_unit,
       od.op_qty,
       od.remark
FROM   orderdetail od
       JOIN orderform o
       ON   od.ord_id = o.ord_id
       JOIN prod_master p
       ON   od.prod_code = p.prod_code
       JOIN comncode_dt cd_pu
       ON   p.prod_unit = cd_pu.comncode_detailid
WHERE  1=1`;

const insertOrd = `CALL add_form(?,?,?,?,?,?,?,?)`;

const deleteDetail = `DELETE FROM orderdetail WHERE ord_id = ?`;

const selectOrderProducts = `
SELECT od.ord_id,
       od.no,
       od.prod_code,
       p.prod_name,
       p.prod_spec,
	cd_pu.comncode_dtnm AS prod_unit,
       od.op_qty,
       od.remark
FROM   orderdetail od
       JOIN orderform o
       ON   od.ord_id = o.ord_id
       JOIN prod_master p
       ON   od.prod_code = p.prod_code
       JOIN	comncode_dt cd_pu
       ON	p.prod_unit = cd_pu.comncode_detailid
WHERE  od.ord_id = ?`;

const selectProdUnit = `
SELECT comncode_dtnm
FROM   comncode_dt
WHERE  comncode_id = '0B'`;

module.exports = {
  selectOrderDetail,
  selectOrderDetailProducts,
  insertOrd,
  deleteDetail,
  selectOrderProducts,
  selectProdUnit,
};
