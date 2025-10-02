USE dev;
SELECT * FROM prod_drct;

SELECT  CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MIN(SUBSTR(prod_drct_id, -3)),0) + 1, 3, '0')) FROM prod_drct;

SELECT CONCAT('PRO', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(prod_drct_id, -3)),0) + 1, 3, '0'))) 
FROM prod_drct
WHERE SUBSTR(prod_drct_id, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
FOR UPDATE;

