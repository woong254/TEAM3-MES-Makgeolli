BEGIN;

-- ① 해당 설비를 잠금 (중복 비가동 방지)
SELECT * 
FROM equipment 
WHERE equip_code = 'EQ-005' 
FOR UPDATE;

-- ② 비가동 테이블에 설비 정보와 함께 등록
INSERT INTO equipment_downtime (
    equip_code, equip_name, manager, downtime_type, description, progress_status, downtime_start
)
SELECT 
    e.equip_code,
    e.equip_name,
    e.manager,
    '비계획정지' AS downtime_type,
    '라인 점검 중' AS description,
    '진행중' AS progress_status,
    NOW() AS downtime_start
FROM equipment e
WHERE e.equip_code = 'EQ-005';

-- ③ 설비 상태 업데이트
UPDATE equipment 
SET status = 'DOWN' 
WHERE equip_code = 'EQ-005';

COMMIT;