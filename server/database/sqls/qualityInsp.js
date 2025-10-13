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
  CALL insp_master_insert(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
const cleanupTmpQuestions = `
DELETE FROM tmp_sen_questions WHERE session_id = ?
`;
const cleanupTmpTargets = `
DELETE FROM tmp_targets WHERE session_id = ?
`;

module.exports = {
  selectInspTargetList,
  searchInspTarget,
  insertTmpQuestion,
  insertTmpTarget,
  callInspMaster,
  cleanupTmpQuestions,
  cleanupTmpTargets,
};
