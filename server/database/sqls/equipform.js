// table : equip_master

// ✅ 다건조회 (상태 한글명까지)
const searchEquipList = `
SELECT
  e.equip_code,
  e.equip_name,
  e.equip_type,                         -- 코드 (s1)
  t.comncode_dtnm AS equip_type_name,   -- 이름 (절단기)
  e.manager,
  e.equip_status,                       -- 코드 (j2)
  s.comncode_dtnm AS equip_status_name, -- 이름 (비가동)
  e.insp_cycle
FROM equip_master e
LEFT JOIN comncode_dt s
  ON s.comncode_id = '0J'
 AND s.comncode_detailid = e.equip_status
LEFT JOIN comncode_dt t
  ON t.comncode_id = '0S'
 AND t.comncode_detailid = e.equip_type
WHERE 1=1
`;
// -- ✅ 권장 쿼리: 코드와 이름 동시 반환
// ✅ 설비 상태 조회 (드롭다운용) — value: code_id, label: code_name
const selectEquipType = `
SELECT
  comncode_detailid AS code,
  comncode_dtnm     AS name
FROM comncode_dt
WHERE comncode_id = '0S'
ORDER BY comncode_detailid
`;

// ✅ 등록 (FK 안전: 존재하는 코드일 때만 INSERT 됨 → 없으면 0행 insert)
const insertEquip = `
INSERT INTO equip_master (
  equip_code, equip_name, equip_type, manager, equip_status,
  insp_cycle, install_date, model_name, equip_image, mfg_dt, maker
)
SELECT
  ?, ?, t.comncode_detailid, ?, s.comncode_detailid,
  ?, ?, ?, ?, ?, ?
FROM comncode_dt s
JOIN comncode_dt t
  ON t.comncode_id = '0S' AND t.comncode_detailid = ?
WHERE s.comncode_id = '0J' AND s.comncode_detailid = ?`;
// ⚠️ 파라미터 순서(총 12개):
// [equip_code, equip_name, manager, insp_cycle,install_date, model_name, equip_image, mfg_dt, maker,equip_type_code(s1~), equip_status_code(j1~)]

// ✅ 단건 수정 (FK 안전: 존재하는 코드일 때만 갱신)
const updateEquip = `
UPDATE equip_master e
JOIN comncode_dt s
  ON s.comncode_id = '0J' AND s.comncode_detailid = ?   -- 상태 코드 (j1~j4)
JOIN comncode_dt t
  ON t.comncode_id = '0S' AND t.comncode_detailid = ?   -- 유형 코드 (s1~sN)
SET
  e.equip_name   = ?,          
  e.equip_type   = t.comncode_detailid,
  e.manager      = ?,          
  e.equip_status = s.comncode_detailid,
  e.insp_cycle   = ?,          
  e.maker        = ?,          
  e.model_name   = ?,          
  e.equip_image  = ?           
WHERE e.equip_code = ?         
`;
// ✅ 단건 상세 조회 (상태명 포함)
const selectEquipByCode = `
SELECT
  o.equip_code,
  o.equip_name,
  o.equip_type,                         -- 코드
  t.comncode_dtnm AS equip_type_name,   -- 이름
  o.manager,
  o.equip_status,                       -- 코드
  s.comncode_dtnm AS equip_status_name, -- 이름
  o.insp_cycle,
  o.install_date,
  o.model_name,
  o.equip_image,
  o.mfg_dt,
  o.maker
FROM equip_master o
LEFT JOIN comncode_dt s
  ON s.comncode_id = '0J'
 AND s.comncode_detailid = o.equip_status
LEFT JOIN comncode_dt t
  ON t.comncode_id = '0S'
 AND t.comncode_detailid = o.equip_type
WHERE o.equip_code = ?
LIMIT 1
`;

// ✅ 삭제 (그대로 OK)
const deleteEquip = `
DELETE FROM equip_master
WHERE equip_code = ?
`;

// 비가동 INSERT
const insertDowntime = `
  INSERT INTO equip_downtime (
    downtime_code,
    equip_name,
    downtime_type,
    downtime_start,
    downtime_end,     -- 시작 시 보통 NULL
    description,
   worker_id,
    progress_status,
    equip_code
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 비가동 종료(종료시간 + 상태 + 옵션으로 비고 갱신)
const endDowntime = `
  UPDATE equip_downtime
     SET downtime_end   = COALESCE(?, NOW()),
         description    = COALESCE(?, description),
         progress_status= ?
   WHERE downtime_code  = ?
     AND downtime_end IS NULL   -- 이미 끝난 건 중복 종료 방지
`;

// // (선택) 진행중/완료 상태 조회 등에 자주 쓰는 쿼리 예시
// const selectRunningByEquip = `
//   SELECT *
//     FROM downtime
//    WHERE equip_code = ?
//      AND downtime_end IS NULL
//    ORDER BY downtime_start DESC
//   LIMIT 1
// `;

module.exports = {
  searchEquipList,
  insertEquip,
  updateEquip,
  deleteEquip,
  selectEquipByCode,
  selectEquipType,
  insertDowntime,
  endDowntime,
};
