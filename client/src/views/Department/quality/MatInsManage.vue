<!-- 자재입고검사 관리 -->
<script setup lang="ts">
import { ref } from 'vue'
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
import MatInspTargetSelectModal from './MatInspTargetSelectModal.vue' // 검사대기(가입고) 선택모달

// 1. 페이지 타이틀
const currentPageTitle = ref('자재입고검사 관리')

// 2. TS
interface SensoryDetail {
  id: string // 상세행 고유키
  question: string // 질문(세부 평가 항목)
  s1?: number // 평가자1 점수
  s2?: number // 평가자2 점수
  s3?: number
  s4?: number
  s5?: number
}
interface SensoryRow {
  id: string // 부모행 고유키 (dataKey로 씁니다)
  insp_name: string // 항목
  insp_method: number // 합격기준점수(평균)
  file_name: number // 현재점수(평균) - 샘플
  range_stand: string // 채점기준 설명(파일/문서 버튼로 대체 가능)
  insp_unit: '합격' | '불합격' | '-' // 판정
  details: SensoryDetail[] // ★ 확장행에서 표시할 자식 테이블 데이터
}

// 3. 변수
const date = ref(null)
const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'F j, Y',
  wrap: true,
}
const inspector = ref('이한솔') //검사자

// 4. 검사일자
const dateValue = new Date()
// 4-1. 날짜 (YYYY-MM-DD)
const year = dateValue.getFullYear()
const month = String(dateValue.getMonth() + 1).padStart(2, '0')
const day = String(dateValue.getDate()).padStart(2, '0')
// 4-2. 시간 (HH:mm:ss)
const hour = String(dateValue.getHours()).padStart(2, '0')
const minute = String(dateValue.getMinutes()).padStart(2, '0')
const second = String(dateValue.getSeconds()).padStart(2, '0')
// 4-3. YYYY-MM-DD HH:mm:ss 형식으로 조합
const formattedDateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`

// 5. 테이블 확장
const expandedRows = ref<Record<string, boolean> | null>(null)
// 모두 열기/닫기 유틸 (원하시면 버튼으로 연결)
const expandAll = () => {
  expandedRows.value = inspDataSen.value.reduce(
    (acc, row) => {
      acc[row.id] = true
      return acc
    },
    {} as Record<string, boolean>,
  )
}
const collapseAll = () => {
  expandedRows.value = null
}

// 모달 이벤트(open, close)
const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

// 테이블 데이터
const inspDataRan = ref([
  {
    insp_name: 'dd',
    insp_method: '-',
    file_name: '-',
    range_stand: 'dd',
    insp_unit: 'dd',
    mea_values: 'dd',
    t_unit: 'dd',
  },
])
const inspDataSen = ref<SensoryRow[]>([
  {
    id: 'SEN-001',
    insp_name: '향(아로마)',
    insp_method: 3.5, // 합격기준 평균
    file_name: 3.8, // 현재 평균 점수(예시)
    range_stand: '5점 만점, 평균 3.5 이상',
    insp_unit: '합격',
    details: [
      { id: 'SEN-001-1', question: '잡내 없음', s1: 4, s2: 4, s3: 3, s4: 4, s5: 4 },
      { id: 'SEN-001-2', question: '곡물 향 유지', s1: 4, s2: 3, s3: 4, s4: 4, s5: 4 },
    ],
  },
  {
    id: 'SEN-002',
    insp_name: '맛',
    insp_method: 3.5,
    file_name: 3.2,
    range_stand: '5점 만점, 평균 3.5 이상',
    insp_unit: '불합격',
    details: [
      { id: 'SEN-002-1', question: '쓴맛 없음', s1: 3, s2: 3, s3: 3, s4: 4, s5: 3 },
      { id: 'SEN-002-2', question: '단맛 균형', s1: 3, s2: 3, s3: 4, s4: 3, s5: 3 },
    ],
  },
])

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const inputStyleSM =
  'dark:bg-dark-900 h-7 w-full rounded-sm border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const inputStyleClick =
  'dark:bg-dark-900 h-7 w-full rounded-sm border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const inputDisabled =
  'dark:bg-dark-900 h-7 w-full rounded-sm border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30'
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
    <ComponentCard title="조회" className="shadow-sm" class="mb-2">
      <template #header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-white">초기화</button>
          <button class="btn-common btn-color">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="flex gap-4">
          <div class="w-1/4">
            <label :class="labelStyle"> 검사명 </label>
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
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
    <ComponentCard title="등록" className="shadow-sm">
      <template #header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-color">PDF</button>
          <button class="btn-common btn-color">등록</button>
          <button class="btn-common btn-white">삭제</button>
        </div>
      </template>
      <template #body-content>
        <div class="h-[420px] overflow-auto">
          <div class="rounded-lg border border-gray-200 shadow-sm p-4 mb-2">
            <h3 class="text-md mb-2 font-medium">기본정보</h3>
            <div class="w-full flex items-center mb-2">
              <label :class="labelStyle" class="w-[86px]"> 검사명 </label>
              <input
                type="text"
                :class="inputStyleSM"
                class="w-2/3"
                placeholder="검사명을 입력하세요."
              />
            </div>
            <div class="flex flex-wrap justify-between gap-2">
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 가입고번호 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 발주번호 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 발주명 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 발주일자 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 거래처 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 자재코드 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 자재명 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 규격 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 단위 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 주문수량 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  @click="openModal"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 검사자 </label>
                <input
                  type="text"
                  :class="inputDisabled"
                  class="w-2/3"
                  v-model="inspector"
                  disabled
                />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 검사일시 </label>
                <input
                  type="text"
                  :class="inputDisabled"
                  class="w-2/3"
                  v-model="formattedDateTime"
                  disabled
                />
              </div>
            </div>
            <MatInspTargetSelectModal
              :visible="isModalOpen"
              @close="closeModal"
            ></MatInspTargetSelectModal>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 shadow-sm mb-2">
            <h3 class="text-md mb-2 font-medium">수량입력</h3>
            <div class="flex flex-wrap mb-2">
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]">입고량 </label>
                <div class="relative">
                  <input
                    type="text"
                    :class="inputStyleClick"
                    class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                    readonly
                    @click="openModal"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                    @click="openModal"
                  >
                    <i class="pi pi-search"></i>
                  </button>
                </div>
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 검사량 </label>
                <div>
                  <input
                    type="text"
                    :class="inputStyleSM"
                    class="w-2/3"
                    placeholder="검사량을 입력하세요."
                  />
                </div>
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 불량량 </label>
                <div>
                  <input type="text" :class="inputDisabled" class="w-2/3" disabled />
                </div>
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 합격량 </label>
                <div>
                  <input type="text" :class="inputDisabled" class="w-2/3" disabled />
                </div>
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
            </div>
            <div class="flex flex-wrap mb-2">
              <div class="text-sm w-[95px]">불량유형</div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[180px]">이물질 혼입 </label>
                <input type="text" :class="inputStyleSM" class="w-2/3" />
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[180px]"> 유통기한 경과 </label>
                <input type="text" :class="inputStyleSM" class="w-2/3" />
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
            </div>
            <div class="w-full flex">
              <label :class="labelStyle" class="w-[85px]">비고 </label>
              <input type="text" :class="inputStyleSM" />
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 shadow-sm">
            <div class="flex justify-between">
              <div class="w-[70%]">
                <h3 class="text-md mb-2 font-medium">검사 기준 항목</h3>
                <h4 class="mb-1.5 text-md">범위 검사</h4>
              </div>
              <!-- 최종합격 -->
              <div
                class="w-[30%] flex justify-center items-center m-1.5 rounded-md"
                style="border: 1px solid #ccc"
              >
                <p class="text-2xl font-bold">최종결과 : 합격</p>
              </div>
            </div>
            <!-- 범위검사 -->
            <DataTable
              :value="inspDataRan"
              dataKey="t_id"
              showGridlines
              scrollable
              size="small"
              :rows="5"
              class="text-sm mb-4"
            >
              <!-- 데이터가 없을 때 나타낼 방법 #empty슬롯 -->
              <template #empty>
                <div class="text-center">추가된 검사대상이 없습니다.</div>
              </template>
              <Column
                field="insp_name"
                header="항목"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 300px"
              />
              <Column
                field="insp_method"
                header="검사방법"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 100px"
              >
                <template #body="{ data }">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-file"
                      :text="true"
                      severity="secondary"
                      class="p-button-sm hover:bg-gray-400"
                      style="width: 20px; height: 15px; text-align: center; color: #999"
                    ></Button>
                  </div>
                </template>
              </Column>
              <Column
                field="file_name"
                header="첨부파일"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 100px"
              >
                <template #body="{ data }">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-paperclip"
                      :text="true"
                      severity="secondary"
                      class="p-button-sm"
                      style="width: 20px; height: 15px; text-align: center; color: #999"
                    ></Button>
                  </div>
                </template>
              </Column>
              <Column
                field="range_stand"
                header="범위기준"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 450px"
              >
                <template #body="{ data }">
                  <div class="flex gap-2 w-full items-center">
                    <input
                      type="text"
                      :class="inputDisabled"
                      class="text-right w-[100px]"
                      disabled
                    />
                    <span class="w-[100px]">단위</span>
                    <span class="w-[80px] flex justify-center">- </span>
                    <input type="text" :class="inputDisabled" class="text-right" disabled />
                    <span class="w-[100px]">단위</span>
                  </div>
                </template>
              </Column>
              <Column
                field="insp_unit"
                header="단위"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 100px"
              />
              <Column
                field="mea_values"
                header="측정값 입력"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 250px"
              >
                <template #body="{ data }">
                  <input type="text" :class="inputStyleSM" placeholder="측정값 입력하세요." />
                </template>
              </Column>
              <Column
                field="t_unit"
                header="판정"
                :pt="{ columnHeaderContent: 'justify-center' }"
                class="text-center"
                style="width: 120px"
              />
            </DataTable>
            <!-- 관능검사 -->
            <h4 class="mb-1.5 text-md">관능 검사</h4>
            <DataTable
              v-model:expandedRows="expandedRows"
              :value="inspDataSen"
              dataKey="id"
              showGridlines
              scrollable
              size="small"
              :rows="5"
              class="text-sm mb-4"
            >
              <!-- 데이터가 없을 때 나타낼 방법 #empty슬롯 -->
              <template #empty>
                <div class="text-center">추가된 검사대상이 없습니다.</div>
              </template>
              <Column expander style="width: 3rem" />
              <Column
                field="insp_name"
                header="항목"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 400px"
              />
              <Column
                field="insp_method"
                header="합격기준점수(평균)"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 300px"
              />
              <Column
                field="file_name"
                header="현재점수"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 300px"
              />
              <Column
                field="range_stand"
                header="채점기준"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 120px"
              >
                <template #body="{ data }">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-file"
                      :text="true"
                      severity="secondary"
                      class="p-button-sm hover:bg-gray-400"
                      style="width: 20px; height: 15px; text-align: center; color: #999"
                    ></Button>
                  </div>
                </template>
              </Column>
              <Column
                field="insp_unit"
                header="판정"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 120px"
              />
              <!-- 확장버전 -->
              <template #expansion="slotProps">
                <div class="p-4">
                  <DataTable :value="slotProps.data.details" dataKey="id" size="small">
                    <Column
                      field="id"
                      header="번호"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 120px"
                    />
                    <Column
                      field="question"
                      header="질문"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                    />
                    <Column
                      field="s1"
                      header="1"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 60px"
                    >
                      <template #body="{ data }">
                        <div class="flex justify-center">
                          <input type="radio" name="senScore" class="checkboxStyle" />
                        </div>
                      </template>
                    </Column>
                    <Column
                      field="s2"
                      header="2"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 60px"
                    >
                      <template #body="{ data }">
                        <div class="flex justify-center">
                          <input type="radio" name="senScore" class="checkboxStyle" />
                        </div>
                      </template>
                    </Column>
                    <Column
                      field="s3"
                      header="3"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 60px"
                    >
                      <template #body="{ data }">
                        <div class="flex justify-center">
                          <input type="radio" name="senScore" class="checkboxStyle" />
                        </div>
                      </template>
                    </Column>
                    <Column
                      field="s4"
                      header="4"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 60px"
                    >
                      <template #body="{ data }">
                        <div class="flex justify-center">
                          <input type="radio" name="senScore" class="checkboxStyle" />
                        </div>
                      </template>
                    </Column>
                    <Column
                      field="s5"
                      header="5"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 60px"
                    >
                      <template #body="{ data }">
                        <div class="flex justify-center">
                          <input type="radio" name="senScore" class="checkboxStyle" />
                        </div>
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </template>
    </ComponentCard>
  </AdminLayout>
</template>

<style scoped>
.checkboxStyle {
  accent-color: #3e5879;
  border: 1px solid #eee;
  cursor: pointer;
}
</style>
