// Table : orderform

const selectOrdersForm = `
SELECT o.ord_id,
	     o.ord_name,
       e.emp_name,
       b.bcnc_name,
       b.pic,
       o.due_date,
       o.ord_date,       
       p.prod_code,
       p.prod_name,
       p.prod_spec,
       p.prod_unit,
       od.op_qty,
       o.order_status
FROM   orderform o
	     JOIN emp_master e
       ON   o.emp_id = e.emp_id
       JOIN bcnc_master b
       ON   o.bcnc_code = b.bcnc_code
       JOIN orderdetail od
       ON   o.ord_id = od.ord_id
       JOIN prod_master p
       ON   od.prod_code = p.prod_code`;

module.exports = {
  selectOrdersForm,
};
