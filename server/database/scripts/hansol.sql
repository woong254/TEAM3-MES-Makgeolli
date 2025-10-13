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



-- 25-10-13(월)
-- 기존 프로시저 삭제 
DROP PROCEDURE IF EXISTS insp_master_insert;

-- 품질기준관리 등록 프로시저 
DELIMITER $$
CREATE PROCEDURE insp_master_insert (
    /* ===== 공통 ===== */
    IN p_insp_item_name      VARCHAR(200),
    IN p_insp_type           CHAR(1),          -- 'R': 범위형, 'S': 관능형
    IN p_use_yn              CHAR(1), 
    IN p_insp_method         VARCHAR(1000),
    IN p_insp_file_name      VARCHAR(50),
    IN p_writer              VARCHAR(100),

    /* ===== 범위형 파라미터 ===== */
    IN p_min_range           DECIMAL(6,2),
    IN p_min_range_spec      CHAR(2),
    IN p_max_range           DECIMAL(6,2),
    IN p_max_range_spec      CHAR(2),
    IN p_unit                VARCHAR(5),

    /* ===== 관능형 파라미터 ===== */
    IN p_max_score           INT,
    IN p_pass_score          DECIMAL(6,2),
    IN p_pass_score_spec     CHAR(2),

    /* ===== 임시테이블 세션키 ===== */
    IN p_session_questions   VARCHAR(64),
    IN p_session_targets     VARCHAR(64)
)
BEGIN
    /* =========================
       1) 변수 선언
       ========================= */
    DECLARE v_insp_item_id    VARCHAR(100);

    -- 관능형(질문)
    DECLARE v_ques_id         VARCHAR(100);
    DECLARE v_next_order      INT;
    DECLARE v_qname           VARCHAR(100);

    -- 대상 타깃
    DECLARE v_insp_target_type CHAR(3);     -- '제품' 또는 '자재'
    DECLARE v_insp_target_code VARCHAR(100);-- a1~a5 (품목구분)
    DECLARE v_product_code     VARCHAR(100);
    DECLARE v_mat_code         VARCHAR(100);
    DECLARE v_insp_target_id   VARCHAR(100);

    DECLARE done INT DEFAULT 0;

    /* =========================
       2) 커서 선언
       ========================= */
    DECLARE cur_q CURSOR FOR
        SELECT ques_name
          FROM tmp_sen_questions
         WHERE session_id = p_session_questions
         ORDER BY id;

    DECLARE cur_t CURSOR FOR
        SELECT insp_target_type, insp_target_code, product_code, mat_code
          FROM tmp_targets
         WHERE session_id = p_session_targets;

    /* =========================
       3) 핸들러 선언
       ========================= */
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    /* =========================
       4) 본문
       ========================= */
    START TRANSACTION;

    /* 4-1) QC ID 생성 (QC-YYYYMMDD-###) */
    SELECT CONCAT(
             'QC-',
             DATE_FORMAT(NOW(), '%Y%m%d'),
             '-',
             LPAD(IFNULL(MAX(CAST(RIGHT(insp_item_id,3) AS UNSIGNED)),0) + 1, 3, '0')
           )
      INTO v_insp_item_id
      FROM qc_master
     WHERE SUBSTR(insp_item_id, 4, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
     FOR UPDATE;

    /* 4-2) 관능 필수값 검증 */
    IF p_insp_type = 'S' AND (p_max_score IS NULL OR p_pass_score IS NULL OR p_pass_score_spec IS NULL) THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT='관능형은 max_score, pass_score, pass_score_spec이 필수입니다.';
    END IF;

    /* 4-3) qc_master INSERT */
    INSERT INTO qc_master (
        insp_item_id, insp_item_name, insp_type, use_yn, insp_method, file_name,
        max_score, pass_score, pass_score_spec,
        writer, write_date
    ) VALUES (
        v_insp_item_id, p_insp_item_name, p_insp_type, IFNULL(p_use_yn,'Y'),
        p_insp_method, p_insp_file_name,
        CASE WHEN p_insp_type='S' THEN p_max_score       ELSE NULL END,
        CASE WHEN p_insp_type='S' THEN p_pass_score      ELSE NULL END,
        CASE WHEN p_insp_type='S' THEN p_pass_score_spec ELSE NULL END,
        p_writer, NOW()
    );

    /* 4-4) 유형별 상세 */
    IF p_insp_type = 'R' THEN
        INSERT INTO qc_master_ran (
            insp_item_id, min_range, min_range_spec, max_range, max_range_spec, unit
        ) VALUES (
            v_insp_item_id, p_min_range, p_min_range_spec, p_max_range, p_max_range_spec, p_unit
        );

    ELSEIF p_insp_type = 'S' THEN
        SET done = 0;
        OPEN cur_q;
        read_q: LOOP
            FETCH cur_q INTO v_qname;
            IF done = 1 THEN
                LEAVE read_q;
            END IF;

            -- 질문 ID (QCS-YYYYMMDD-###)
            SELECT CONCAT(
                     'QCS-',
                     DATE_FORMAT(NOW(), '%Y%m%d'),
                     '-',
                     LPAD(IFNULL(MAX(CAST(RIGHT(ques_id,3) AS UNSIGNED)),0) + 1, 3, '0')
                   )
              INTO v_ques_id
              FROM qc_master_sen
             WHERE SUBSTR(ques_id, 5, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
             FOR UPDATE;

            -- 이 항목에서 다음 질문 순번
            SELECT COALESCE(MAX(ques_order),0) + 1
              INTO v_next_order
              FROM qc_master_sen
             WHERE insp_item_id = v_insp_item_id
             FOR UPDATE;

            INSERT INTO qc_master_sen (ques_id, ques_order, ques_name, insp_item_id)
            VALUES (v_ques_id, v_next_order, v_qname, v_insp_item_id);
        END LOOP;
        CLOSE cur_q;
    END IF;

    /* 4-5) 검사대상 다건 */
    SET done = 0;
    OPEN cur_t;
    read_t: LOOP
        FETCH cur_t INTO v_insp_target_type, v_insp_target_code, v_product_code, v_mat_code;
        IF done = 1 THEN
            LEAVE read_t;
        END IF;

        -- 타깃 ID (QCT-YYYYMMDD-###)
        SELECT CONCAT(
                 'QCT-',
                 DATE_FORMAT(NOW(), '%Y%m%d'),
                 '-',
                 LPAD(IFNULL(MAX(CAST(RIGHT(insp_target_id,3) AS UNSIGNED)),0) + 1, 3, '0')
               )
          INTO v_insp_target_id
          FROM qc_master_target
         WHERE SUBSTR(insp_target_id, 5, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
         FOR UPDATE;

        /* ★ 변경 포인트: 제품/자재 분기를 코드(R1~R5)가 아니라 타입으로 판별 */
        INSERT INTO qc_master_target (
            insp_target_id, insp_target_type, insp_target_code,
            product_code, mat_code, insp_item_id
        ) VALUES (
            v_insp_target_id,
            v_insp_target_type,    -- '제품' 또는 '자재'
            v_insp_target_code,    -- a1~a5 그대로 저장
            CASE WHEN v_insp_target_type = '제품' THEN v_product_code ELSE NULL END,
            CASE WHEN v_insp_target_type = '자재' THEN v_mat_code     ELSE NULL END,
            v_insp_item_id
        );
    END LOOP;
    CLOSE cur_t;

    COMMIT;
END $$
DELIMITER ;

-- 관능 질문 임시테이블
CREATE TABLE IF NOT EXISTS tmp_sen_questions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  ques_name  VARCHAR(100) NOT NULL
);

-- 검사대상 임시테이블
CREATE TABLE IF NOT EXISTS tmp_targets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id        VARCHAR(64) NOT NULL,
  insp_target_type  VARCHAR(100)     NOT NULL,    
  insp_target_code  CHAR(3) NOT NULL,    -- R1~R5
  product_code      VARCHAR(100) NULL,
  mat_code          VARCHAR(100) NULL
);


-- 날짜/작성자 추가
ALTER TABLE qc_master
  ADD COLUMN writer     VARCHAR(100) NULL COMMENT '작성자',
  ADD COLUMN write_date DATETIME     NULL COMMENT '작성일자';

UPDATE qc_master
   SET writer     = '이한솔',
       write_date = Now()
WHERE insp_item_id = 'QC-20251013-003';


-- 검사대상 조회 (CASE로 자재/제품 구분 -> 좀더 명시적으로 사용 가능)
SELECT qcm.insp_item_id
      ,qcm.insp_item_name
      ,CASE 
          WHEN qct.product_code IS NOT NULL THEN p.prod_name
          WHEN qct.mat_code IS NOT NULL     THEN m.mat_name
          ELSE NULL
       END AS target_name
      ,c.comncode_dtnm      AS insp_target_name
      ,qcm.use_yn
FROM qc_master qcm
LEFT JOIN qc_master_target qct
       ON qct.insp_item_id = qcm.insp_item_id
LEFT JOIN comncode_dt c
       ON c.comncode_detailid = qct.insp_target_code 
LEFT JOIN prod_master AS p
       ON p.prod_code = qct.product_code
LEFT JOIN mat_master AS m
       ON m.mat_code = qct.mat_code
ORDER BY qcm.write_date;

-- 검사대상 조회(COALESCE 함수사용)
SELECT qcm.insp_item_id
      ,qcm.insp_item_name
      ,COALESCE(p.prod_name, m.mat_name) AS target_name  -- 제품명/자재명 중 하나
      ,c.comncode_dtnm      AS insp_target_name 
      ,qcm.use_yn
FROM qc_master qcm
LEFT JOIN qc_master_target qct
       ON qct.insp_item_id = qcm.insp_item_id
LEFT JOIN comncode_dt c
       ON c.comncode_detailid = qct.insp_target_code 
LEFT JOIN prod_master AS p
       ON p.prod_code = qct.product_code
LEFT JOIN mat_master AS m
       ON m.mat_code = qct.mat_code
ORDER BY qcm.write_date;



-- 품질기준관리 삭제 프로시저
DELIMITER $$
CREATE PROCEDURE insp_master_delete(IN p_insp_item_id VARCHAR(100))
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN ROLLBACK; RESIGNAL; END;

  START TRANSACTION;
    DELETE FROM qc_master_sen    WHERE insp_item_id = p_insp_item_id;
    DELETE FROM qc_master_ran    WHERE insp_item_id = p_insp_item_id;
    DELETE FROM qc_master_target WHERE insp_item_id = p_insp_item_id;
    DELETE FROM qc_master        WHERE insp_item_id = p_insp_item_id;
  COMMIT;
END$$
DELIMITER ;



-- 품질기준관리 수정 프로시저 (변경된 사항만 수정하는 것보다 재적재 방식이 안전하고 덜복잡)
DELIMITER $$

CREATE PROCEDURE insp_master_update (
    /* ===== 식별자 ===== */
    IN p_insp_item_id       VARCHAR(100),

    /* ===== 공통 ===== */
    IN p_insp_item_name     VARCHAR(200),
    IN p_insp_type          CHAR(1),          -- 'R' or 'S'
    IN p_use_yn             CHAR(1),
    IN p_insp_method        VARCHAR(1000),
    IN p_insp_file_name     VARCHAR(50),

    /* ===== 범위형 파라미터 ===== */
    IN p_min_range          DECIMAL(6,2),
    IN p_min_range_spec     CHAR(2),
    IN p_max_range          DECIMAL(6,2),
    IN p_max_range_spec     CHAR(2),
    IN p_unit               VARCHAR(5),

    /* ===== 관능형 파라미터 ===== */
    IN p_max_score          INT,
    IN p_pass_score         DECIMAL(4,2),
    IN p_pass_score_spec    CHAR(2),

    /* ===== 임시테이블 세션키 ===== */
    IN p_session_questions  VARCHAR(64),
    IN p_session_targets    VARCHAR(64),

    /* ===== 작성자 ===== */
    IN p_writer             VARCHAR(50)
)
BEGIN
    DECLARE done INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    /* 1) 기본정보 업데이트 */
    UPDATE qc_master
       SET insp_item_name = p_insp_item_name,
           insp_type      = p_insp_type,
           use_yn         = IFNULL(p_use_yn,'Y'),
           insp_method    = p_insp_method,
           file_name      = p_insp_file_name,
           max_score      = CASE WHEN p_insp_type='S' THEN p_max_score       ELSE NULL END,
           pass_score     = CASE WHEN p_insp_type='S' THEN p_pass_score      ELSE NULL END,
           pass_score_spec= CASE WHEN p_insp_type='S' THEN p_pass_score_spec ELSE NULL END,
           update_user    = p_writer,
           update_date    = NOW()
     WHERE insp_item_id = p_insp_item_id;

    /* 2) 유형별 상세 싹 초기화 */
    DELETE FROM qc_master_ran WHERE insp_item_id = p_insp_item_id;
    DELETE FROM qc_master_sen WHERE insp_item_id = p_insp_item_id;

    /* 3) 유형별 상세 재적재 */
    IF p_insp_type = 'R' THEN
        INSERT INTO qc_master_ran (
            insp_item_id, min_range, min_range_spec, max_range, max_range_spec, unit
        ) VALUES (
            p_insp_item_id, p_min_range, p_min_range_spec, p_max_range, p_max_range_spec, p_unit
        );
    ELSEIF p_insp_type = 'S' THEN
        /* tmp_sen_questions → qc_master_sen 재적재 (질문 순번은 tmp id 오름차순 기준) */
        INSERT INTO qc_master_sen (ques_id, ques_order, ques_name, insp_item_id)
        SELECT 
            CONCAT('QCS-', DATE_FORMAT(NOW(),'%Y%m%d'), '-', LPAD(ROW_NUMBER() OVER (ORDER BY id), 3, '0')) AS ques_id,
            ROW_NUMBER() OVER (ORDER BY id) AS ques_order,
            ques_name,
            p_insp_item_id
          FROM tmp_sen_questions
         WHERE session_id = p_session_questions;
    END IF;

    /* 4) 대상 타깃 싹 초기화 후 재적재 */
    DELETE FROM qc_master_target WHERE insp_item_id = p_insp_item_id;

    INSERT INTO qc_master_target (
        insp_target_id, insp_target_type, insp_target_code,
        product_code, mat_code, insp_item_id
    )
    SELECT
        CONCAT('QCT-', DATE_FORMAT(NOW(),'%Y%m%d'), '-', LPAD(ROW_NUMBER() OVER (ORDER BY id), 3, '0')) AS insp_target_id,
        insp_target_type,
        insp_target_code,
        CASE WHEN insp_target_type='제품' THEN product_code ELSE NULL END,
        CASE WHEN insp_target_type='자재' THEN mat_code ELSE NULL END,
        p_insp_item_id
      FROM tmp_targets
     WHERE session_id = p_session_targets;

    COMMIT;
END $$

DELIMITER ;