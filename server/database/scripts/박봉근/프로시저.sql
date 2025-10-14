DELIMITER //

CREATE PROCEDURE add_makeForm (
  IN p_mk_name       VARCHAR(100),
  IN p_mk_bgnde      DATE,
  IN p_mk_ende       DATE,
  IN p_writing_date  DATE,
  IN p_remark        VARCHAR(1000),
  IN p_emp_id        VARCHAR(50),
  IN p_details_json  JSON  -- [{no, prod_code, mk_num, mk_priority, remark, pld_no}]
)
BEGIN
  DECLARE v_mk_ord_no VARCHAR(30);
  DECLARE v_mk_list   INT(100);
  DECLARE i           INT DEFAULT 0;
  DECLARE n           INT;

  START TRANSACTION;

  /* 1) 지시서 번호 생성 */
  SELECT CONCAT(
	'MK-', 
    DATE_FORMAT(NOW(), '%Y%m%d'), 
    '-', 
    LPAD(IFNULL(MAX(CAST(RIGHT(mk_ord_no, 3) AS UNSIGNED)), 0) + 1, 3, '0')
  )
  INTO v_mk_ord_no
  FROM makeform
  WHERE SUBSTR(mk_ord_no,4,8)=DATE_FORMAT(NOW(),'%Y%m%d')
  FOR UPDATE;

  /* 2) makeform 헤더 INSERT */
  INSERT INTO makeform (mk_ord_no, 
						mk_name, 
                        mk_bgnde, 
                        mk_ende, 
                        writing_date, 
                        remark, 
                        emp_id)
  VALUES (v_mk_ord_no, 
		  p_mk_name, 
          p_mk_bgnde,
          p_mk_ende, 
          p_writing_date, 
          p_remark, 
          p_emp_id);

  /* 3) 상세 INSERT */
  SET n = JSON_LENGTH(p_details_json);
  WHILE i < n DO
	INSERT INTO makedetail (mk_ord_no, 
							no, 
                            prod_code, 
                            mk_num, 
                            mk_priority, 
                            remark, 
                            bom_code, 
                            pld_no)
	SELECT
		v_mk_ord_no,
		JSON_UNQUOTE(JSON_EXTRACT(p_details_json, CONCAT('$[',i,'].no')))           AS no,
		pm.prod_code,
		JSON_UNQUOTE(JSON_EXTRACT(p_details_json, CONCAT('$[',i,'].mk_num')))       AS mk_num,
		JSON_UNQUOTE(JSON_EXTRACT(p_details_json, CONCAT('$[',i,'].mk_priority')))  AS mk_priority,
		JSON_UNQUOTE(JSON_EXTRACT(p_details_json, CONCAT('$[',i,'].remark')))       AS remark,
		b.bom_code,
		COALESCE( NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p_details_json, CONCAT('$[',i,'].pld_no'))), 'null'), NULL ) AS pld_no
	FROM prod_master pm JOIN bom_master b 
						  ON b.prod_code = pm.prod_code
	WHERE pm.prod_code = JSON_UNQUOTE(JSON_EXTRACT(p_details_json, CONCAT('$[',i,'].prod_code')))
	AND b.use_yn = 'y';
	SET i = i + 1;
  END WHILE;
  
  /* makelist에 데이터 입력 */ 
  INSERT INTO makelist (mk_ord_no, 
                        flow_id)
  SELECT v_mk_ord_no, 
		 f.flow_id
  FROM makedetail d JOIN prod_master p 
					  ON d.prod_code = p.prod_code
					JOIN proc_flow_master f 
					  ON f.prod_code = d.prod_code
  WHERE d.mk_ord_no = v_mk_ord_no;

  COMMIT;

  /* 결과 반환 */
  SELECT v_mk_ord_no AS mk_ord_no, v_mk_list AS mk_list;
END //

DELIMITER ;

drop procedure add_makeForm;
