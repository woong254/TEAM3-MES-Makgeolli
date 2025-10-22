<script setup lang="ts">
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import { defineProps, defineEmits, ref, computed } from 'vue'

type HeaderInfo = {
  pur_code: string
  pur_name: string
  bcnc_name: string
  emp_name: string
  pur_date: string
  receipt_date: string
  remark: string
}
type Doc = {
  headerInfo: HeaderInfo
  items: Array<{
    mat_name: string
    mat_spec: string
    mat_unit: string
    pur_qty: number | string
    pur_remark: string
  }>
}

const props = defineProps<{
  visible: boolean
  docs: Doc[]
}>()

const emit = defineEmits(['close'])
const closeModal = () => emit('close')

// 페이지네이션
const page = ref(0)
const total = computed(() => props.docs?.length || 0)
const hasPrev = computed(() => page.value > 0)
const hasNext = computed(() => page.value < total.value - 1)
const goPrev = () => {
  if (hasPrev.value) page.value--
}
const goNext = () => {
  if (hasNext.value) page.value++
}

// 현재 문서
const cur = computed(
  () => props.docs?.[page.value] || ({ headerInfo: {} as HeaderInfo, items: [] } as Doc),
)

// 날짜
const today = new Date()
const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
  today.getDate(),
).padStart(2, '0')}`

// 서버 엔드포인트
const API_ENDPOINT = '/api/download-order-pdf'

/** PDF 전용 스타일 (발주수량: th 중앙, td 오른쪽으로 수정) */
const pdfStyles = `
.purchase-order-container{ width:210mm; margin:0 auto; padding:0; font-family:'Malgun Gothic','Dotum',sans-serif; font-size:0.7rem; color:#000; }
.header{ text-align:center; margin-bottom:18px; }
.title{ font-size:22pt; font-weight:700; margin:0; padding-bottom:8px; border-bottom:2px solid #000; display:inline-block; letter-spacing:6px; }
.info-table{ width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:12px; }
.info-table th,.info-table td{ border:0.5px solid #000; padding:4px 10px; height:25px; vertical-align:middle; }
.info-table th{ background:#f2f2f2; text-align:center; font-weight:700; }
.info-table td{ text-align:left; }
.info-table .center{ text-align:center; }
.guide-text{ margin:6px 0 8px; }
.item-table{ width:100%; border-collapse:collapse; table-layout:fixed; }
.item-table th,.item-table td{ border:0.5px solid #000; padding:4px 10px; height:25px; vertical-align:middle; }
.item-table th{ background:#f2f2f2; text-align:center; font-weight:700; }
.item-table td{ text-align:left; }

/* 열 폭 */
.item-table .col-no{ width:8%; text-align:center; }
.item-table .col-name{ width:22%; }
.item-table .col-spec{ width:12%; }
.item-table .col-unit{ width:10%; text-align:center; }
.item-table .col-qty{ width:16%; }
/* 정렬 분리: 헤더/데이터 */
.item-table th.col-qty{ text-align:center; }
.item-table td.col-qty{ text-align:right; }

.item-table .col-remark{ width:32%; }

.footer-sign{ text-align:center; margin-top:22px; }
.date-input{ margin:10px 0; font-size:0.7rem; }
.company-name{ font-size:0.7rem; font-weight:700; margin-top:10px; }
.system-text{ font-size:0.7rem; text-align:center; margin-top:16px; color:#666; }
`

/** 현재 페이지 PDF 다운로드 */
const exportPDF = async () => {
  const element = document.getElementById('purchase-order-pdf')
  if (!element) return
  const rawHtmlContent = element.innerHTML
  const filename = `발주서_${cur.value.headerInfo?.pur_code || 'TEMP'}_${dateString}.pdf`
  const styledPdfContent = `<style>${pdfStyles}</style>${rawHtmlContent}`
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: styledPdfContent, filename }),
    })
    if (!response.ok) throw new Error(await response.text())
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err) {
    console.error('PDF 다운로드 오류:', err)
    alert('PDF 생성 중 오류가 발생했습니다.')
  }
}
</script>

<template>
  <div v-if="visible">
    <Modal
      title="발주서 미리보기"
      :fullScreenBackdrop="true"
      @close="closeModal"
      header-align="right"
      title-align="left"
    >
      <!-- 헤더: 다운로드만 우측 -->
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
            <div class="header"><h1 class="title">발 주 서</h1></div>

            <!-- 상단 정보 -->
            <table class="info-table">
              <tbody>
                <tr>
                  <th>발주코드</th>
                  <td class="center">{{ cur.headerInfo.pur_code }}</td>
                  <th>발주서명</th>
                  <td class="left">{{ cur.headerInfo.pur_name }}</td>
                </tr>
                <tr>
                  <th>매입처</th>
                  <td class="left">{{ cur.headerInfo.bcnc_name }}</td>
                  <th>담당자</th>
                  <td class="left">{{ cur.headerInfo.emp_name }}</td>
                </tr>
                <tr>
                  <th>발주일자</th>
                  <td class="center">{{ cur.headerInfo.pur_date }}</td>
                  <th>입고요청일자</th>
                  <td class="center">{{ cur.headerInfo.receipt_date }}</td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td colspan="3">{{ cur.headerInfo.remark }}</td>
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
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in cur.items" :key="idx">
                  <td class="col-no">{{ idx + 1 }}</td>
                  <td class="col-name">{{ it.mat_name }}</td>
                  <td class="col-spec">{{ it.mat_spec }}</td>
                  <td class="col-unit; left">{{ it.mat_unit }}</td>
                  <td class="col-qty">
                    {{
                      it.pur_qty === '' || it.pur_qty == null
                        ? ''
                        : Number(it.pur_qty).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                    }}
                  </td>
                  <td class="col-remark">{{ it.pur_remark }}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer-sign">
              <div class="date-input">{{ dateString }}</div>
              <p class="company-name">**Dalgubeol Makgeolli**</p>
            </div>

            <p class="system-text">※ 본 문서는 시스템에서 자동 생성된 발주입니다.</p>
          </div>
        </div>

        <!-- 하단 중앙: 페이지네이션 -->
        <div class="flex justify-center mt-3 gap-3">
          <button class="btn-common" :disabled="!hasPrev" @click="goPrev">◀ 이전</button>
          <span class="text-sm text-gray-700 self-center">{{ page + 1 }} / {{ total }}</span>
          <button class="btn-common" :disabled="!hasNext" @click="goNext">다음 ▶</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.modal-container {
  padding: 0 !important;
  width: 100%;
  max-width: none;
}
.purchase-order-container {
  width: 210mm;
  margin: 0 auto;
  padding: 0;
  font-family: 'Malgun Gothic', 'Dotum', sans-serif;
  font-size: 0.7rem;
  color: #000;
}
.header {
  text-align: center;
  margin-bottom: 18px;
}
.title {
  font-size: 22pt;
  font-weight: 700;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #000;
  display: inline-block;
  letter-spacing: 6px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-bottom: 12px;
}
.info-table th,
.info-table td {
  border: 0.5px solid #000;
  padding: 4px 10px;
  height: 25px;
  vertical-align: middle;
}
.info-table th {
  background: #f2f2f2;
  text-align: center;
  font-weight: 700;
}
.info-table td {
  text-align: left;
}
.info-table .center {
  text-align: center;
}

.item-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.item-table th,
.item-table td {
  border: 0.5px solid #000;
  padding: 4px 10px;
  height: 25px;
  vertical-align: middle;
}
.item-table th {
  background: #f2f2f2;
  text-align: center;
  font-weight: 700;
}
.item-table td {
  text-align: left;
}

/* 열 폭 */
.item-table .col-no {
  width: 8%;
  text-align: center;
}
.item-table .col-name {
  width: 22%;
}
.item-table .col-spec {
  width: 12%;
}
.item-table .col-unit {
  width: 10%;
  text-align: center;
}
.item-table .col-qty {
  width: 16%;
} /* 폭 유지 */
/* 정렬 분리: 헤더/데이터 */
.item-table th.col-qty {
  text-align: center;
} /* 헤더 중앙 */
.item-table td.col-qty {
  text-align: right;
} /* 데이터 오른쪽 */
.item-table .col-remark {
  width: 32%;
}

.footer-sign {
  text-align: center;
  margin-top: 22px;
}
.date-input {
  margin: 10px 0;
  font-size: 0.7rem;
}
.company-name {
  font-size: 0.7rem;
  font-weight: 700;
  margin-top: 10px;
}
.system-text {
  font-size: 0.7rem;
  text-align: center;
  margin-top: 16px;
  color: #666;
}
</style>
