show databases;
use mes;

-- 생산 지시서 테이블 
desc makeform;

ALTER TABLE makeform
CHANGE emp_no emp_id varchar(100),
CHANGE writng_date writing_date DATE,
ADD CONSTRAINT fk_makeform_to_emp_master
FOREIGN KEY (emp_id) REFERENCES emp_master(emp_id);

-- 생산 지시서 상세 테이블
desc makedetail;

ALTER TABLE makedetail
ADD CONSTRAINT fk_makedetail_to_prod_master
FOREIGN KEY (prod_code) REFERENCES prod_master(prod_code),
ADD CONSTRAINT fk_makedetail_to_bom_master
FOREIGN KEY (bom_code) REFERENCES bom_master(bom_code);

