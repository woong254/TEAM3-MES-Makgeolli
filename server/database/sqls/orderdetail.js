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
       p.prod_unit,
       od.op_qty,
       od.remark
FROM   orderdetail od
       JOIN orderform o
       ON   od.ord_id = o.ord_id
       JOIN prod_master p
       ON   od.prod_code = p.prod_code
WHERE  1=1`;

const insertOrd = `CALL add_form(?,?,?,?,?,?,?,?)`;

const deleteDetail = `DELETE FROM orderdetail WHERE ord_id = ?`;

module.exports = {
  selectOrderDetail,
  selectOrderDetailProducts,
  insertOrd,
  deleteDetail,
};
