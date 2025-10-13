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

      payload.min_range,
      payload.min_range_spec, // R1/R2
      payload.max_range,
      payload.max_range_spec, // R3/R4
      payload.unit,

      payload.max_score,
      payload.pass_score,
      payload.pass_score_spec, // R1/R2

      qSession,
      tSession,

      payload.writer ?? "system",
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

module.exports = {
  findInspTarget,
  findInspTargetSearch,
  registerInspMaster,
  findInspMaster,
};
