use mes;

-- 인덱스 정의서 쿼리문
SELECT INDEX_SCHEMA -- 데이터베이스명
     , TABLE_NAME -- 테이블명
     , INDEX_NAME -- 인덱스명
     , GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS INDEX_COLUMNS -- 컬럼명
     , CASE NON_UNIQUE WHEN 1 THEN 'NON_UNIQUE' ELSE 'UNIQUE' END AS IS_UNIQUE -- 인덱스유형
     , SEQ_IN_INDEX -- 위치
     , COLLATION -- 정렬 ( A:ASC, D:DESC)
  FROM INFORMATION_SCHEMA.STATISTICS
 WHERE TABLE_SCHEMA NOT IN ('INFORMATION_SCHEMA', 'MYSQL', 'PERFORMANCE_SCHEMA', 'SYS')
 GROUP BY INDEX_SCHEMA
        , INDEX_NAME
        , INDEX_TYPE
        , NON_UNIQUE
        , TABLE_NAME
 ORDER BY INDEX_SCHEMA
        , INDEX_NAME;

-- 주문서조회-주문서조회검색-조회버튼
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
       ON   od.prod_code = p.prod_code;

-- 주문서관리-주문서상세조회검색-조회버튼-주문서상세정보
SELECT o.ord_id,
	   o.ord_name,
       b.bcnc_name,
       b.pic,
       o.ord_date,
       o.due_date,
       e.emp_name
FROM   orderform o
	   JOIN bcnc_master b
       ON   o.bcnc_code = b.bcnc_code
       JOIN emp_master e
       ON   o.emp_id = e.emp_id;
       
-- 주문서관리-주문서상세조회검색-조회버튼-주문제품
SELECT od.prod_code,
       p.prod_name,
       p.prod_spec,
       p.prod_unit,
       od.op_qty
FROM   orderdetail od
	   JOIN orderform o
       ON   od.ord_id = o.ord_id
       JOIN prod_master p
       ON   od.prod_code = p.prod_code
WHERE  o.ord_name = '생막걸리예담주문';
	   
-- ord_id자동생성
SELECT  CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MIN(SUBSTR(ord_id, -3)),0) + 1, 3, '0')) FROM orderform;
-- ord_id자동생성
SELECT CONCAT('ORD', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(ord_id, -3)),0) + 1, 3, '0'))) 
FROM orderform
WHERE SUBSTR(ord_id, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
FOR UPDATE;
 
-- 주문서관리-주문서상세정보-저장버튼
DELIMITER $$

CREATE PROCEDURE add_form(
    IN p_ord_id    VARCHAR(20),   -- 수정 시 기존 ord_id 전달, 신규면 NULL
    IN p_ord_name  VARCHAR(50),
    IN p_emp_name  VARCHAR(100),
    IN p_bcnc_name VARCHAR(100),
    IN p_due_date  DATE,
    IN p_ord_knd   VARCHAR(100),
    IN p_remark    VARCHAR(500),
    IN p_products  JSON
)
BEGIN
    DECLARE target_ord_id VARCHAR(20);
    DECLARE i INT DEFAULT 0;
    DECLARE prod_count INT;

    IF p_ord_id IS NULL OR p_ord_id = '' THEN
        -- 신규 주문서 생성
        SELECT CONCAT('ORD', CONCAT(DATE_FORMAT(NOW(), '%y%m'), LPAD(IFNULL(MAX(SUBSTR(ord_id, -3)),0)+1,3,'0')))
        INTO target_ord_id
        FROM orderform
        WHERE SUBSTR(ord_id, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
        FOR UPDATE;

        INSERT INTO orderform(
            ord_id, ord_name, emp_id, bcnc_code, due_date, ord_knd, remark
        )
        VALUES(
            target_ord_id,
            p_ord_name,
            (SELECT emp_id FROM emp_master WHERE emp_name = p_emp_name),
            (SELECT bcnc_code FROM bcnc_master WHERE bcnc_name = p_bcnc_name),
            p_due_date,
            p_ord_knd,
            p_remark
        );
    ELSE
        -- 기존 주문서 수정
        SET target_ord_id = p_ord_id;

        UPDATE orderform
        SET
            ord_name = p_ord_name,
            emp_id = (SELECT emp_id FROM emp_master WHERE emp_name = p_emp_name),
            bcnc_code = (SELECT bcnc_code FROM bcnc_master WHERE bcnc_name = p_bcnc_name),
            due_date = p_due_date,
            ord_knd = p_ord_knd,
            remark = p_remark
        WHERE ord_id = target_ord_id;

        -- 기존 orderdetail 삭제
        DELETE FROM orderdetail WHERE ord_id = target_ord_id;
    END IF;

    -- orderdetail 삽입
    SET prod_count = JSON_LENGTH(p_products);
    WHILE i < prod_count DO
        INSERT INTO orderdetail(ord_id, no, prod_code, op_qty, remark)
        VALUES(
            target_ord_id,
            JSON_EXTRACT(p_products, CONCAT('$[', i, '].no')),
            JSON_UNQUOTE(JSON_EXTRACT(p_products, CONCAT('$[', i, '].prod_code'))),
            JSON_EXTRACT(p_products, CONCAT('$[', i, '].op_qty')),
            JSON_UNQUOTE(JSON_EXTRACT(p_products, CONCAT('$[', i, '].remark')))
        );
        SET i = i + 1;
    END WHILE;

    -- 저장된 주문서와 상세 데이터 조회
    SELECT 
		o.ord_id,
		o.ord_name,
		e.emp_name,
		b.bcnc_name,
        o.ord_date,
		o.due_date,
		o.ord_knd,
		o.remark
	FROM orderform o
	LEFT JOIN emp_master e ON o.emp_id = e.emp_id
	LEFT JOIN bcnc_master b ON o.bcnc_code = b.bcnc_code
	WHERE o.ord_id = target_ord_id;

    SELECT 
        od.no, 
        od.prod_code,
        p.prod_name,
        p.prod_spec,     
		p.prod_unit,
        od.op_qty, 
        od.remark
    FROM orderdetail od
    LEFT JOIN prod_master p ON od.prod_code = p.prod_code
    WHERE od.ord_id = target_ord_id
    ORDER BY od.no;

END $$
DELIMITER ;
-- 제품 등록 프로시저 실행
CALL add_form('testOne','장준현','예담','2025-10-30','생막걸리(750ml*20병)외3건',1,'MAK_001',1);
-- add_form 삭제       
DROP PROCEDURE IF EXISTS add_form;      

-- 주문서관리-주문서상세정보-거래처명-조회
SELECT bcnc_name,
	   pic,
       brn
FROM   bcnc_master
WHERE  1=1;
-- AND    bcnc_name LIKE '예담'; 

-- 제품 조회 프로시저
DELIMITER $$
CREATE PROCEDURE search_products(
    IN p_name VARCHAR(50),
    IN p_spec VARCHAR(50),
    IN p_unit VARCHAR(20)
)
BEGIN
    SELECT prod_code,
		   prod_name,
           prod_spec,
           prod_unit           
    FROM   prod_master
    WHERE (p_name IS NULL OR prod_name LIKE CONCAT('%', p_name, '%'))
      AND (p_spec IS NULL OR prod_spec LIKE CONCAT('%', p_spec, '%'))
      AND (p_unit IS NULL OR prod_unit = p_unit);
END $$
DELIMITER ;
-- 제품 조회 프로시저 실행
CALL search_products(null,null,null);
-- add_form 삭제       
DROP PROCEDURE IF EXISTS search_products;      
       
-- 제품단위 구분코드 조회
SELECT comncode_dtnm
FROM   comncode_dt
WHERE  comncode_id = '0B';

-- 완제품검사합격처리된 제품을 입고하기위해 합격된 완제품 조회 
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
       AND pi.final_result = 'p';
       
-- 완제품 입고 관리 조회 입고버튼 프로시저
DELIMITER $$
CREATE PROCEDURE insert_epis(
    IN p_insp_id VARCHAR(50),
    IN p_prod_code VARCHAR(50),
    IN p_pass_qty INT,
    IN p_epep_dt DATE,
    IN p_remark VARCHAR(255)
)
BEGIN
    DECLARE target_ep_lot VARCHAR(20);
    
    -- 순번 계산
    SELECT CONCAT(
         'EPRO',
         DATE_FORMAT(p_epep_dt, '%y%m%d'),   -- 유통기한 YYMMDD
         DATE_FORMAT(NOW(), '%y%m%d'),       -- 등록일자 YYMMDD
         LPAD(IFNULL(MAX(CAST(SUBSTR(ep_lot,17,3) AS UNSIGNED)), 0) + 1, 3, '0') -- 순번 3자리
    ) 
    INTO target_ep_lot
    FROM epis
    WHERE SUBSTR(ep_lot,5,6) = DATE_FORMAT(p_epep_dt, '%y%m%d') -- 유통기한 기준 그룹화
      AND SUBSTR(ep_lot,11,6) = DATE_FORMAT(NOW(), '%y%m%d')    -- 등록일 기준 그룹화
    FOR UPDATE;

    -- 데이터 INSERT
    INSERT INTO epis(ep_lot, insp_id, prod_code, epis_qty, ep_qty, epep_dt, remark)
    VALUES(target_ep_lot, p_insp_id, p_prod_code, p_pass_qty, p_pass_qty, p_epep_dt, p_remark);
END $$
DELIMITER ;

-- 제품 조회 프로시저 실행
CALL insert_epis();
-- add_form 삭제       
DROP PROCEDURE IF EXISTS insert_epis;      

-- 완제품출고관리조회
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
FROM	orderdetail od
		JOIN orderform o
        ON od.ord_id = o.ord_id
        JOIN bcnc_master bm
        ON o.bcnc_code = bm.bcnc_code
        JOIN prod_master pm
        ON od.prod_code = pm.prod_code
        JOIN epis e
        ON od.prod_code = e.prod_code
        JOIN comncode_dt cd
        ON od.ofd_st = cd.comncode_detailid;
        

       
SELECT *
FROM   orderform;
SELECT *
FROM   emp_master;
SELECT *
FROM   bcnc_master;
SELECT *
FROM   orderdetail;
SELECT *
FROM   prod_master;
SELECT *
FROM   comncode_dt;
SELECT *
FROM   prod_insp;
SELECT *
FROM   makelist;
SELECT *
FROM   equip_master;
SELECT *
FROM   processform;
SELECT *
FROM   epis;
SELECT *
FROM   edcts;	


-- 테이블 foreign키 넣는 코드
ALTER TABLE orderform ADD CONSTRAINT FOREIGN KEY(bcnc_code) REFERENCES bcnc_master(bcnc_code);
ALTER TABLE orderdetail ADD CONSTRAINT FOREIGN KEY(ord_id) REFERENCES orderform(ord_id);
ALTER TABLE orderdetail ADD CONSTRAINT FOREIGN KEY(prod_code) REFERENCES prod_master(prod_code);
ALTER TABLE orderform ADD CONSTRAINT FOREIGN KEY(order_status) REFERENCES comncode_dt(comncode_detailid);
ALTER TABLE epis ADD CONSTRAINT FOREIGN KEY(eps) REFERENCES comncode_dt(comncode_detailid);
-- edcts의 ofd_no에 orderdetail의 ofd_no를 foreign키로 넣는 코드
ALTER TABLE edcts ADD CONSTRAINT FOREIGN KEY(ofd_no) REFERENCES orderdetail(ofd_no);
-- edcts의 ep_lot에 epis의 ep_lot를 foreign키로 넣는 코드
ALTER TABLE edcts ADD CONSTRAINT FOREIGN KEY(ep_lot) REFERENCES epis(ep_lot);

-- 테이블 컬럼 추가 코드
ALTER TABLE proc_insp ADD COLUMN epep_dt date;

-- 테이블 이름 바꾸는 코드 
ALTER TABLE bcnc_master CHANGE field5 biz_type varchar(100);

-- 테이블 제약조건 바꾸는 코드 not null
ALTER TABLE bcnc_master MODIFY COLUMN biz_type varchar(100) NOT NULL;

DESC orderform;
DESC orderdetail;
DESC prod_master;
DESC bcnc_master;
DESC equip_downtime;
DESC equip_repair;
DESC equip_inspection;
DESC emp_master;
DESC qc_master;
DESC prod_insp;
DESC processform;
DESC epis;
DESC edcts;

-- 거래처기준관리, 거래처 데이터 삽입
INSERT INTO bcnc_master(bcnc_code, bcnc_name, bcnc_type, brn, pic, biz_type, bcnc_category, bcnc_tel, writer, write_date)
				VALUES (1, '예담', '매입처', '123-45-67890', '손태화', '도매업', '대형할인점', '010-1234-1234', '장준현', sysdate());
                
-- 제품기준관리, 제품 데이터 삽입
INSERT INTO prod_master(prod_code, prod_name, prod_type, prod_spec, prod_unit, exp, exp_unit, prod_lt, prod_ltunit, writer, write_date)
				VALUES ('MAK_001', '생막걸리(750ml*20병)','완제품','20병','P-BOX', 30,'일',10,'일','장준현',sysdate());			

-- 주문서상세, 주문서상세 제품 데이터 삽입                
INSERT INTO orderdetail(ord_id, no, prod_code, op_qty, ofd_st)
				VALUES ('20251002-01',1,'MAK_001',20,'주문완료');
INSERT INTO orderdetail(ord_id, no, prod_code, op_qty, ofd_st)
				VALUES ('20251002-01',2,'MAK_001',20,'주문완료');
                
-- 주문서조회, 주문서 데이터 삽입
INSERT INTO orderform(ord_id, ord_name, due_date, bcnc_code, emp_id, ord_date, ord_knd, order_status)
			   VALUES('20251002-01', '생막걸리예담주문', '2025-10-10','1','EMP-20250616-0001', '2025-10-02','생막걸리(750ml*20병)외2건','주문완료');
               
-- 완제품검사 테이블 임시 데이터 삽입
INSERT INTO prod_insp (insp_id, insp_name, pass_qty, procs_no, epep_dt, final_result)
VALUES
  ('test01', '테스트01', 500, 100, '2025-11-04', 'P'),
  ('test02', '테스트02', 400, 101, '2025-11-07', 'P'),
  ('test03', '테스트03', 500, 102, '2025-11-10', 'P'),
  ('test04', '테스트04', 500, 103, '2025-11-20', 'P'),
  ('test05', '테스트05', 500, 104, '2025-11-15', 'P'),
  ('test06', '테스트06', 500, 105, '2025-11-13', ''),
  ('test07', '테스트07', 500, 106, '2025-11-13', 'F'),
  ('test08', '테스트08', 500, 107, '2025-11-15', 'P'),
  ('test09', '테스트09', 500, 108, '2025-11-12', 'P'),
  ('test10', '테스트10', 500, 109, '2025-11-11', 'P'),
  ('test11', '테스트11', 500, 110, '2025-11-10', 'P'),
  ('test12', '테스트12', 500, 111, '2025-11-20', 'P'),
  ('test13', '테스트13', 500, 112, '2025-11-25', 'P');              
               
-- 공정실적관리 테이블 임시 데이터 삽입
INSERT INTO processform(procs_no, mk_list, equip_code, emp_no, prod_code, inpt_qty, mk_qty, fail_qty, pass_qty, prog,now_procs)
VALUES
    (100, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-001',500,500,0,500,'100','포장'),
    (101, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-002',500,500,0,500,'100','포장'),
    (102, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-003',500,500,0,500,'99','포장'),
    (103, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-004',500,500,0,500,'100','병입'),
    (104, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-005',500,500,0,500,'100','포장'),
    (105, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-006',500,500,0,500,'100','포장'),
    (106, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-007',500,500,0,500,'100','포장'),
    (107, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-008',500,500,0,500,'100','포장'),
    (108, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-009',500,500,0,500,'100','포장'),
    (109, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-010',500,500,0,500,'100','포장'),
    (110, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-011',500,500,0,500,'100','포장'),
    (111, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-012',500,500,0,500,'100','포장'),
    (112, 100, 'EQP-MK015','EMP-20250616-0001','PROD-20250101-001',500,500,0,500,'100','포장'); 

                 
                        
DELETE FROM orderform
WHERE  ord_id = 'ORD2510005';
DELETE FROM orderdetail
WHERE  ofd_no = 44;
DELETE FROM orderform
WHERE  ord_id = 'ORD2510005';
DELETE FROM orderform
WHERE  ord_id = 'ORD2510006';
DELETE FROM epis
WHERE  ep_lot = 'EPRO251115251014001';
DELETE FROM epis;
TRUNCATE TABLE epis;
DELETE FROM edcts;
TRUNCATE TABLE edcts;

SELECT *
FROM   epis;

SELECT prod_code, prod_name
FROM prod_master
WHERE prod_code IN ('PROD-20250101-001','PROD-20250101-002','PROD-20250101-003');

-- 제품 출고 관리 조회1
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
FROM	orderdetail od
		JOIN orderform o 
		ON od.ord_id = o.ord_id
		JOIN bcnc_master bm 
		ON o.bcnc_code = bm.bcnc_code
		JOIN prod_master pm 
		ON od.prod_code = pm.prod_code
		JOIN epis e 
		ON od.prod_code = e.prod_code
		JOIN comncode_dt cd 
		ON od.ofd_st = cd.comncode_detailid
WHERE 	e.epep_dt = (
		SELECT	MIN(e2.epep_dt)
		FROM 	epis e2
		WHERE 	e2.prod_code = od.prod_code
				AND e2.ep_qty > 0  -- 재고가 0인 LOT 제외
)
ORDER BY od.ofd_no, e.epep_dt;

-- 제품 출고 관리 조회2
SELECT 
    od.ofd_no,
    o.ord_name,
    bm.bcnc_name,
    od.prod_code,
    pm.prod_name,
    pm.prod_spec,
    pm.prod_unit,
    od.op_qty AS ord_qty,
  IFNULL(SUM(e.ord_epos_qty), 0) AS shipped_qty,   -- 누적 출고량
  (od.op_qty - IFNULL(SUM(e.ord_epos_qty), 0)) AS remain_qty, -- 미출고량
    o.due_date,
    e.ep_lot,
    e.epep_dt,
    e.ep_qty,
    cd.comncode_dtnm
FROM orderdetail od
	JOIN orderform o 
    ON od.ord_id = o.ord_id
	JOIN bcnc_master bm 
    ON o.bcnc_code = bm.bcnc_code
	JOIN prod_master pm 
    ON od.prod_code = pm.prod_code
	JOIN comncode_dt cd 
    ON od.ofd_st = cd.comncode_detailid
	JOIN (
		SELECT prod_code, MIN(epep_dt) AS min_epep_dt
		FROM epis
		WHERE ep_qty > 0
		GROUP BY prod_code
	) em 
    ON em.prod_code = od.prod_code
	JOIN epis e 
    ON e.prod_code = em.prod_code AND e.epep_dt = em.min_epep_dt
ORDER BY od.ofd_no, e.epep_dt;

-- 완제품 출고 관리 출고 버튼 기능
INSERT INTO edcts(ofd_no, ep_lot, ord_epos_qty, remark)
VALUES (?,?,?,?);

-- 완제품 출고 관리 검색 조회 쿼리문
SELECT 
    od.ofd_no,
    o.ord_name,
    bm.bcnc_name,
    od.prod_code,
    pm.prod_name,
    pm.prod_spec,
    cd_pu.comncode_dtnm as prod_unit,
    od.op_qty AS ord_qty,
    IFNULL(SUM(ed.ord_epos_qty), 0) AS shipped_qty,                 -- 누적 출고량
    (od.op_qty - IFNULL(SUM(ed.ord_epos_qty), 0)) AS remain_qty,    -- 미출고량
    o.due_date,
    e.ep_lot,
    e.epep_dt,
    e.ep_qty,
    cd.comncode_dtnm
FROM orderdetail od
    JOIN orderform o 
        ON od.ord_id = o.ord_id
    JOIN bcnc_master bm 
        ON o.bcnc_code = bm.bcnc_code
    JOIN prod_master pm 
        ON od.prod_code = pm.prod_code
    JOIN comncode_dt cd 
        ON od.ofd_st = cd.comncode_detailid
	JOIN comncode_dt cd_pu
		ON pm.prod_unit = cd_pu.comncode_detailid
    JOIN (
        SELECT prod_code, MIN(epep_dt) AS min_epep_dt
        FROM epis
        GROUP BY prod_code
    ) em 
        ON em.prod_code = od.prod_code
    JOIN epis e 
        ON e.prod_code = em.prod_code 
        AND e.epep_dt = em.min_epep_dt
    LEFT JOIN edcts ed                   
        ON od.ofd_no = ed.ofd_no
	
GROUP BY 
    od.ofd_no,
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
ORDER BY 
    o.due_date, 
    e.epep_dt;

UPDATE epis
SET ep_qty = ep_qty - ?,
    epos_qty = epos_qty + ?
WHERE prod_code = ? AND ep_lot = ?;
  
UPDATE orderdetail od
SET od.ofd_st = 'o2'
WHERE od.ofd_no = ?
  AND (
    SELECT SUM(od.op_qty - ec.ord_epos_qty)
    FROM edcts ec
    WHERE ec.ofd_no = od.ofd_no
  ) = 0;
  
-- 완제품입고관리 테이블-루트 재고수량이 0이면 상태가 출고완료로 전환
UPDATE 	epis
SET 	eps = 'm1'
WHERE 	ep_lot = ?
AND	 	ep_qty = 0;

-- 출고버튼을 누르면 주문서 상세테이블에 있는 선택한 제품의 상태가 모두 출고완료일경우 주문서 테이블에 있는 선택한 제품의 주문서의 상태도 출고완료로 바뀌게 하기
UPDATE	orderform
SET		order_status = 'n2'
WHERE	ord_id = ?
AND	NOT EXISTS (
	SELECT	1
    FROM	orderdetail od
    WHERE	

-- 출고완료후 확인해야하는것들
-- 루트테이블 조회 후 eps값 재고 및 출고수량 잘 들어왔는지
SELECT	*
FROM  	epis;
-- 완제품출고관리테이블 잘 들어갔는지 확인
SELECT	*
FROM	edcts;
-- 주문서상세테이블에 ofd_st상태가 바꼈는지 확인
SELECT	*
FROM	orderdetail;
-- 주문서테이블에 order_status가 바꼈는지 확인
SELECT	*
FROM	orderform;





SELECT 	comncode_dtnm
FROM	equip_master e
		JOIN comncode_dt c
        ON e.equip_status = c.comncode_detailid;
        
        
SELECT	equip_code,
		equip_name,
		equip_type,
		manager,
		c.comncode_dtnm as equip_status,
		insp_cycle
FROM 	equip_master e
		JOIN comncode_dt c
        ON e.equip_status = c.comncode_detailid;