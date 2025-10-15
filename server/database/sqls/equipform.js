// table : equip_master

// ✅ 다건조회 (상태 한글명까지)
const searchEquipList = `
SELECT  e.equip_code,
		    e.equip_name,
		    e.equip_type,
		    e.manager,
		    c.comncode_dtnm as equip_status,
		    e.insp_cycle
FROM 	equip_master e
		JOIN comncode_dt c
    ON e.equip_status = c.comncode_detailid`;

// ✅ 설비 상태 조회 (드롭다운용) — value: code_id, label: code_name
const selectEquipType = `
SELECT comncode_dtnm
FROM   comncode_dt
WHERE  comncode_id = '0S'`;

// ✅ 등록 (FK 안전: 존재하는 코드일 때만 INSERT 됨 → 없으면 0행 insert)
const insertEquip = `
INSERT INTO equip_master (
  equip_code, equip_name, equip_type, manager, equip_status,
  insp_cycle, install_date, model_name, equip_image, mfg_dt, maker
)
SELECT
  ?, ?, ?, ?, d.comncode_detailid,
  ?, ?, ?, ?, ?, ?
FROM comncode_dt d
WHERE d.comncode_id = '0J' AND d.comncode_detailid = ?  -- 마지막 파라미터: 상태코드(j1~j4)
`;
// ⚠️ 파라미터 순서(총 12개):
// [equip_code, equip_name, equip_type, manager, insp_cycle, install_date, model_name, equip_image, mfg_dt, maker, status_code]

// ✅ 단건 수정 (FK 안전: 존재하는 코드일 때만 갱신)
const updateEquip = `
UPDATE equip_master e
JOIN comncode_dt d
  ON d.comncode_id = '0J' AND d.comncode_detailid = ?   -- 1) 새 상태코드(j1~j4)
SET
  e.equip_name  = ?,   -- 2
  e.equip_type  = ?,   -- 3
  e.manager     = ?,   -- 4
  e.equip_status= d.comncode_detailid, -- FK 보장
  e.insp_cycle  = ?,   -- 5
  e.maker       = ?,   -- 6
  e.model_name  = ?,   -- 7
  e.equip_image = ?    -- 8
WHERE e.equip_code = ? -- 9
`;

// ✅ 단건 상세 조회 (상태명 포함)
const selectEquipByCode = `
SELECT
  o.equip_code, o.equip_name, o.equip_type, o.manager,
  o.equip_status, d.comncode_dtnm AS equip_status_name,
  o.insp_cycle, o.install_date, o.model_name, o.equip_image, o.mfg_dt, o.maker
FROM equip_master o
LEFT JOIN comncode_dt d
  ON d.comncode_detailid = o.equip_status
WHERE o.equip_code = ?
LIMIT 1
`;

// ✅ 삭제 (그대로 OK)
const deleteEquip = `
DELETE FROM equip_master
WHERE equip_code = ?
`;

module.exports = {
  searchEquipList,
  insertEquip,
  updateEquip,
  deleteEquip,
  selectEquipByCode,
  selectEquipType,
};
