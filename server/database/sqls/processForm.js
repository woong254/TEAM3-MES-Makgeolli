// table : processForm
const insertedResult = `
SELECT  pf.procs_no,
        pf.mk_qty,
		    pf.fail_qty,	
        pf.pass_qty, 	
        DATE_FORMAT(pf.procs_bgntm, '%Y-%m-%d') AS procs_bgntm,	
        pf.inpt_qty,	
        sum(pf.inpt_qty) AS prev_input_qty,	
        (md.mk_num - sum(pf.inpt_qty)) AS remain_qty
FROM	  processform pf
		    JOIN makedetail md
        ON pf.mk_list = md.mkd_no
WHERE	  procs_no = ?
GROUP BY  pf.mk_list,
          md.mk_num,
          pf.inpt_qty,
          pf.mk_qty,
          pf.fail_qty,
          pf.pass_qty,
          pf.procs_bgntm`;

const selectProcessControlData = `
SELECT  
    pf.procs_no,
    pm.prod_name,
    pf.now_procs,
    em.equip_name,
    empm.emp_name,
    DATE_FORMAT(mf.writing_date, '%Y-%m-%d') AS writing_date,

    -- ✅ 지시량: 이전 공정의 합격량, 없으면 makedetail의 mk_num
    COALESCE(
        (
            SELECT SUM(pf_prev.pass_qty)
            FROM processform pf_prev
            WHERE pf_prev.mk_list = pf.mk_list
              AND pf_prev.seq_no = (pf.seq_no - 1)
        ),
        md.mk_num
    ) AS mk_num,

    pf.inpt_qty,         -- 현투입량
    pf.mk_qty,           -- 생산량
    pf.fail_qty,         -- 불량량
    pf.pass_qty,         -- 합격량

    -- 기투입량: 이전에 투입된 누적 투입량
    (
        SELECT COALESCE(SUM(pf_sub.inpt_qty), 0)
        FROM processform pf_sub
        WHERE pf_sub.mk_list = pf.mk_list
          AND pf_sub.procs_no < pf.procs_no
          AND pf_sub.now_procs = pf.now_procs
    ) AS prev_input_qty,

    -- 미투입량: 지시량 - (기투입 + 현투입)
    (
        COALESCE(
            (
                SELECT SUM(pf_prev.pass_qty)
            FROM processform pf_prev
            WHERE pf_prev.mk_list = pf.mk_list
              AND pf_prev.seq_no = (pf.seq_no - 1)
            ),
            md.mk_num
        )
        -
        (
            (
                SELECT COALESCE(SUM(pf_sub.inpt_qty), 0)
                FROM processform pf_sub
                WHERE pf_sub.mk_list = pf.mk_list
                  AND pf_sub.procs_no <= pf.procs_no
                  AND pf_sub.now_procs = pf.now_procs
            )
        )
    ) AS remain_qty,
    DATE_FORMAT(pf.procs_bgntm, '%Y-%m-%d %H-%M-%S') AS procs_bgntm, -- 생산시작일
    DATE_FORMAT(pf.procs_endtm, '%Y-%m-%d %H-%M-%S') AS procs_endtm  -- 생산종료일

FROM processform pf
    JOIN prod_master pm 
        ON pf.prod_code = pm.prod_code
    JOIN makedetail md
        ON pf.mk_list = md.mkd_no
    JOIN makeform mf 
        ON md.mk_ord_no = mf.mk_ord_no
    JOIN equip_master em 
        ON pf.equip_code = em.equip_code
    JOIN emp_master empm
        ON pf.emp_no = empm.emp_id
WHERE empm.emp_id = ?
  AND em.equip_code = ?
  AND md.mkd_no = ?
  AND pf.now_procs = ?
  AND pf.procs_st <> 't3'
ORDER BY pf.procs_no
`;
module.exports = { insertedResult, selectProcessControlData };
