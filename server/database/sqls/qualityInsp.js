// 1. 품질기준관리
// 1-1. 모달 : 검사대상(자재,제품) 조회
const selectInspTargetList = `
SELECT 
  p.prod_code AS t_id
	,p.prod_name AS t_name
  ,p.prod_type AS t_type
  ,c.comncode_dtnm AS t_type_name
	,p.prod_spec AS t_spec
  ,p.prod_unit AS t_unit
  ,cb.comncode_dtnm AS t_unit_name
  ,'제품' AS t_category
FROM prod_master p
JOIN comncode_dt c 
  ON p.prod_type = c.comncode_detailid
 AND c.comncode_id = '0A'
LEFT JOIN comncode_dt cb
  ON p.prod_unit = cb.comncode_detailid
 AND cb.comncode_id = '0B'
 UNION ALL
 SELECT 
  m.mat_code AS t_id
	,m.mat_name  AS t_name
  ,m.mat_item_code AS t_type
  ,c.comncode_dtnm AS t_type_name
	,m.mat_spec AS t_spec
  ,m.mat_unit AS t_unit
  ,m.mat_unit AS t_unit_name
  ,'자재' AS t_category
FROM mat_master m
JOIN comncode_dt c 
  ON m.mat_item_code = c.comncode_detailid
 AND c.comncode_id = '0A'
 `;

// 1-2. 모달 : 검사대상(검색)
const searchInspTarget = `
SELECT
  p.prod_code AS t_id
  ,p.prod_name AS t_name
  ,p.prod_type AS t_type
  ,c.comncode_dtnm AS t_type_name
  ,p.prod_spec AS t_spec
  ,p.prod_unit AS t_unit
  ,cb.comncode_dtnm AS t_unit_name
  ,'제품' AS t_category
FROM prod_master p
JOIN comncode_dt c 
  ON p.prod_type = c.comncode_detailid
 AND c.comncode_id = '0A'
LEFT JOIN comncode_dt cb 
  ON p.prod_unit = cb.comncode_detailid
 AND cb.comncode_id = '0B'
WHERE p.prod_name LIKE ? 
AND   (? = '' OR p.prod_type = ?)
UNION ALL
SELECT 
  m.mat_code AS t_id
  ,m.mat_name AS t_name
  ,m.mat_item_code AS t_type
  ,c.comncode_dtnm AS t_type_name
  ,m.mat_spec AS t_spec
  ,m.mat_unit AS t_unit
  ,m.mat_unit AS t_unit_name
  ,'자재' AS t_category
FROM mat_master m
JOIN comncode_dt c
  ON m.mat_item_code = c.comncode_detailid
 AND c.comncode_id = '0A'
 WHERE m.mat_name LIKE ? 
 AND   (? = '' OR m.mat_item_code = ?)
 `;

// 1-3. 품질기준관리 등록
const insertTmpQuestion = `
INSERT INTO tmp_sen_questions (session_id, ques_name)
VALUES (?, ?)
`;
const insertTmpTarget = `
INSERT INTO tmp_targets (session_id, insp_target_type, insp_target_code, product_code, mat_code)
VALUES (?, ?, ?, ?, ?)
`;
const callInspMaster = `
CALL insp_master_insert(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
const cleanupTmpQuestions = `
DELETE FROM tmp_sen_questions WHERE session_id = ?
`;
const cleanupTmpTargets = `
DELETE FROM tmp_targets WHERE session_id = ?
`;

// 1-4. 품질기준관리 조회(목록)
const selectInspMaster = `
SELECT qcm.insp_item_id
      ,qcm.insp_item_name
      ,COALESCE(p.prod_name, m.mat_name) AS target_name
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
ORDER BY qcm.insp_item_id;
`;

// 1-5. 품질기준관리 수정
const InspMasterUpdate = `
CALL insp_master_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 1-6. 품질기준관리 삭제
const InspMasterDel = `
CALL insp_master_delete(?)
`;

// 1-7. 품질기준관리 검색
const searchInspMaster = `
-- 검색 파라미터: ?, ?, ?, ?
-- 1) 검사항목명 like
-- 2) 검사대상명 like (prod/mat 중 coalesce)
-- 3) 품목구분(a1~a5) 정확일치
-- 4) 사용여부('Y'/'N') 정확일치

SELECT qcm.insp_item_id
      ,qcm.insp_item_name
      ,COALESCE(p.prod_name, m.mat_name) AS target_name
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
WHERE (? = '' OR qcm.insp_item_name LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR COALESCE(p.prod_name, m.mat_name) LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR qct.insp_target_code = ?)   -- a1~a5
  AND (? = '' OR qcm.use_yn = ?)             -- 'Y'|'N'
ORDER BY qcm.write_date DESC
`;

// 1-8. 품질기준관리 상세 조회
const selectInspMasterDetail = `
SELECT
  qcm.insp_item_id,
  qcm.insp_item_name,
  qcm.insp_type,
  qcm.use_yn,
  qcm.insp_method,
  qcm.file_name,
  qcm.max_score,
  qcm.pass_score,
  qcm.pass_score_spec,
  qcm.score_desc,  
  ran.min_range,
  ran.min_range_spec,
  ran.max_range,
  ran.max_range_spec,
  ran.unit
FROM qc_master AS qcm
LEFT JOIN qc_master_ran AS ran
       ON ran.insp_item_id = qcm.insp_item_id
WHERE qcm.insp_item_id = ?
`;
// 1-9. 상세(타겟 목록)
const selectInspTargetsByItem = `
SELECT
  qmt.insp_target_id,
  qmt.insp_target_code,
  qmt.product_code,
  qmt.mat_code,
  COALESCE(p.prod_code, m.mat_code)         AS t_id,
  COALESCE(p.prod_name, m.mat_name)         AS t_name,
  COALESCE(p.prod_spec, m.mat_spec)         AS t_spec,
  COALESCE(p.prod_unit, m.mat_unit)         AS t_unit,
  CASE WHEN qmt.product_code IS NOT NULL THEN '제품' ELSE '자재' END AS t_category,
  c.comncode_dtnm                            AS t_type_name
FROM qc_master_target AS qmt
LEFT JOIN prod_master  AS p ON p.prod_code      = qmt.product_code
LEFT JOIN mat_master   AS m ON m.mat_code       = qmt.mat_code
LEFT JOIN comncode_dt  AS c ON c.comncode_id    = '0A'
                            AND c.comncode_detailid = qmt.insp_target_code
WHERE qmt.insp_item_id = ?
ORDER BY qmt.insp_target_code, qmt.product_code, qmt.mat_code
`;
const selectInspQuestionsByItem = `
SELECT
  qs.ques_id,
  qs.ques_order,
  qs.ques_name
FROM qc_master_sen AS qs
WHERE qs.insp_item_id = ?
ORDER BY qs.ques_order, qs.ques_id
`;

// 2. 자재입고검사
// 2-1. 모달 : 자재입고검사 가입고(검사대기) 조회
const matInspTargetSelect = `
SELECT
  i.iis_id,               -- 가입고번호
  i.pur_code,             -- 발주번호
  pf.pur_name,            -- 발주명
  pf.pur_date,            -- 발주일자
  bcm.bcnc_name,          -- 거래처
  i.mat_code,             -- 자재코드 (iis 기준)
  mat.mat_name,           -- 자재명
  mat.mat_spec,           -- 자재규격
  mat.mat_unit,           -- 자재단위
  pm.pur_qty,             -- 주문수량(발주수량)
  i.receipt_qty           -- 입고량
FROM iis i
LEFT JOIN pur_form pf
       ON i.pur_code = pf.pur_code
LEFT JOIN pur_mat pm
       ON pm.pur_code = i.pur_code
      AND pm.mat_code = i.mat_code      -- ★ 추가
LEFT JOIN bcnc_master bcm
       ON i.bcnc_code = bcm.bcnc_code
LEFT JOIN mat_master mat
       ON i.mat_code = mat.mat_code
WHERE i.insp_status = '검사대기'
`;

// 2-2. 자재입고검사 조회시 -> 불량 조회
const selectNGMaster = `
SELECT dmt.def_item_id
       ,dm.def_item_name
FROM def_master_target dmt
 JOIN def_master dm
   ON dmt.def_item_id = dm.def_item_id
WHERE dmt.mat_code = ?
`;

// 2-3. 자재입고검사 조회시 -> 등록(사용Y)된 품질기준관리 데이터 조회
const selectMatInspQcMaster = `
SELECT 
    qt.insp_item_id
    ,qm.insp_item_name
    ,qm.insp_type
    ,qm.insp_method
    ,qm.file_name
    ,qm.max_score
    ,qm.pass_score
    ,qm.pass_score_spec
    ,qm.score_desc
    ,qr.min_range
    ,qr.min_range_spec
    ,qr.max_range
    ,qr.max_range_spec
    ,qr.unit
    ,qs.sens_questions  -- 문자열 형태의 JSON 배열(프론트에서 JSON.parse)
FROM qc_master_target qt
JOIN qc_master qm
  ON qt.insp_item_id = qm.insp_item_id
LEFT JOIN qc_master_ran qr
  ON qm.insp_item_id = qr.insp_item_id
LEFT JOIN (
    SELECT 
        insp_item_id,
        CONCAT(
          '[',
          GROUP_CONCAT(
            CONCAT(
              '{',
              '"order":', ques_order, ',',
              '"name":',  JSON_QUOTE(ques_name),
              '}'
            )
            ORDER BY ques_order
            SEPARATOR ','
          ),
          ']'
        ) AS sens_questions
    FROM qc_master_sen
    GROUP BY insp_item_id
) qs
  ON qm.insp_item_id = qs.insp_item_id
WHERE qt.mat_code = ?
  AND qm.use_yn = 'Y'
ORDER BY qt.insp_item_id
`;

// 2-4. 자재입고검사 검색
const matInspSearch = `
SELECT 
    mi.insp_id,
    mi.insp_name,
    mi.insp_date,
    i.iis_id,
    m.mat_code,
    m.mat_name,
    b.bcnc_name,
    c.comncode_dtnm
FROM mat_insp mi
JOIN iis         i ON i.iis_id        = mi.iis_id
JOIN mat_master  m ON i.mat_code      = m.mat_code
JOIN bcnc_master b ON i.bcnc_code     = b.bcnc_code
JOIN comncode_dt c ON m.mat_item_code = c.comncode_detailid
WHERE 1=1
`;

// 2-5. 자재입고검사 상세조회 (검색->insp_id 기준으로 상세조회)
// 2-5-1. mat_insp + iis 정보
const selectMatInspHeaderById = `SELECT
  -- mat_insp(자재입고) 테이블
  mi.insp_id,          -- 검사ID
  mi.insp_name,        -- 검사명
  mi.insp_date,        -- 검사일시
  mi.insp_qty,         -- 검사량
  mi.pass_qty,         -- 합격량
  mi.fail_qty,         -- 불량량(합계)
  mi.remark,           -- 비고 
  mi.t_result,         -- 총결과(합격:P/불합격:F)
  mi.emp_id,           -- 사용자

  -- iis(가입고) 테이블
  i.iis_id,            -- 가입고번호
  i.pur_code,          -- 발주코드
  i.mat_code,          -- 자재코드
  i.receipt_qty,       -- 입고량
  
  -- pur_form(발주서) 테이블
  pf.pur_name,         -- 발주서명
  pf.pur_date,         -- 발주날짜

  -- bcnc_master(거래처) 테이블
  b.bcnc_name,         -- 거래처명

  -- mat_master(자재 기준정보) 테이블
  m.mat_name,          -- 자재명
  m.mat_spec,          -- 자재 규격
  m.mat_unit,          -- 자재 단위
  m.mat_item_code,     -- 자재 품목구분코드
  c.comncode_dtnm AS item_type_name,   -- 품목구분 라벨(한글)

  -- pur_mat(발주자재) 테이블
  pm.pur_qty           -- 발주수량
FROM mat_insp mi
JOIN iis            i  ON i.iis_id    = mi.iis_id
LEFT JOIN pur_form  pf ON pf.pur_code = i.pur_code
LEFT JOIN pur_mat   pm ON pm.pur_code = i.pur_code AND pm.mat_code = i.mat_code
JOIN bcnc_master    b  ON b.bcnc_code = i.bcnc_code
JOIN mat_master     m  ON m.mat_code  = i.mat_code
LEFT JOIN comncode_dt c ON c.comncode_id = '0A' AND c.comncode_detailid = m.mat_item_code
WHERE mi.insp_id = ?`;

// 2-5-2. 자재입고검사 결과 + 품질기준관리 정보
const selectMatInspResultsById = `
SELECT
  -- mat_insp_result(자재입고검사 결과) 테이블
  r.insp_result_id,           -- 자재입고검사결과 ID
  r.insp_item_id,             -- 품질기준관리 ID
  r.insp_result_value,        -- 결과값
  r.r_value,                  -- 적합(P)/부적합(F)

  -- qc_master(품질기준관리) 테이블 
  qm.insp_item_name,          -- 품질기준관리 항목명
  qm.insp_type,               -- R(범위), S(관능)
  qm.insp_method,             -- 검사방법
  qm.file_name,               -- 파일이름

  -- qc_master_ran(품질기준관리-범위)테이블 
  qr.min_range,               
  qr.min_range_spec,
  qr.max_range,
  qr.max_range_spec,
  qr.unit,

  -- qc_master(품질기준관리)인데 관능에 관련된 칼럼
  qm.max_score,
  qm.pass_score,
  qm.pass_score_spec
FROM mat_insp_result r
JOIN qc_master      qm ON qm.insp_item_id = r.insp_item_id
LEFT JOIN qc_master_ran qr ON qr.insp_item_id = r.insp_item_id
WHERE r.insp_id = ?
ORDER BY r.insp_item_id
`;

// 2-5-3. 불량목록 + 불량기준관리(이름)
const selectMatInspNGsById = `
SELECT
  n.fail_id,
  n.def_item_id,
  n.qty,
  d.def_item_name
FROM mat_insp_ng n
JOIN def_master d ON d.def_item_id = n.def_item_id
WHERE n.insp_id = 'IQC-20251017-001'
ORDER BY d.def_item_name`;

// 3. 자재입고검사 조회 
const matInspSelect = `
SELECT mi.insp_id -- 검사ID
       ,mi.insp_name -- 검사명
       ,mi.insp_date -- 검사일시
       ,mi.emp_id -- 검사자
       ,m.mat_name -- 검사대상(자재명)
       ,cd.comncode_dtnm -- 품목구분
       ,m.mat_spec -- 규격
       ,m.mat_unit -- 단위
       ,mi.insp_qty -- 검사량
       ,mi.t_result -- 합격여부
FROM mat_insp mi
JOIN iis i
  ON mi.iis_id = i.iis_id
JOIN mat_master m
  ON i.mat_code = m.mat_code
JOIN comncode_dt cd
  ON m.mat_item_code = cd.comncode_detailid
WHERE 1=1
`;


// 4. 완제품검사 관리
// 4-1. 완제품검사 대상(검사대상) 조회
const prodInspTargetSelect = `
SELECT pf.procs_no        -- 공정실적번호
       ,pf.prod_code      -- 제품코드
       ,pm.prod_name      -- 제품명
       ,pm.prod_spec      -- 규격
       ,c.comncode_dtnm   -- 단위 공통코드 이름
       ,pf.mk_qty         -- 생산량
       ,pf.procs_endtm    -- 생산작업일시
FROM processform pf
JOIN prod_master pm
  ON pf.prod_code = pm.prod_code
JOIN comncode_dt c
  ON pm.prod_unit = c.comncode_detailid
WHERE now_procs = '포장'
  AND procs_endtm IS NOT NULL
  AND (pf.insp_status IS NULL OR pf.insp_status <> 'u2')
`;


// 4-2. 완제품검사 대상 조회시 -> 불량 자동조회 
const prodInspTargetNg = `
SELECT dmt.def_item_id
       ,dm.def_item_name
FROM def_master_target dmt
 JOIN def_master dm
   ON dmt.def_item_id = dm.def_item_id
WHERE dmt.prod_code = ?
`;

// 4-3. 완제품검사 대상 조회시 -> 품질기준관리 자동조회
const prodInspTargetQcMaster = `
SELECT 
    qt.insp_item_id
  , qm.insp_item_name
  , qm.insp_type
  , qm.insp_method
  , qm.file_name
  , qm.max_score
  , qm.pass_score
  , qm.pass_score_spec
  , qm.score_desc
  , qr.min_range
  , qr.min_range_spec
  , qr.max_range
  , qr.max_range_spec
  , qr.unit
  , qs.sens_questions  -- 문자열 JSON(프론트에서 JSON.parse)
FROM qc_master_target qt
JOIN qc_master qm
  ON qt.insp_item_id = qm.insp_item_id
LEFT JOIN qc_master_ran qr
  ON qm.insp_item_id = qr.insp_item_id
LEFT JOIN (
    SELECT 
        insp_item_id,
        CONCAT(
          '[',
          GROUP_CONCAT(
            CONCAT(
              '{',
              '"order":', ques_order, ',',
              '"name":',  JSON_QUOTE(ques_name),
              '}'
            )
            ORDER BY ques_order
            SEPARATOR ','
          ),
          ']'
        ) AS sens_questions
    FROM qc_master_sen
    GROUP BY insp_item_id
) qs
  ON qm.insp_item_id = qs.insp_item_id
WHERE qt.product_code = ?
  AND qm.use_yn = 'Y'
ORDER BY qt.insp_item_id
`;

// 4-4. 완제품검사 검색
const prodInspSearch = `
SELECT pi.insp_id        -- 검사ID
       ,pi.insp_name     -- 검사명
       ,pi.insp_date     -- 검사일시
       ,pm.prod_name     -- 제품명
       ,pm.prod_spec     -- 제품규격
       ,c.comncode_dtnm  -- 제품단위 이름
       ,pi.insp_qty      -- 검사량
FROM prod_insp pi
LEFT JOIN processform pf
  ON pi.procs_no = pf.procs_no
LEFT JOIN prod_master pm
  ON pf.prod_code = pm.prod_code
LEFT JOIN comncode_dt c
  ON pm.prod_unit = c.comncode_detailid
WHERE 1=1
`;

// 4-5. 완제품 검사 상세조회 
// 4-5-1. 헤더 (prod_insp + processform + prod_master 등)
const selectProdInspHeaderById = `
SELECT
  -- prod_insp(완제품검사)
  pi.insp_id,           -- 검사ID
  pi.insp_name,         -- 검사명
  pi.insp_date,         -- 검사일시
  pi.insp_qty,          -- 검사량
  pi.pass_qty,          -- 합격량
  pi.fail_qty,          -- 불량량(합계)
  pi.remark,            -- 비고
  pi.final_result,      -- 총결과(합격:P/불합격:F)
  pi.emp_id,            -- 사용자
  pi.procs_no,          -- 공정실적번호
  pi.epep_dt,           -- 유통기한(검사완료일+30일)

  -- processform(공정실적)
  pf.mk_qty,            -- 생산량
  pf.procs_endtm,       -- 생산작업(종료)일시

  -- prod_master(제품)
  pm.prod_code,
  pm.prod_name,
  pm.prod_spec,

  -- 단위 공통코드 라벨
  c.comncode_dtnm AS prod_unit_name

FROM prod_insp pi
LEFT JOIN processform pf ON pf.procs_no = pi.procs_no
LEFT JOIN prod_master pm ON pm.prod_code = pf.prod_code
LEFT JOIN comncode_dt c ON c.comncode_detailid = pm.prod_unit
WHERE pi.insp_id = ?
`;

// 4-5-2. 결과 (prod_insp_result + qc_master(+ran))
const selectProdInspResultsById = `
SELECT
  -- prod_insp_result
  r.insp_id,
  r.insp_item_id,
  r.insp_result_value,
  r.r_value,

  -- qc_master (공통 품질기준)
  qm.insp_item_name,
  qm.insp_type,           -- 'R' 또는 'S'
  qm.insp_method,
  qm.file_name,
  qm.max_score,
  qm.pass_score,
  qm.pass_score_spec,

  -- 범위형 세부 (있으면)
  qr.min_range,
  qr.min_range_spec,
  qr.max_range,
  qr.max_range_spec,
  qr.unit

FROM prod_insp_result r
JOIN qc_master qm
  ON qm.insp_item_id = r.insp_item_id
LEFT JOIN qc_master_ran qr
  ON qr.insp_item_id = r.insp_item_id
WHERE r.insp_id = ?
ORDER BY r.insp_item_id
`;

// 4-5-3. 불량 (prod_insp_ng + def_master)
const selectProdInspNGsById = `
SELECT
  n.fail_id,
  n.def_item_id,
  n.qty,
  d.def_item_name
FROM prod_insp_ng n
JOIN def_master d ON d.def_item_id = n.def_item_id
WHERE n.insp_id = ?
ORDER BY d.def_item_name
`;



module.exports = {
  selectInspTargetList,
  searchInspTarget,
  insertTmpQuestion,
  insertTmpTarget,
  callInspMaster,
  cleanupTmpQuestions,
  cleanupTmpTargets,
  selectInspMaster,
  InspMasterDel,
  InspMasterUpdate,
  selectInspMasterDetail,
  selectInspTargetsByItem,
  selectInspQuestionsByItem,
  searchInspMaster,
  matInspTargetSelect,
  selectMatInspQcMaster,
  selectNGMaster,
  matInspSearch,
  selectMatInspNGsById,
  selectMatInspResultsById,
  selectMatInspHeaderById,
  matInspSelect,
  prodInspTargetSelect,
  prodInspTargetNg,
  prodInspTargetQcMaster,
  prodInspSearch,
  selectProdInspHeaderById,
  selectProdInspResultsById,
  selectProdInspNGsById
};
