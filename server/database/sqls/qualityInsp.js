// 품질기준관리

// 모달 : 검사대상(자재,제품) 조회
const selectInspTargetList = `
SELECT
	  p.prod_code AS t_id
	  ,p.prod_name AS t_name
    ,p.prod_type AS t_type
    ,c.comncode_dtnm AS t_type_name
	  ,p.prod_spec AS t_spec
    ,p.prod_unit AS t_unit
    ,'제품' AS t_category
FROM prod_master p
JOIN comncode_dt c 
  ON p.prod_type = c.comncode_detailid
 AND c.comncode_id = '0A'
UNION ALL
SELECT 
	  m.mat_code AS t_id
	  ,m.mat_name AS t_name
    ,m.mat_item_code AS t_type
    ,c.comncode_dtnm AS t_type_name
    ,m.mat_spec AS t_spec
    ,m.mat_unit AS t_unit
    ,'자재' AS t_category
FROM mat_master m
JOIN comncode_dt c
  ON m.mat_item_code = c.comncode_detailid
 AND c.comncode_id = '0A'
 `;

// 모달 : 검사대상(검색)
const searchInspTarget = `
SELECT
	p.prod_code AS t_id
	,p.prod_name AS t_name
    ,p.prod_type AS t_type
    ,c.comncode_dtnm AS t_type_name
	,p.prod_spec AS t_spec
    ,p.prod_unit AS t_unit
    ,'제품' AS t_category
FROM prod_master p
JOIN comncode_dt c 
  ON p.prod_type = c.comncode_detailid
 AND c.comncode_id = '0A'
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
    ,'자재' AS t_category
FROM mat_master m
JOIN comncode_dt c
  ON m.mat_item_code = c.comncode_detailid
 AND c.comncode_id = '0A'
 WHERE m.mat_name LIKE ? 
 AND   (? = '' OR m.mat_item_code = ?)
 `;

// 품질기준관리 등록
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

// 품질기준관리 조회(목록)
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

// 품질기준관리 수정
const InspMasterUpdate = `
CALL insp_master_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 품질기준관리 삭제
const InspMasterDel = `
CALL insp_master_delete(?)
`;

// 품질기준관리 검색
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
ORDER BY qcm.write_date DESC;
`;

// 품질기준관리 상세 조회
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
// 상세(타겟 목록)
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

// 자재입고검사 가입고(검사대기) 조회 (모달)
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
WHERE i.insp_status = '검사대기';
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
  matInspTargetSelect
};
