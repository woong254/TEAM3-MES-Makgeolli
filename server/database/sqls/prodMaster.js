// Table : prod_master
const selectProd = `
CALL search_products(?,?,?)`;

module.exports = {
  // 사용할 쿼리문의 이름을 여기에 적으세요
  selectProd,
};
