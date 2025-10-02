
CREATE TABLE `prod_insp_result` (
	`insp_result_id`	INT(6)	NOT NULL,
	`insp_result_value`	DECIMAL(6,2)	NULL,
	`r_value`	CHAR(1)	NULL,
	`insp_item_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`insp_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `bcnc_master` (
	`bcnc_code`	VARCHAR(100)	NOT NULL,
	`bcnc_name`	VARCHAR(100)	NOT NULL,
	`bcnc_type`	VARCHAR(20)	NOT NULL,
	`brn`	VARCHAR(100)	NOT NULL,
	`pic`	VARCHAR(20)	NOT NULL,
	`field5`	VARCHAR(100)	NOT NULL,
	`bcnc_category`	VARCHAR(100)	NOT NULL,
	`email`	VARCHAR(100)	NULL,
	`bcnc_tel`	VARCHAR(15)	NOT NULL,
	`fax`	VARCHAR(30)	NULL,
	`remark`	VARCHAR(1000)	NULL,
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL
);

CREATE TABLE `pur_form` (
	`pur_code`	VARCHAR(100)	NOT NULL,
	`emp_id`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`bcnc_code`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`pur_name`	VARCHAR(100)	NOT NULL,
	`pur_date`	DATE	NOT NULL,
	`receipt_date`	DATE	NOT NULL,
	`pur_status`	VARCHAR(100)	NOT NULL	DEFAULT '발주대기',
	`remark`	VARCHAR(300)	NULL
);

CREATE TABLE `makelist` (
	`mk_list`	VARCHAR(10)	NOT NULL,
	`mk_ord_no`	VARCHAR(100)	NOT NULL,
	`flow_id`	VARCHAR(100)	NOT NULL	COMMENT 'FK'
);

CREATE TABLE `def_master_target` (
	`insp_target_id`	VARCHAR(100)	NOT NULL,
	`insp_target_type`	CHAR(3)	NULL	COMMENT '공통코드(제품:PRD / 자재:MAT)',
	`insp_target_code`	VARCHAR(100)	NULL,
	`prod_code`	VARCHAR(100)	NULL,
	`mat_code`	VARCHAR(100)	NULL,
	`def_item_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `prod_master` (
	`prod_code`	VARCHAR(100)	NOT NULL,
	`prod_name`	VARCHAR(100)	NOT NULL,
	`prod_type`	VARCHAR(50)	NOT NULL,
	`prod_spec`	VARCHAR(10)	NOT NULL	COMMENT 'STNDRD - STANDARD - 규격',
	`prod_unit`	VARCHAR(100)	NOT NULL,
	`prod_safe_stock`	DECIMAL(7,2)	NULL	COMMENT 'SAFETY INVOICE - SFINVC',
	`mxabv`	DECIMAL(5,2)	NULL,
	`minabv`	DECIMAL(5,2)	NULL,
	`abv`	VARCHAR(10)	NULL,
	`mxtp`	DECIMAL(4,2)	NULL,
	`mintp`	DECIMAL(4,2)	NULL,
	`tp`	VARCHAR(10)	NULL,
	`exp`	INT(3)	NOT NULL,
	`exp_unit`	VARCHAR(10)	NOT NULL,
	`prod_lt`	INT(3)	NOT NULL,
	`prod_ltunit`	VARCHAR(10)	NOT NULL,
	`prod_dc`	VARCHAR(1000)	NULL,
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL
);

CREATE TABLE `qc_master` (
	`insp_item_id`	VARCHAR(100)	NOT NULL,
	`insp_item_name`	VARCHAR(100)	NOT NULL,
	`insp_type`	CHAR(1)	NOT NULL	COMMENT '공통코드(범위:R / 관능:S)',
	`use_yn`	CHAR(1)	NOT NULL	DEFAULT 'y',
	`insp_method`	VARCHAR(1000)	NULL,
	`file_name`	VARCHAR(50)	NULL,
	`max_score`	CHAR(1)	NULL	COMMENT '5점 / 10점 (셀렉트박스), 채점기준(공통코드)',
	`pass_score`	DECIMAL(2,2)	NULL	COMMENT '평균',
	`pass_score_spec`	CHAR(1)	NULL	COMMENT '이상(a), 이하(b), 초과(c), 미만(d)'
);

CREATE TABLE `makedetail` (
	`mkd_no`	DECIMAL(5,0)	NOT NULL,
	`mk_ord_no`	VARCHAR(100)	NOT NULL,
	`no`	INT(5)	NOT NULL,
	`prod_code`	VARCHAR(100)	NOT NULL,
	`mk_num`	DECIMAL(10,0)	NOT NULL,
	`mkpriort`	INT(5)	NULL,
	`remark`	VARCHAR(1000)	NULL,
	`mkd_st`	VARCHAR(20)	NOT NULL,
	`bom_code`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`pld_no`	DECIMAL(5,0)	NOT NULL
);

CREATE TABLE `qc_masrer_target` (
	`insp_target_id`	VARCHAR(100)	NOT NULL,
	`insp_target_type`	CHAR(3)	NULL	COMMENT '공통코드(제품:PRD / 자재:MAT)',
	`insp_target_code`	VARCHAR(100)	NULL,
	`product_code`	VARCHAR(100)	NULL	COMMENT 'FK',
	`mat_code`	VARCHAR(100)	NULL	COMMENT 'FK',
	`insp_item_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `ins_item` (
	`insp_order`	INT(10)	NOT NULL	COMMENT 'PK',
	`insp_code`	VARCHAR(100)	NOT NULL	COMMENT 'PK,FK',
	`insp_desc`	VARCHAR(100)	NOT NULL,
	`insp_result`	VARCHAR(100)	NULL,
	`itemnote`	VARCHAR(100)	NULL,
	`insp_item`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `mat_receipt` (
	`iis_id`	INT(8)	NOT NULL,
	`mat_lot`	VARCHAR(100)	NOT NULL,
	`receipt_date`	DATE	NOT NULL,
	`remark`	VARCHAR(300)	NULL
);

CREATE TABLE `bom_detail` (
	`bom_info_id`	VARCHAR(100)	NOT NULL,
	`bom_mat_code`	VARCHAR(100)	NOT NULL,
	`mat_qty`	DECIMAL(10,2)	NULL,
	`bom_code`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `processform` (
	`procs_no`	DECIMAL(10,0)	NOT NULL,
	`mk_list`	VARCHAR(10)	NOT NULL,
	`equip_code`	VARCHAR(100)	NOT NULL,
	`emp_no`	VARCHAR(100)	NOT NULL,
	`prod_code`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`inpt_qty`	DECIMAL(5,0)	NOT NULL,
	`mk_qty`	DECIMAL(5,0)	NOT NULL,
	`fail_qty`	DECIMAL(5,0)	NOT NULL,
	`pass_qty`	DECIMAL(5,0)	NOT NULL,
	`procs_bgntm`	DATE	NULL,
	`procs_endtm`	DATE	NULL,
	`prog`	VARCHAR(50)	NOT NULL,
	`procs_st`	VARCHAR(20)	NULL,
	`insp_status`	VARCHAR(30)	NULL,
	`now_procs`	VARCHAR(30)	NULL
);

CREATE TABLE `proc_flow_master` (
	`flow_id`	VARCHAR(100)	NOT NULL,
	`use_yn`	CHAR(1)	NOT NULL	DEFAULT 'y',
	`prod_code`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL
);

CREATE TABLE `iis` (
	`iis_id`	INT(8)	NOT NULL,
	`pur_code`	VARCHAR(100)	NOT NULL,
	`mat_code`	VARCHAR(100)	NOT NULL,
	`bcnc_code`	VARCHAR(100)	NOT NULL,
	`exp_date`	DATE	NOT NULL,
	`pre_receipt_date`	DATE	NOT NULL,
	`prod_date`	DATE	NOT NULL,
	`receipt_qty`	DECIMAL(10,2)	NOT NULL,
	`pass_qty`	DECIMAL(10,2)	NULL,
	`fail_qty`	DECIMAL(10,2)	NULL,
	`insp_status`	VARCHAR(100)	NOT NULL	DEFAULT '검사대기',
	`remark`	VARCHAR(300)	NULL
);

CREATE TABLE `epis` (
	`ep_lot`	VARCHAR(50)	NOT NULL,
	`insp_id`	VARCHAR(100)	NOT NULL,
	`epis_dt`	DATE	NOT NULL,
	`prod_code`	VARCHAR(100)	NOT NULL,
	`epis_qty`	DECIMAL(7,2)	NOT NULL,
	`epos_qty`	DECIMAL(7,2)	NOT NULL,
	`ep_qty`	DECIMAL(7,2)	NOT NULL,
	`epep_dt`	DATE	NOT NULL,
	`eps`	VARCHAR(20)	NOT NULL,
	`remark`	VARCHAR(500)	NULL
);

CREATE TABLE `equip_master` (
	`equip_code`	VARCHAR(100)	NOT NULL	COMMENT 'PK',
	`equip_name`	VARCHAR(100)	NULL,
	`equip_type`	VARCHAR(100)	NULL,
	`install_date`	DATE	NULL,
	`mfg_dt`	DATE	NULL,
	`maker`	VARCHAR(100)	NULL,
	`model_name`	VARCHAR(100)	NULL,
	`insp_cycle`	VARCHAR(100)	NULL,
	`manager`	VARCHAR(100)	NULL,
	`equip_image`	VARCHAR(100)	NULL,
	`equip_status`	VARCHAR(100)	NULL
);

CREATE TABLE `proc_master` (
	`proc_id`	VARCHAR(100)	NOT NULL,
	`proc_name`	VARCHAR(100)	NOT NULL,
	`equip_type`	VARCHAR(100)	NOT NULL,
	`use_yn`	CHAR(1)	NOT NULL	DEFAULT 'y',
	`remark`	VARCHAR(1000)	NULL,
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL
);

CREATE TABLE `prod_insp` (
	`insp_id`	VARCHAR(100)	NOT NULL,
	`insp_name`	VARCHAR(200)	NULL,
	`insp_date`	DATETIME NOT NULL DEFAULT NOW(),
	`insp_qty`	DECIMAL(6,2)	NULL,
	`pass_qty`	DECIMAL(6,2)	NULL	COMMENT '검사량 - 불량량 = 합격량',
	`fail_qty`	DECIMAL(6,2)	NULL	COMMENT '총 불량갯수',
	`remark`	VARCHAR(500)	NULL,
	`final_result`	CHAR(1)	NULL,
	`emp_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`epep_dt`	DATE	NULL	COMMENT '합격일+30(일)',
	`procs_no`	INT(10)	NOT NULL
);

CREATE TABLE `proc_insp_ng` (
	`fail_id`	INT(6)	NOT NULL,
	`qty`	INT(3)	NULL,
	`def_item_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`insp_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `prod_insp_ng` (
	`key`	INT(6)	NOT NULL,
	`qty`	INT(3)	NULL,
	`def_item_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`insp_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `mat_master` (
	`mat_code`	VARCHAR(100)	NOT NULL,
	`mat_name`	VARCHAR(100)	NOT NULL,
	`mat_item_code`	VARCHAR(100)	NOT NULL,
	`mat_spec`	VARCHAR(20)	NOT NULL,
	`mat_unit`	VARCHAR(20)	NOT NULL,
	`safe_stock`	DECIMAL(7,2)	NULL,
	`mat_info`	VARCHAR(1000)	NULL,
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL
);

CREATE TABLE `proc_flow_detail` (
	`flow_info_id`	VARCHAR(100)	NOT NULL	COMMENT 'PK',
	`seq_no`	INT(3)	NOT NULL,
	`proc_id`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`flow_id`	VARCHAR(100)	NOT NULL	COMMENT 'FK'
);

CREATE TABLE `def_master` (
	`def_item_id`	VARCHAR(100)	NOT NULL,
	`def_item_name`	VARCHAR(200)	NULL,
	`action`	CHAR(1)	NULL	COMMENT '폐기(d), 재검사(r)',
	`file_name`	VARCHAR(200)	NULL,
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL
);

CREATE TABLE `proc_insp` (
	`insp_id`	VARCHAR(100)	NOT NULL,
	`insp_name`	VARCHAR(200)	NULL,
	`insp_date`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`insp_qty`	DECIMAL(6,2)	NULL,
	`pass_qty`	DECIMAL(6,2)	NULL	COMMENT '검사량 - 불량량 = 합격량',
	`fail_qty`	DECIMAL(6,2)	NULL	COMMENT '총 불량갯수',
	`remark`	VARCHAR(500)	NULL,
	`final_result`	CHAR(1)	NULL	COMMENT '합격/불합격 : P/F',
	`emp_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`procs_no`	INT(10)	NOT NULL	COMMENT 'FK'
);

CREATE TABLE `plandetail` (
	`pld_no`	DECIMAL(5,0)	NOT NULL,
	`pl_no`	VARCHAR(100)	NOT NULL,
	`no`	INT(5)	NOT NULL,
	`prod_code`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`pl_prod_qty`	DECIMAL(10,0)	NOT NULL,
	`remark`	VARCHAR(300)	NULL,
	`ofd_no`	DECIMAL(5,0)	NOT NULL
);

CREATE TABLE `pur_mat` (
	`pur_mat_id`	INT(8)	NOT NULL,
	`pur_code`	VARCHAR(100)	NOT NULL,
	`mat_code`	VARCHAR(100)	NOT NULL,
	`pur_qty`	DECIMAL(10,2)	NOT NULL,
	`receipt_qty`	DECIMAL(10,2)	NULL,
	`unreceipt_qty`	DECIMAL(10,2)	NULL,
	`receipt_status`	VARCHAR(100)	NOT NULL	DEFAULT '입고전',
	`remark`	VARCHAR(300)	NULL
);

CREATE TABLE `qc_master_ran` (
	`insp_item_id`	VARCHAR(100)	NOT NULL,
	`min_range`	DECIMAL(6,2)	NOT NULL,
	`min_range_spec`	CHAR(1)	NOT NULL	COMMENT '이상(a), 초과(b)',
	`max_range`	DECIMAL(6,2)	NOT NULL,
	`max_range_spec`	CHAR(1)	NOT NULL	COMMENT '이하(a), 미만(b)',
	`unit`	VARCHAR(5)	NOT NULL
);

CREATE TABLE `mat_insp` (
	`insp_id`	VARCHAR(100)	NOT NULL,
	`insp_name`	VARCHAR(200)	NOT NULL,
	`insp_date`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`insp_qty`	DECIMAL(6,2)	NOT NULL,
	`pass_qty`	DECIMAL(6,2)	NOT NULL	COMMENT '검사량 - 불량량 = 합격량',
	`fail_qty`	DECIMAL(6,2)	NOT NULL	COMMENT '총 불량갯수',
	`remark`	VARCHAR(500)	NULL,
	`t_result`	CHAR(1)	NULL	COMMENT '합격/불합격 : P/F',
	`emp_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`iis_id`	INT(8)	NOT NULL	COMMENT 'FK'
);

CREATE TABLE `mat_release` (
	`release_id`	INT(8)	NOT NULL,
	`mat_lot`	VARCHAR(100)	NOT NULL,
	`release_date`	DATE	NOT NULL,
	`release_qty`	DECIMAL(10,2)	NOT NULL,
	`remark`	VARCHAR(300)	NULL,
	`mkd_no`	DECIMAL(5,0)	NOT NULL
);

CREATE TABLE `qc_master_sen` (
	`ques_id`	VARCHAR(100)	NOT NULL,
	`ques_order`	VARCHAR(100)	NULL,
	`ques_name`	VARCHAR(100)	NULL,
	`insp_item_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `equip_inspection` (
	`insp_code`	VARCHAR(100)	NOT NULL	COMMENT 'PK',
	`inspector`	VARCHAR(100)	NULL,
	`insp_type`	VARCHAR(100)	NULL,
	`insp_item`	VARCHAR(100)	NULL,
	`insp_start`	DATE	NOT NULL,
	`insp_end`	DATE	NULL,
	`insp_result`	VARCHAR(100)	NULL,
	`action_status`	VARCHAR(100)	NULL,
	`equip_name`	VARCHAR(100)	NULL,
	`equip_code`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `edcts` (
	`epos_id`	VARCHAR(100)	NOT NULL,
	`ofd_no`	DECIMAL(5,0)	NOT NULL,
	`ep_lot`	VARCHAR(50)	NOT NULL,
	`epos_qty`	DECIMAL(9,2)	NOT NULL,
	`epos_dt`	DATE	NOT NULL,
	`remark`	VARCHAR(500)	NULL
);

CREATE TABLE `equip_downtime` (
	`downtime_code`	VARCHAR(100)	NOT NULL	COMMENT 'PK',
	`equip_name`	VARCHAR(100)	NULL,
	`downtime_type`	VARCHAR(100)	NULL,
	`downtime_start`	DATE	NOT NULL,
	`downtime_end`	DATE	NULL,
	`description`	VARCHAR(100)	NULL,
	`worker_id`	VARCHAR(100)	NULL,
	`progress_status`	VARCHAR(100)	NULL,
	`equip_code`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `comncode_dt` (
	`comncode_detailid`	VARCHAR(50)	NOT NULL,
	`comncode_id`	VARCHAR(50)	NOT NULL,
	`comncode_dtnm`	VARCHAR(100)	NOT NULL,
	`comncode_id2`	VARCHAR(50)	NOT NULL
);

CREATE TABLE `planform` (
	`pl_no`	VARCHAR(100)	NOT NULL,
	`pl_name`	VARCHAR(200)	NOT NULL,
	`pl_bgnde`	DATE	NOT NULL,
	`pl_endde`	DATE	NOT NULL,
	`writng_date`	DATE	NOT NULL,
	`remark`	VARCHAR(300)	NULL,
	`pl_knd`	VARCHAR(30)	NOT NULL,
	`emp_no`	VARCHAR(100)	NOT NULL	COMMENT 'FK'
);

CREATE TABLE `orderform` (
	`ord_id`	VARCHAR(100)	NOT NULL,
	`ord_name`	VARCHAR(10)	NOT NULL,
	`due_date`	DATE	NOT NULL,
	`bcnc_code`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`emp_no`	VARCHAR(100)	NOT NULL	COMMENT 'FK',
	`ord_date`	DATE	NOT NULL,
	`ord_knd`	VARCHAR(30)	NOT NULL,
	`order_status`	VARCHAR(20)	NOT NULL,
	`remark`	VARCHAR(500)	NULL
);

CREATE TABLE `mat_insp_ng` (
	`fail_id`	INT(6)	NOT NULL,
	`qty`	INT(3)	NULL,
	`def_item_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`insp_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `lot_mat` (
	`mat_lot`	VARCHAR(100)	NOT NULL,
	`mat_code`	VARCHAR(100)	NOT NULL,
	`exp_date`	DATE	NOT NULL,
	`prod_date`	DATE	NOT NULL,
	`stock_qty`	DECIMAL(10,2)	NOT NULL	DEFAULT 0,
	`receipt_qty`	DECIMAL(10,2)	NOT NULL	DEFAULT 0,
	`release_qty`	DECIMAL(10,2)	NOT NULL	DEFAULT 0,
	`remark`	VARCHAR(300)	NULL
);

CREATE TABLE `mat_insp_result` (
	`insp_result_id`	INT(6)	NOT NULL,
	`insp_result_value`	DECIMAL(6,2)	NULL	COMMENT '범위(측정값) / 관능(현재점수)',
	`r_value`	CHAR(1)	NULL	COMMENT '적합/부적합 : P/F',
	`insp_item_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`insp_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `equip_repair` (
	`repair_code`	VARCHAR(100)	NOT NULL	COMMENT 'PK',
	`equip_name`	VARCHAR(100)	NULL,
	`repair_person`	VARCHAR(100)	NULL,
	`failure_time`	DATE	NULL,
	`symptom`	VARCHAR(100)	NULL,
	`repair_start`	DATE	NOT NULL,
	`repair_end`	DATE	NULL,
	`repair_result`	VARCHAR(100)	NULL,
	`action_desc`	VARCHAR(100)	NULL,
	`equip_code`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `orderdetail` (
	`ofd_no`	DECIMAL(5,0)	NOT NULL,
	`ord_id`	VARCHAR(100)	NOT NULL,
	`no`	INT(2)	NOT NULL,
	`prod_code`	VARCHAR(100)	NOT NULL,
	`op_qty`	DECIMAL(9,2)	NOT NULL,
	`ofd_st`	VARCHAR(20)	NOT NULL,
	`remark`	VARCHAR(500)	NULL
);

CREATE TABLE `emp_master` (
	`emp_id`	VARCHAR(100)	NOT NULL,
	`emp_name`	VARCHAR(100)	NOT NULL,
	`dept_name`	VARCHAR(100)	NOT NULL	COMMENT '공통코드',
	`rank`	VARCHAR(50)	NOT NULL	COMMENT '공통코드',
	`emp_phone`	VARCHAR(30)	NULL,
	`emp_email`	VARCHAR(250)	NULL,
	`hire_date`	DATE	NULL,
	`field`	DATE	NULL,
	`role`	CHAR(1)	NOT NULL,
	`use_yn`	CHAR(1)	NOT NULL	DEFAULT 'y',
	`remark`	VARCHAR(1000)	NULL,
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL
);

CREATE TABLE `proc_insp_result` (
	`key`	INT(6)	NOT NULL,
	`insp_result_value`	DECIMAL(6,2)	NULL,
	`r_value`	CHAR(1)	NULL,
	`insp_item_id`	VARCHAR(100)	NULL	COMMENT 'FK',
	`insp_id`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `bom_master` (
	`bom_code`	VARCHAR(100)	NOT NULL,
	`prod_code`	VARCHAR(100)	NOT NULL,
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL,
	`use_yn`	CHAR(1)	NOT NULL	DEFAULT 'y',
	`field`	VARCHAR(20)	NULL
);

CREATE TABLE `makeform` (
	`mk_ord_no`	VARCHAR(100)	NOT NULL,
	`mk_name`	VARCHAR(200)	NOT NULL,
	`mk_bgnde`	DATE	NOT NULL,
	`mk_ende`	DATE	NOT NULL,
	`writng_date`	DATE	NOT NULL,
	`remark`	VARCHAR(1000)	NULL,
	`mk_st`	VARCHAR(20)	NOT NULL,
	`emp_no`	VARCHAR(100)	NOT NULL	COMMENT 'FK'
);

CREATE TABLE `comncode` (
	`comncode_id`	VARCHAR(50)	NOT NULL,
	`comncode_name`	VARCHAR(100)	NOT NULL,
	`writer`	VARCHAR(100)	NOT NULL,
	`write_date`	DATE	NOT NULL
);

ALTER TABLE `prod_insp_result` ADD CONSTRAINT `pk_prod_insp_result` PRIMARY KEY (
	`insp_result_id`
);

ALTER TABLE `bcnc_master` ADD CONSTRAINT `pk_bcnc_master` PRIMARY KEY (
	`bcnc_code`
);

ALTER TABLE `pur_form` ADD CONSTRAINT `pk_pur_form` PRIMARY KEY (
	`pur_code`
);

ALTER TABLE `makelist` ADD CONSTRAINT `pk_makelist` PRIMARY KEY (
	`mk_list`
);

ALTER TABLE `def_master_target` ADD CONSTRAINT `pk_def_master_target` PRIMARY KEY (
	`insp_target_id`
);

ALTER TABLE `prod_master` ADD CONSTRAINT `pk_prod_master` PRIMARY KEY (
	`prod_code`
);

ALTER TABLE `qc_master` ADD CONSTRAINT `pk_qc_master` PRIMARY KEY (
	`insp_item_id`
);

ALTER TABLE `makedetail` ADD CONSTRAINT `pk_makedetail` PRIMARY KEY (
	`mkd_no`
);

ALTER TABLE `qc_masrer_target` ADD CONSTRAINT `pk_qc_masrer_target` PRIMARY KEY (
	`insp_target_id`
);

ALTER TABLE `ins_item` ADD CONSTRAINT `pk_ins_item` PRIMARY KEY (
	`insp_order`,
	`insp_code`
);

ALTER TABLE `mat_receipt` ADD CONSTRAINT `pk_mat_receipt` PRIMARY KEY (
	`iis_id`
);

ALTER TABLE `bom_detail` ADD CONSTRAINT `pk_bom_detail` PRIMARY KEY (
	`bom_info_id`
);

ALTER TABLE `processform` ADD CONSTRAINT `pk_processform` PRIMARY KEY (
	`procs_no`
);

ALTER TABLE `proc_flow_master` ADD CONSTRAINT `pk_proc_flow_master` PRIMARY KEY (
	`flow_id`
);

ALTER TABLE `iis` ADD CONSTRAINT `pk_iis` PRIMARY KEY (
	`iis_id`
);

ALTER TABLE `epis` ADD CONSTRAINT `pk_epis` PRIMARY KEY (
	`ep_lot`
);

ALTER TABLE `equip_master` ADD CONSTRAINT `pk_equip_master` PRIMARY KEY (
	`equip_code`
);

ALTER TABLE `proc_master` ADD CONSTRAINT `pk_proc_master` PRIMARY KEY (
	`proc_id`
);

ALTER TABLE `prod_insp` ADD CONSTRAINT `pk_prod_insp` PRIMARY KEY (
	`insp_id`
);

ALTER TABLE `proc_insp_ng` ADD CONSTRAINT `pk_proc_insp_ng` PRIMARY KEY (
	`fail_id`
);

ALTER TABLE `prod_insp_ng` ADD CONSTRAINT `pk_prod_insp_ng` PRIMARY KEY (
	`key`
);

ALTER TABLE `mat_master` ADD CONSTRAINT `pk_mat_master` PRIMARY KEY (
	`mat_code`
);

ALTER TABLE `proc_flow_detail` ADD CONSTRAINT `pk_proc_flow_detail` PRIMARY KEY (
	`flow_info_id`
);

ALTER TABLE `def_master` ADD CONSTRAINT `pk_def_master` PRIMARY KEY (
	`def_item_id`
);

ALTER TABLE `proc_insp` ADD CONSTRAINT `pk_proc_insp` PRIMARY KEY (
	`insp_id`
);

ALTER TABLE `plandetail` ADD CONSTRAINT `pk_plandetail` PRIMARY KEY (
	`pld_no`
);

ALTER TABLE `pur_mat` ADD CONSTRAINT `pk_pur_mat` PRIMARY KEY (
	`pur_mat_id`
);

ALTER TABLE `qc_master_ran` ADD CONSTRAINT `pk_qc_master_ran` PRIMARY KEY (
	`insp_item_id`
);

ALTER TABLE `mat_insp` ADD CONSTRAINT `pk_mat_insp` PRIMARY KEY (
	`insp_id`
);

ALTER TABLE `mat_release` ADD CONSTRAINT `pk_mat_release` PRIMARY KEY (
	`release_id`
);

ALTER TABLE `qc_master_sen` ADD CONSTRAINT `pk_qc_master_sen` PRIMARY KEY (
	`ques_id`
);

ALTER TABLE `equip_inspection` ADD CONSTRAINT `pk_equip_inspection` PRIMARY KEY (
	`insp_code`
);

ALTER TABLE `edcts` ADD CONSTRAINT `pk_edcts` PRIMARY KEY (
	`epos_id`
);

ALTER TABLE `equip_downtime` ADD CONSTRAINT `pk_equip_downtime` PRIMARY KEY (
	`downtime_code`
);

ALTER TABLE `comncode_dt` ADD CONSTRAINT `pk_comncode_dt` PRIMARY KEY (
	`comncode_detailid`
);

ALTER TABLE `planform` ADD CONSTRAINT `pk_planform` PRIMARY KEY (
	`pl_no`
);

ALTER TABLE `orderform` ADD CONSTRAINT `pk_orderform` PRIMARY KEY (
	`ord_id`
);

ALTER TABLE `mat_insp_ng` ADD CONSTRAINT `pk_mat_insp_ng` PRIMARY KEY (
	`fail_id`
);

ALTER TABLE `lot_mat` ADD CONSTRAINT `pk_lot_mat` PRIMARY KEY (
	`mat_lot`
);

ALTER TABLE `mat_insp_result` ADD CONSTRAINT `pk_mat_insp_result` PRIMARY KEY (
	`insp_result_id`
);

ALTER TABLE `equip_repair` ADD CONSTRAINT `pk_equip_repair` PRIMARY KEY (
	`repair_code`
);

ALTER TABLE `orderdetail` ADD CONSTRAINT `pk_orderdetail` PRIMARY KEY (
	`ofd_no`
);

ALTER TABLE `emp_master` ADD CONSTRAINT `pk_emp_master` PRIMARY KEY (
	`emp_id`
);

ALTER TABLE `proc_insp_result` ADD CONSTRAINT `pk_proc_insp_result` PRIMARY KEY (
	`key`
);

ALTER TABLE `bom_master` ADD CONSTRAINT `pk_bom_master` PRIMARY KEY (
	`bom_code`
);

ALTER TABLE `makeform` ADD CONSTRAINT `pk_makeform` PRIMARY KEY (
	`mk_ord_no`
);

ALTER TABLE `comncode` ADD CONSTRAINT `pk_comncode` PRIMARY KEY (
	`comncode_id`
);

ALTER TABLE `ins_item` ADD CONSTRAINT `fk_equip_inspection_to_ins_item_1` FOREIGN KEY (
	`insp_code`
)
REFERENCES `equip_inspection` (
	`insp_code`
);

ALTER TABLE `mat_receipt` ADD CONSTRAINT `fk_iis_to_mat_receipt_1` FOREIGN KEY (
	`iis_id`
)
REFERENCES `iis` (
	`iis_id`
);

ALTER TABLE `qc_master_ran` ADD CONSTRAINT `fk_qc_master_to_qc_master_ran_1` FOREIGN KEY (
	`insp_item_id`
)
REFERENCES `qc_master` (
	`insp_item_id`
);


