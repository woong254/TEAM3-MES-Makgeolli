// Table : makeform, makedetail

// 작성한 지시서 불러오기 (모달창에서 사용)
const selectMakeForm = `
  SELECT  mk_name,
          writing_date,
          mk_bgnde,
          mk_ende
  FROM    makeform
  WHERE   emp_id = ?
  ORDER BY writing_date DESC
`;

// 생산 지시 정보와 상품 추가하기
const addProdToMakeForm = `

`;