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
	IN p_ord_name  VARCHAR(10),
    IN p_emp_name  VARCHAR(100),
    IN p_bcnc_name VARCHAR(100),
    IN p_due_date  DATE,
    IN p_ord_knd   VARCHAR(30),
    IN p_no		   INT(2),
    IN p_prod_code VARCHAR(100),
    IN p_op_qty    DECIMAL(9,2)
)
BEGIN
	SELECT CONCAT('ORD', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(ord_id, -3)),0) + 1, 3, '0'))) 
    INTO   @new_ord_id
	FROM   orderform
	WHERE  SUBSTR(ord_id, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
	FOR UPDATE;
     
	INSERT INTO orderform(
		ord_id,
		ord_name,
        emp_id,
        bcnc_code,        
		due_date,        		
		ord_knd)
	VALUES(
		@new_ord_id,
        p_ord_name,
        (SELECT emp_id
		 FROM   emp_master
         WHERE  emp_name = p_emp_name),
        (SELECT bcnc_code
		 FROM   bcnc_master
         WHERE  bcnc_name = p_bcnc_name),
        p_due_date,
        p_ord_knd);
        
	INSERT INTO orderdetail (
		ord_id,
        no,
        prod_code,
        op_qty)
	VALUES (
		@new_ord_id,
        p_no,
        p_prod_code,
        p_op_qty);
    
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

-- 테이블 foreign키 넣는 코드
ALTER TABLE orderform ADD CONSTRAINT FOREIGN KEY(bcnc_code) REFERENCES bcnc_master(bcnc_code);
ALTER TABLE orderdetail ADD CONSTRAINT FOREIGN KEY(ord_id) REFERENCES orderform(ord_id);
ALTER TABLE orderdetail ADD CONSTRAINT FOREIGN KEY(prod_code) REFERENCES prod_master(prod_code);

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
DESC proc_insp;

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
                        
DELETE FROM orderform
WHERE  ord_id = 'ORD2510001';
