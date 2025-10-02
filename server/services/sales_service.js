// 영업 서비스
const mariadb = require("../database/mapper.js");

// 날짜 객체를 'YYYY-MM-DD' 문자열로 변환하는 헬퍼 함수
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    // Date 객체가 아니면 그대로 반환하거나, 에러 처리
    return date;
  }

  // UTC 기준이 아닌, 로컬 시간 기준으로 연/월/일을 가져오기 위해
  // getUTCFullYear 등을 사용하는 대신 일반 getFullYear 등을 사용합니다.
  // 단, 타임존 이슈를 완전히 해결하려면 DB 저장 시점부터 UTC를 사용하거나
  // 'moment.js'나 'date-fns' 같은 라이브러리를 쓰는 것이 좋습니다.

  const year = date.getFullYear();
  // getMonth()는 0부터 시작하므로 1을 더합니다.
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const viewList = async () => {
  let list = await mariadb.query("selectOrderForm").catch((err) => {
    console.error("DB 조회 오류:", err);
    // 오류 발생 시 빈 배열 반환하여 이후 로직이 멈추지 않도록 처리
    return [];
  });

  // 💡 비즈니스 로직(데이터 가공)이 Service 계층에서 수행됩니다.
  const formattedList = list.map((item) => {
    // 주문일자 필드 이름이 'ord.date' 또는 'orderDate'라고 가정하고 수정합니다.
    const dateFieldName = "due_date"; // 또는 'order_date', 'create_dt' 등 실제 필드명 사용
    if (item[dateFieldName]) {
      // Node.js가 DB에서 가져온 Date 객체를 포맷팅
      item[dateFieldName] = formatDate(item[dateFieldName]);
    }

    const ordDateFieldName = "ord_date";
    if (item[ordDateFieldName]) {
      item[ordDateFieldName] = formatDate(item[ordDateFieldName]);
    }
    return item;
  });

  return formattedList; // 포맷팅된 데이터 리스트 반환
};

module.exports = {
  viewList,
};
