// Table : bcnc_master
const selectBcnc = `
SELECT bcnc_name,
	     pic,
       brn
FROM   bcnc_master
WHERE  1=1`;

module.exports = {
  // 사용할 쿼리문의 이름을 여기에 적으세요
  selectBcnc,
};
