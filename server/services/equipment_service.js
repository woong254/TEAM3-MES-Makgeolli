// 설비 서비스
const mariadb = require("../database/mapper.js");
// const { searchEquipList } = require("../database/sqls/equipform.js");

const {
  searchEquipList,
  insertEquip,
  updateEquip,
  deleteEquip,
} = require("../database/sqls/equipform.js");

// 유틸: 공백/빈문자 → null
function toNullTrim(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
}

// [다건 조회] filters를 받아 WHERE를 동적으로 붙여서 실행
async function list(filters = {}) {
  const {
    equipCode, // 부분 검색
    equipName, // 부분 검색
    equipType, // 정확히 일치
    equipStatus, // 숫자일 가능성
    limit, // 페이지 사이즈(옵션)
    offset, // 시작 위치(옵션)
  } = filters;

  let sql = searchEquipList;
  const params = [];

  const _equipCode = toNullTrim(equipCode);
  const _equipName = toNullTrim(equipName);
  const _equipType = toNullTrim(equipType);
  const _equipStatus = toNullTrim(equipStatus);

  if (_equipCode) {
    sql += ` AND o.equip_code LIKE ?`;
    params.push(`%${_equipCode}%`);
  }
  if (_equipName) {
    sql += ` AND o.equip_name LIKE ?`;
    params.push(`%${_equipName}%`);
  }
  if (_equipType) {
    sql += ` AND o.equip_type = ?`;
    params.push(_equipType);
  }
  if (_equipStatus !== null) {
    const n = Number(_equipStatus);
    if (!Number.isNaN(n)) {
      sql += ` AND o.equip_status = ?`;
      params.push(n);
    }
  }

  sql += ` ORDER BY o.equip_code`;

  // 페이지네이션 (옵션)
  if (Number.isInteger(Number(limit)) && Number.isInteger(Number(offset))) {
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
  }

  return await mariadb.query(sql, params);
}

// [등록]
async function create(payload = {}) {
  const equip_code = toNullTrim(payload.equip_code);
  const equip_name = toNullTrim(payload.equip_name);
  const equip_type = toNullTrim(payload.equip_type);
  const manager = toNullTrim(payload.manager);
  const equip_status =
    payload.equip_status === undefined ? null : Number(payload.equip_status);
  const insp_cycle =
    payload.insp_cycle === undefined ? null : Number(payload.insp_cycle);

  // 필수값 체크(예: 코드/이름/타입)
  if (!equip_code || !equip_name || !equip_type) {
    const err = new Error("필수값 누락: equip_code, equip_name, equip_type");
    err.status = 400;
    throw err;
  }

  const params = [
    equip_code,
    equip_name,
    equip_type,
    manager,
    equip_status,
    insp_cycle,
  ];
  const result = await mariadb.query(insertEquip, params);
  return { affectedRows: result.affectedRows };
}

// [수정] PK = equip_code
async function update(equip_code, payload = {}) {
  equip_code ??= toNullTrim(equip_code);
  if (!equip_code) {
    const err = new Error("equip_code가 필요합니다");
    err.status = 400;
    throw err;
  }

  const equip_name = toNullTrim(payload.equip_name);
  const equip_type = toNullTrim(payload.equip_type);
  const manager = toNullTrim(payload.manager);
  const equip_status =
    payload.equip_status === undefined ? null : Number(payload.equip_status);
  const insp_cycle =
    payload.insp_cycle === undefined ? null : Number(payload.insp_cycle);

  // 단순 버전: 모든 컬럼을 SET (일부만 수정하려면 동적 UPDATE로 확장 가능)
  if (!equip_name || !equip_type) {
    const err = new Error("수정 시 equip_name, equip_type은 필요합니다");
    err.status = 400;
    throw err;
  }

  const params = [
    equip_name,
    equip_type,
    manager,
    equip_status,
    insp_cycle,
    equip_code,
  ];
  const result = await mariadb.query(updateEquip, params);
  return { affectedRows: result.affectedRows };
}

// [삭제]
async function remove(equip_code) {
  const code = toNullTrim(equip_code);
  if (!code) {
    const err = new Error("equip_code가 필요합니다");
    err.status = 400;
    throw err;
  }
  const result = await mariadb.query(deleteEquip, [code]);
  return { affectedRows: result.affectedRows };
}

module.exports = { list, create, update, remove };

// const findAll = async () => {
//   const list = await mariadb
//     .query("searchEquipList")
//     .catch((err) => console.log(err));
//   return list;
// };

// module.exports = { findAll };
