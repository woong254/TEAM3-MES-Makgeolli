-- 생산 지시 셈플 테이터
DESC makeform;

-- INSERT INTO makeform (mk_name,   -- 생산지시명
-- 					  emp_id,    -- 담당자
--                       mk_bgnde,  -- 생산시작일
--                       mk_ende,	 -- 생산종료일
--                       remark)    -- 비고
-- VALUES ('이마트 납품',
-- 		'emp_sample_data1',
--         STR_TO_DATE('25.10.02', 'yy.MM.dd'),
--         STR_TO_DATE('25.10.24', 'yy.MM.dd'),
--         '추석 이벤트 먼저 납품');
        
INSERT INTO makeform (mk_ord_no, -- 생산지시코드
					  mk_name,   -- 생산지시명
					  emp_id,    -- 담당자
                      mk_bgnde,  -- 생산시작일
                      mk_ende,	 -- 생산종료일
                      writing_date, -- 작성일
                      remark,
                      mk_st)    -- 비고
VALUES ('PI-20250930-0001',
		'이마트 납품',
		null,
        STR_TO_DATE('25.10.02', '%y.%m.%d'),
        STR_TO_DATE('25.10.24', '%y.%m.%d'),
        CURDATE(),
        '추석 이벤트 먼저 납품',
        '생산대기');
        
INSERT INTO makeform (mk_ord_no, -- 생산지시코드
					  mk_name,   -- 생산지시명
					  emp_id,    -- 담당자
                      mk_bgnde,  -- 생산시작일
                      mk_ende,	 -- 생산종료일
                      writing_date, -- 작성일
                      remark,
                      mk_st)    -- 비고
VALUES ('PI-20251001-0001',
		'롯데백화점 단체 납품',
		null,
        STR_TO_DATE('25.10.10', '%y.%m.%d'),
        STR_TO_DATE('25.10.31', '%y.%m.%d'),
        CURDATE(),
        null,
        '생산대기');
        
select  *
from makeform;

select  mk_name,
		writing_date,
		mk_bgnde,
        mk_ende
from makeform;

update makeform
set emp_id = 'EMP-20250616-0002'
where mk_ord_no = 'PI-20251001-0001';

delete from makeform
where emp_id = 'EMP-20250616-0001';

DESC makedetail;

ALTER TABLE makedetail MODIFY mkd_no INT(5) AUTO_INCREMENT;


ALTER TABLE makedetail
CHANGE mkpriort mk_priority INT(5);

ALTER TABLE orderdetail MODIFY ofd_no INT(5);

INSERT INTO makedetail (mkd_no,
						mk_ord_no,
                        no,
                        prod_code,
                        mk_num,
                        mk_priort
                        
                        
                        


        
