// Table : makeform, makedetail, makelist

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

module.exports = {
  selectMakeForm,
}
