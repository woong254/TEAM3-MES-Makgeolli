// 공정실적관리

// 작업지시목록
const selectMakeAll = `
  SELECT  DISTINCT
          ROW_NUMBER() OVER (ORDER BY ml.mk_list ASC, md.mk_priority ASC, pd.seq_no ASC) AS no,
          ml.mk_ord_no,
		      DATE_FORMAT(mf.writing_date, '%Y-%m-%d') AS writing_date,
          mf.mk_name,
          md.prod_code,
          pdm.prod_name,
          pdm.prod_spec,
          ccd.comncode_dtnm,
          md.mk_num,
		      pd.seq_no,
		      pcm.proc_id,
          pcm.proc_name,
		      pcss.procs_st
  FROM  makelist ml JOIN makeform mf
                      ON ml.mk_ord_no = mf.mk_ord_no
                    JOIN makedetail md
                      ON mf.mk_ord_no = md.mk_ord_no
                    JOIN prod_master pdm
                      ON md.prod_code = pdm.prod_code
                    JOIN comncode_dt ccd
                      ON pdm.prod_unit = ccd.comncode_detailid
                    JOIN proc_flow_master p
                      ON ml.flow_id = p.flow_id
                      AND md.prod_code = p.prod_code
                    JOIN proc_flow_detail pd
                      ON p.flow_id = pd.flow_id
                    JOIN proc_master pcm
                      ON pd.proc_id = pcm.proc_id
                  LEFT JOIN processform pcss
                      ON ml.mk_list = pcss.mk_list
  ORDER BY ml.mk_list ASC, md.mk_priority ASC, pd.seq_no ASC
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
