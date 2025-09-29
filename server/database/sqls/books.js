// Table : t_book_01
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )
// 조건없이 전체조회
const selectBookList = `SELECT no
,name
,writer
,publisher
,publication_date
,info
FROM t_book_01
ORDER BY no`;
// PRIMARY KEY를 활용한 단건조회
const selectBookOne = `SELECT no
		, name
        , writer
        , publisher
        , publication_date
        , info 
FROM t_book_01
WHERE no = ?`;
// ?의 총 갯수는 1개이고 대체할 값이 입력될 컬럼은 no로 명확함 : 단일 기본값(문자, 숫자, 날짜) 중 숫자
// 등록
const bookInsert = `INSERT INTO t_book_01 (name, writer, publisher, publication_date, info)
VALUES (?, ?, ?, ?, ?)`;
// 수정
const bookUpdate = ``;
// PRIMARY KEY를 활용한 삭제
const bookDelete = ``;
module.exports = {
  selectBookList,
  selectBookOne,
  bookInsert,
  bookUpdate,
  bookDelete,
};
