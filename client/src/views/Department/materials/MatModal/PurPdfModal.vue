<!-- src/views/Department/materials/MatModal/PurPdfModal.vue -->
<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue'

type HeaderInfo = {
  pur_code: string
  pur_name: string
  bcnc_name: string
  emp_name: string
  pur_date: string
  receipt_date: string
  remark: string
}
type LineItem = {
  mat_name: string
  mat_spec: string
  mat_unit: string
  pur_qty: number | string
  pur_remark: string
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    headerInfo?: HeaderInfo
    items?: LineItem[]
  }>(),
  {
    visible: false,
    headerInfo: () => ({
      pur_code: '',
      pur_name: '',
      bcnc_name: '',
      emp_name: '',
      pur_date: '',
      receipt_date: '',
      remark: '',
    }),
    items: () => [],
  },
)

const emit = defineEmits(['close'])
const closeModal = () => emit('close')

const today = new Date()
const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
  today.getDate(),
).padStart(2, '0')}`

const API_ENDPOINT = '/api/download-order-pdf'

const pdfStyles = `
.purchase-order-container{width:210mm;margin:0 auto;padding:0 10mm 10mm;
  font-family:'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',sans-serif;
  color:#111;font-size:12px;line-height:1.6;}
.header{text-align:center;margin-bottom:18px;}
.title{margin:10px 0 6px;font-weight:800;font-size:28px;letter-spacing:.25em;border:0;padding:0;}
.title-underline{display:block;width:70px;height:2px;background:#232323;margin:6px auto 0;}
/* ----- 상단 정보 ----- */
.info-table{width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:12px;}
.info-table th,.info-table td{border:1px solid #2b2b2b;height:34px;padding:7px 10px;font-size:12px;vertical-align:middle;}
.info-table th{width:15%;background:#f6f7fb;font-weight:700;text-align:center;white-space:nowrap;}
.info-table td{width:18.33%;text-align:left;} /* 기본 왼쪽정렬 */
.tc{text-align:center;} /* 날짜 전용 중앙정렬 */
/* ----- 품목 표 ----- */
.item-table{width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:18px;}
.item-table th,.item-table td{border:1px solid #2b2b2b;height:28px;padding:6px 8px;font-size:12px;vertical-align:middle;}
.item-table th{background:#f6f7fb;font-weight:700;text-align:center;}
.item-table td{text-align:left;} /* 기본 왼쪽정렬 */
.col-no{width:6%;text-align:center;}
.col-name{width:28%;}   /* 자재명 축소 */
.col-spec{width:12%;}
.col-unit{width:10%;}
.col-qty{width:12%;text-align:left;} /* 수량 왼쪽정렬 */
.col-remark{width:32%;} /* 비고 확장 */
/* ----- 하단 ----- */
.footer-sign{text-align:center;margin-top:18px;}
.date-input{margin:8px 0 6px;}
.company-name{font-weight:800;margin-bottom:12px;}
.system-text{color:#666;}
`

const exportPDF = async () => {
  const el = document.getElementById('purchase-order-pdf')
  if (!el) return
  const fileId = (props.headerInfo?.pur_code || 'TEMP').trim() || 'TEMP'
  const filename = `발주서_${fileId}_${dateString}.pdf`
  const html = `<style>${pdfStyles}</style>${el.innerHTML}`

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, filename }),
  })
  if (!res.ok) throw new Error(await res.text())

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
</script>

<template>
  <div v-if="visible">
    <Modal
      title="발주서 미리보기"
      :fullScreenBackdrop="true"
      header-align="right"
      title-align="left"
      @close="closeModal"
    >
      <template #modal-header>
        <div class="flex justify-end">
          <button
            style="width: 10rem"
            type="button"
            class="btn-color btn-common btn-common-pdf"
            @click="exportPDF"
          >
            PDF다운로드
          </button>
        </div>
      </template>

      <template #modal-body>
        <div class="modal-container flex gap-2 mb-2">
          <div id="purchase-order-pdf" class="purchase-order-container">
            <div class="header">
              <h1 class="title">발 주 서</h1>
              <span class="title-underline"></span>
            </div>

            <!-- 상단 정보 -->
            <table class="info-table">
              <tbody>
                <tr>
                  <th>발주코드</th>
                  <td>{{ headerInfo.pur_code }}</td>
                  <th>발주서명</th>
                  <td>{{ headerInfo.pur_name }}</td>
                </tr>
                <tr>
                  <th>매입처</th>
                  <td>{{ headerInfo.bcnc_name }}</td>
                  <th>담당자</th>
                  <td>{{ headerInfo.emp_name }}</td>
                </tr>
                <tr>
                  <th>발주일자</th>
                  <td class="tc">{{ headerInfo.pur_date }}</td>
                  <th>입고요청일자</th>
                  <td class="tc">{{ headerInfo.receipt_date }}</td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td colspan="3">{{ headerInfo.remark }}</td>
                </tr>
              </tbody>
            </table>

            <p class="guide-text">아래와 같이 발주합니다.</p>

            <!-- 품목 테이블 -->
            <table class="item-table">
              <thead>
                <tr>
                  <th class="col-no">NO</th>
                  <th class="col-name">자재명</th>
                  <th class="col-spec">규격</th>
                  <th class="col-unit">단위</th>
                  <th class="col-qty">발주 수량</th>
                  <th class="col-remark">비고</th>
                  <!-- 컬럼명 변경 -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in items" :key="i">
                  <td class="col-no">{{ i + 1 }}</td>
                  <td class="col-name">{{ r.mat_name }}</td>
                  <td class="col-spec">{{ r.mat_spec }}</td>
                  <td class="col-unit">{{ r.mat_unit }}</td>
                  <td class="col-qty">{{ r.pur_qty }}</td>
                  <td class="col-remark">{{ r.pur_remark }}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer-sign">
              <div class="date-input">{{ dateString }}</div>
              <p class="company-name">**Dalgubeol Makgeolli**</p>
            </div>
            <p class="system-text">※ 본 문서는 시스템에서 자동 생성된 발주서입니다.</p>
          </div>
        </div>

        <div class="flex justify-center mt-3">
          <button class="btn-common btn-color" @click="closeModal">닫기</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style>
.modal-container {
  padding: 0;
  width: 100%;
  max-width: none;
}
/* 미리보기용 CSS (PDF와 동일) */
.purchase-order-container {
  width: 210mm;
  margin: 0 auto;
  padding: 0 10mm 10mm;
  font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  color: #111;
  font-size: 12px;
  line-height: 1.6;
}
.header {
  text-align: center;
  margin-bottom: 18px;
}
.title {
  margin: 10px 0 6px;
  font-weight: 800;
  font-size: 28px;
  letter-spacing: 0.25em;
  border: 0;
  padding: 0;
}
.title-underline {
  display: block;
  width: 70px;
  height: 2px;
  background: #232323;
  margin: 6px auto 0;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-bottom: 12px;
}
.info-table th,
.info-table td {
  border: 1px solid #2b2b2b;
  height: 34px;
  padding: 7px 10px;
  font-size: 12px;
  vertical-align: middle;
}
.info-table th {
  width: 15%;
  background: #f6f7fb;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}
.info-table td {
  width: 18.33%;
  text-align: left;
}
.tc {
  text-align: center;
}
.item-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-bottom: 18px;
}
.item-table th,
.item-table td {
  border: 1px solid #2b2b2b;
  height: 28px;
  padding: 6px 8px;
  font-size: 12px;
  vertical-align: middle;
}
.item-table th {
  background: #f6f7fb;
  font-weight: 700;
  text-align: center;
}
.item-table td {
  text-align: left;
}
.col-no {
  width: 6%;
  text-align: center;
}
.col-name {
  width: 28%;
}
.col-spec {
  width: 12%;
}
.col-unit {
  width: 10%;
}
.col-qty {
  width: 12%;
  text-align: left;
}
.col-remark {
  width: 32%;
}
.footer-sign {
  text-align: center;
  margin-top: 18px;
}
.date-input {
  margin: 8px 0 6px;
}
.company-name {
  font-weight: 800;
  margin-bottom: 12px;
}
.system-text {
  color: #666;
}
</style>
