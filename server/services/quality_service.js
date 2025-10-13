// 품질 서비스
const mariadb = require("../database/mapper.js");

// 1. 품질 기준 관리
// 1-1. 검사대상 조회
const findInspTarget = async () => {
  let list = await mariadb
    .query("selectInspTargetList")
    .catch((err) => console.log(err));
  return list;
};
// 1-2. 검사대상 검색
const findInspTargetSearch = async (param) => {
  const { name = "", type = "" } = param;
  const tName = name ? `%${name}%` : "%";
  const tType = type || "";

  const params = [tName, tType, tType, tName, tType, tType];

  let list = await mariadb.query("searchInspTarget", params).catch((err) => {
    console.log(err);
    return [];
  });
  return list;
};

// 1-3. 품질기준관리 등록
// 간단 세션키
function makeSessionId(prefix) {
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${Date.now()}-${rand}`;
}
const registerInspMaster = async (payload) => {
  // ---------- [A] 입력값(서버 가드) 검증: DB작업 전에 ----------
  // 공통 기본정리
  payload.insp_item_name = (payload.insp_item_name || "").trim();
  payload.use_yn = payload.use_yn === "N" ? "N" : "Y";

  if (!payload.insp_item_name) {
    return { ok: false, message: "검사항목명은 필수입니다." };
  }

  // 범위형 검증
  if (payload.insp_type === "R") {
    const min = Number(payload.min_range);
    const max = Number(payload.max_range);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { ok: false, message: "범위형: 최소/최대는 숫자여야 합니다." };
    }
    if (min > max) {
      return { ok: false, message: "범위형: 최소값이 최대값보다 클 수 없습니다." };
    }
    // 스펙 코드 길이(컬럼이 CHAR(2)라면)
    if (payload.min_range_spec && String(payload.min_range_spec).length > 2) {
      return { ok: false, message: "범위형: min_range_spec은 2자리 코드여야 합니다." };
    }
    if (payload.max_range_spec && String(payload.max_range_spec).length > 2) {
      return { ok: false, message: "범위형: max_range_spec은 2자리 코드여야 합니다." };
    }
  }

  // 관능형 검증  ← 질문하신 블록을 여기에!
  if (payload.insp_type === "S") {
    const ms = Number(payload.max_score);            // 5 or 10
    const ps = Number(payload.pass_score);           // 예: 3.50, 6.50 등
    if (!Number.isFinite(ms) || !Number.isFinite(ps)) {
      return { ok: false, message: "관능형: 최고점수/합격점수는 숫자여야 합니다." };
    }
    if (ps < 0 || ps > ms) {
      return { ok: false, message: `관능형: 합격 점수는 0 ~ ${ms} 사이여야 합니다.` };
    }
    if (payload.pass_score_spec && String(payload.pass_score_spec).length > 2) {
      return { ok: false, message: "관능형: pass_score_spec은 2자리 코드여야 합니다." };
    }
    // ★ score_desc_json 필수
    if (!payload.score_desc_json || typeof payload.score_desc_json !== 'string') {
      return { ok: false, message: "관능형: 채점기준(score_desc_json)이 필요합니다." };
    }
  }
  // ---------- [A] 끝 ----------

  const qSession = makeSessionId("Q");
  const tSession = makeSessionId("T");

  try {
    // 관능형 질문 적재
    if (payload.insp_type === "S" && Array.isArray(payload.questions)) {
      for (const q of payload.questions) {
        const text = (q || "").trim();
        if (!text) continue;
        await mariadb.query("insertTmpQuestion", [qSession, text]);
      }
    }

    // ✅ 검사대상: a1~a5 그대로 넣기
    if (Array.isArray(payload.targets)) {
      for (const row of payload.targets) {
        const insp_target_type = row.t_category; // '제품' | '자재'
        const insp_target_code = row.t_type; // ✅ a1~a5 그대로
        const product_code = insp_target_type === "제품" ? row.t_id : null;
        const mat_code = insp_target_type === "자재" ? row.t_id : null;

        await mariadb.query("insertTmpTarget", [
          tSession,
          insp_target_type,
          insp_target_code,
          product_code,
          mat_code,
        ]);
      }
    }

    // 프로시저 호출(자리수 15개 유지!)
    const params = [
      payload.insp_item_name,
      payload.insp_type, // 'R' or 'S'
      payload.use_yn,
      payload.insp_method,
      payload.insp_file_name,
      payload.writer ?? "system",

      payload.min_range,
      payload.min_range_spec, // R1/R2
      payload.max_range,
      payload.max_range_spec, // R3/R4
      payload.unit,

      payload.max_score,
      payload.pass_score,
      payload.pass_score_spec, // R1/R2
      payload.score_desc_json ?? null,   // ★ 추가: JSON 문자열

      qSession,
      tSession,
    ];

    await mariadb.query("callInspMaster", params);
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, message: err.message || "등록 실패" };
  } finally {
    try {
      await mariadb.query("cleanupTmpQuestions", [qSession]);
    } catch {}
    try {
      await mariadb.query("cleanupTmpTargets", [tSession]);
    } catch {}
  }
};

// 1-4. 품질기준관리 조회
const findInspMaster = async () => {
  let list = await mariadb
    .query("selectInspMaster")
    .catch((err) => console.log(err));
  return list;
};

// 1-5. 품질기준관리 검색
const searchInspMaster = async (param) => {
  const { itemName = '', targetName = '', typeCode = '', useYn = '' } = param;

  const params = [
    itemName, itemName,
    targetName, targetName,
    typeCode, typeCode,
    useYn, useYn
  ];

  try {
    return await mariadb.query("searchInspMaster", params);
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 1-6. 품질기준관리 수정
const updateInspMaster = async (inspItemId, payload) => {
  // ---- 서버 가드 검증 (등록과 동일/유사) ----
  if (!inspItemId) return { ok: false, message: "수정할 ID가 없습니다." };

  payload.insp_item_name = (payload.insp_item_name || "").trim();
  payload.use_yn = payload.use_yn === "N" ? "N" : "Y";
  if (!payload.insp_item_name) {
    return { ok: false, message: "검사항목명은 필수입니다." };
  }

  if (payload.insp_type === "R") {
    const min = Number(payload.min_range);
    const max = Number(payload.max_range);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { ok: false, message: "범위형: 최소/최대는 숫자여야 합니다." };
    }
    if (min > max) {
      return { ok: false, message: "범위형: 최소값이 최대값보다 클 수 없습니다." };
    }
  } else if (payload.insp_type === "S") {
    const ms = Number(payload.max_score);
    const ps = Number(payload.pass_score);
    if (!Number.isFinite(ms) || !Number.isFinite(ps)) {
      return { ok: false, message: "관능형: 최고점수/합격점수는 숫자여야 합니다." };
    }
    if (ps < 0 || ps > ms) {
      return { ok: false, message: `관능형: 합격 점수는 0 ~ ${ms} 사이여야 합니다.` };
    }
  }

  const qSession = makeSessionId("Q");
  const tSession = makeSessionId("T");

  try {
    // 질문 tmp
    if (payload.insp_type === "S" && Array.isArray(payload.questions)) {
      for (const q of payload.questions) {
        const text = (q || "").trim();
        if (!text) continue;
        await mariadb.query("insertTmpQuestion", [qSession, text]);
      }
    }

    // 대상 tmp
    if (Array.isArray(payload.targets)) {
      for (const row of payload.targets) {
        const insp_target_type = row.t_category;   // '제품' | '자재'
        const insp_target_code = row.t_type;       // a1~a5
        const product_code     = insp_target_type === "제품" ? row.t_id : null;
        const mat_code         = insp_target_type === "자재" ? row.t_id : null;

        await mariadb.query("insertTmpTarget", [
          tSession,
          insp_target_type,
          insp_target_code,
          product_code,
          mat_code,
        ]);
      }
    }

    // 프로시저 호출 (파라미터 순서 주의!)
    const params = [
      inspItemId,                          // ★ 수정 대상 ID
      payload.insp_item_name,
      payload.insp_type,
      payload.use_yn,
      payload.insp_method,
      payload.insp_file_name,
      payload.writer ?? "system",

      payload.min_range,
      payload.min_range_spec,
      payload.max_range,
      payload.max_range_spec,
      payload.unit,

      payload.max_score,
      payload.pass_score,
      payload.pass_score_spec,
      payload.score_desc_json ?? null,   // ★ 추가

      qSession,
      tSession,
    ];

    await mariadb.query("InspMasterUpdate", params);
    return { ok: true };
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return { ok: false, message: err.sqlMessage || err.message || "수정 실패" };
  } finally {
    try { await mariadb.query("cleanupTmpQuestions", [qSession]); } catch {}
    try { await mariadb.query("cleanupTmpTargets",   [tSession]); } catch {}
  }
};

// 1-7. 품질기준관리 삭제 
const deleteInspMaster = async (inspItemId) => {
  try{
    if (!inspItemId) return { ok: false, message: "삭제할 ID가 없습니다." };
    await mariadb.query("InspMasterDel", [inspItemId]);
    return { ok: true };
  }catch(err){
    console.error("DELETE ERROR: ", err)
    return {ok: false, message: err.sqlMessage || err.message || '삭제 실패'}
  }
}

// 1-8. 품질기준관리 상세조회
const findInspMasterDetail = async (inspItemId) => {
  try {
    const [master]  = await mariadb.query("selectInspMasterDetail", [inspItemId]);
    if (!master) return { ok:false, message:"데이터가 없습니다." };

    const targets = await mariadb.query("selectInspTargetsByItem", [inspItemId]);
    const questions = await mariadb.query("selectInspQuestionsByItem", [inspItemId]);

    // 프론트가 그대로 바인딩하기 좋게 키 이름만 맞춰서 반환
    const normTargets = targets.map(t => ({
      t_id: t.t_id,
      t_type: t.insp_target_code,        // a1~a5
      t_category: t.t_category,
      t_name: t.t_name ?? '',
      t_spec: t.t_spec ?? '',
      t_unit: t.t_unit ?? '',
      t_type_name: t.t_type_name ?? '',
    }));

    const normQuestions = questions.map((q, i) => ({
      id: q.ques_id ?? i + 1,
      text: q.ques_name ?? ''
    }));

    return { ok:true, data: { master, targets: normTargets, questions: normQuestions } };
  } catch (e) {
    console.error(e);
    return { ok:false, message: e.sqlMessage || e.message || "상세 조회 실패" };
  }
};


module.exports = {
  findInspTarget,
  findInspTargetSearch,
  registerInspMaster,
  findInspMaster,
  deleteInspMaster,
  updateInspMaster,
  findInspMasterDetail,
  searchInspMaster
};
