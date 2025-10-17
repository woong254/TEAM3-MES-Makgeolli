// Table: bcnc_master, mat_master, pur_form, emp_master, pur_mat, lot_mat, iis, mat_receipt, mat_release, lot_seq

/* =========================
 *  목록/검색 (기존 그대로)
 * ========================= */
const selectPurList = `
  SELECT 
    p.pur_code,
    p.pur_name,
    COALESCE(b.bcnc_name, '') AS bcnc_name,
    p.pur_date,
    p.receipt_date,
    COALESCE(e.emp_name, '')  AS emp_name,
    p.remark
  FROM pur_form p
  LEFT JOIN bcnc_master b ON p.bcnc_code = b.bcnc_code
  LEFT JOIN emp_master  e ON p.emp_id    = e.emp_id
  WHERE p.pur_status = '입고대기'
  ORDER BY p.pur_code DESC
`;

const selectPurTarget = `
  SELECT 
    p.pur_code,
    p.pur_name,
    COALESCE(b.bcnc_name, '') AS bcnc_name,
    p.pur_date,
    p.receipt_date,
    COALESCE(e.emp_name, '')  AS emp_name,
    p.remark
  FROM pur_form p
  LEFT JOIN bcnc_master b ON p.bcnc_code = b.bcnc_code
  LEFT JOIN emp_master  e ON p.emp_id    = e.emp_id
  WHERE p.pur_status = '입고대기'
    AND p.pur_name LIKE ?
  ORDER BY p.pur_code DESC
`;

const selectPurHeaderByCode = `
  SELECT 
    p.pur_code,
    p.pur_name,
    p.bcnc_code,
    COALESCE(b.bcnc_name, '') AS bcnc_name,
    p.pur_date,
    p.receipt_date,
    p.emp_id,
    COALESCE(e.emp_name, '')  AS emp_name,
    p.remark
  FROM pur_form p
  LEFT JOIN bcnc_master b ON p.bcnc_code = b.bcnc_code
  LEFT JOIN emp_master  e ON p.emp_id    = e.emp_id
  WHERE p.pur_code = ?
`;

const selectPurLinesByCode = `
  SELECT
    pm.mat_code,
    m.mat_name,
    COALESCE(stock.stock_qty, 0) AS stock_qty,
    m.safe_stock,
    pm.pur_qty,
    m.mat_spec,
    m.mat_unit,
    pm.remark
  FROM pur_mat pm
  JOIN mat_master m ON m.mat_code = pm.mat_code
  LEFT JOIN (
    SELECT l.mat_code, SUM(l.receipt_qty - l.release_qty) AS stock_qty
    FROM lot_mat l
    GROUP BY l.mat_code
  ) stock ON stock.mat_code = pm.mat_code
  WHERE pm.pur_code = ?
  ORDER BY pm.mat_code
`;

const selectPurMatList = `
  SELECT
    m.mat_code,
    m.mat_name,
    COALESCE(SUM(l.receipt_qty - l.release_qty), 0) AS stock_qty,
    m.safe_stock,
    m.mat_spec,
    m.mat_unit
  FROM mat_master m
  LEFT JOIN lot_mat l ON l.mat_code = m.mat_code
  GROUP BY m.mat_code, m.mat_name, m.safe_stock, m.mat_spec, m.mat_unit
  ORDER BY m.mat_code
`;

const selectPurMatTarget = `
  SELECT
    m.mat_code,
    m.mat_name,
    COALESCE(SUM(l.receipt_qty - l.release_qty), 0) AS stock_qty,
    m.safe_stock,
    m.mat_spec,
    m.mat_unit
  FROM mat_master m
  LEFT JOIN lot_mat l ON l.mat_code = m.mat_code
  WHERE m.mat_name LIKE ?
  GROUP BY m.mat_code, m.mat_name, m.safe_stock, m.mat_spec, m.mat_unit
  ORDER BY m.mat_code
`;

const selectBcncList = `
  SELECT bcnc_code, bcnc_name, bcnc_category
  FROM bcnc_master
  WHERE bcnc_type = '매입처'
  ORDER BY CONVERT(bcnc_code, UNSIGNED INTEGER)
`;

const searchBcncTarget = `
  SELECT bcnc_code, bcnc_name, bcnc_category
  FROM bcnc_master
  WHERE bcnc_type = '매입처'
    AND bcnc_name LIKE ?
`;

const purCode = `
  SELECT CONCAT('PUR-', LPAD(
    IFNULL(MAX(CAST(SUBSTRING(pur_code, 5) AS UNSIGNED)), 0) + 1,
    3,
    '0'
  )) AS pur_code
  FROM pur_form
  WHERE pur_code LIKE 'PUR-%'
`;

/* =========================
 *  저장(등록/수정) (기존 그대로)
 * ========================= */
const existsPurForm = `
  SELECT COUNT(*) AS cnt
  FROM pur_form
  WHERE pur_code = ?
`;

const upsertPurForm = `
INSERT INTO pur_form
  (pur_code, emp_id, bcnc_code, pur_name, pur_date, receipt_date, pur_status, remark)
VALUES
  (?,        ?,      ?,         ?,        ?,        ?,            '입고대기', ?)
ON DUPLICATE KEY UPDATE
  emp_id       = VALUES(emp_id),
  bcnc_code    = VALUES(bcnc_code),
  pur_name     = VALUES(pur_name),
  pur_date     = VALUES(pur_date),
  receipt_date = VALUES(receipt_date),
  remark       = VALUES(remark)
`;

const selectMatCodesByPurCode = `
SELECT mat_code
FROM pur_mat
WHERE pur_code = ?
`;

const upsertOnePurMat = `
INSERT INTO pur_mat
  (pur_code, mat_code, pur_qty, remark)
VALUES
  (?,        ?,        ?,       ?)
ON DUPLICATE KEY UPDATE
  pur_qty = VALUES(pur_qty),
  remark  = VALUES(remark)
`;

const deleteOnePurMat = `
DELETE FROM pur_mat
WHERE pur_code = ? AND mat_code = ?
`;

const deletePur = `
DELETE FROM pur_form
WHERE pur_code = ?
`;

/* =========================
 *  가입고 입력/목록 (기존 그대로)
 * ========================= */
const insertIis = `
INSERT INTO iis (pur_code, bcnc_code, mat_code, prod_date, exp_date, pre_receipt_date, receipt_qty)
SELECT
  f.pur_code,
  f.bcnc_code,
  m.mat_code,
  ?,
  ?,
  ?,
  ?
FROM pur_form f JOIN pur_mat m 
ON f.pur_code = m.pur_code
WHERE f.receipt_date = ?
  AND f.bcnc_code    = ?
  AND m.mat_code     = ?
  AND (
        (m.pur_qty - IFNULL(m.receipt_qty,0)) 
        - (
            SELECT IFNULL(SUM(i.receipt_qty),0)
            FROM iis i
            WHERE i.pur_code = f.pur_code
              AND i.mat_code = m.mat_code
              AND i.insp_status IN ('검사대기','검사완료')
          )
      ) >= ?
ORDER BY f.pur_date DESC
LIMIT 1
`;

const iisList = `
SELECT
  i.iis_id,
  i.pur_code,
  f.pur_name,
  b.bcnc_name,
  i.mat_code,
  m.mat_name,
  m.mat_spec,
  m.mat_unit,
  i.prod_date,
  i.exp_date,
  i.pre_receipt_date,
  i.receipt_qty,
  i.pass_qty
FROM iis i
JOIN mat_master m ON m.mat_code  = i.mat_code
JOIN bcnc_master b ON b.bcnc_code = i.bcnc_code
JOIN pur_form f ON f.pur_code  = i.pur_code  
WHERE i.insp_status = ?
ORDER BY i.iis_id
`;

const deleteIis = `
DELETE
FROM iis
WHERE insp_status = '검사대기'
AND iis_id IN(?)
`;

const selectIisMatList = `
SELECT
  pm.pur_code,
  pf.pur_name,
  pf.bcnc_code,
  b.bcnc_name,
  pm.mat_code,
  m.mat_name,
  m.mat_spec,
  m.mat_unit,
  pm.unreceipt_qty,
  pm.receipt_status
FROM pur_mat pm
JOIN pur_form pf ON pf.pur_code = pm.pur_code
JOIN mat_master m ON m.mat_code = pm.mat_code
JOIN bcnc_master b ON b.bcnc_code = pf.bcnc_code
WHERE pm.receipt_status IN ('입고대기', '부분입고')
AND pf.receipt_date = CURDATE()
ORDER BY pm.pur_mat_id 
`;

const selectIisMatTarget = `
SELECT
  pm.pur_code,
  pf.pur_name,
  pf.bcnc_code,
  b.bcnc_name,
  pm.mat_code,
  m.mat_name,
  m.mat_spec,
  m.mat_unit,
  pm.unreceipt_qty,
  pm.receipt_status
FROM pur_mat pm
JOIN pur_form pf ON pf.pur_code = pm.pur_code
JOIN mat_master m ON m.mat_code = pm.mat_code
JOIN bcnc_master b ON b.bcnc_code = pf.bcnc_code
WHERE pm.receipt_status IN ('입고대기', '부분입고')
AND pf.receipt_date = CURDATE()
AND m.mat_name LIKE ?
ORDER BY pm.pur_mat_id 
`;

const iisModalBcnc = `
SELECT
  pf.bcnc_code,
  b.bcnc_name,
  b.bcnc_category
FROM pur_mat pm
JOIN pur_form pf ON pf.pur_code = pm.pur_code
JOIN mat_master m ON m.mat_code = pm.mat_code
JOIN bcnc_master b ON b.bcnc_code = pf.bcnc_code
WHERE pm.receipt_status IN ('입고대기', '부분입고')
AND pf.receipt_date = CURDATE()
`;

const iisModalMat = `
SELECT
  pm.mat_code,
  m.mat_name,
  COALESCE((
    SELECT SUM(l.receipt_qty - l.release_qty)
    FROM lot_mat l
    WHERE l.mat_code = m.mat_code
  ), 0) AS stock_qty,
  m.safe_stock,
  m.mat_spec,
  m.mat_unit
FROM pur_mat pm
JOIN pur_form pf  ON pf.pur_code = pm.pur_code
JOIN mat_master m ON m.mat_code  = pm.mat_code
WHERE pm.receipt_status IN ('입고대기', '부분입고')
  AND pf.receipt_date = CURDATE()
`;

// 검사완료건 조회 (발주누적용 receipt_qty, LOT/입고용 pass_qty 둘 다 꺼내옴)
const selectIisForRegister = `
SELECT
  i.iis_id,
  i.pur_code,
  i.mat_code,
  i.exp_date,
  i.prod_date,
  IFNULL(i.receipt_qty,0) AS receipt_qty,  -- 발주누적(pur_mat.receipt_qty +=)
  IFNULL(i.pass_qty,0)    AS pass_qty      -- LOT/입고이력(mat_receipt.receipt_qty)
FROM iis i
WHERE i.insp_status = '검사완료'
  AND i.iis_id IN (?)
ORDER BY i.iis_id
`;

// 같은 자재/유통기한 LOT 재사용
const selectLotForReuse = `
SELECT mat_lot
FROM lot_mat
WHERE mat_code = ?
  AND DATE(exp_date) = DATE(?)
LIMIT 1
`;

// 날짜별 시퀀스 +1 (YYYYMMDD 기준) → LAST_INSERT_ID()로 현재값 얻음
const nextLotSeqByDate = `
INSERT INTO lot_seq(date_key, seq)
VALUES (DATE_FORMAT(DATE(?), '%Y%m%d'), 1)
ON DUPLICATE KEY UPDATE seq = LAST_INSERT_ID(seq + 1)
`;

// LOT 신규 생성 (이미 있으면 무시)
const insertLotIgnore = `
INSERT IGNORE INTO lot_mat
  (mat_lot, mat_code, exp_date, prod_date, stock_qty, receipt_qty, release_qty)
VALUES
  (?,       ?,        ?,        ?,         0,         0,           0)
`;

// 발주누적: receipt_qty 증가 (트리거가 미입고/상태 처리)
const updatePurMatOnReceipt = `
UPDATE pur_mat
   SET receipt_qty = IFNULL(receipt_qty, 0) + ?
 WHERE pur_code = ?
   AND mat_code = ?
`;

// 입고이력: pass_qty를 넣어야 함(트리거가 lot_mat 합계/재고 갱신)
const insertMatReceipt = `
INSERT INTO mat_receipt
  (iis_id, mat_lot, receipt_date, receipt_qty)
VALUES
  (?,      ?,       CURDATE(),   ?)
`;

// iis 상태 변경
const updateIisStatusDone = `
UPDATE iis
   SET insp_status = '입고완료'
 WHERE iis_id IN (?)
`;
module.exports = {
  // 목록/검색
  selectPurList,
  selectPurTarget,
  selectIisMatList,
  iisList,
  iisModalBcnc,
  iisModalMat,

  // 단건 조회
  selectPurHeaderByCode,
  selectPurLinesByCode,

  // 자재 목록/검색
  selectPurMatList,
  selectPurMatTarget,
  selectIisMatTarget,

  // 매입처
  selectBcncList,
  searchBcncTarget,

  // 코드 생성
  purCode,

  // 삭제
  deletePur,
  deleteIis,

  // 저장 관련
  existsPurForm,
  upsertPurForm,
  selectMatCodesByPurCode,
  upsertOnePurMat,
  deleteOnePurMat,
  insertIis,

  // 입고등록
  selectIisForRegister,
  selectLotForReuse,
  nextLotSeqByDate,
  insertLotIgnore,
  updatePurMatOnReceipt,
  insertMatReceipt,
  updateIisStatusDone,
};
