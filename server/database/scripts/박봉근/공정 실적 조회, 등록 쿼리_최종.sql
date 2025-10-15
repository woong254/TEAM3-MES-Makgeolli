-- 작업지시목록 쿼리
SELECT  ml.mk_ord_no "작업지시코드",
		mf.writing_date "지시일자",
        mf.mk_name "지시명",
        md.prod_code "제품코드",
        pdm.prod_name "제품명",
        pdm.prod_spec "규격",
        ccd.comncode_dtnm "단위",
        md.mk_num "지시수량",
		pd.seq_no "공정순서",
		pcm.proc_id "공정코드",
        pcm.proc_name "공정명",
		pcss.procs_st "실적상태"
FROM makelist ml JOIN makeform mf
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
-- WHERE ml.mk_ord_no = 'MK-20251014-004' 
ORDER BY ml.mk_list ASC, md.mk_priority ASC, pd.seq_no ASC;

-- 설비 선택 쿼리
SELECT  em.equip_code,
		em.equip_name,
        comn.comncode_dtnm
FROM proc_master pm JOIN equip_master em
					  ON em.equip_type = pm.equip_type
					JOIN comncode_dt comn
					  ON em.equip_status = comn.comncode_detailid
WHERE pm.proc_name = '세미';

-- 작업자 선택
select *
from emp_master
where role = (select  comncode_detailid
			  from comncode_dt
			  where comncode_dtnm = '작업자');

