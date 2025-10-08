// Table: bcnc_master, mat_master, pur_form

const selectBcncList = `
  SELECT bcnc_code, bcnc_name, bcnc_category
  FROM bcnc_master
  WHERE bcnc_type = '매입처'
  ORDER BY CONVERT(bcnc_code, UNSIGNED INTEGER)`;

const searchBcncTarget = `
  SELECT bcnc_code, bcnc_name, bcnc_category
  FROM bcnc_master
  WHERE bcnc_type = '매입처'
  AND bcnc_name LIKE ?`;

const purCode = `
  SELECT CONCAT('PUR-', LPAD(
  IFNULL(MAX(CAST(SUBSTRING(pur_code, 5) AS UNSIGNED)), 0) + 1,
  3,
  '0'
)) AS pur_code
FROM pur_form
WHERE pur_code LIKE 'PUR-%';
`;

module.exports = {
  selectBcncList,
  searchBcncTarget,
};
