<!-- 자재입고검사 관리 -->
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
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
import axios from 'axios'

// 1. 페이지 타이틀
const currentPageTitle = ref('자재입고검사 관리')

// 2. TS 데이터타입
// 2-1. 관능/범위 데이터타입(수정필요)
interface SensoryRow {
  insp_item_id: string
  insp_item_name: string
  pass_score: number // “합격기준점수(평균)”
  pass_score_spec?: string // (있으면) 범위 코드 등
  score_desc: any[] // (옵션) 점수설명
  max_score: number // 동적 점수 컬럼 개수
  insp_result_value: number
  r_value: string // 판정(합P/불N)
  details: SensoryDetail[]
}
interface SensoryDetail {
  id: string // `${insp_item_id}-${order}`
  order: number // 번호 컬럼에 꽂힘
  question_name: string // 질문 컬럼에 꽂힘
  score?: number // 사용자가 고른 점수(1..max_score)
}
interface RangeRow {
  insp_item_id: string
  insp_item_name: string
  min_range: string // "12.00"
  min_label: string // "이상/초과"
  max_range: string // "25.00"
  max_label: string // "이하/미만"
  unit: string // 예: "kg"
  insp_method: string | null // "-" 등
  file_name: string | null // "-" 등
  insp_result_value: number // 사용자 입력값
  r_value: string // 판정(계산 후 세팅)
}

// 2-2. 검사대상(가입고)
interface matInspTargetDT {
  iis_id: number
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
}
// 2-3. 불량
interface ngDT {
  def_item_id: string
  def_item_name: string
}
// 2-4. 품질기준관리
interface qcDT {
  insp_item_id: string
  insp_item_name: string
  insp_type: 'S' | 'R'
  insp_method: string | null
  file_name: string | null
  min_range: string | null
  min_range_spec: string | null
  max_range: string | null
  max_range_spec: string | null
  max_score: string | null
  unit: string | null
  pass_score: string | null
  pass_score_spec: string | null
  score_desc: string | null //문자열JSON
  sens_questions: string | null //문자열JSON
}

// 3. 변수
// 3-1. 달력 pickr
const date = ref(null)
const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'F j, Y',
  wrap: true,
}
// 3-2. 검사자
const inspector = ref('이한솔')
// 3-3. 검사대상(가입고)
const matInspTargetData = reactive({
  iis_id: '',
  pur_code: '',
  pur_name: '',
  pur_date: '',
  bcnc_name: '',
  mat_code: '',
  mat_name: '',
  mat_spec: '',
  mat_unit: '',
  pur_qty: 0,
  receipt_qty: 0,
})
const matInspQty = ref<number>(0) // 검사량
const matInspNG = ref<number>(0) // 불량량
const matInspPass = ref<number>(0) // 합격량

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
const matInspTargetDataattedDateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`

// 5. 테이블 확장
const expandedRows = ref<Record<string, boolean> | null>(null)

// 6. 모달에서 선택한 검사대상(가입고) 해당 input에 넣기
const onInspChecked = async (row: matInspTargetDT) => {
  // 1) 상단 input 바인딩
  matInspTargetData.iis_id = String(row.iis_id)
  matInspTargetData.pur_code = row.pur_code
  matInspTargetData.pur_name = row.pur_name
  matInspTargetData.pur_date = row.pur_date
  matInspTargetData.bcnc_name = row.bcnc_name
  matInspTargetData.mat_code = row.mat_code
  matInspTargetData.mat_name = row.mat_name
  matInspTargetData.mat_spec = row.mat_spec
  matInspTargetData.mat_unit = row.mat_unit
  matInspTargetData.pur_qty = row.pur_qty
  matInspTargetData.receipt_qty = row.receipt_qty
  // 2) 모달 닫기
  isModalOpen.value = false
  // 3) 불량 + 품질기준 조회를 위한 함수 호출 및 매개변수 전달(9번)
  await findMatInspNgnQcMaster(row.mat_code)
}

// 7. 모달 이벤트(open, close)
const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

// 8. 검사량, 불량량, 합격량 계산
// 8-1. 검사량 값 제한(입고량을 넘길수 X)
const onInspValue = () => {
  if (matInspQty.value > matInspTargetData.receipt_qty) {
    alert('검사량은 입고량을 초과할 수 없습니다.')
    matInspQty.value = matInspTargetData.receipt_qty
  }
}
// 8-2. 합격량 계산
watch([matInspQty, matInspNG], () => {
  matInspPass.value = matInspQty.value - matInspNG.value
})
// 8-3. 불량량 계산
const ngValues = reactive<Record<string, number>>({}) //불량유형별 수치를 담는 객체
watch(
  () => Object.values(ngValues), // 모든 값이 변경될 때 감지
  (vals) => {
    const sum = vals.reduce((acc, val) => acc + (val || 0), 0)
    matInspNG.value = sum
  },
)

// 9. 데이터 조회 (mat_code로 불량 및 품질기준관리 자동조회)
const ng = ref<ngDT[]>([]) // 불량
const qc = ref<qcDT[]>([]) // 품질기준관리
const safeParse = (s?: string) => {
  try {
    return s ? JSON.parse(s) : []
  } catch {
    return []
  }
}
const findMatInspNgnQcMaster = async (mat_code: string) => {
  try {
    const { data } = await axios.get(`/api/matInspQcMasternNG/${mat_code}`)
    if (!data?.ok) throw new Error('조회 실패')
    ng.value = data.ng ?? []
    qc.value = (data.qc ?? []).map((r: any) => ({
      ...r,
      sens_questions: safeParse(r.sens_questions),
      score_desc: safeParse(r.score_desc),
    }))
    processQcToTables()
    console.log('불량 및 품질기준관리 조회결과:', data)
  } catch (err) {
    console.error('데이터 조회 오류:', err)
    ng.value = []
    qc.value = []
    inspDataSen.value = []
    inspDataRan.value = []
  }
}

// 10.

// 15. 테이블 데이터
// 범위
const inspDataRan = ref<RangeRow[]>([
  // {
  //   insp_name: 'dd',
  //   insp_method: '-',
  //   file_name: '-',
  //   range_stand: 'dd',
  //   insp_unit: 'dd',
  //   mea_values: 'dd',
  //   t_unit: 'dd',
  // },
])
// 관능
const inspDataSen = ref<SensoryRow[]>([
  // {
  //   id: 'SEN-001',
  //   insp_name: '향(아로마)',
  //   insp_method: 3.5, // 합격기준 평균
  //   file_name: 3.8, // 현재 평균 점수(예시)
  //   range_stand: '5점 만점, 평균 3.5 이상',
  //   insp_unit: '합격',
  //   details: [
  //     { id: 'SEN-001-1', question: '잡내 없음', s1: 4, s2: 4, s3: 3, s4: 4, s5: 4 },
  //     { id: 'SEN-001-2', question: '곡물 향 유지', s1: 4, s2: 3, s3: 4, s4: 4, s5: 4 },
  //   ],
  // },
  // {
  //   id: 'SEN-002',
  //   insp_name: '맛',
  //   insp_method: 3.5,
  //   file_name: 3.2,
  //   range_stand: '5점 만점, 평균 3.5 이상',
  //   insp_unit: '불합격',
  //   details: [
  //     { id: 'SEN-002-1', question: '쓴맛 없음', s1: 3, s2: 3, s3: 3, s4: 4, s5: 3 },
  //     { id: 'SEN-002-2', question: '단맛 균형', s1: 3, s2: 3, s3: 4, s4: 3, s5: 3 },
  //   ],
  // },
])
const specLabel: Record<string, string> = {
  R1: '이상',
  R2: '초과',
  R3: '이하',
  R4: '미만',
}

const processQcToTables = () => {
  if (!qc.value?.length) {
    inspDataSen.value = []
    inspDataRan.value = []
    return
  }

  const senRows: SensoryRow[] = []
  const ranRows: RangeRow[] = []

  qc.value.forEach((item) => {
    if (item.insp_type === 'S') {
      // 관능
      const maxScore = Number(item.max_score) || 5
      const passScore = Number(item.pass_score) || 0

      const questions = Array.isArray(item.sens_questions) ? item.sens_questions : []
      const details: SensoryDetail[] = questions.map((q: any) => ({
        id: `${item.insp_item_id}-${q.order}`,
        order: Number(q.order),
        question_name: q.name,
        score: undefined,
      }))

      senRows.push({
        insp_item_id: item.insp_item_id,
        insp_item_name: item.insp_item_name,
        pass_score: passScore,
        pass_score_spec: item.pass_score_spec ?? null,
        score_desc: Array.isArray(item.score_desc) ? item.score_desc : [],
        max_score: maxScore,
        insp_result_value: 0,
        r_value: '-',
        details,
      })
    } else if (item.insp_type === 'R') {
      // 범위
      const minLabel = specLabel[item.min_range_spec ?? ''] ?? '단위'
      const maxLabel = specLabel[item.max_range_spec ?? ''] ?? '단위'

      ranRows.push({
        insp_item_id: item.insp_item_id,
        insp_item_name: item.insp_item_name,
        min_range: item.min_range ?? '',
        min_label: minLabel,
        max_range: item.max_range ?? '',
        max_label: maxLabel,
        unit: item.unit ?? null,
        insp_method: item.insp_method ?? '-',
        file_name: item.file_name ?? '-',
        insp_result_value: 0,
        r_value: '',
      })
    }
  })

  inspDataSen.value = senRows
  inspDataRan.value = ranRows
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const inputStyleSM =
  'dark:bg-dark-900 h-7 w-full rounded-sm border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const inputStyleClick =
  'dark:bg-dark-900 h-7 w-full rounded-sm border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const inputDisabled =
  'dark:bg-dark-900 h-7 w-full rounded-sm border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
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
                  v-model="matInspTargetData.iis_id"
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
                  v-model="matInspTargetData.pur_code"
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
                  v-model="matInspTargetData.pur_name"
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
                  v-model="matInspTargetData.pur_date"
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
                  v-model="matInspTargetData.bcnc_name"
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
                  v-model="matInspTargetData.mat_code"
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
                  v-model="matInspTargetData.mat_name"
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
                  v-model="matInspTargetData.mat_spec"
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
                  v-model="matInspTargetData.mat_unit"
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
                <label :class="labelStyle" class="w-[120px]"> 발주수량 </label>
                <input
                  type="number"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                  v-model="matInspTargetData.pur_qty"
                  style="text-align: right; padding-right: 20px"
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
                  v-model="matInspTargetDataattedDateTime"
                  disabled
                />
              </div>
            </div>
            <MatInspTargetSelectModal
              :visible="isModalOpen"
              @close="closeModal"
              @checked="onInspChecked"
            ></MatInspTargetSelectModal>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 shadow-sm mb-2">
            <h3 class="text-md mb-2 font-medium">수량입력</h3>
            <div class="flex flex-wrap mb-2">
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]">입고량 </label>
                <div class="relative">
                  <input
                    type="number"
                    :class="inputStyleClick"
                    class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                    readonly
                    @click="openModal"
                    v-model="matInspTargetData.receipt_qty"
                    style="text-align: right; padding-right: 20px"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-2 flex items-center text-gray-400"
                    @click="openModal"
                  >
                    <i class="pi pi-search"></i>
                  </button>
                </div>
                <div class="text-sm w-[100px] ml-2">{{ matInspTargetData.mat_unit || '단위' }}</div>
              </div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 검사량 </label>
                <div>
                  <input
                    type="number"
                    :class="inputStyleSM"
                    class="w-2/3"
                    placeholder="검사량을 입력하세요."
                    v-model="matInspQty"
                    style="text-align: right"
                    @input="onInspValue"
                  />
                </div>
                <div class="text-sm w-[100px] ml-2">{{ matInspTargetData.mat_unit || '단위' }}</div>
              </div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 불량량 </label>
                <div>
                  <input
                    type="number"
                    :class="inputDisabled"
                    class="w-2/3"
                    disabled
                    style="text-align: right"
                    v-model="matInspNG"
                  />
                </div>
                <div class="text-sm w-[100px] ml-2">{{ matInspTargetData.mat_unit || '단위' }}</div>
              </div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 합격량 </label>
                <div>
                  <input
                    type="number"
                    :class="inputDisabled"
                    class="w-2/3"
                    disabled
                    style="text-align: right"
                    v-model="matInspPass"
                  />
                </div>
                <div class="text-sm w-[100px] ml-2">{{ matInspTargetData.mat_unit || '단위' }}</div>
              </div>
            </div>
            <div class="flex flex-wrap mb-2">
              <div class="text-sm w-[95px]">불량유형</div>
              <div class="w-1/4 flex items-center" v-for="item in ng" :key="item.def_item_id">
                <label :class="labelStyle" class="w-[180px]">{{ item.def_item_name }}</label>
                <input
                  type="number"
                  v-model.number="ngValues[item.def_item_id]"
                  :class="inputStyleSM"
                  class="w-2/3"
                  style="text-align: right"
                />
                <div class="text-sm w-[100px] ml-2">{{ matInspTargetData.mat_unit || '단위' }}</div>
              </div>
              <!-- 데이터 값이 없을 때 -->
              <div v-if="ng.length == 0">
                <div v-if="!matInspTargetData.mat_name">
                  <span class="text-sm" style="color: #999">불량 항목이 비어 있습니다.</span>
                </div>
                <div v-else>
                  <span class="text-sm" style="color: #999"
                    >선택한 자재 '{{ matInspTargetData.mat_name }}'에 연결된 불량 항목이 없습니다.
                    불량 기준을 등록해주세요.
                  </span>
                </div>
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
            <!-- 범위검사(insp_type: "R") -->
            <DataTable
              :value="inspDataRan"
              dataKey="insp_item_id"
              showGridlines
              size="small"
              :rows="5"
              class="text-sm mb-4"
            >
              <!-- 데이터가 없을 때 나타낼 방법 #empty슬롯 -->
              <template #empty>
                <div class="text-center">추가된 검사대상이 없습니다.</div>
              </template>

              <Column
                field="insp_item_name"
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
                <template #body>
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
                <template #body>
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
                <template #body>
                  <div class="flex gap-2 w-full items-center">
                    <!-- v-moel="min_range" -->
                    <input
                      type="text"
                      :value="slotProps.data.min_range"
                      :class="inputDisabled"
                      class="text-right w-[100px]"
                      disabled
                    />
                    <!-- min_range_spec -->
                    <span class="w-[100px]">{{ slotProps.data.min_label || '단위' }}</span>
                    <span class="w-[80px] flex justify-center">- </span>
                    <!-- v-model="max_range" -->
                    <input
                      type="text"
                      :value="slotProps.data.max_range"
                      :class="inputDisabled"
                      class="text-right"
                      disabled
                    />
                    <!-- max_range_spec -->
                    <span class="w-[100px]">{{ slotProps.data.max_label || '단위' }}</span>
                  </div>
                </template>
              </Column>
              <Column
                field="unit"
                header="단위"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 100px"
              />
              <Column
                field="insp_result_value"
                header="측정값 입력"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 250px"
              >
                <template #body>
                  <input type="text" :class="inputStyleSM" placeholder="측정값 입력하세요." />
                </template>
              </Column>
              <Column
                field="r_value"
                header="판정"
                :pt="{ columnHeaderContent: 'justify-center' }"
                class="text-center"
                style="width: 120px"
              />
            </DataTable>
            <!-- 관능검사(insp_type: "S") -->
            <h4 class="mb-1.5 text-md">관능 검사</h4>
            <DataTable
              v-model:expandedRows="expandedRows"
              :value="inspDataSen"
              dataKey="insp_item_id"
              showGridlines
              scrollable
              size="small"
              class="text-sm mb-4"
            >
              <!-- 데이터가 없을 때 나타낼 방법 #empty슬롯 -->
              <template #empty>
                <div class="text-center">추가된 검사대상이 없습니다.</div>
              </template>

              <Column expander style="width: 3rem" />
              <Column
                field="insp_item_name"
                header="항목"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 400px"
              />
              <Column
                field="pass_score"
                header="합격기준점수(평균)"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 300px"
              />
              <Column
                field="pass_score_spec"
                header="합격기준점수 범위"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 300px"
              />
              <Column
                field="insp_result_value"
                header="현재점수"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 300px"
              />
              <Column
                field="score_desc"
                header="채점기준"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 120px"
              >
                <template #body>
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
                field="r_value"
                header="판정"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 120px"
              />
              <!-- 확장버전(sens_questions 부분이 들어감) -->
              <template #expansion="slotProps">
                <div class="p-4">
                  <DataTable :value="slotProps.data.details" dataKey="id" size="small">
                    <Column
                      field="order"
                      header="번호"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 120px"
                    />
                    <Column
                      field="question_name"
                      header="질문"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                    />
                    <Column
                      field="s1"
                      header="1"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 60px"
                      v-for="n in slotProps.data.max_score"
                      :key="n"
                      :field="`s${n}`"
                      :header="String(n)"
                    >
                      <template #body>
                        <div class="flex justify-center">
                          <input
                            type="radio"
                            name="senScore"
                            class="checkboxStyle"
                            :name="`${slotProps.data.insp_item_id}-${detailSlot.data.id}`"
                            :value="n"
                            v-model.number="detailSlot.data.score"
                          />
                        </div>
                      </template>
                    </Column>
                    <!-- <Column
                      field="s2"
                      header="2"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 60px"
                    >
                      <template #body>
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
                      <template #body>
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
                      <template #body>
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
                      <template #body>
                        <div class="flex justify-center">
                          <input type="radio" name="senScore" class="checkboxStyle" />
                        </div>
                      </template>
                    </Column> -->
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
