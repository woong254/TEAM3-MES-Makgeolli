use mes;

-- mat_master : 자재 샘플
SELECT *
FROM mat_master;

INSERT INTO mat_master (mat_code, mat_name, mat_item_code, mat_spec, mat_unit, safe_stock, mat_info, writer, write_date)
VALUES ('M0001', '멥쌀', 'a1', '20kg', '포대', 100, '막걸리 주재료', '정지웅', '2025-02-01');

INSERT INTO mat_master (mat_code, mat_name, mat_item_code, mat_spec, mat_unit, safe_stock, mat_info, writer, write_date)
VALUES ('M0002', '찹쌀', 'a1', '20kg', '포대', 50, '단맛 및 점성 보강용', '정지웅', '2025-02-02');

INSERT INTO mat_master (mat_code, mat_name, mat_item_code, mat_spec, mat_unit, safe_stock, mat_info, writer, write_date)
VALUES ('M0003', '전통누룩', 'a1', '10kg', '팩', 50, '발효용 전통 효모', '정지웅', '2025-03-15');

INSERT INTO mat_master (mat_code, mat_name, mat_item_code, mat_spec, mat_unit, safe_stock, mat_info, writer, write_date)
VALUES ('M0004', '건조효모', 'a1', '5kg', '팩', 50, '속발효용 상업용 효모', '정지웅', '2025-03-15');

INSERT INTO mat_master (mat_code, mat_name, mat_item_code, mat_spec, mat_unit, safe_stock, mat_info, writer, write_date)
VALUES ('M0005', '정제설탕', 'a2', '20kg', '봉지', 100, '당도 조절용', '정지웅', '2025-03-17');

UPDATE mat_master
SET mat_code = 'M-20250317-001'
WHERE mat_code = 'M0005';



-- 공통코드 : 품목유형구분코드
INSERT INTO comncode (comncode_id, comncode_name, writer, write_date)
VALUES ('0A', '품목유형구분코드', 'admin', '2025-01-01');

SELECT * 
FROM comncode;

INSERT INTO comncode_dt (comncode_detailid, comncode_dtnm, comncode_id) 
VALUES ('a1', '주자재', '0A');
INSERT INTO comncode_dt (comncode_detailid, comncode_dtnm, comncode_id) 
VALUES ('a2', '부자재', '0A');
INSERT INTO comncode_dt (comncode_detailid, comncode_dtnm, comncode_id) 
VALUES ('a3', '재공품', '0A');
INSERT INTO comncode_dt (comncode_detailid, comncode_dtnm, comncode_id) 
VALUES ('a4', '반제품', '0A');
INSERT INTO comncode_dt (comncode_detailid, comncode_dtnm, comncode_id) 
VALUES ('a5', '완제품', '0A');

SELECT * 
FROM comncode_dt;

ALTER TABLE mes.comncode_dt
DROP COLUMN comncode_id2;



-- 제품 :

SELECT *
FROM prod_master;

UPDATE prod_master
SET prod_spec = '20병'
WHERE prod_code = 'MAK_001';


-- 제품/자재 조회

-- union all 합치기 
SELECT prod_code AS t_id
	,prod_name AS t_name
    ,prod_type AS t_type
	,prod_spec AS t_spec
    ,prod_unit AS t_unit
    ,'자재' AS t_category
FROM prod_master
UNION ALL
SELECT mat_code AS t_id
	,mat_name AS t_name
    ,mat_item_code AS t_type
    ,mat_spec AS t_spec
    ,mat_unit AS t_unit
    ,'제품' AS t_category
FROM mat_master;

-- 공통코드 join 
SELECT
	p.prod_code AS t_id
	,p.prod_name AS t_name
    ,p.prod_type AS t_type
    ,c.comncode_dtnm AS t_type_name
	,p.prod_spec AS t_spec
    ,p.prod_unit AS t_unit
    ,'자재' AS t_category
FROM prod_master p
JOIN comncode_dt c 
  ON p.prod_type = c.comncode_detailid
 AND c.comncode_id = '0A'
UNION ALL
SELECT 
	m.mat_code AS t_id
	,m.mat_name AS t_name
    ,m.mat_item_code AS t_type
    ,c.comncode_dtnm AS t_type_name
    ,m.mat_spec AS t_spec
    ,m.mat_unit AS t_unit
    ,'제품' AS t_category
FROM mat_master m
JOIN comncode_dt c
  ON m.mat_item_code = c.comncode_detailid
 AND c.comncode_id = '0A';






