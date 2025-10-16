USE mes;

SELECT * FROM makeform;
SELECT mkd.*, pfd.*, pm.*
FROM makeform mkf
     JOIN makedetail mkd
     ON mkf.mk_ord_no = mkd.mk_ord_no
     JOIN proc_flow_master pfm
     ON mkd.prod_code = pfm.prod_code
     JOIN proc_flow_detail pfd
     ON pfm.flow_id = pfd.flow_id
     JOIN proc_master pm
     ON pfd.proc_id = pm.proc_id
WHERE mkf.mk_st <> 'p3';


SELECT mkd.mkd_no -- 생산지시상세번호
	   ,mkd.prod_code -- 제품코드
       ,mkd.mk_num -- 지시수량
       ,(SELECT IFNULL(SUM(inpt_qty),0) FROM processform WHERE mk_list = mkf.mk_ord_no) AS total_inpt_qty -- 해당 지시건을 기반으로 총 투입량
       ,mkd.mk_priority -- 우선순위
       ,pfd.seq_no -- 공정순서
       ,pfd.proc_id -- 공정코드
       ,pm.proc_name -- 공정이름
       ,pm.equip_type -- 설비유형
FROM makeform mkf
     JOIN makedetail mkd
     ON mkf.mk_ord_no = mkd.mk_ord_no
     JOIN proc_flow_master pfm
     ON mkd.prod_code = pfm.prod_code
     JOIN proc_flow_detail pfd
     ON pfm.flow_id = pfd.flow_id
     JOIN proc_master pm
     ON pfd.proc_id = pm.proc_id
WHERE mkf.mk_st <> 'p3';

SELECT * FROM processform;
