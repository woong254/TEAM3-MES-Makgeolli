// Table : epis

const selectEpIsManage = `
SELECT pi.insp_id,
       pi.insp_name,
       pm.prod_code,
	pm.prod_name,
       pm.prod_spec,
	pm.prod_unit,
       pi.pass_qty,
       pi.epep_dt,
       cd.comncode_dtnm,
       ep.remark
FROM   prod_insp pi
	JOIN processform pf
       ON pi.procs_no = pf.procs_no
       JOIN prod_master pm
       ON pf.prod_code = pm.prod_code
       LEFT JOIN epis ep
       ON pi.insp_id = ep.insp_id
       LEFT JOIN comncode_dt cd
       ON ep.eps = cd.comncode_detailid
WHERE  1=1
	AND pf.prog = '100'
	AND pf.now_procs = '포장'
       AND pi.final_result = 'p'`;

const insert_epis = `insert_epis(?,?,?,?,?)`;

module.exports = {
  // 사용할 쿼리문의 이름을 여기에 적으세요
  selectEpIsManage,
  insert_epis,
};
