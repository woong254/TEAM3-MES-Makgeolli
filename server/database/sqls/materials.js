// Table: bcnc_master, mat_master, pur_form, emp_master, pur_mat, lot_mat

// 발주서 조회 (목록) - LEFT JOIN
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

// 발주서명으로 발주서 조회 (목록) - LEFT JOIN
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

// ✅ 단건 헤더 조회 (모달 선택 시 메인으로 채우기)
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

// ✅ 단건 라인 조회 (해당 발주서의 발주자재 라인)
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

// 발주자재 조회(모달: 자재 선택용 목록)
const selectPurMatList = `
  SELECT
    m.mat_code,
    m.mat_name,
    COALESCE(SUM(l.receipt_qty - l.release_qty), 0) AS stock_qty,  -- LOT 합계
    m.safe_stock,
    m.mat_spec,
    m.mat_unit
  FROM mat_master m
  LEFT JOIN lot_mat l ON l.mat_code = m.mat_code
  GROUP BY m.mat_code, m.mat_name, m.safe_stock, m.mat_spec, m.mat_unit
  ORDER BY m.mat_code
`;

// 자재명으로 발주자재 조회
const selectPurMatTarget = `
  SELECT
    m.mat_code,
    m.mat_name,
    COALESCE(SUM(l.receipt_qty - l.release_qty), 0) AS stock_qty,  -- LOT 합계
    m.safe_stock,
    m.mat_spec,
    m.mat_unit
  FROM mat_master m
  LEFT JOIN lot_mat l ON l.mat_code = m.mat_code
  WHERE m.mat_name LIKE ?
  GROUP BY m.mat_code, m.mat_name, m.safe_stock, m.mat_spec, m.mat_unit
  ORDER BY m.mat_code
`;

// 매입처 조회/검색
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

// 발주서코드 생성
const purCode = `
  SELECT CONCAT('PUR-', LPAD(
    IFNULL(MAX(CAST(SUBSTRING(pur_code, 5) AS UNSIGNED)), 0) + 1,
    3,
    '0'
  )) AS pur_code
  FROM pur_form
  WHERE pur_code LIKE 'PUR-%'
`;

/* ========== 저장(등록/수정) 관련 ========== */

// 발주서 존재 여부(등록/수정 구분)
const existsPurForm = `
  SELECT COUNT(*) AS cnt
  FROM pur_form
  WHERE pur_code = ?
`;

// 헤더 UPSERT
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

// 발주서의 현재 라인 목록(코드만)
const selectMatCodesByPurCode = `
SELECT mat_code
FROM pur_mat
WHERE pur_code = ?
`;

// 라인 UPSERT (필수 4컬럼만)
const upsertOnePurMat = `
INSERT INTO pur_mat
  (pur_code, mat_code, pur_qty, remark)
VALUES
  (?,        ?,        ?,       ?)
ON DUPLICATE KEY UPDATE
  pur_qty = VALUES(pur_qty),
  remark  = VALUES(remark)
`;

// 화면에서 지운 라인만 삭제
const deleteOnePurMat = `
DELETE FROM pur_mat
WHERE pur_code = ? AND mat_code = ?
`;

// 발주서 삭제
const deletePur = `
DELETE FROM pur_form
WHERE pur_code = ?
`;

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
  AND m.unreceipt_qty >= ?
ORDER BY f.pur_date DESC
LIMIT 1
`;
// 바인딩 순서 (mysql2.execute(insertIis, params)):
// [
//   prod_date, exp_date, pre_receipt_date, receipt_qty,
//   pre_receipt_date, bcnc_code, mat_code, receipt_qty
// ]

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
ORDER BY i.iis_id DESC
`;

const deleteIis = `
DELETE
FROM iis
WHERE insp_status = '검사대기'
AND iis_id IN(?)`;

const selectPurMatList `
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
AND pf.receipt_date = ?
`

module.exports = {
  // 목록/검색
  selectPurList,
  selectPurTarget,
  selectPurMatList,
  iisList,
  // 단건 조회
  selectPurHeaderByCode,
  selectPurLinesByCode,
  // 자재 목록/검색
  selectPurMatList,
  selectPurMatTarget,
  // 매입처 목록/검색
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
};
