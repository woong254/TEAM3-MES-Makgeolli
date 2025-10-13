//table : equip_master
//다건조회
const searchEquipList = `
SELECT
  equip_code,
  equip_name,
  equip_type,
  manager,
  equip_status,
  insp_cycle
FROM equip_master o
WHERE 1=1
`;

//설비 상태 조회
const selectEquipStatus = `
SELECT comncode_dtnm
FROM comncode_dt
WHERE comncode_id = '0j'`;
//등록
const insertEquip = `
      INSERT INTO equip_master (
        equip_code, equip_name, equip_type, manager, equip_status,
        insp_cycle, install_date, model_name, equip_image, mfg_dt, maker
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

// 단건 수정 (PK로 찾음)
const updateEquip = `
UPDATE equip_master
SET
  equip_name = ?,
  equip_type = ?,
  manager = ?,
  equip_status = ?,
  insp_cycle = ?,
  maker = ?,
  model_name = ?,
  equip_image = ?
WHERE equip_code = ?
`;
// 단건 상세 조회
const selectEquipByCode = `
  SELECT
    equip_code, equip_name, equip_type, manager, equip_status,
    insp_cycle, install_date, model_name, equip_image, mfg_dt, maker
  FROM equip_master
  WHERE equip_code = ?
  LIMIT 1
`;

// 삭제
const deleteEquip = `
DELETE FROM equip_master
WHERE equip_code = ?
`;

// `
// SELECT equip_code,
//        equip_name,
//        equip_type,
//        manager,
//        equip_status,
//        insp_cycle
// FROM equip_master
// WHERE 1=1
//   AND (:equip_code IS NULL OR equip_code LIKE CONCAT('%', :equip_code, '%'))
//   AND (:equip_name IS NULL OR equip_name LIKE CONCAT('%', :equip_name, '%'))
//   AND (:equip_type IS NULL OR equip_type = :equip_type)
//   AND (:equip_status IS NULL OR equip_status = :equip_status)
// ORDER BY equip_code;
// `;
module.exports = {
  searchEquipList,
  insertEquip,
  updateEquip,
  deleteEquip,
  selectEquipByCode,
  selectEquipStatus,
};
