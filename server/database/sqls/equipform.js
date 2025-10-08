const searchEquipList = `
SELECT equip_code,
       equip_name,
       equip_type,
       manager,
       equip_status,
       insp_cycle
FROM equip_master
WHERE 1=1
  AND (:equip_code IS NULL OR equip_code LIKE CONCAT('%', :equip_code, '%'))
  AND (:equip_name IS NULL OR equip_name LIKE CONCAT('%', :equip_name, '%'))
  AND (:equip_type IS NULL OR equip_type = :equip_type)
  AND (:equip_status IS NULL OR equip_status = :equip_status)
ORDER BY equip_code;
`;
module.exports = {
  searchEquipList,
};
