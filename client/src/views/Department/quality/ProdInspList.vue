<!-- 완제품검사 조회 -->
<script setup lang="ts">
import { ref, reactive } from 'vue'
import '@/assets/common.css'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import 'primeicons/primeicons.css'
import Button from 'primevue/button'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import * as XLSX from 'xlsx'

const currentPageTitle = ref('완제품검사 조회')

const formData = reactive({
  date: '',
})
const date = ref(null)
const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'F j, Y',
  wrap: true,
}

// table data
const inspData = ref([
  {
    inspCode: 'PQC-20250821-001',
    inspName: '발효 알코올 도수 검사',
    inspDate: '2025-08-21 15:32:21',
    inspector: '이한솔',
    prodRecordNum: 'PRO-20250821-002',
    prodName: '막걸리',
    processName: '담금',
    inspStandard: '20kg',
    inspUnit: '포대',
    inspQty: '1,000.00',
    inspPass: '합격',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspDate: '-',
    inspector: '-',
    prodRecordNum: '-',
    prodName: '-',
    inspStandard: '-',
    inspUnit: '-',
    inspQty: '-',
    inspPass: '-',
  },
])

// 엑셀 (https://kongda.tistory.com/118)
// xlsx 내보내기
const excelColumns = [
  { key: 'inspCode', header: '검사ID' },
  { key: 'inspName', header: '검사명' },
  { key: 'inspDate', header: '검사일시' },
  { key: 'inspector', header: '검사자' },
  { key: 'inspTarget', header: '검사대상' },
  { key: 'inspType', header: '품목구분' },
  { key: 'inspStandard', header: '규격' },
  { key: 'inspUnit', header: '단위' },
  { key: 'inspQty', header: '검사량' },
  { key: 'inspPass', header: '합격여부' },
]
// 3) 값 포맷터(숫자/날짜 등 필요 시 정리)
function formatCell(key: string, value: unknown) {
  if (value == null || value === '-') return '' // 빈칸 정리

  // 숫자 문자열을 실제 숫자로 (엑셀에서 합계/정렬 가능)
  if (key === 'inspQty') {
    const n = Number(String(value).replace(/,/g, ''))
    return isNaN(n) ? String(value) : n
  }

  // 그대로 문자열
  return String(value)
}

// 4) 시트 너비 자동화(간단한 문자 길이 기반)
function autosizeCols(headerRow: string[], bodyRows: any[][]) {
  return headerRow.map((h, colIdx) => {
    const maxCellLen = Math.max(
      h.length,
      ...bodyRows.map((r) => (r[colIdx] == null ? 0 : String(r[colIdx]).length)),
    )
    // 한글/영문 섞임 고려하여 약간 여유
    return { wch: Math.min(Math.max(maxCellLen + 2, 8), 40) }
  })
}

// 5) 엑셀 내보내기
function exportToXlsx() {
  const header = excelColumns.map((c) => c.header)
  const rows = inspData.value.map((row) =>
    excelColumns.map((c) => formatCell(c.key, (row as any)[c.key])),
  )

  // DataTable의 현재 데이터로 시트 생성
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])

  // 열 너비 자동 설정
  ws['!cols'] = autosizeCols(header, rows)

  // 워크북 생성 & 시트 추가
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '입고검사')

  // 파일명(예: 자재입고검사_2025-10-08.xlsx)
  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `자재입고검사_${today}.xlsx`)
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const textareaStyle =
  'dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 overflow-y-auto'
const fileStyle =
  'focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400'
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <ComponentCard title="조회" className="shadow-sm mb-2">
      <template #header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-white">초기화</button>
          <button class="btn-common btn-color">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="flex flex-wrap gap-4">
          <div class="w-1/4">
            <label :class="labelStyle"> 검사명 </label>
            <input type="text" :class="inputStyle" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle">제품명 </label>
            <input type="text" :class="inputStyle" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle"> 검사자 </label>
            <input type="text" :class="inputStyle" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              검사일시
            </label>
            <div class="flex items-center gap-2">
              <div class="relative">
                <flat-pickr
                  v-model="date"
                  :config="flatpickrConfig"
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:b≈order-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=" "
                />
                <span
                  class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                >
                  <svg
                    class="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                      fill=""
                    />
                  </svg>
                </span>
              </div>
              <div>-</div>
              <div class="relative">
                <flat-pickr
                  v-model="date"
                  :config="flatpickrConfig"
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:b≈order-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=" "
                />
                <span
                  class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                >
                  <svg
                    class="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                      fill=""
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ComponentCard>
    <ComponentCard title="목록" className="shadow-sm">
      <template #header-right>
        <div>
          <button type="button" class="btn-common btn-color" @click="exportToXlsx">
            .xlsx 다운
          </button>
        </div>
      </template>
      <template #body-content>
        <DataTable
          :value="inspData"
          showGridlines
          scrollable
          scrollHeight="310px"
          size="small"
          :rows="10"
          class="text-sm"
          v-model:selection="selectedInspData"
        >
          <!-- 데이터가 없을 때 나타낼 방법 #empty슬롯 -->
          <template #empty>
            <div class="text-center">조회된 데이터가 없습니다.</div>
          </template>
          <Column
            field="inspCode"
            header="검사ID"
            sortable
            :pt="{ columnHeaderContent: 'justify-center' }"
            bodyStyle="text-align: center"
          />
          <Column
            field="inspName"
            header="검사명"
            sortable
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <Column
            field="inspDate"
            header="검사일시"
            sortable
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <Column
            field="inspector"
            header="검사자"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <Column
            field="prodRecordNum"
            header="생산실적번호"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <Column
            field="prodName"
            header="제품명"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <Column
            field="inspStandard"
            header="규격"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <Column field="inspUnit" header="단위" :pt="{ columnHeaderContent: 'justify-center' }" />
          <Column field="inspQty" header="검사량" :pt="{ columnHeaderContent: 'justify-center' }" />
          <Column
            field="inspPass"
            header="합격여부"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
        </DataTable>
      </template>
    </ComponentCard>
  </AdminLayout>
</template>

<style scoped></style>
