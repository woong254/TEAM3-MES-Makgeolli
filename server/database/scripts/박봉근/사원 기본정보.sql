-- 사원 기준 정보 셈플 데이터

DESC emp_master;

ALTER TABLE emp_master MODIFY hire_date DATE NOT NULL;
ALTER TABLE emp_master
CHANGE rank position VARCHAR(50); 

INSERT INTO emp_master (emp_id,
						emp_name,
                        dept_name,
                        position,
                        emp_phone,
                        emp_email,
                        hire_date,
                        role,
                        writer,
                        write_date)
VALUES ('EMP20250001',
		'박봉근',
        '생산',
        '팀장',
        '01038001708',
        'c1-03@naver.com',
        STR_TO_DATE('25.06.16', '%y.%m.%d'),
        'm',
        'admin',
        STR_TO_DATE('09.08.01', '%y.%m.%d')
);

INSERT INTO emp_master (emp_id,
						emp_name,
                        dept_name,
                        position,
                        emp_phone,
                        emp_email,
                        hire_date,
                        role,
                        writer,
                        write_date)
VALUES ('EMP20250002',
		'이한솔',
        '품질',
        '팀장',
        '01077575263',
        'hansollee95@naver.com',
        STR_TO_DATE('25.06.16', '%y.%m.%d'),
        'm',
        'admin',
        STR_TO_DATE('09.08.01', '%y.%m.%d')
);

INSERT INTO emp_master (emp_id,
						emp_name,
                        dept_name,
                        position,
                        emp_phone,
                        emp_email,
                        hire_date,
                        role,
                        writer,
                        write_date)
VALUES ('EMP20250003',
		'장준현',
        '영업',
        '팀장',
        '01026104902',
        'idontno@gmail.com',
        STR_TO_DATE('25.06.16', '%y.%m.%d'),
        'm',
        'admin',
        STR_TO_DATE('09.08.01', '%y.%m.%d')
);

INSERT INTO emp_master (emp_id,
						emp_name,
                        dept_name,
                        position,
                        emp_phone,
                        emp_email,
                        hire_date,
                        role,
                        writer,
                        write_date)
VALUES ('EMP20250004',
		'정지웅',
        '품질',
        '팀장',
        '01056114575',
        'please_input_email@gmail.com',
        STR_TO_DATE('25.06.16', '%y.%m.%d'),
        'm',
        'admin',
        STR_TO_DATE('09.08.01', '%y.%m.%d')
);

INSERT INTO emp_master (emp_id,
						emp_name,
                        dept_name,
                        position,
                        emp_phone,
                        emp_email,
                        hire_date,
                        role,
                        writer,
                        write_date)
VALUES ('EMP20250005',
		'방재우',
        '설비',
        '팀장',
        '01023655198',
        'helloVUE@naver.com',
        STR_TO_DATE('25.06.16', '%y.%m.%d'),
        'm',
        'admin',
        STR_TO_DATE('09.08.01', '%y.%m.%d')
);

select  *
from  emp_master;

use mes;
select  *
from 	makeform;



SELECT  mk_name,
          writing_date,
          mk_bgnde,
          mk_ende
  FROM    makeform
  WHERE   emp_id = 'EMP-20250616-0002'
  ORDER BY writing_date DESC;
  

