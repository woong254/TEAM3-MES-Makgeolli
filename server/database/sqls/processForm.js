// table : processForm
const insertedResult = `
SELECT  pf.procs_no,
        pf.mk_qty,
		    pf.fail_qty,	
        pf.pass_qty, 	
        DATE_FORMAT(pf.procs_bgntm, '%Y-%m-%d') AS procs_bgntm,	
        pf.inpt_qty,	
        sum(pf.inpt_qty) AS prev_input_qty,	
        (md.mk_num - sum(pf.inpt_qty)) AS remain_qty
FROM	  processform pf
		    JOIN makedetail md
        ON pf.mk_list = md.mkd_no
WHERE	  procs_no = ?
GROUP BY  pf.mk_list,
          md.mk_num,
          pf.inpt_qty,
          pf.mk_qty,
          pf.fail_qty,
          pf.pass_qty,
          pf.procs_bgntm`;
module.exports = { insertedResult };
