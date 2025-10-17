/*
-- 작업지시목록 쿼리 (실패-봉근-내가 한 코드)
SELECT  ml.mk_ord_no "작업지시코드",
				mf.writing_date "지시일자",
        mf.mk_name "지시명",							
        md.prod_code "제품코드",				o
        pdm.prod_name "제품명",
        pdm.prod_spec "규격",
        ccd.comncode_dtnm "단위",
        md.mk_num "지시수량",						o
		pd.seq_no "공정순서",								o
		pcm.proc_id "공정코드",							o
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
*/

-- 작업지시목록 쿼리 (교수님 코드 응용)
SELECT  mkd.mkd_no, -- 생산지시상세번호
		mkf.mk_ord_no, -- 작업지시코드
        mkf.writing_date, -- 작업일자
		mkf.mk_name, -- 작업지시명
 	    mkd.prod_code, -- 제품코드
        prod.prod_name, -- 제품명
        comn1.comncode_dtnm, -- 규격
        prod.prod_spec, -- 단위
        mkd.mk_num, -- 지시수량
        pfd.seq_no, -- 공정순서
        pfd.proc_id, -- 공정코드
        pm.proc_name, -- 공정이름
        (SELECT IFNULL(SUM(inpt_qty),0) FROM processform WHERE mk_list = mkf.mk_ord_no) AS total_inpt_qty, -- 해당 지시건을 기반으로 총 투입량
        mkd.mk_priority, -- 우선순위
        pm.equip_type -- 설비유형
FROM makeform mkf
     JOIN makedetail mkd
     ON mkf.mk_ord_no = mkd.mk_ord_no
     JOIN proc_flow_master pfm
     ON mkd.prod_code = pfm.prod_code
     JOIN prod_master prod
     ON pfm.prod_code = prod.prod_code
     JOIN comncode_dt comn1
     ON prod.prod_unit = comn1.comncode_detailid
     JOIN proc_flow_detail pfd
     ON pfm.flow_id = pfd.flow_id
     JOIN proc_master pm
     ON pfd.proc_id = pm.proc_id
WHERE mkf.mk_st <> 'p3';

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

