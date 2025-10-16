use mes;

select *
from bcnc_master;

INSERT INTO bcnc_master 
(bcnc_code, bcnc_name, bcnc_type, brn, pic, biz_type, bcnc_category, email, bcnc_tel, fax, remark, writer, write_date)
VALUES
(2, '은하상사', '매출처', '234-56-78901', '조은하', '유통업', '식자재 도매상', 'eunha@wholesale.com', '010-8888-9999', '02-999-8888', '주류 납품 거래처', '장준현', '2025-10-08'),
(3, '한강막걸리집', '매출처', '345-67-89012', '오한결', '요식업', '주점/식당', 'hangang@bar.co.kr', '010-7777-5555', '02-222-1111', '정기 납품처', '장준현', '2025-10-08'),
(4, '전통유통', '매출처', '456-78-90123', '정우석', '도매업', '전통주 전문 도매상', 'jeontong@tradewine.co.kr', '010-3333-2222', '02-555-6666', '지방권 납품처', '장준현', '2025-10-08'),
(5, '마실마켓', '매출처', '567-89-01234', '이한빛', '온라인판매', '전통주 전문몰', 'masil@market.co.kr', '010-4444-3333', '02-444-3333', '온라인 납품처', '장준현', '2025-10-08'),

-- 매입처 (writer: 정지웅)
(6, '농협', '매입처', '234-56-78910', '박지은', '농업', '농산물 협동조합', 'nh@nonghyup.co.kr', '010-2222-3333', '02-987-6543', '쌀 및 곡물 공급', '정지웅', '2025-10-08'),
(7, '청솔패키지', '매입처', '678-90-12345', '김태호', '제조업', '병 및 포장재 납품', 'chspkg@naver.com', '010-4444-5555', '02-333-2222', '막걸리 병 공급', '정지웅', '2025-10-08'),
(8, '참누룩', '매입처', '789-01-23456', '윤지성', '식품원재료', '누룩 제조업체', 'cham@nuruk.co.kr', '010-6666-7777', '02-777-6666', '전통누룩 공급', '정지웅', '2025-10-08'),
(9, '그린라벨', '매입처', '890-12-34567', '최미나', '인쇄업', '라벨 인쇄업체', 'greenlabel@print.co.kr', '010-9999-0000', '02-333-4444', '라벨 디자인 공급', '정지웅', '2025-10-08'),
(10, '우리농산', '매입처', '901-23-45678', '김유진', '농업', '쌀 납품업체', 'woorifarm@farm.co.kr', '010-1010-2020', '055-777-8888', '신규 쌀 공급처', '정지웅', '2025-10-08');

SELECT CONCAT('BAL-', LPAD(
  IFNULL(MAX(CAST(SUBSTRING(pur_code, 5) AS UNSIGNED)), 0) + 1,
  3,
  '0'
)) AS pur_code
FROM pur_form
WHERE pur_code LIKE 'BAL-%';



ALTER TABLE pur_mat
ADD CONSTRAINT FK_PUR_CODE
FOREIGN KEY (PUR_CODE)
REFERENCES pur_form(PUR_CODE)
ON DELETE CASCADE;

ALTER TABLE pur_form
ALTER COLUMN pur_status SET DEFAULT '입고대기';

INSERT INTO pur_form (pur_code, emp_id, bcnc_code, pur_name, pur_date, receipt_date, pur_status, remark) VALUES
('PUR-001', 'EMP-20250616-0003', 6,  '250925농협발주',      '2025-09-25', '2025-09-28', '입고대기', '맵쌀(농협) 발주'),
('PUR-002', 'EMP-20250616-0003', 6,  '250815농협발주',      '2025-08-15', '2025-08-20', '입고완료', '맵쌀(농협) 추가 발주'),
('PUR-003', 'EMP-20250616-0003', 10, '250920우리농산발주',  '2025-09-20', '2025-09-22', '부분입고', '찹쌀(우리농산) 일부 입고'),
('PUR-004', 'EMP-20250616-0003', 10, '250710우리농산발주',  '2025-07-10', '2025-07-15', '입고대기', '찹쌀(우리농산) 요청'),
('PUR-005', 'EMP-20250616-0003', 8,  '250512삼누룩발주',    '2025-05-12', '2025-05-15', '입고완료', '전통누룩(삼누룩) 납품완료'),
('PUR-006', 'EMP-20250616-0003', 8,  '250420삼누룩발주',    '2025-04-20', '2025-04-25', '입고대기', '전통누룩(삼누룩) 발주'),
('PUR-007', 'EMP-20250616-0003', 2,  '250910은하상사발주',  '2025-09-10', '2025-09-12', '입고완료', '건조효모(은하상사) 납품완료'),
('PUR-008', 'EMP-20250616-0003', 2,  '250605은하상사발주',  '2025-06-05', '2025-06-07', '부분입고', '건조효모(은하상사) 일부입고'),
('PUR-009', 'EMP-20250616-0003', 9,  '250310그린라벨발주',  '2025-03-10', '2025-03-12', '부분입고', '정제설탕(그린라벨) 일부입고'),
('PUR-010', 'EMP-20250616-0003', 9,  '250214그린라벨발주',  '2025-02-14', '2025-02-18', '입고완료', '정제설탕(그린라벨) 납품완료');

INSERT INTO pur_form (pur_code, emp_id, bcnc_code, pur_name, pur_date, receipt_date, pur_status, remark) VALUES
('PUR-001', 'EMP-20250616-0003', 10, '251007우리농산발주', '2025-10-07', '2025-10-08', '입고대기', NULL),
('PUR-002', 'EMP-20250616-0003', 10, '251005우리농산발주', '2025-10-05', '2025-10-06', '입고완료', '긴급 발주'),

('PUR-003', 'EMP-20250616-0003', 6, '251006농협발주', '2025-10-06', '2025-10-07', '부분입고', NULL),
('PUR-004', 'EMP-20250616-0003', 6, '251004농협발주', '2025-10-04', '2025-10-05', '입고완료', NULL),

('PUR-005', 'EMP-20250616-0003', 7, '251003청솔패키지발주', '2025-10-03', '2025-10-04', '입고대기', '샘플 발주건'),
('PUR-006', 'EMP-20250616-0003', 7, '251002청솔패키지발주', '2025-10-02', '2025-10-03', '입고완료', NULL),

('PUR-007', 'EMP-20250616-0003', 8, '251001참누룩발주', '2025-10-01', '2025-10-02', '부분입고', NULL),
('PUR-008', 'EMP-20250616-0003', 8, '250930참누룩발주', '2025-09-30', '2025-10-01', '입고대기', NULL),

('PUR-009', 'EMP-20250616-0003', 9, '250929그린라벨발주', '2025-09-29', '2025-09-30', '입고완료', '디자인 변경 요청 포함'),
('PUR-010', 'EMP-20250616-0003', 9, '250928그린라벨발주', '2025-09-28', '2025-09-29', '입고대기', NULL);


-- 먼저 컬럼이 이미 있다면 삭제 (에러 무시해도 됨)
ALTER TABLE pur_mat DROP COLUMN unreceipt_qty;

-- 자동 계산 컬럼 다시 생성
ALTER TABLE pur_mat
ADD COLUMN unreceipt_qty DECIMAL(10,2)
    GENERATED ALWAYS AS (pur_qty - receipt_qty) STORED;
    

DELIMITER $$

CREATE TRIGGER trg_set_receipt_status_before_insert
BEFORE INSERT ON pur_mat
FOR EACH ROW
BEGIN
    IF NEW.receipt_qty = 0 THEN
        SET NEW.receipt_status = '입고대기';
    ELSEIF NEW.receipt_qty < NEW.pur_qty THEN
        SET NEW.receipt_status = '부분입고';
    ELSE
        SET NEW.receipt_status = '입고완료';
    END IF;
END$$

CREATE TRIGGER trg_set_receipt_status_before_update
BEFORE UPDATE ON pur_mat
FOR EACH ROW
BEGIN
    IF NEW.receipt_qty = 0 THEN
        SET NEW.receipt_status = '입고대기';
    ELSEIF NEW.receipt_qty < NEW.pur_qty THEN
        SET NEW.receipt_status = '부분입고';
    ELSE
        SET NEW.receipt_status = '입고완료';
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE update_pur_form_status(IN p_pur_code VARCHAR(100))
BEGIN
    DECLARE total INT;
    DECLARE complete INT;
    DECLARE waiting INT;

    SELECT COUNT(*) INTO total
    FROM pur_mat
    WHERE pur_code = p_pur_code;

    SELECT COUNT(*) INTO complete
    FROM pur_mat
    WHERE pur_code = p_pur_code AND receipt_status = '입고완료';

    SELECT COUNT(*) INTO waiting
    FROM pur_mat
    WHERE pur_code = p_pur_code AND receipt_status = '입고대기';

    IF complete = total THEN
        UPDATE pur_form SET pur_status = '입고완료' WHERE pur_code = p_pur_code;
    ELSEIF waiting = total THEN
        UPDATE pur_form SET pur_status = '입고대기' WHERE pur_code = p_pur_code;
    ELSE
        UPDATE pur_form SET pur_status = '부분입고' WHERE pur_code = p_pur_code;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_update_pur_form_status_after_insert
AFTER INSERT ON pur_mat
FOR EACH ROW
BEGIN
    CALL update_pur_form_status(NEW.pur_code);
END$$

CREATE TRIGGER trg_update_pur_form_status_after_update
AFTER UPDATE ON pur_mat
FOR EACH ROW
BEGIN
    CALL update_pur_form_status(NEW.pur_code);
END$$

DELIMITER ;

ALTER TABLE pur_mat
MODIFY COLUMN pur_mat_id INT NOT NULL AUTO_INCREMENT;

-- PUR-001 발주서: 멥쌀 1000개 발주, 0개 입고 (입고대기)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty, remark)
VALUES ('PUR-001', 'M-20250201-001', 1000, 0, '긴급 발주');

-- PUR-001 발주서: 정제설탕 300개 발주, 150개 입고 (부분입고)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-001', 'M-20250317-001', 300, 150);

-- PUR-002: 찹쌀 500개 발주, 500개 입고 (입고완료)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-002', 'M-20250202-001', 500, 500);

-- PUR-003: 전통누룩 400개 발주, 200개 입고 (부분입고)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty, remark)
VALUES ('PUR-003', 'M-20250315-001', 400, 200, '품질 확인 필요');

-- PUR-003: 건조효모 300개 발주, 300개 입고 (입고완료)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-003', 'M-20250315-002', 300, 300);

-- PUR-004: 멥쌀 800개 발주, 0개 입고 (입고대기)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-004', 'M-20250201-001', 800, 0);

-- PUR-005: 찹쌀 600개 발주, 100개 입고 (부분입고)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-005', 'M-20250202-001', 600, 100);

-- PUR-006: 전통누룩 700개 발주, 700개 입고 (입고완료)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-006', 'M-20250315-001', 700, 700);

-- PUR-007: 건조효모 200개 발주, 0개 입고 (입고대기)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-007', 'M-20250315-002', 200, 0);

-- PUR-008: 정제설탕 400개 발주, 400개 입고 (입고완료)
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-008', 'M-20250317-001', 400, 400);

UPDATE pur_mat SET receipt_qty = receipt_qty WHERE pur_code = 'PUR-003';

DELIMITER $$

DROP PROCEDURE IF EXISTS update_pur_form_status$$

CREATE PROCEDURE update_pur_form_status(IN p_pur_code VARCHAR(20))
BEGIN
    DECLARE total INT DEFAULT 0;
    DECLARE complete INT DEFAULT 0;
    DECLARE waiting INT DEFAULT 0;

    SELECT COUNT(*) INTO total
    FROM pur_mat
    WHERE pur_code = p_pur_code;

    SELECT COUNT(*) INTO complete
    FROM pur_mat
    WHERE pur_code = p_pur_code AND receipt_status = '입고완료';

    SELECT COUNT(*) INTO waiting
    FROM pur_mat
    WHERE pur_code = p_pur_code AND receipt_status = '입고대기';

    IF complete = total THEN
        UPDATE pur_form SET pur_status = '입고완료' WHERE pur_code = p_pur_code;
    ELSEIF waiting = total THEN
        UPDATE pur_form SET pur_status = '입고대기' WHERE pur_code = p_pur_code;
    ELSE
        UPDATE pur_form SET pur_status = '부분입고' WHERE pur_code = p_pur_code;
    END IF;
END$$

DELIMITER ;

-- PUR-001: 멥쌀 1000 발주, 입고 0 → 입고대기
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty, remark)
VALUES ('PUR-001', 'M-20250201-001', 1000, 0, '긴급 요청');

-- PUR-002: 찹쌀 500 발주, 입고 0 → 입고대기
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-002', 'M-20250202-001', 500, 0);

-- PUR-003: 전통누룩 400 발주, 입고 200 → 부분입고
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty, remark)
VALUES ('PUR-003', 'M-20250315-001', 400, 200, '검수 중');

-- PUR-003: 정제설탕 300 발주, 입고 300 → 입고완료
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-003', 'M-20250317-001', 300, 300);

-- PUR-004: 찹쌀 600 발주, 입고 600 → 입고완료
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-004', 'M-20250202-001', 600, 600);

-- PUR-005: 건조효모 300 발주, 입고 300 → 입고완료
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-005', 'M-20250315-002', 300, 300);

-- PUR-006: 멥쌀 700 발주, 입고 0 → 입고대기
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty, remark)
VALUES ('PUR-006', 'M-20250201-001', 700, 0, '재고 없음');

-- PUR-007: 찹쌀 400 발주, 입고 200 → 부분입고
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-007', 'M-20250202-001', 400, 200);

-- PUR-008: 전통누룩 800 발주, 입고 800 → 입고완료
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-008', 'M-20250315-001', 800, 800);

-- PUR-009: 정제설탕 500 발주, 입고 500 → 입고완료
INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty)
VALUES ('PUR-009', 'M-20250317-001', 500, 500);

INSERT INTO pur_mat (pur_code, mat_code, pur_qty, receipt_qty, remark)
VALUES ('PUR-010', 'M-20250315-002', 600, 0, '검수 전');

ALTER TABLE lot_mat
  MODIFY stock_qty DECIMAL(10,2) AS (receipt_qty - release_qty) STORED;

DELIMITER $$

CREATE TRIGGER trg_lot_mat_bi
BEFORE INSERT ON lot_mat
FOR EACH ROW
BEGIN
  SET NEW.stock_qty = NEW.receipt_qty - NEW.release_qty;
END$$

CREATE TRIGGER trg_lot_mat_bu
BEFORE UPDATE ON lot_mat
FOR EACH ROW
BEGIN
  SET NEW.stock_qty = NEW.receipt_qty - NEW.release_qty;
END$$

DELIMITER ;

SELECT *
FROM mat_master;

insert into lot_mat
  (mat_lot, mat_code, exp_date, prod_date, receipt_qty, release_qty, remark)
values
('wr-260210','m-20250201-001','2026-02-10','2025-02-10',400.00,0.00,'멥쌀 20kg 포대 20개'),
('wr-260401','m-20250201-001','2026-04-01','2025-04-01',200.00,0.00,'멥쌀 20kg 포대 10개'),
('gr-260205','m-20250202-001','2026-02-05','2025-02-05',200.00,0.00,'찹쌀 20kg 포대 10개'),
('gr-260501','m-20250202-001','2026-05-01','2025-05-01',100.00,0.00,'찹쌀 20kg 포대 5개'),
('nr-250916','m-20250315-001','2025-09-16','2025-03-16',100.00,0.00,'전통누룩 10kg 포대 10개'),
('ym-270312','m-20250315-002','2027-03-12','2025-03-12',25.00,0.00,'건조효모 5kg 팩 5개'),
('sg-270318','m-20250317-001','2027-03-18','2025-03-18',400.00,0.00,'정제설탕 20kg 봉지 20개');

  SELECT
  m.mat_code,
  m.mat_name,
  COALESCE(SUM(l.receipt_qty - l.release_qty), 0) AS stock,  -- LOT 합계
  m.safe_stock,
  m.mat_spec,
  m.mat_unit
FROM mat_master m
LEFT JOIN lot_mat l
  ON l.mat_code = m.mat_code
GROUP BY m.mat_code, m.mat_name, m.safe_stock, m.mat_spec, m.mat_unit
ORDER BY m.mat_code;

ALTER TABLE pur_form
  ADD UNIQUE KEY uk_pur_code (pur_code);

ALTER TABLE pur_mat
  ADD UNIQUE KEY uk_pur_mat (pur_code, mat_code);
  
ALTER TABLE pur_mat
  MODIFY pur_mat_id INT NOT NULL AUTO_INCREMENT;
  
DELETE 
FROM pur_form
WHERE pur_code = 'PUR-012';

ALTER TABLE pur_mat
  MODIFY receipt_qty    DECIMAL(10,2) NOT NULL DEFAULT 0,
  MODIFY unreceipt_qty  DECIMAL(10,2) NOT NULL DEFAULT 0,
  MODIFY receipt_status VARCHAR(100)  NOT NULL DEFAULT '입고대기';
  
  ALTER TABLE pur_mat DROP COLUMN unreceipt_qty;

ALTER TABLE pur_mat
ADD COLUMN unreceipt_qty DECIMAL(10,2)
    GENERATED ALWAYS AS (pur_qty - receipt_qty) STORED;
    
SELECT (COUNT(*) > 0) AS has_match
FROM pur_form f JOIN pur_mat m 
ON m.pur_code = f.pur_code
WHERE f.receipt_date = '2025-10-14'
  AND f.bcnc_code        = '8'
  AND m.mat_code        = 'M-20250315-001'
  AND m.unreceipt_qty  >= 50;
  
  SELECT *
  FROM iis;


UPDATE iis
SET pass_qty = 18,
fail_qty = 2
WHERE iis_id = 9; 

UPDATE mat_receipt SET receipt_qty = 0 WHERE receipt_qty IS NULL;

ALTER TABLE mat_receipt DROP INDEX uq_mat_receipt_iis_id;

use mes;

select *
from edcts;

select *
from pur_form;

UPDATE pur_mat
SET receipt_qty = 200
WHERE pur_mat_id = 14;


DELIMITER $$

DROP TRIGGER IF EXISTS pur_mat_bu $$
CREATE TRIGGER pur_mat_bu
BEFORE UPDATE ON `pur_mat`   -- 🔹 테이블명을 실제와 동일(소문자)하게
FOR EACH ROW
BEGIN
  SET NEW.PUR_QTY     = IFNULL(NEW.PUR_QTY, 0);
  SET NEW.RECEIPT_QTY = IFNULL(NEW.RECEIPT_QTY, 0);

  IF NEW.RECEIPT_QTY < 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'receipt_qty는 음수일 수 없습니다.';
  END IF;

  IF NEW.RECEIPT_QTY > NEW.PUR_QTY THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '입고량이 발주수량을 초과합니다.';
  END IF;

  SET NEW.UNRECEIPT_QTY = GREATEST(NEW.PUR_QTY - NEW.RECEIPT_QTY, 0);

  SET NEW.RECEIPT_STATUS =
    CASE
      WHEN NEW.RECEIPT_QTY = 0 THEN '입고전'
      WHEN NEW.RECEIPT_QTY < NEW.PUR_QTY THEN '부분입고'
      ELSE '입고완료'
    END;
END $$
DELIMITER ;

CREATE INDEX ix_mat_receipt_lot ON mat_receipt(mat_lot);
CREATE INDEX ix_mat_release_lot ON mat_release(mat_lot);

DELIMITER $$

CREATE OR REPLACE PROCEDURE sp_recompute_lot(IN p_mat_lot VARCHAR(100))
BEGIN
  DECLARE v_rcpt DECIMAL(10,2);
  DECLARE v_rel  DECIMAL(10,2);

  SELECT IFNULL(SUM(receipt_qty),0)
    INTO v_rcpt
  FROM mat_receipt
  WHERE mat_lot = p_mat_lot;

  SELECT IFNULL(SUM(release_qty),0)
    INTO v_rel
  FROM mat_release
  WHERE mat_lot = p_mat_lot;

  UPDATE lot_mat
     SET receipt_qty = v_rcpt,
         release_qty = v_rel,
         stock_qty   = v_rcpt - v_rel
   WHERE mat_lot = p_mat_lot;
END$$

DELIMITER ;

DELIMITER $$

CREATE OR REPLACE TRIGGER tr_mat_receipt_ai
AFTER INSERT ON mat_receipt
FOR EACH ROW
BEGIN
  CALL sp_recompute_lot(NEW.mat_lot);
END$$

CREATE OR REPLACE TRIGGER tr_mat_receipt_au
AFTER UPDATE ON mat_receipt
FOR EACH ROW
BEGIN
  IF OLD.mat_lot <> NEW.mat_lot THEN
    CALL sp_recompute_lot(OLD.mat_lot);
  END IF;
  CALL sp_recompute_lot(NEW.mat_lot);
END$$

CREATE OR REPLACE TRIGGER tr_mat_receipt_ad
AFTER DELETE ON mat_receipt
FOR EACH ROW
BEGIN
  CALL sp_recompute_lot(OLD.mat_lot);
END$$

DELIMITER ;

DELIMITER $$

-- 출고 초과 방지
CREATE OR REPLACE TRIGGER tr_mat_release_bi
BEFORE INSERT ON mat_release
FOR EACH ROW
BEGIN
  DECLARE v_stock DECIMAL(10,2);

  SELECT IFNULL(stock_qty,0)
    INTO v_stock
  FROM lot_mat
  WHERE mat_lot = NEW.mat_lot;

  IF NEW.release_qty < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '출고량은 음수일 수 없습니다.';
  END IF;

  IF NEW.release_qty > v_stock THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '출고량이 재고를 초과합니다.';
  END IF;
END$$

CREATE OR REPLACE TRIGGER tr_mat_release_bu
BEFORE UPDATE ON mat_release
FOR EACH ROW
BEGIN
  DECLARE v_stock DECIMAL(10,2);
  DECLARE v_allow DECIMAL(10,2);

  SELECT IFNULL(stock_qty,0)
    INTO v_stock
  FROM lot_mat
  WHERE mat_lot = NEW.mat_lot;

  SET v_allow = v_stock;
  IF NEW.mat_lot = OLD.mat_lot THEN
    SET v_allow = v_stock + IFNULL(OLD.release_qty,0);
  END IF;

  IF NEW.release_qty < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '출고량은 음수일 수 없습니다.';
  END IF;

  IF NEW.release_qty > v_allow THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '출고량이 재고를 초과합니다.';
  END IF;
END$$

-- 집계 재계산
CREATE OR REPLACE TRIGGER tr_mat_release_ai
AFTER INSERT ON mat_release
FOR EACH ROW
BEGIN
  CALL sp_recompute_lot(NEW.mat_lot);
END$$

CREATE OR REPLACE TRIGGER tr_mat_release_au
AFTER UPDATE ON mat_release
FOR EACH ROW
BEGIN
  IF OLD.mat_lot <> NEW.mat_lot THEN
    CALL sp_recompute_lot(OLD.mat_lot);
  END IF;
  CALL sp_recompute_lot(NEW.mat_lot);
END$$

CREATE OR REPLACE TRIGGER tr_mat_release_ad
AFTER DELETE ON mat_release
FOR EACH ROW
BEGIN
  CALL sp_recompute_lot(OLD.mat_lot);
END$$

DELIMITER ;

ALTER TABLE mat_receipt
  ADD UNIQUE KEY uq_receipt_iis (iis_id);

 