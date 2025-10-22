<!-- 완제품검사 관리 -->
<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
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
import ProdInspTargetSelectModal from './ProdInspTargetSelectModal.vue' // 검사대상(공정실적) 조회 모달
import axios from 'axios'
import { Korean } from 'flatpickr/dist/l10n/ko.js' // 달력 한글 import
import InspMethodModal from './MatInspMethodModal.vue' // 검사방법 모달
import InspRubricModal from './MatInspRubricModal.vue' // 채점기준 모달
import ProdInspSearchModal from './ProdInspSearchModal.vue' // 검색 모달

// 1. 페이지 타이틀
const currentPageTitle = ref('완제품검사 관리')

// 2. TS 데이터타입
// 2-1. 검사대상(공정실적관리 완제품)
interface prodInspTargetDT {
  procs_no: number
  prod_code: string
  prod_name: string
  prod_spec: string
  comncode_dtnm: string
  mk_qty: number
  procs_endtm: string
}
// 2-2. 관능/범위 데이터타입
interface SensoryRow {
  insp_item_id: string
  insp_item_name: string
  pass_score: number // “합격기준점수(평균)”
  pass_score_spec: string // (있으면) 범위 코드 등
  score_desc: scoredescDT[] // 점수설명
  max_score: number // 동적 점수 컬럼 개수
  insp_result_value: number
  r_value: string // 판정(합P/불N)
  details: SensoryDetail[]
}
interface SensoryDetail {
  id: string // `${insp_item_id}-${order}`
  order: number
  question_name: string
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
interface scoredescDT {
  score: number
  desc: string
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
// 2-5. 검색 모달
interface modalRowDT {
  insp_id: string
  insp_name: string
  insp_date: string
  prod_name: string
  prod_spec: string
  comncode_dtnm: string
  insp_qty: number
  procs_no: number
}

// 3. 변수
const inspector = ref('이한솔') // 검사자
// 3-1. 검사대상(공정실적번호 완제품)
const prodInspTargetData = reactive({
  procs_no: null as number | null, //공정실적번호
  prod_code: '', //제품코드
  prod_name: '', //제품명
  prod_spec: '', //규격
  comncode_dtnm: '', //단위 공통코드 이름
  mk_qty: null as number | null, //생산량
  procs_endtm: '', //생산종료날짜
})
const inspName = ref('') // 검사명
const prodInspQty = ref<number>() // 검사량
const prodInspNG = ref<number>(0) // 불량량
const prodInspPass = ref<number>(0) // 합격량
const remark = ref('') // 비고
const inspDataRan = ref<RangeRow[]>([]) // 범위 테이블 데이터
const inspDataSen = ref<SensoryRow[]>([]) // 관능 테이블 데이터
const mode = ref<'create' | 'edit'>('create') // 모드선택(등록/수정)
const currentInspId = ref<string | null>(null) // 등록/수정 상태

// 4. 모달에서 선택한 검사대상 해당 input에 넣기
const onInspChecked = async (row: prodInspTargetDT) => {
  // 1) 상단 input 바인딩
  prodInspTargetData.procs_no = row.procs_no
  prodInspTargetData.prod_code = row.prod_code
  prodInspTargetData.prod_name = row.prod_name
  prodInspTargetData.prod_spec = row.prod_spec
  prodInspTargetData.comncode_dtnm = row.comncode_dtnm
  prodInspTargetData.mk_qty = row.mk_qty
  // 2) 모달 닫기
  isModalOpen.value = false
  // 3) 불량 + 품질기준 조회를 위한 함수 호출 및 매개변수 전달
  await findProdInspNgnQcMaster(row.prod_code)
  // 4) 수량 초기화(선택)
  prodInspQty.value = 0
  prodInspNG.value = 0
  prodInspPass.value = 0
  // 5) 수정/등록 구분
  currentInspId.value = null
  mode.value = 'create'
}

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
const prodInspTargetDataattedDateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`

// 5. 테이블 확장
const expandedRows = ref<Record<string, boolean> | null>(null)

// 6. 모달 이벤트(open, close)
const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

// 7. 날짜 선택
// 7-1. 일자 시작일 설정 (종료일이 있다면 maxDate 설정)
const startDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 종료일이 설정되어 있으면 해당 날짜를 최대 날짜로 설정하여 범위를 제한
  maxDate: cond.end_date || 'today',
  locale: Korean,
}))

// 일자 종료일 설정 (시작일이 있다면 minDate 설정)
const endDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 시작일이 설정되어 있으면 해당 날짜를 최소 날짜로 설정하여 범위를 제한
  minDate: cond.start_date || undefined, // 시작일 없으면 minDate 설정 안함
  maxDate: 'today',
  locale: Korean,
}))

// 8. 검사량, 불량량, 합격량 계산
// 8-1. 검사량 값 제한(입고량을 넘길수 X)
const onInspValue = () => {
  if (prodInspQty.value > prodInspTargetData.mk_qty) {
    alert('검사량은 생산량을 초과할 수 없습니다.')
    prodInspQty.value = prodInspTargetData.mk_qty
  }
}
// 8-2. 합격량 계산
watch([prodInspQty, prodInspNG], () => {
  prodInspPass.value = prodInspQty.value - prodInspNG.value
})
// 8-3. 불량량 계산
const ngValues = reactive<Record<string, number>>({}) //불량유형별 수치를 담는 객체
watch(
  () => Object.values(ngValues), // 모든 값이 변경될 때 감지
  (vals) => {
    const sum = vals.reduce((acc, val) => acc + (val || 0), 0)
    prodInspNG.value = sum
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
const findProdInspNgnQcMaster = async (prod_code: string) => {
  try {
    const { data } = await axios.get(`/api/prodInspQcMasternNg/${prod_code}`)
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

// 테이블에 가져온 데이터 넣기
// 10-1. 공통코드 한글라벨
const specLabel = (code?: string | null) => {
  switch ((code || '').toLowerCase()) {
    case 'r1':
      return '이상'
    case 'r2':
      return '초과'
    case 'r3':
      return '이하'
    case 'r4':
      return '미만'
    default:
      return ''
  }
}

// 10-3. 숫자/JSON/라벨 유틸
const toNum = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v))
const safeArr = <T = any,>(v: any): T[] => (Array.isArray(v) ? v : v ? JSON.parse(v) : [])

// 10-4. 범위형 한 행의 판정 계산
const judgeRange = (row: RangeRow) => {
  const val = toNum(row.insp_result_value)
  if (val === null) {
    row.r_value = ''
    return
  }

  const min = toNum(row.min_range)
  const max = toNum(row.max_range)

  // 하한 체크
  let okMin = true
  if (min !== null) {
    okMin = row.min_label === '이상' ? val >= min : row.min_label === '초과' ? val > min : true
  }
  // 상한 체크
  let okMax = true
  if (max !== null) {
    okMax = row.max_label === '이하' ? val <= max : row.max_label === '미만' ? val < max : true
  }
  row.r_value = okMin && okMax ? 'P' : 'F'
}
// 10-5. 관능형 한 행의 판정 계산(평균 >= pass_score 이면 합격으로 가정)
const judgeSensory = (row: SensoryRow) => {
  const picked = row.details.map((d) => d.score).filter((n): n is number => typeof n === 'number')
  if (!picked.length) {
    row.insp_result_value = 0
    row.r_value = ''
    return
  }

  const avg = picked.reduce((a, b) => a + b, 0) / picked.length
  const base = row.pass_score
  const cond = (row.pass_score_spec || 'r1').toLowerCase() // 기본은 '이상(r1)'

  // r1(이상) / r2(초과)만
  const pass = cond === 'r2' ? avg > base : avg >= base

  row.insp_result_value = Number(avg.toFixed(2))
  row.r_value = pass ? 'P' : 'F' // ★ DB 저장용 코드로 유지
}

// 10-3. 테이블에 데이터 넣기
// qc[] → inspDataRan / inspDataSen 로 변환
const processQcToTables = () => {
  const ran: RangeRow[] = []
  const sen: SensoryRow[] = []

  ;(qc.value || []).forEach((r) => {
    if (r.insp_type === 'R') {
      ran.push({
        insp_item_id: r.insp_item_id,
        insp_item_name: r.insp_item_name,
        min_range: r.min_range ?? '',
        min_label: specLabel(r.min_range_spec),
        max_range: r.max_range ?? '',
        max_label: specLabel(r.max_range_spec),
        unit: r.unit ?? '',
        insp_method: r.insp_method ?? null,
        file_name: r.file_name ?? null,
        insp_result_value: 0,
        r_value: '',
      })
    } else if (r.insp_type === 'S') {
      const questions = safeArr<any>(r.sens_questions).map((q: any, idx: number) => ({
        id: `${r.insp_item_id}-${q.order ?? idx + 1}`,
        order: q.order ?? idx + 1,
        question_name: q.name ?? q.question ?? q.question_name ?? '',
        score: undefined,
      }))

      sen.push({
        insp_item_id: r.insp_item_id,
        insp_item_name: r.insp_item_name,
        pass_score: Number(r.pass_score ?? 0),
        pass_score_spec: (r.pass_score_spec ?? '').toLowerCase(), // r1/r2 등
        score_desc: safeArr<scoredescDT>(r.score_desc),
        max_score: Number(r.max_score ?? 5),
        insp_result_value: 0,
        r_value: '',
        details: questions,
      })
    }
  })

  inspDataRan.value = ran
  inspDataSen.value = sen
}

// 10-4. 최종결과 판정 계산
const finalResult = computed(() => {
  // 모든 검사결과 모으기
  const ranOk = inspDataRan.value.every((r) => r.r_value === 'P')
  const senOk = inspDataSen.value.every((s) => s.r_value === 'P')

  if (inspDataRan.value.length === 0 && inspDataSen.value.length === 0) {
    return '' // 검사 데이터 없으면 공란
  }
  return ranOk && senOk ? '합격' : '불합격'
})

// 11. 검사방법 모달
// 11-1. 검사방법 모달 상태
const isMethodModalOpen = ref(false) // 모달 열림/닫힘(boolean)
const selectedMethod = ref<string | null>(null) // 모달에 넘겨줄 "내용" (검사방법 텍스트 등)
const openMethodModal = async (row: RangeRow) => {
  selectedMethod.value = row?.insp_method ?? null // ① 값 먼저 세팅
  await nextTick() // ② DOM/반응성 반영 대기
  isMethodModalOpen.value = true // ③ 모달 열기
}
const closeMethodModal = () => {
  isMethodModalOpen.value = false // 닫기
  selectedMethod.value = null // 다음 열림 때 이전 값 안 섞이게 초기화
}

// 12. 채점기준 모달
const isScoreDescModalOpen = ref(false)
const selectedScoreDesc = ref<any>(null)
const openScoreDescModal = (row: SensoryRow) => {
  selectedScoreDesc.value = row.score_desc // 문자열이든 배열이든 OK
  isScoreDescModalOpen.value = true
}
const closeScoreDescModal = () => {
  isScoreDescModalOpen.value = false
  selectedScoreDesc.value = null
}

// 13. 등록/수정
// 13-1. 공통 payload빌더
const buildPayload = () => {
  // 최종결과 코드화
  const final_result = finalResult.value === '합격' ? 'P' : 'F'

  // 결과 rows(범위형 + 관능형) → mat_insp_result
  const results: Array<{ insp_result_value: number; r_value: string; insp_item_id: string }> = []
  for (const r of inspDataRan.value) {
    results.push({
      insp_result_value: Number(r.insp_result_value ?? 0),
      r_value: r.r_value || '',
      insp_item_id: r.insp_item_id,
    })
  }
  for (const s of inspDataSen.value) {
    results.push({
      insp_result_value: Number(s.insp_result_value ?? 0),
      r_value: s.r_value || '',
      insp_item_id: s.insp_item_id,
    })
  }

  // 불량 합계 → mat_insp_ng
  const ngs = Object.entries(ngValues)
    .filter(([, v]) => Number(v) > 0)
    .map(([def_item_id, v]) => ({ def_item_id, qty: Number(v) }))

  return {
    insp_name: inspName.value,
    insp_date: prodInspTargetDataattedDateTime,
    insp_qty: Number(prodInspQty.value || 0),
    pass_qty: Number(prodInspPass.value || 0),
    fail_qty: Number(prodInspNG.value || 0),
    remark: remark.value || '',
    final_result, // 'P' | 'F'
    emp_id: inspector.value || 'EMP-20250616-0004',
    procs_no: Number(prodInspTargetData.procs_no),
    results,
    ngs,
  }
}

// 13-2. 유효성 검사
// 숫자 입력 여부 체크
const isFilledNumber = (v: any) =>
  v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v))
const validateBeforeSubmit = (): boolean => {
  // 0) 기본 수량/타겟
  if (!inspName.value?.trim()) {
    alert('검사명을 입력해주세요.')
    return false
  }
  if (!prodInspTargetData.prod_name) {
    alert('검사할 완제품을 선택해주세요.')
    return false
  }
  if (!prodInspQty.value || prodInspQty.value <= 0) {
    alert('검사량을 입력해주세요.')
    return false
  }
  if (prodInspQty.value > prodInspTargetData.mk_qty) {
    alert('검사량은 생산량을 초과할 수 없습니다.')
    return false
  }
  if (prodInspPass.value < 0) {
    alert('합격량은 0보다 작을 수 없습니다.')
    return false
  }
  // 1) 범위검사: 측정값 필수
  if (inspDataRan.value.length > 0) {
    const missingRan = inspDataRan.value.filter((r) => !isFilledNumber(r.insp_result_value))
    if (missingRan.length > 0) {
      const first = missingRan[0]
      alert(`범위 검사 '${first.insp_item_name}'에 측정값을 입력해주세요.`)
      return false
    }
  }
  // 2) 관능검사: 각 질문 라디오 필수
  if (inspDataSen.value.length > 0) {
    for (const row of inspDataSen.value) {
      if (!row.details || row.details.length === 0) continue
      const notPicked = row.details.find((d) => typeof d.score !== 'number')
      if (notPicked) {
        alert(
          `관능 검사 '${row.insp_item_name}'의 '${notPicked.order}. ${notPicked.question_name}' 점수를 선택해주세요.`,
        )
        return false
      }
    }
  }

  return true
}

// 13-3. 등록
const submitRegister = async () => {
  try {
    if (!validateBeforeSubmit()) return //유효성검사

    const payload = buildPayload()
    const { data } = await axios.post('/api/prodInsp', payload)
    if (data?.ok) {
      alert(`등록되었습니다.\n검사ID: ${data.insp_id ?? ''}`)
      // 등록 후 수정모드로 전환하고 싶으면 아래 두 줄 사용:
      // currentInspId.value = data.insp_id
      // mode.value = 'edit'
      // 아니면 폼 초기화:
      resetForm()
    } else {
      alert(data?.message || '등록 실패')
    }
  } catch (e) {
    console.error('[FE] 등록 오류:', e)
    alert('서버 오류가 발생했습니다.')
  }
}

// 13-4. 수정
const submitUpdate = async () => {
  try {
    if (!validateBeforeSubmit()) return //유효성검사

    const payload = buildPayload()
    const { data } = await axios.put(`/api/prodInsp/${currentInspId.value}`, payload)
    if (data?.ok) {
      alert(`수정되었습니다.\n검사ID: ${currentInspId.value}`)
    } else {
      alert(data?.message || '수정 실패')
    }
  } catch (e) {
    console.error('[FE] 수정 오류:', e)
    alert('서버 오류가 발생했습니다.')
  }
}

// 13-5. 삭제
const confirmDelete = async () => {
  try {
    if (!currentInspId.value) return alert('삭제할 검사ID가 없습니다.')
    if (!confirm(`'${inspName.value}'를 삭제하시겠습니까?`)) return
    const { data } = await axios.delete(`/api/prodInsp/${currentInspId.value}`)
    if (data?.ok) {
      alert(`'${inspName.value}'가 삭제되었습니다.`)
      resetForm()
    } else {
      alert(data?.message || '삭제를 실패했습니다.')
    }
  } catch (e) {
    console.error('[FE] 삭제 오류:', e)
    alert('서버 오류가 발생했습니다.')
  }
}

// 14. 초기화
const resetForm = () => {
  // 상단 기본정보
  inspName.value = ''
  inspector.value = '이한솔'
  remark.value = ''

  // 타겟(공정실적관리)
  Object.assign(prodInspTargetData, {
    procs_no: '',
    prod_code: '',
    prod_name: '',
    prod_spec: '',
    comncode_dtnm: '',
    mk_qty: 0,
  })

  // 수량
  prodInspQty.value = 0
  prodInspNG.value = 0
  prodInspPass.value = 0

  // 불량 목록/값
  ng.value = []
  Object.keys(ngValues).forEach((k) => delete ngValues[k])

  // 검사 테이블
  inspDataRan.value = []
  inspDataSen.value = []
  expandedRows.value = null

  // 모드/ID
  currentInspId.value = null
  mode.value = 'create'
}

// 15. 검색 모달
// 15-1. 검색 조건 폼
const cond = reactive({
  insp_name_word: '',
  start_date: '', // 'YYYY-MM-DD'
  end_date: '', // 'YYYY-MM-DD'
})
// 15-2. 초기화
const resetSearch = () => {
  cond.insp_name_word = ''
  cond.start_date = ''
  cond.end_date = ''
  modalRows.value = []
}
// 15-3. 모달 상태/데이터
const isSearchModalOpen = ref(false)
const modalRows = ref<modalRowDT[]>([])

// 15-4. 조회 버튼 클릭 → 서버 검색 → 모달 열기
const openSearchModal = async () => {
  try {
    const { data } = await axios.post('/api/prodInspSearch', {
      insp_name_word: cond.insp_name_word || undefined,
      start_date: cond.start_date || undefined,
      end_date: cond.end_date || undefined,
    })
    modalRows.value = Array.isArray(data) ? data : data?.data || [] // 서버 응답 구조에 맞게
    await nextTick() // rows 반영된 뒤
    console.log('검색기능 : ', data) // 확인값
    isSearchModalOpen.value = true // 모달 오픈
    // 초기화
    cond.insp_name_word = '' // 검사명 input 초기화
    cond.start_date = ''
    cond.end_date = ''
  } catch (e) {
    alert('검색에 실패했습니다.')
    console.error(e)
  }
}

// 15-5. 부모 script setup (검색→상세조회→화면 주입)
async function onPickedRow(row: modalRowDT) {
  // 1) 모달 닫기
  isSearchModalOpen.value = false

  // 2) 상세조회 호출
  await axios
    .get(`/api/prodInspDetail/${row.insp_id}`)
    .then(({ data }) => {
      if (!data?.ok) {
        alert(data?.message || '상세 조회 실패')
        return
      }

      const { header, results, ngs } = data

      // 3) 상단 기본정보 주입
      inspName.value = header.insp_name || ''
      inspector.value = header.emp_id || inspector.value // 검사자
      // 수량/비고
      prodInspQty.value = Number(header.insp_qty || 0)
      prodInspNG.value = Number(header.fail_qty || 0)
      prodInspPass.value = Number(header.pass_qty || 0)
      remark.value = header.remark || ''

      // 공정실적(완제품) 영역
      // prodInspTargetData: { procs_no, prod_code, prod_name, prod_spec, comncode_dtnm, mk_qty, procs_endtm }
      prodInspTargetData.procs_no = header.procs_no || ''
      prodInspTargetData.prod_code = header.prod_code || ''
      prodInspTargetData.prod_name = header.prod_name || ''
      prodInspTargetData.prod_spec = header.prod_spec || ''
      prodInspTargetData.comncode_dtnm = header.prod_unit_name || '' // 단위 라벨
      prodInspTargetData.mk_qty = Number(header.mk_qty || 0)
      prodInspTargetData.procs_endtm = header.procs_endtm || ''

      // 4) 결과 rows → 기존 테이블(inspDataRan / inspDataSen)로 매핑
      const ran: RangeRow[] = []
      const sen: SensoryRow[] = []

      for (const r of results || []) {
        if (r.insp_type === 'R') {
          ran.push({
            insp_item_id: r.insp_item_id,
            insp_item_name: r.insp_item_name,
            min_range: r.min_range ?? '',
            min_label: specLabel(r.min_range_spec),
            max_range: r.max_range ?? '',
            max_label: specLabel(r.max_range_spec),
            unit: r.unit ?? '',
            insp_method: r.insp_method ?? null,
            file_name: r.file_name ?? null,
            insp_result_value: Number(r.insp_result_value ?? 0),
            r_value: r.r_value || '',
          })
        } else if (r.insp_type === 'S') {
          sen.push({
            insp_item_id: r.insp_item_id,
            insp_item_name: r.insp_item_name,
            pass_score: Number(r.pass_score ?? 0),
            pass_score_spec: (r.pass_score_spec ?? '').toLowerCase(),
            score_desc: [], // (필요 시 상세 설계 추가)
            max_score: Number(r.max_score ?? 5),
            insp_result_value: Number(r.insp_result_value ?? 0),
            r_value: r.r_value || '',
            details: [], // (질문별 점수 복구는 별도 저장 필요)
          })
        }
      }

      inspDataRan.value = ran
      inspDataSen.value = sen

      // 5) 불량 복구
      ng.value = (ngs || []).map((n: any) => ({
        def_item_id: n.def_item_id,
        def_item_name: n.def_item_name,
      }))
      Object.keys(ngValues).forEach((k) => delete ngValues[k]) // 초기화
      for (const n of ngs || []) {
        ngValues[n.def_item_id] = Number(n.qty || 0)
      }
    })
    .catch((e) => {
      console.error(e)
      alert('상세 조회 중 오류')
    })

  // 6) 모드 전환
  currentInspId.value = row.insp_id
  mode.value = 'edit'
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
          <button class="btn-common btn-white" @click="resetSearch">초기화</button>
          <button class="btn-common btn-color" @click="openSearchModal">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="flex gap-4">
          <div class="w-1/4">
            <label :class="labelStyle"> 검사명 </label>
            <input type="text" :class="inputStyle" v-model="cond.insp_name_word" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              검사일시
            </label>
            <div class="flex items-center gap-2">
              <div class="relative">
                <flat-pickr
                  v-model="cond.start_date"
                  :config="startDateConfig"
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
                  v-model="cond.end_date"
                  :config="endDateConfig"
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
            </div>
          </div>
        </div>
      </template>
    </ComponentCard>
    <ProdInspSearchModal
      :visible="isSearchModalOpen"
      :rows="modalRows"
      @close="isSearchModalOpen = false"
      @checked="onPickedRow"
    />
    <ComponentCard title="등록" className="shadow-sm">
      <template #header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-white" @click="resetForm">초기화</button>
          <!-- 등록 모드 -->
          <template v-if="mode === 'create'">
            <button class="btn-common btn-color" @click="submitRegister">등록</button>
          </template>
          <!-- 수정 모드 -->
          <template v-else>
            <!-- <button class="btn-common btn-color">PDF</button> -->
            <button class="btn-common btn-color" @click="submitUpdate">수정</button>
            <button class="btn-common btn-white" @click="confirmDelete">삭제</button>
          </template>
        </div>
      </template>
      <template #body-content>
        <div class="h-[420px] overflow-auto">
          <div class="rounded-lg border border-gray-200 shadow-sm p-4 mb-2">
            <h3 class="text-md mb-2 font-medium">기본정보</h3>
            <div class="w-full flex items-center mb-2">
              <label :class="labelStyle" class="w-[86px]"> 검사명 *</label>
              <input
                type="text"
                :class="inputStyleSM"
                class="w-2/3"
                placeholder="검사명을 입력하세요."
                v-model="inspName"
              />
            </div>
            <div class="flex flex-wrap justify-between gap-2">
              <div class="w-1/5 flex items-center relative">
                <label :class="labelStyle" class="w-[120px]"> 제품코드 *</label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                  v-model="prodInspTargetData.prod_code"
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
                <label :class="labelStyle" class="w-[120px]"> 제품명 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                  v-model="prodInspTargetData.prod_name"
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
                <label :class="labelStyle" class="w-[120px]"> 공정실적번호 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                  v-model="prodInspTargetData.procs_no"
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
                  v-model="prodInspTargetData.prod_spec"
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
                  v-model="prodInspTargetData.comncode_dtnm"
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
                <label :class="labelStyle" class="w-[120px]"> 생산량 </label>
                <input
                  type="text"
                  :class="inputStyleClick"
                  class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                  readonly
                  @click="openModal"
                  v-model="prodInspTargetData.mk_qty"
                  style="text-align: right; padding-right: 40px"
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
                  v-model="prodInspTargetDataattedDateTime"
                  disabled
                />
              </div>
            </div>
            <ProdInspTargetSelectModal
              :visible="isModalOpen"
              @close="closeModal"
              @checked="onInspChecked"
            ></ProdInspTargetSelectModal>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 shadow-sm mb-2">
            <h3 class="text-md mb-2 font-medium">수량입력</h3>
            <div class="flex flex-wrap mb-2">
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 검사량 *</label>
                <div>
                  <input
                    type="number"
                    :class="inputStyleSM"
                    class="w-2/3"
                    placeholder="검사량을 입력하세요."
                    style="text-align: right"
                    v-model="prodInspQty"
                    @input="onInspValue"
                    ref="tem_insp_qty"
                  />
                </div>
                <div class="text-sm w-[100px] ml-2">
                  {{ prodInspTargetData.comncode_dtnm || '단위' }}
                </div>
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
                    v-model="prodInspNG"
                  />
                </div>
                <div class="text-sm w-[100px] ml-2">
                  {{ prodInspTargetData.comncode_dtnm || '단위' }}
                </div>
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
                    v-model="prodInspPass"
                  />
                </div>
                <div class="text-sm w-[100px] ml-2">
                  {{ prodInspTargetData.comncode_dtnm || '단위' }}
                </div>
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
                <div class="text-sm w-[100px] ml-2">
                  {{ prodInspTargetData.comncode_dtnm || '단위' }}
                </div>
              </div>
              <!-- 데이터 값이 없을 때 -->
              <div v-if="ng.length == 0">
                <div v-if="!prodInspTargetData.prod_name">
                  <span class="text-sm" style="color: #999">불량 항목이 비어 있습니다.</span>
                </div>
                <div v-else>
                  <span class="text-sm" style="color: #999"
                    >선택한 자재 '{{ prodInspTargetData.prod_name }}'에 연결된 불량 항목이 없습니다.
                    불량 기준을 등록해주세요.
                  </span>
                </div>
              </div>
            </div>
            <div class="w-full flex">
              <label :class="labelStyle" class="w-[85px]">비고 </label>
              <input type="text" :class="inputStyleSM" v-model="remark" />
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 shadow-sm">
            <!-- 최종합격 -->
            <div
              class="w-[30%] flex justify-center items-center m-1.5 rounded-md float-right"
              style="border: 1px solid #ccc; padding: 4px"
            >
              <p class="text-2xl font-bold">최종결과 : {{ finalResult || '' }}</p>
            </div>
            <h3 class="text-md mb-2 font-medium">검사 기준 항목</h3>
            <!-- 범위검사(insp_type: "R") -->
            <h4 class="mb-1.5 text-md">범위 검사</h4>

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
                <template #body="slotProps">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-file"
                      :text="true"
                      severity="secondary"
                      class="p-button-sm hover:bg-gray-400"
                      style="width: 20px; height: 15px; text-align: center; color: #999"
                      :disabled="!slotProps.data.insp_method || slotProps.data.insp_method === '-'"
                      @click="openMethodModal(slotProps.data)"
                    ></Button>
                  </div>
                </template>
              </Column>
              <!-- <Column
                field="file_name"
                header="첨부파일"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 100px"
              >
                <template #body="slotProps">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-paperclip"
                      :text="true"
                      severity="secondary"
                      class="p-button-sm"
                      style="width: 20px; height: 15px; text-align: center; color: #999"
                      :disabled="!slotProps.data.file_name"
                    />
                  </div>
                </template>
              </Column> -->
              <Column
                field="range_stand"
                header="범위기준"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 450px"
              >
                <template #body="slotProps">
                  <div class="flex gap-2 w-full items-center">
                    <!-- v-moel="min_range" -->
                    <input
                      type="text"
                      v-model="slotProps.data.min_range"
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
                      v-model="slotProps.data.max_range"
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
                <template #body="slotProps">
                  <input
                    type="text"
                    :class="inputStyleSM"
                    placeholder="측정값 입력하세요."
                    v-model="slotProps.data.insp_result_value"
                    @input="judgeRange(slotProps.data)"
                    style="text-align: right"
                  />
                </template>
              </Column>
              <Column
                field="r_value"
                header="판정"
                :pt="{ columnHeaderContent: 'justify-center' }"
                class="text-center"
                style="width: 120px; text-align: center"
              >
                <template #body="slotProps">
                  {{
                    slotProps.data.r_value === 'P'
                      ? '적합'
                      : slotProps.data.r_value === 'F'
                        ? '부적합'
                        : ''
                  }}
                </template>
              </Column>
            </DataTable>
            <!-- 검사방법 모달 -->
            <InspMethodModal
              :visible="isMethodModalOpen"
              :method="selectedMethod"
              @close="closeMethodModal"
            />

            <!-- 관능검사(insp_type: "S") -->
            <h4 class="mb-1.5 text-md">관능 검사</h4>
            <DataTable
              :value="inspDataSen"
              v-model:expandedRows="expandedRows"
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
                style="width: 300px; text-align: right"
              />
              <Column
                field="pass_score_spec"
                header="합격기준점수 범위"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 300px"
              >
                <template #body="slotProps">
                  {{ specLabel(slotProps.data.pass_score_spec) }}
                </template>
              </Column>
              <Column
                field="insp_result_value"
                header="현재점수"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 300px; text-align: right"
              />
              <Column
                field="score_desc"
                header="채점기준"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 120px"
              >
                <template #body="slotProps">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-file"
                      :text="true"
                      severity="secondary"
                      class="p-button-sm hover:bg-gray-400"
                      style="width: 20px; height: 15px; text-align: center; color: #999"
                      :disabled="!slotProps.data.score_desc || !slotProps.data.score_desc.length"
                      @click="openScoreDescModal(slotProps.data)"
                    ></Button>
                  </div>
                </template>
              </Column>
              <Column
                field="r_value"
                header="판정"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="width: 120px; text-align: center"
              >
                <template #body="slotProps">
                  {{
                    slotProps.data.r_value === 'P'
                      ? '적합'
                      : slotProps.data.r_value === 'F'
                        ? '부적합'
                        : ''
                  }}
                </template>
              </Column>
              <!-- 확장버전(sens_questions 부분이 들어감) -->
              <template #expansion="slotProps">
                <div class="p-4">
                  <DataTable :value="slotProps.data.details" dataKey="id" size="small">
                    <Column
                      field="order"
                      header="번호"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 120px; text-align: center"
                    />
                    <Column
                      field="question_name"
                      header="질문"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                    />
                    <!-- max_score 값만큼 for문(5/10) -->
                    <Column
                      v-for="n in slotProps.data.max_score"
                      :key="n"
                      :field="`s${n}`"
                      :header="String(n)"
                      :pt="{ columnHeaderContent: 'justify-center' }"
                      style="width: 60px"
                    >
                      <template #body="detailSlot">
                        <div class="flex justify-center">
                          <input
                            type="radio"
                            class="checkboxStyle"
                            :name="`${slotProps.data.insp_item_id}-${detailSlot.data.id}`"
                            :value="n"
                            v-model.number="detailSlot.data.score"
                            @change="judgeSensory(slotProps.data)"
                          />
                        </div>
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </template>
            </DataTable>
            <!-- 채점기준 모달 -->
            <InspRubricModal
              :visible="isScoreDescModalOpen"
              :items="selectedScoreDesc"
              @close="closeScoreDescModal"
            />
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
