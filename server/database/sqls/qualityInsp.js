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
  CALL insp_master_insert(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
const cleanupTmpQuestions = `
DELETE FROM tmp_sen_questions WHERE session_id = ?
`;
const cleanupTmpTargets = `
DELETE FROM tmp_targets WHERE session_id = ?
`;

// 품질기준관리 조회
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
ORDER BY qcm.write_date;
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


// 품질기준관리 상세 조회


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
};
