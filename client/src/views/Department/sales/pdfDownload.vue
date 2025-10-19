<script setup lang="ts">
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import { defineProps, defineEmits } from 'vue'

// 1. 부모로부터 'visible' prop을 받습니다.
const props = defineProps<{
  visible: boolean
  orderInfo: {
    ord_id: string
    ord_name: string
    bcnc_name: string
    pic: string
    ord_date: string
    due_date: string
    remark: string
  }
  products: Array<{
    prod_name: string
    prod_spec: string
    prod_unit: string
    op_qty: number
    remark: string
  }>
}>()

// 2. 부모에게 알릴 'close' 이벤트를 정의합니다.
const emit = defineEmits(['close'])

// 모달 내부에서 닫기 동작 시 호출될 함수
const closeModal = () => {
  emit('close') // 'close' 이벤트를 부모에게 발생시켜 닫아달라고 요청합니다.
}

// pdf출력할때 오늘 날짜 출력
const today = new Date()
const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

// ----------------------------------------------------
// 🌟 수정된 PDF 생성 로직: 백엔드 API (POST) 호출 🌟
// ----------------------------------------------------

// ⚠️ 백엔드에서 설정한 PDF 생성 API 엔드포인트를 여기에 정의합니다.
const API_ENDPOINT = '/api/download-order-pdf'

const pdfStyles = `/* ================================================= */
/* ⚠️ PDF 출력을 위한 필수 스타일 (인라인 삽입용) */
/* ================================================= */

.purchase-order-container {
  width: 210mm; /* A4 용지 너비 */
  margin: 0 auto;
  padding: 0mm; /* 여백 추가 */
  font-family: 'Malgun Gothic', 'Dotum', sans-serif;
  font-size: 0.7rem;
  color: #000;
}

/* 1. 기본 정보 테이블 스타일 */
.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  table-layout: auto;
}
.info-table th,
.info-table td {
  border: 0.5px solid #000;
  padding: 4px 10px;
  text-align: center;
  font-size: 0.7rem;
  vertical-align: middle;
  height: 25px;
}
.info-table th {
  background-color: #f2f2f2;
  width: 15%; 
  font-weight: bold;
  white-space: nowrap;
}
.info-table td {
  width: 35%;
  text-align: left;
  height: 15px;
}

.guide-text {
  margin-bottom: 5px;
}

/* 2. 품목 목록 테이블 스타일 */
.item-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  table-layout: fixed;
}
.item-table th,
.item-table td {
  border: 0.5px solid #000;
  padding: 8px 5px;
  text-align: center;
  height: 15px;
}
.item-table th {
  background-color: #e0e0e0;
  font-weight: bold;
  white-space: nowrap;
}
.item-table .align-left {
  text-align: left;
  padding-left: 10px;
}

/* 비고 영역 */
.memo-area {
  min-height: 50px;
  border-bottom: 1px solid #000;
  padding-bottom: 10px;
  margin-bottom: 50px;
  font-weight: bold;
}

/* 3. 하단 서명 스타일 */
.footer-sign {
  text-align: center;
  margin-top: 50px;
}

.date-input {
  margin: 20px 0;
  font-size: 0.7rem;
}

.company-name {
  font-size: 0.7rem;
  font-weight: bold;
  margin-top: 20px;
}

.system-text {
  font-size: 0.7rem;
  text-align: center;
  margin-top: 30px;
  color: #666;
}
`

const exportPDF = async () => {
  const element = document.getElementById('purchase-order-pdf')
  if (!element) {
    console.error('Element not found')
    return
  }
  // 1. PDF로 만들 HTML 내용 전체를 가져옵니다.
  const rawHtmlContent = element.innerHTML
  const filename = `주문서_${props.orderInfo.ord_id || 'TEMP'}_${dateString}.pdf` // <style> 태그로 CSS 문자열을 감싸서 HTML 내용의 시작 부분에 붙입니다.
  // 🌟🌟🌟 2. HTML에 CSS 스타일을 직접 주입합니다. (핵심 수정)
  const styledPdfContent = `<style>${pdfStyles}</style>${rawHtmlContent}`
  try {
    console.log(`[프론트엔드] PDF 생성 API 호출 시작: ${API_ENDPOINT}`)

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: styledPdfContent,
        filename: filename,
        // 백엔드에서 필요하다면 CSS도 함께 전송할 수 있습니다.
        // css: document.querySelector('style')?.innerHTML // 필요시 추가
      }),
    })
    if (!response.ok) {
      // 백엔드에서 에러 메시지를 JSON으로 보낼 경우 처리
      const errorText = await response.text()
      throw new Error(`PDF 생성 실패: ${response.status} - ${errorText}`)
    }

    // 2. 응답으로 받은 PDF 파일을 Blob 형태로 가져옵니다.
    const blob = await response.blob()

    // 3. 다운로드 링크를 생성하고 클릭 이벤트를 발생시켜 다운로드를 유도합니다.
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename // 다운로드될 파일명
    document.body.appendChild(a)
    a.click()

    // 4. 사용이 끝난 임시 URL과 요소를 정리합니다.
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    console.log(`[프론트엔드] PDF 다운로드 성공: ${filename}`)
  } catch (error) {
    console.error('PDF 다운로드 중 오류 발생:', error)
    // 사용자에게 오류를 알리는 UI 로직 추가
  }
}
</script>

<template>
  <div v-if="props.visible">
    <!-- ⚠️ NOTE: 백엔드 API 호출 방식에서는 CDN 스크립트가 필요 없습니다. ⚠️ -->
    <Modal
      title="주문서 미리보기"
      :fullScreenBackdrop="true"
      @close="closeModal"
      header-align="right"
      title-align="left"
    >
      <template #modal-header>
        <div class="flex justify-end">
          <!-- 버튼 클릭 시 API 호출 -->
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
          <!-- 🌟 PDF 변환 대상 템플릿 (백엔드로 전송될 HTML) 🌟 -->
          <div id="purchase-order-pdf" class="purchase-order-container">
            <div class="header" style="text-align: center; margin-bottom: 30px">
              <h1
                class="title"
                style="
                  font-size: 20pt;
                  font-weight: bold;
                  margin: 0;
                  padding-bottom: 10px;
                  border-bottom: 2px solid #000;
                  display: inline-block;
                "
              >
                주 문 서
              </h1>
            </div>
            <!-- 🌟 info-table 🌟 -->
            <table
              class="info-table"
              style="
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                table-layout: auto;
              "
            >
              <thead>
                <tr>
                  <th
                    class="label"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    주문서번호
                  </th>
                  <td
                    class="data"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: left;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    {{ props.orderInfo.ord_id }}
                  </td>
                  <th
                    class="label"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    주문서명
                  </th>
                  <td
                    class="data"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: left;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    {{ props.orderInfo.ord_name }}
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th
                    class="label"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    거래처
                  </th>
                  <td
                    class="data"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: left;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    {{ props.orderInfo.bcnc_name }}
                  </td>
                  <th
                    class="label"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    대표자
                  </th>
                  <td
                    class="data"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: left;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    {{ props.orderInfo.pic }}
                  </td>
                </tr>
                <tr>
                  <th
                    class="label"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    주문날짜
                  </th>
                  <td
                    class="data"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    {{ props.orderInfo.ord_date }}
                  </td>
                  <th
                    class="label"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    납기일짜
                  </th>
                  <td
                    class="data"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    {{ props.orderInfo.due_date }}
                  </td>
                </tr>
                <tr>
                  <th
                    class="label"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: center;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                  >
                    비고
                  </th>
                  <td
                    class="data"
                    style="
                      border: 0.5px solid #000;
                      padding: 4px 10px;
                      text-align: left;
                      font-size: 0.7rem;
                      vertical-align: middle;
                      height: 25px;
                    "
                    colspan="3"
                  >
                    {{ props.orderInfo.remark }}
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="guide-text" style="font-size: 0.7rem">아래와 같이 주문합니다.</p>

            <!-- 🌟 item-table 🌟 -->
            <table style="border: solid 1px #000; border-collapse: collapse; width: 100%">
              <thead>
                <tr>
                  <th
                    style="
                      border: 1px solid #000;
                      width: 5%;
                      text-align: center;
                      background-color: #f2f2f2;
                      font-size: 0.7rem;
                    "
                  >
                    NO
                  </th>
                  <th
                    style="
                      border: 1px solid #000;
                      width: 30%;
                      text-align: center;
                      background-color: #f2f2f2;
                      font-size: 0.7rem;
                    "
                  >
                    제품명
                  </th>
                  <th
                    style="
                      border: 1px solid #000;
                      width: 10%;
                      text-align: center;
                      background-color: #f2f2f2;
                      font-size: 0.7rem;
                    "
                  >
                    규격
                  </th>
                  <th
                    style="
                      border: 1px solid #000;
                      width: 10%;
                      text-align: center;
                      background-color: #f2f2f2;
                      font-size: 0.7rem;
                    "
                  >
                    단위
                  </th>
                  <th
                    style="
                      border: 1px solid #000;
                      width: 10%;
                      text-align: center;
                      background-color: #f2f2f2;
                      font-size: 0.7rem;
                    "
                  >
                    요청 수량
                  </th>
                  <th
                    style="
                      border: 1px solid #000;
                      width: 20%;
                      text-align: center;
                      background-color: #f2f2f2;
                      font-size: 0.7rem;
                    "
                  >
                    비고
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in props.products" :key="index">
                  <td
                    style="
                      border: 1px solid #000;
                      text-align: left;
                      padding: 0px 10px;
                      font-size: 0.7rem;
                    "
                  >
                    {{ index + 1 }}
                  </td>
                  <td
                    style="
                      border: 1px solid #000;
                      text-align: left;
                      padding: 0px 10px;
                      font-size: 0.7rem;
                    "
                  >
                    {{ product.prod_name }}
                  </td>
                  <td
                    style="
                      border: 1px solid #000;
                      text-align: left;
                      padding: 0px 10px;
                      font-size: 0.7rem;
                    "
                  >
                    {{ product.prod_spec }}
                  </td>
                  <td
                    style="
                      border: 1px solid #000;
                      text-align: left;
                      padding: 0px 10px;
                      font-size: 0.7rem;
                    "
                  >
                    {{ product.prod_unit }}
                  </td>
                  <td
                    style="
                      border: 1px solid #000;
                      text-align: right;
                      padding: 0px 10px;
                      font-size: 0.7rem;
                    "
                  >
                    {{ product.op_qty }}
                  </td>
                  <td
                    style="
                      border: 1px solid #000;
                      text-align: left;
                      padding: 0px 10px;
                      font-size: 0.7rem;
                    "
                  >
                    {{ product.remark }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="footer-sign">
              <div class="date-input">
                {{ dateString }}
              </div>
              <p class="company-name">**Dalgubeol Makgeolli**</p>
            </div>
            <p class="system-text">※ 본 문서는 시스템에서 자동 생성된 주문서입니다</p>
          </div>
          <!-- /PDF 변환 대상 템플릿 끝 -->
        </div>
        <div class="flex justify-center mt-3 control-buttons">
          <button class="btn-common btn-color" @click="closeModal">취소</button>
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

.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* PDF 출력을 위한 스타일 */
.purchase-order-container {
  width: 210mm; /* A4 용지 너비 */
  margin: 0;
  padding: 0mm; /* 여백 추가 */
  font-family: 'Malgun Gothic', 'Dotum', sans-serif; /* 한글 폰트 지정 */
  font-size: 0.7rem;
  color: #000;
}

/* 제목 스타일 */
.header {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  font-size: 10pt;
  font-weight: bold;
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #000;
  display: inline-block;
}

/* 1. 기본 정보 테이블 스타일 */
.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  table-layout: auto;
}
.info-table th,
.info-table td {
  border: 0.5px solid #000;
  padding: 4px 10px;
  text-align: center;
  font-size: 0.7rem;
  vertical-align: middle;
  height: 25px;
}
.info-table th {
  background-color: #f2f2f2; /* 회색 배경 (이미지와 달리 조금 밝게 설정) */
  width: 15%; /* 레이블 너비 고정 */
  font-weight: bold;
  white-space: nowrap;
}
.info-table td {
  width: 35%; /* 데이터 너비 고정 */
  text-align: left;
  height: 15px;
}

.guide-text {
  margin-bottom: 5px;
}

/* 2. 품목 목록 테이블 스타일 */
/* .item-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  table-layout: fixed;
}
.item-table th,
.item-table td {
  border: 0.5px solid #000;
  padding: 8px 5px;
  text-align: center;
  height: 15px;
}
.item-table th {
  background-color: #e0e0e0;
  font-weight: bold;
  white-space: nowrap;
}
.item-table .align-left {
  text-align: left;
  padding-left: 10px;
} */

/* 비고 영역 */
.memo-area {
  min-height: 50px;
  border-bottom: 1px solid #000;
  padding-bottom: 10px;
  margin-bottom: 50px;
  font-weight: bold;
}

/* 3. 하단 서명 스타일 */
.footer-sign {
  text-align: center;
  margin-top: 50px;
}

.sign-text {
  margin-bottom: 10px;
}

.checkbox {
  border: 0.5px solid #000;
  padding: 0 4px;
  margin-right: 5px;
}

.date-input {
  margin: 20px 0;
  font-size: 0.7rem;
}

.line {
  display: inline-block;
  width: 50px;
  border-bottom: 1px solid #000;
  text-align: center;
  padding: 0 5px;
}

.company-name {
  font-size: 0.7rem;
  font-weight: bold;
  margin-top: 20px;
}

.system-text {
  font-size: 0.7rem;
  text-align: center;
  margin-top: 30px;
  color: #666;
}
</style>
