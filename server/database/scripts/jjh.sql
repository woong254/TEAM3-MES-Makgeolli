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

-- 주문서 조회 페이지 쿼리문
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
       ON   od.prod_code = p.prod_code
WHERE  o.ord_name LIKE '%막걸리%';

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

-- 거래처기준관리, 거래처 데이터 삽입
INSERT INTO bcnc_master(bcnc_code, bcnc_name, bcnc_type, brn, pic, biz_type, bcnc_category, bcnc_tel, writer, write_date)
				VALUES (1, '예담', '매입처', '123-45-67890', '손태화', '도매업', '대형할인점', '010-1234-1234', '장준현', sysdate());
                
-- 제품기준관리, 제품 데이터 삽입
INSERT INTO prod_master(prod_code, prod_name, prod_type, prod_spec, prod_unit, exp, exp_unit, prod_lt, prod_ltunit, writer, write_date)
				VALUES ('MAK_001', '생막걸리(750ml*20병)','완제품','20병','P-BOX', 30,'일',10,'일','장준현',sysdate());			

-- 주문서상세, 주문서상세 제품 데이터 삽입                
INSERT INTO orderdetail(ord_id, no, prod_code, op_qty, ofd_st)
				VALUES ('20251002-01',1,'MAK_001',20,'주문완료');
                
-- 주문서조회, 주문서 데이터 삽입
INSERT INTO orderform(ord_id, ord_name, due_date, bcnc_code, emp_id, ord_date, ord_knd, order_status)
			   VALUES('20251002-01', '생막걸리예담주문', '2025-10-10','1','EMP-20250616-0001', '2025-10-02','생막걸리(750ml*20병)외2건','주문완료');
                        
                        
