// 공정실적관리-공정제어 데이터 저장소

// 메모리에 데이터를 저장할 변수
const processStorage = {};

/**
 * 공정 진행에 필요한 3가지 데이터를 저장합니다.
 * @param : 아래함수가 받는 인자(parameter)에 대한 정보를 설명할 때 사용
 * {object} : 타입을 설명하고
 * make : 인자에 있는 변수이름
 * >> 그래서 정리하자면 아래함수가 받는 인자에 대해서 설명할건데 이 인자의 타입은 object타입이고 인자의 변수이름은 make이다.
 * @param {object} make - 지시서 상세 정보 (mkd_no, prod_code, inpt_qty)
 *  ㄴ mkd_no - 지시서 상세 목록
 *  ㄴ prod_code - 제품코드
 *  ㄴ inpt_qty - 현투입량
 * @param {object} equip - 설비 정보 (equip_code)
 * @param {object} emp - 사원 정보 (emp_id)
 */
// 공정제어에서 받을 데이터 저장하는 saveProcessData 함수
const saveProcessData = (make, equip, emp) => {
  processStorage["currentProcessData"] = { make, equip, emp };
};

/**
 * 저장된 공정 데이터를 가져옵니다.
 * @returns {{make: object, equip: object, emp: object}}
 */
const getProcessData = () => {
  const data = processDataStore["currentProcessData"];
  if (data) {
    console.log("서버 저장소에서 프로세스 데이터를 성공적으로 가져왔습니다.");
  } else {
    console.log("서버 저장소에서 프로세스 데이터를 찾을 수 없습니다.");
  }
  return data;
};
