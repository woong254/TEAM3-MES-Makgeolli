<!-- 자재입고검사 pdf 모달창 -->
<script setup lang="ts">
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import { defineProps, defineEmits, computed } from 'vue'

// ===== props & emits =====
const props = defineProps<{
  visible: boolean
  // 상단 헤더/기본정보
  header: {
    insp_name: string
    inspector: string
    insp_datetime: string
    iis_id: string
    pur_code: string
    pur_name: string
    pur_date: string
    bcnc_name: string
    mat_code: string
    mat_name: string
    mat_spec: string
    mat_unit: string
    pur_qty: number
    receipt_qty: number
    insp_qty: number
    fail_qty: number
    pass_qty: number
    remark: string
    final_result: string // '합격' | '불합격' | ''
  }
  // 범위검사 테이블
  rangeRows: Array<{
    insp_item_id: string
    insp_item_name: string
    min_range: string
    min_label: string
    max_range: string
    max_label: string
    unit: string
    insp_method: string | null
    file_name: string | null
    insp_result_value: number
    r_value: string // 'P' | 'F' | ''
  }>
  // 관능검사 테이블
  sensoryRows: Array<{
    insp_item_id: string
    insp_item_name: string
    pass_score: number
    pass_score_spec: string
    score_desc: Array<{ score: number; desc: string }>
    max_score: number
    insp_result_value: number
    r_value: string // 'P' | 'F' | ''
    details: Array<{ id: string; order: number; question_name: string; score?: number }>
  }>
  // 불량 합계(라벨: 수량)
  ngSummary: Array<{ name: string; qty: number }>
}>()

const emit = defineEmits(['close'])

const today = new Date()
const y = today.getFullYear()
const m = String(today.getMonth() + 1).padStart(2, '0')
const d = String(today.getDate()).padStart(2, '0')
const dateString = `${y}-${m}-${d}`

// MatInspPdfModal.vue
const API_ENDPOINT = '/download-order-pdf'

// 합격/불합격 라벨
const resultLabel = (v: string) => (v === 'P' ? '적합' : v === 'F' ? '부적합' : '')

// 안전 포맷
const fmtNum = (v: any) =>
  Number.isFinite(Number(v))
    ? new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(Number(v))
    : ''

// ===== PDF 스타일(인라인로 주입) =====
const pdfStyles = `
@page { size: A4; margin: 12mm; }
* { box-sizing: border-box; }
body { font-family: 'Malgun Gothic','Dotum',sans-serif; color:#000; }
h1, h2, h3 { margin: 0; }
.small { font-size: 10px; color:#666; }
.wrap { width: 100%; }
.header-title { text-align:center; margin-bottom:10px; }
.header-title h1 { font-size: 20pt; padding-bottom:6px; border-bottom:2px solid #000; display:inline-block; }
.info-grid { width:100%; border-collapse:collapse; margin: 8px 0 10px 0; table-layout: fixed; }
.info-grid th, .info-grid td { border:0.5px solid #000; padding:6px 8px; font-size:10pt; vertical-align:middle; }
.info-grid th { background:#f4f4f4; width:18%; white-space:nowrap; text-align:center; }
.info-grid td { width:32%; }
.block { margin-top: 14px; }
.block h3 { font-size: 12pt; margin-bottom: 6px; }
.tbl { width:100%; border-collapse:collapse; table-layout: fixed; }
.tbl th, .tbl td { border:0.5px solid #000; padding:6px 6px; font-size:10pt; }
.tbl th { background:#f6f6f6; text-align:center; white-space:nowrap; }
.right { text-align:right; }
.center { text-align:center; }
.left { text-align:left; }
.badge { display:inline-block; padding:2px 8px; border-radius:10px; font-weight:bold; border:1px solid #333; }
.badge.pass { color:#0a7; border-color:#0a7; }
.badge.fail { color:#d22; border-color:#d22; }
.footer { margin-top: 14px; text-align:center; }
.small-note { margin-top: 8px; font-size: 9pt; color:#666; }
`
// ===== HTML 템플릿 =====
const htmlContent = computed(() => {
  const H = props.header

  const rangeRowsHtml = props.rangeRows.length
    ? props.rangeRows
        .map(
          (r, idx) => `
  <tr>
    <td class="center">${idx + 1}</td>
    <td class="left">${r.insp_item_name || ''}</td>
    <td class="center">${r.min_range ? `${r.min_range} ${r.min_label || ''}` : '-'}</td>
    <td class="center">${r.max_range ? `${r.max_range} ${r.max_label || ''}` : '-'}</td>
    <td class="center">${r.unit || ''}</td>
    <td class="right">${fmtNum(r.insp_result_value)}</td>
    <td class="center">${resultLabel(r.r_value)}</td>
  </tr>`,
        )
        .join('')
    : `<tr><td colspan="7" class="center">범위 검사 항목이 없습니다.</td></tr>`

  const sensoryRowsHtml = props.sensoryRows.length
    ? props.sensoryRows
        .map((s, idx) => {
          const qs = (s.details || [])
            .map(
              (q) => `
            <tr>
              <td class="center" style="width:60px">${q.order}</td>
              <td class="left">${q.question_name || ''}</td>
              <td class="center" style="width:100px">${q.score ?? ''}</td>
            </tr>`,
            )
            .join('')

          const desc = (s.score_desc || [])
            .map((d) => `<div>- ${d.score}점: ${d.desc}</div>`)
            .join('')

          return `
          <tr>
            <td class="center" rowspan="2">${idx + 1}</td>
            <td class="left">${s.insp_item_name || ''}</td>
            <td class="center">${s.pass_score} ${s.pass_score_spec?.toLowerCase() === 'r2' ? '초과' : '이상'}</td>
            <td class="right">${fmtNum(s.insp_result_value)}</td>
            <td class="center">${resultLabel(s.r_value)}</td>
          </tr>
          <tr>
            <td colspan="4">
              <div class="left small"><b>채점기준</b>${desc ? `<div>${desc}</div>` : ' - '}</div>
              <table class="tbl" style="margin-top:6px">
                <thead>
                  <tr><th style="width:60px">번호</th><th>질문</th><th style="width:100px">점수</th></tr>
                </thead>
                <tbody>
                  ${qs || `<tr><td colspan="3" class="center">질문 항목이 없습니다.</td></tr>`}
                </tbody>
              </table>
            </td>
          </tr>`
        })
        .join('')
    : `<tr><td colspan="5" class="center">관능 검사 항목이 없습니다.</td></tr>`

  const ngHtml = props.ngSummary.length
    ? props.ngSummary
        .map(
          (n) => `
        <tr>
          <td class="left">${n.name}</td>
          <td class="right">${fmtNum(n.qty)}</td>
          <td class="center">${H.mat_unit || ''}</td>
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="3" class="center">불량 항목이 없습니다.</td></tr>`

  const finalBadge =
    H.final_result === '합격'
      ? `<span class="badge pass">합격</span>`
      : H.final_result === '불합격'
        ? `<span class="badge fail">불합격</span>`
        : `<span class="badge">-</span>`

  return `
  <div class="wrap">
    <div class="header-title">
      <h1>자재 입고 검사서</h1>
      <div class="small">Generated: ${dateString}</div>
    </div>

    <table class="info-grid">
      <tr>
        <th>검사명</th><td>${H.insp_name || ''}</td>
        <th>검사자</th><td>${H.inspector || ''}</td>
      </tr>
      <tr>
        <th>검사일시</th><td>${H.insp_datetime || ''}</td>
        <th>최종결과</th><td>${finalBadge}</td>
      </tr>
      <tr>
        <th>가입고번호</th><td>${H.iis_id || ''}</td>
        <th>발주번호</th><td>${H.pur_code || ''}</td>
      </tr>
      <tr>
        <th>발주명</th><td>${H.pur_name || ''}</td>
        <th>발주일자</th><td>${H.pur_date || ''}</td>
      </tr>
      <tr>
        <th>거래처</th><td>${H.bcnc_name || ''}</td>
        <th>자재코드</th><td>${H.mat_code || ''}</td>
      </tr>
      <tr>
        <th>자재명</th><td>${H.mat_name || ''}</td>
        <th>규격</th><td>${H.mat_spec || ''}</td>
      </tr>
      <tr>
        <th>단위</th><td>${H.mat_unit || ''}</td>
        <th>비고</th><td>${H.remark || ''}</td>
      </tr>
      <tr>
        <th>발주수량</th><td class="right">${fmtNum(H.pur_qty)}</td>
        <th>입고량</th><td class="right">${fmtNum(H.receipt_qty)}</td>
      </tr>
      <tr>
        <th>검사량</th><td class="right">${fmtNum(H.insp_qty)}</td>
        <th>불량량/합격량</th><td class="right">${fmtNum(H.fail_qty)} / ${fmtNum(H.pass_qty)}</td>
      </tr>
    </table>

    <div class="block">
      <h3>불량 요약</h3>
      <table class="tbl">
        <thead>
          <tr><th>불량유형</th><th>수량</th><th>단위</th></tr>
        </thead>
        <tbody>${ngHtml}</tbody>
      </table>
    </div>

    <div class="block">
      <h3>범위 검사</h3>
      <table class="tbl">
        <thead>
          <tr>
            <th style="width:50px">No</th>
            <th>항목</th>
            <th style="width:140px">하한</th>
            <th style="width:140px">상한</th>
            <th style="width:80px">단위</th>
            <th style="width:120px">측정값</th>
            <th style="width:90px">판정</th>
          </tr>
        </thead>
        <tbody>${rangeRowsHtml}</tbody>
      </table>
    </div>

    <div class="block">
      <h3>관능 검사</h3>
      <table class="tbl">
        <thead>
          <tr>
            <th style="width:50px">No</th>
            <th>항목</th>
            <th style="width:150px">합격기준(평균)</th>
            <th style="width:120px">현재점수</th>
            <th style="width:90px">판정</th>
          </tr>
        </thead>
        <tbody>${sensoryRowsHtml}</tbody>
      </table>
    </div>

    <div class="footer">
      <div class="small-note">※ 본 문서는 시스템에서 자동 생성된 검사서입니다.</div>
    </div>
  </div>
  `
})

// ===== 행동 =====
const close = () => emit('close')

const exportPDF = async () => {
  const filenameSafe = (s: string) => (s || '검사서').replace(/[\\/:*?"<>|]/g, '_')
  const fname = `자재입고검사_${filenameSafe(props.header.insp_name)}_${dateString}.pdf`
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: `<style>${pdfStyles}</style>${htmlContent.value}`,
        filename: fname,
      }),
    })
    if (!response.ok) {
      const t = await response.text()
      throw new Error(`PDF 생성 실패: ${response.status} - ${t}`)
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fname
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (e) {
    console.error(e)
    alert('PDF 생성 중 오류가 발생했습니다.')
  }
}
</script>

<template>
  <div v-if="visible">
    <Modal
      title="자재 입고 검사서 미리보기"
      :fullScreenBackdrop="true"
      @close="close"
      header-align="right"
      title-align="left"
    >
      <template #modal-header>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-common btn-color" @click="exportPDF">
            PDF 다운로드
          </button>
          <button type="button" class="btn-common btn-white" @click="close">닫기</button>
        </div>
      </template>

      <template #modal-body>
        <!-- 미리보기 -->
        <div
          style="
            background: #fff;
            padding: 16px;
            border: 1px solid #eee;
            max-height: 70vh;
            overflow: auto;
          "
        >
          <!-- 실제 인쇄/서버 전송용 HTML을 그대로 미리보기 -->
          <div v-html="`<style>${pdfStyles}</style>${htmlContent}`"></div>
        </div>
      </template>
    </Modal>
  </div>
</template>
