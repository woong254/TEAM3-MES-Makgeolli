<!-- 품질기준관리 -->

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import '@/assets/common.css'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import 'primeicons/primeicons.css'
import Button from 'primevue/button'
import InspTargetSelectModal from './InspTargetSelectModal.vue' // import the modal component (검사대상조회)
import axios from 'axios'

// 1. 페이지 제목
const currentPageTitle = ref('품질검사 기준관리')

// 2. TS명시
interface InspRow {
  t_id: string
  t_name: string
  t_type: string
  t_spec: string
  t_unit: string
}
interface Question {
  id: number
  text: string
}
interface InspListRow {
  insp_item_id: string
  insp_item_name: string
  target_name: string
  insp_target_name: string
  use_yn: 'Y' | 'N'
}

// 3. 변수 선언
const inspName = ref('') //검사항목명
const inspUsing = ref(false) //미사용 체크박스(false, 체크안된상태)
const inspDesc = ref('') //검사방법
const inspTarget = ref<InspRow[]>([]) //검사대상
const minValue = ref('') // 범위 최소값
const maxValue = ref('') // 범위 최대값
const passScore = ref('') // 관능 합격 점수(평균)
const minSpec = ref('R1') // 이상/초과
const maxSpec = ref('R3') // 이하/미만
const unit = ref('')
const passSpec = ref('R1')
const inspMode = ref('range') // 검사유형(범위/관능) 초기값 range
const scoreMax = ref(5) // 관능검사 점수 초기값
const questions = ref<Question[]>([{ id: 1, text: '' }]) // 관능 질문 목록 (처음 1줄)
const allInspData = ref<any[]>([]) // 서버에서 받아온 원본
const inspData = ref<any[]>([]) // 테이블에 바인딩하는 데이터
const selectedInspData = ref<InspListRow | null>(null) // 라디오 버튼
const qItemName = ref('')
const qTargetName = ref('')
const qTypeCode = ref('') // a1~a5
const qUseY = ref(false)
const qUseN = ref(false)
const uploadedFileName = ref('') // 서버가 돌려준 파일명(또는 상대경로)
const uploadedFileUrl = ref('') // 서버가 돌려준 접근 URL
// 상세 로드 시 DB의 기존 파일을 보존하기 위한 상태(수정 모드에서 새 업로드 없으면 유지)
const existingFileName = ref('') // DB의 file_name
const existingFileUrl = ref('') // 필요하면 서버에서 함께 내려주거나, 규칙으로 구성
const uploadedStoredPath = ref<string>('') // image/xxx.png or file/yyy.pdf
const existingStoredPath = ref<string>('') // 수정 모드에서 받아온 기존 값(백엔드 조회 결과)

const fileInputRef = ref<HTMLInputElement | null>(null)
const fileInputKey = ref(0)

const scoreDesc = ref<Record<number, string>>({
  10: '',
  9: '',
  8: '',
  7: '',
  6: '',
  5: '',
  4: '',
  3: '',
  2: '',
  1: '',
}) // 관능 채점기준: 점수별 설명 (5점 모드일 때는 5~1 키 사용, 10점 모드일 땐 10~1 키 사용)

// 5. 모달에서 선택한 검사대상들 검사대상 테이블에 넣기
const onInspChecked = (rows: any[]) => {
  // 여러 건 추가
  const merged = [...inspTarget.value, ...rows] //기존데이터(inspTarget.value) + 넘어온데이터(rows)
  // 중복 제거(de-duplicate)
  const dedup = Array.from(new Map(merged.map((r) => [r.t_id, r])).values())
  inspTarget.value = dedup
}
// 5-1. 검사대상 삭제 (휴지통 버튼 클릭시)
const targetDel = (id: string) => {
  inspTarget.value = inspTarget.value.filter((row) => row.t_id !== id)
}

// 6. 관능검사
const scoreSet = computed(() => {
  return scoreMax.value == 5 ? [5, 4, 3, 2, 1] : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
})
// 6-1. 관능 질문 추가
const addQuest = () => {
  questions.value.push({
    id: questions.value.length + 1, // 새 id
    text: '',
  })
}
// 6-2. 관능 질문 제거
const removeQuest = (id: number) => {
  if (questions.value.length <= 1) {
    alert('최소 1개 이상의 질문이 필요합니다.') // 1개 최소 존재
    return
  }
  questions.value = questions.value.filter((q) => q.id !== id)
  // 라벨 번호 다시 1부터 재정렬(질문1,2,3...)
  questions.value = questions.value.map((q, i) => ({ ...q, id: i + 1 }))
}

// 7-1. 유효성검사 -> 잘못 작성시 알람
const sanitizeDecimal = (e: Event): string => {
  const el = e.target as HTMLInputElement
  const raw = el.value
  let v = raw
  let msg = ''

  if (/[^0-9.]/.test(v)) {
    v = v.replace(/[^0-9.]/g, '')
    msg ||= '숫자만 입력해주세요.'
  }
  const dotCount = (v.match(/\./g) || []).length
  if (dotCount > 1) {
    v = v.replace(/(\..*)\./g, '$1')
    msg = '소수점은 한 번만 사용할 수 있어요.'
  }
  if (v.startsWith('.')) v = '0' + v

  let [intPart = '', decPart = ''] = v.split('.')
  if (intPart.length > 4) {
    intPart = intPart.slice(0, 4)
    msg = '정수는 최대 4자리까지 가능합니다.'
  }
  if (decPart.length > 2) {
    decPart = decPart.slice(0, 2)
    msg = '소수점은 둘째자리까지 가능합니다.'
  }

  if (raw.endsWith('.') && dotCount <= 1 && decPart === '') {
    v = intPart ? intPart + '.' : '0.'
  } else {
    v = decPart !== '' ? `${intPart}.${decPart}` : intPart
  }

  if (v !== raw && msg) alert(msg)
  el.value = v
  return v
}
// 7-2. 유효성검사 (관능)
const validatePassScoreOnBlur = () => {
  if (passScore.value === '') return
  const n = Number(passScore.value)
  const max = Number(scoreMax.value)
  if (Number.isNaN(n)) return

  if (n < 0 || n > max) {
    alert(`관능형: 합격 점수는 0 ~ ${max} 사이여야 합니다.`)
    // 최대값으로 보정 (원하시면 '' 로 비우는 것도 가능)
    passScore.value = String(max)
  }
}
// 7-3. 10점 -> 5점 사용자 선택변경시 자동으로 값 변경
watch(scoreMax, (max) => {
  if (passScore.value === '') return
  const n = Number(passScore.value)
  if (!Number.isNaN(n) && n > max) {
    alert(`최고점수가 ${max}점으로 변경되어 합격 점수를 ${max}로 수정합니다.`)
    passScore.value = String(max)
  }
})

// 8. 품질기준관리 등록
// 8-1. 품질기준관리 등록 초기화
const resetIspForm = () => {
  // 공통
  inspName.value = ''
  inspUsing.value = false
  inspDesc.value = ''
  inspTarget.value = []

  // 파일
  uploadedStoredPath.value = ''
  existingStoredPath.value = ''
  existingFileName.value = ''
  if (fileInputRef.value) fileInputRef.value.value = '' // ← 인풋 값 비우기
  fileInputKey.value++ // ← 강제 리마운트

  // 범위형
  minValue.value = ''
  maxValue.value = ''
  minSpec.value = 'R1'
  maxSpec.value = 'R3'
  unit.value = ''

  // 관능형
  inspMode.value = 'range' // 검사유형 초기값
  scoreMax.value = 5
  passScore.value = ''
  passSpec.value = 'R1'
  questions.value = [{ id: 1, text: '' }]

  // 선택된 테이블 행
  selectedInspData.value = null
}

// 8-2. 등록/수정 공통 payload
const toDecimalOrNull = (s: string) => (s === '' ? null : parseFloat(s))
function buildInspPayload() {
  const insp_item_name = (inspName.value || '').trim()
  const insp_type = inspMode.value === 'sensory' ? 'S' : 'R'
  const use_yn = inspUsing.value ? 'N' : 'Y'
  const insp_method = (inspDesc.value || '').trim()

  // 1순위: 이번에 업로드한 storedPath
  // 2순위: 기존 storedPath (수정 진입 시 백엔드에서 가져온 값)
  // 3순위: 과거 호환 - filename만 있을 때 폴더 추정
  let insp_file_name = ''
  if (uploadedStoredPath.value) {
    insp_file_name = uploadedStoredPath.value
  } else if (existingStoredPath.value) {
    insp_file_name = existingStoredPath.value
  } else if (existingFileName.value) {
    // 하위호환: 옛 데이터가 파일명만 있을 때
    insp_file_name = toStoredPathFromFileName(existingFileName.value)
  }

  // 범위형 세팅
  let min_range: number | null = null
  let min_range_spec: 'R1' | 'R2' | null = null
  let max_range: number | null = null
  let max_range_spec: 'R3' | 'R4' | null = null
  let t_unit: string | null = null

  // ★ 추가: 선언 먼저!
  let score_desc_json: string | null = null

  if (insp_type === 'R') {
    min_range = toDecimalOrNull(minValue.value)
    max_range = toDecimalOrNull(maxValue.value)
    min_range_spec = minSpec.value as 'R1' | 'R2'
    max_range_spec = maxSpec.value as 'R3' | 'R4'
    t_unit = unit.value || null
  }

  // 관능형 세팅
  let max_score: number | null = null
  let pass_score: number | null = null
  let pass_score_spec: 'R1' | 'R2' | null = null
  let questionsPayload: string[] = []

  if (insp_type === 'S') {
    max_score = Number(scoreMax.value) // 5 or 10
    pass_score = toDecimalOrNull(passScore.value)
    pass_score_spec = passSpec.value as 'R1' | 'R2'
    questionsPayload = questions.value.map((q) => (q.text || '').trim()).filter((t) => t.length > 0)
    // ★ 점수-설명 JSON 만들기 (입력값 있는 것만)
    const scales = scoreSet.value
      .map((s) => ({ score: s, desc: (scoreDesc.value[s] || '').trim() }))
      .filter((x) => x.desc.length > 0)

    score_desc_json = JSON.stringify(scales) // ← 문자열
  }

  // 검사대상 그대로 전달(a1~a5 코드와 카테고리/ID)
  // (모달에서 받은 row 구조를 그대로 사용)
  const targets = inspTarget.value // [{ t_id, t_type, t_category, ... }]

  return {
    // 공통
    insp_item_name,
    insp_type,
    use_yn,
    insp_method,
    insp_file_name,

    // 범위형
    min_range,
    min_range_spec,
    max_range,
    max_range_spec,
    unit: t_unit,

    // 관능형
    max_score,
    pass_score,
    pass_score_spec,
    questions: questionsPayload,
    score_desc_json,

    // 대상
    targets,
  }
}

// 8-2. 품질기준관리 등록 (빈문자열이면 null, 아니면 숫자)
const registerInsp = async () => {
  try {
    const payload = buildInspPayload()

    // 6) 전송
    const res = await axios.post('/api/inspMaster', payload)
    if (res.data?.ok) {
      // 서버에서 반영된 최신 데이터 목록 새로고침
      await findinspData()
      // 사용자에게 알림
      alert('등록되었습니다.')
      // 폼 초기화
      resetIspForm()
    } else {
      alert(res.data?.message || '등록에 실패했습니다.')
    }
  } catch (e) {
    console.error(e)
    alert('서버 오류가 발생했습니다.')
  }
}

// 9. 품질기준관리 조회
async function findinspData() {
  try {
    const { data } = await axios.get('/api/inspFindMaster')
    allInspData.value = data
    inspData.value = data
    console.log(data)
  } catch (err) {
    console.error('데이터 조회 오류:', err)
    allInspData.value = []
    inspData.value = []
  }
}
onMounted(() => {
  // 페이지 최초 진입 시 한 번 조회
  findinspData()
})

// 9-2. 품질기준관리 상세 조회
const onRowSelect = async (e: any) => {
  await loadInspDetail(e.data.insp_item_id)
}

async function loadInspDetail(id: string) {
  const { data } = await axios.get(`/api/inspMaster/${id}`)
  if (!data?.ok) {
    alert(data?.message || '상세 실패')
    return
  }

  const { master, targets, questions: qs } = data.data // ✅ 질문도 받기

  // 공통
  inspName.value = master.insp_item_name || ''
  inspUsing.value = master.use_yn === 'N'
  inspDesc.value = master.insp_method || ''
  inspTarget.value = targets // ✅ 이제 t_name/t_spec/t_unit/t_type_name 채워짐

  existingFileName.value = master.file_name || ''
  existingFileUrl.value = master.file_name || '' // 서버가 '/uploads/...'로 주면 그대로 링크 사용
  uploadedFileName.value = '' // 새 업로드 초기화
  uploadedFileUrl.value = ''

  if (master.insp_type === 'R') {
    inspMode.value = 'range'
    minValue.value = master.min_range != null ? String(master.min_range) : ''
    minSpec.value = master.min_range_spec || 'R1'
    maxValue.value = master.max_range != null ? String(master.max_range) : ''
    maxSpec.value = master.max_range_spec || 'R3'
    unit.value = master.unit || ''
    // 관능 필드 초기화
    scoreMax.value = 5
    passScore.value = ''
    passSpec.value = 'R1'
    questions.value = [{ id: 1, text: '' }]
  } else {
    inspMode.value = 'sensory'
    scoreMax.value = Number(master.max_score ?? 5)
    passScore.value = master.pass_score != null ? String(master.pass_score) : ''
    passSpec.value = master.pass_score_spec || 'R1'
    // 범위 필드 초기화
    minValue.value = ''
    minSpec.value = 'R1'
    maxValue.value = ''
    maxSpec.value = 'R3'
    unit.value = ''
    // ✅ 질문 세팅
    questions.value =
      qs && qs.length
        ? qs.map((q: any, i: number) => ({ id: q.id ?? i + 1, text: q.text ?? '' }))
        : [{ id: 1, text: '' }]

    // ★ 채점기준(score_desc) 복원
    scoreDesc.value = {}
    try {
      // 반드시 selectInspMasterDetail 쿼리에 qc_master.score_desc가 포함되어야 합니다.
      const arr = JSON.parse(master.score_desc ?? '[]') as Array<{ score: number; desc: string }>
      for (const item of arr) {
        if (typeof item?.score === 'number') {
          scoreDesc.value[item.score] = String(item?.desc ?? '')
        }
      }
      // 저장된 길이에 맞춰 최고점수 보정(선택)
      if (arr.length === 5) scoreMax.value = 5
      else if (arr.length === 10) scoreMax.value = 10
    } catch {
      // 파싱 실패 시 조용히 무시
    }
  }
}

// 10. 품질기준관리 검색
// 10-1. 초기화 버튼
function resetSearch() {
  qItemName.value = ''
  qTargetName.value = ''
  qTypeCode.value = ''
  qUseY.value = false
  qUseN.value = false

  selectedInspData.value = null
  inspData.value = []
  allInspData.value = []

  // 필요하면 오른쪽 상세 폼도 비우고 싶을 때
  // resetIspForm()

  // 전체 목록 재조회
  findinspData()
}
// 10-2. 체크박스 조합
const qUseYnParam = computed(() => {
  if ((qUseY.value && qUseN.value) || (!qUseY.value && !qUseN.value)) return '' // 전체
  return qUseY.value ? 'Y' : 'N'
})
// 10-3. 조회 버튼
async function searchList() {
  try {
    // 1) 기존 목록/선택 초기화
    selectedInspData.value = null
    inspData.value = []
    allInspData.value = []

    // 2) 조회
    const { data } = await axios.get('/api/inspMaster/search', {
      params: {
        itemName: qItemName.value,
        targetName: qTargetName.value,
        typeCode: qTypeCode.value,
        useYn: qUseYnParam.value,
      },
    })

    // 3) 결과 덮어쓰기
    allInspData.value = data ?? []
    inspData.value = data ?? []
  } catch (e) {
    console.error(e)
    allInspData.value = []
    inspData.value = []
  }
}

// 11. 품질기준관리 수정
const updateInsp = async () => {
  if (!selectedInspData.value) {
    alert('수정할 항목을 선택하세요.')
    return
  }
  const id = selectedInspData.value.insp_item_id
  const payload = buildInspPayload()

  const { data } = await axios.put(`/api/inspMaster/${id}`, payload)
  if (data?.ok) {
    await findinspData() // 목록 새로고침
    alert('수정되었습니다.')
  } else {
    alert(data?.message || '수정 실패')
  }
}

// 12. 품질기준관리 삭제
const deleteInsp = async () => {
  if (!selectedInspData.value) {
    alert('좌측 목록에서 삭제할 항목을 선택하세요.')
    return
  }
  const id = selectedInspData.value.insp_item_id
  if (!confirm(`[${id}] 항목을 삭제하시겠습니까?`)) return

  try {
    const { data } = await axios.delete(`/api/inspMaster/${id}`)
    if (data?.ok) {
      await findinspData() // 목록 최신화
      resetIspForm() // 폼 초기화
      selectedInspData.value = null // 선택 해제
      alert('삭제되었습니다.')
    } else {
      alert(data?.message || '삭제 실패')
    }
  } catch (e: any) {
    console.error(e)
    alert(e?.response?.data?.message || '서버 오류')
  }
}

// 13. 버튼 조건부 렌더링(등록/수정)
const isEditMode = computed(() => !!selectedInspData.value)

// 14. 파일 업로드
// 14-1.파일 변경 핸들러
async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const fd = new FormData()
  fd.append('file', file)

  const res = await axios.post('/api/upload', fd) // ← '/api'로 통일
  if (res.data?.ok) {
    uploadedStoredPath.value = res.data.storedPath // image/... or file/...
    existingFileName.value = res.data.fileName // 화면 표기용
  } else {
    alert(res.data?.message || '업로드 실패')
  }
}
// 14-2. 파일 업로드(multer) 호출 그대로 사용 (필드명 'file')
// async function uploadFile(file: File) {
//   const form = new FormData()
//   form.append('file', file) //필드명 file

//   const res = await axios.post('/api/upload', form, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   })
//   if (res.data?.ok) {
//     uploadedFileName.value = res.data.fileName
//     uploadedFileUrl.value = res.data.url
//   } else {
//     alert(res.data?.message || '업로드 실패')
//   }
// }

// 15. 순수 파일명 보정 함수(다운로드시)
// 과거 데이터(폴더 없는 순수 파일명)용 보정 함수
const imgExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'])
function toStoredPathFromFileName(fileName: string) {
  if (!fileName) return ''
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const subdir = imgExts.has(ext) ? 'image' : 'file'
  return `${subdir}/${fileName}`
}

// 모달 이벤트(open, close)
const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
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

    <ComponentCard title="조회" className="shadow-sm">
      <template v-slot:header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-white" @click="resetSearch">초기화</button>
          <button class="btn-common btn-color" @click="searchList">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="flex gap-4">
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-name"> 검사항목명 </label>
            <input type="text" id="insp-name" :class="inputStyle" v-model="qItemName" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-target-name"> 검사대상 </label>
            <input type="text" id="insp-target-name" :class="inputStyle" v-model="qTargetName" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-type"> 품목구분 </label>
            <div class="relative z-20 bg-transparent">
              <select id="insp-type" :class="selectStyle" v-model="qTypeCode">
                <option value="a1">주자재</option>
                <option value="a2">부자재</option>
                <option value="a3">재공품</option>
                <option value="a4">반제품</option>
                <option value="a5">완제품</option>
              </select>
              <span
                class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
              >
                <svg
                  class="stroke-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                    stroke=""
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div class="w-1/4">
            <div :class="labelStyle">사용여부</div>
            <label :class="labelStyle">
              <input
                type="checkbox"
                name="insp-using"
                value="Y"
                class="checkboxStyle text-sm text-gray-800"
                v-model="qUseY"
              />사용
            </label>
            <label :class="labelStyle">
              <input
                type="checkbox"
                name="insp-using"
                value="N"
                class="checkboxStyle text-sm text-gray-800"
                v-model="qUseN"
              />미사용
            </label>
          </div>
        </div>
      </template>
    </ComponentCard>

    <div class="flex gap-2 mt-2 width-full" style="height: 500px">
      <ComponentCard title="목록" className="shadow-sm w-1/2">
        <template #body-content>
          <DataTable
            :value="inspData"
            showGridlines
            scrollable
            scrollHeight="390px"
            size="small"
            :rows="10"
            class="text-sm"
            v-model:selection="selectedInspData"
            dataKey="insp_item_id"
            @rowSelect="onRowSelect"
          >
            <Column
              field="inspCheck"
              header=""
              :pt="{ columnHeaderContent: 'justify-center' }"
              selectionMode="single"
              style="width: 10px"
            />
            <Column
              field="insp_item_id"
              header="검사항목ID"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: center"
            />
            <Column
              field="insp_item_name"
              header="검사대상명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="target_name"
              header="검사대상"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="insp_target_name"
              header="품목구분"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 80px"
            />
            <Column
              field="use_yn"
              header="사용여부"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 70px; text-align: center"
            />
          </DataTable>
        </template>
      </ComponentCard>

      <ComponentCard title="등록" className="shadow-sm w-1/2 ">
        <template #header-right>
          <div class="flex justify-end">
            <button type="button" class="btn-common btn-white" @click="resetIspForm">초기화</button>
            <button
              type="button"
              class="btn-common btn-color"
              form="insp-form"
              @click="registerInsp"
              v-if="!isEditMode"
            >
              등록
            </button>
            <button
              type="button"
              class="btn-common btn-color"
              form="insp-form"
              @click="updateInsp"
              v-else
            >
              수정
            </button>
            <button
              type="button"
              class="btn-common btn-white"
              @click="deleteInsp"
              :disabled="!selectedInspData"
            >
              삭제
            </button>
          </div>
        </template>
        <template #body-content>
          <form action="" id="insp-form" class="overflow-y-auto" style="height: 380px">
            <div class="flex mb-2 gap-2">
              <label :class="labelStyle" class="w-[152px]" for="inspName"> 검사항목명 </label>
              <input type="text" :class="inputStyle" id="inspName" v-model="inspName" required />
              <div class="justify-center w-1/3 ml-[10px]">
                <div :class="labelStyle">사용여부</div>
                <label :class="labelStyle">
                  <input type="checkbox" class="checkboxStyle" v-model="inspUsing" />미사용
                </label>
              </div>
            </div>
            <div class="flex items-center mb-2 w-full">
              <div :class="labelStyle" class="w-[100px]">검사유형</div>
              <div class="flex gap-10">
                <label :class="labelStyle">
                  <input
                    type="radio"
                    name="inspMode"
                    class="checkboxStyle"
                    value="range"
                    v-model="inspMode"
                  />
                  <span>범위</span>
                </label>
                <label :class="labelStyle">
                  <input
                    type="radio"
                    name="inspMode"
                    class="checkboxStyle"
                    value="sensory"
                    v-model="inspMode"
                  />
                  <span>관능</span>
                </label>
              </div>
            </div>
            <div class="flex mb-2">
              <label :class="labelStyle" class="w-[120px]" for="inspDesc"> 검사방법 </label>
              <textarea
                placeholder="검사방법에 대해서 작성하세요"
                rows="4"
                :class="textareaStyle"
                class=""
                id="inspDesc"
                v-model="inspDesc"
              ></textarea>
            </div>
            <div class="flex mb-4">
              <label :class="labelStyle" class="w-[120px]" for="inspFile">파일첨부 </label>
              <div class="w-full">
                <input
                  type="file"
                  :key="fileInputKey"
                  :class="fileStyle"
                  id="inspFile"
                  @change="onFileChange"
                  ref="fileInputRef"
                />
                <!-- 수정 모드에서 기존 파일(새 업로드 없을 때) -->
                <div v-if="existingFileUrl" class="mt-2 text-sm">
                  <a
                    target="_blank"
                    class="underline text-gray-500"
                    :href="`/uploads/${encodeURIComponent(existingFileName)}`"
                    :download="existingFileName"
                  >
                    {{ existingFileName }}
                  </a>
                </div>
              </div>
            </div>
            <hr class="" />
            <div class="flex justify-between items-center mt-4 mb-4">
              <h3>검사대상조회</h3>
              <button
                type="button"
                @click="openModal"
                class="btn-common btn-color btn-insp-target-search"
              >
                검사대상조회
              </button>
            </div>
            <InspTargetSelectModal
              :visible="isModalOpen"
              @close="closeModal"
              @checked="onInspChecked"
            />
            <DataTable
              :value="inspTarget"
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
                field="t_id"
                header="자재/제품ID"
                :pt="{ columnHeaderContent: 'justify-center' }"
                bodyStyle="text-align: center"
              />
              <Column
                field="t_name"
                header="자재/제품명"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_type_name"
                header="품목구분"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_spec"
                header="규격"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_unit"
                header="단위"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column field="t_del" header="삭제" :pt="{ columnHeaderContent: 'justify-center' }">
                <!-- 스코프드 슬롯(scoped slot)
                  <template #body="slotProps"> slotProps.data로 접근
                  Destructuring -> { data } 
                -->
                <template #body="{ data }">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-trash"
                      variant="outlined"
                      class="p-button-text p-button-danger p-button-sm"
                      style="width: 20px; height: 15px; text-align: center"
                      @click="targetDel(data.t_id)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>

            <hr />
            <h3 class="mt-4 mb-3">검사내용</h3>
            <!-- 범위 -->
            <div v-if="inspMode == 'range'">
              <div class="flex items-center gap-4 mb-3">
                <label :class="labelStyle" class="w-[120px]"> 최소범위 </label>
                <div class="flex gap-2 w-full">
                  <input
                    type="text"
                    :class="inputStyle"
                    v-model="minValue"
                    placeholder="숫자를 입력하세요 (소수 둘째자리까지 입력 가능)"
                    @input="(e: Event) => (minValue = sanitizeDecimal(e))"
                    required
                  />
                  <div class="relative z-20 bg-transparent w-1/2">
                    <select :class="selectStyle" v-model="minSpec">
                      <option value="R1" selected>이상</option>
                      <option value="R2">초과</option>
                    </select>
                    <span
                      class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
                    >
                      <svg
                        class="stroke-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                          stroke=""
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center mb-3 gap-4">
                <label :class="labelStyle" class="w-[120px]"> 최대범위 </label>
                <div class="flex gap-2 w-full">
                  <input
                    type="text"
                    :class="inputStyle"
                    v-model="maxValue"
                    placeholder="숫자를 입력하세요 (소수 둘째자리까지 입력 가능)"
                    @input="(e: Event) => (maxValue = sanitizeDecimal(e))"
                    required
                  />
                  <div class="relative z-20 bg-transparent w-1/2">
                    <select :class="selectStyle" v-model="maxSpec">
                      <option value="R3" selected>이하</option>
                      <option value="R4">미만</option>
                    </select>
                    <span
                      class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
                    >
                      <svg
                        class="stroke-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                          stroke=""
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center mb-4 gap-4">
                <label :class="labelStyle" class="w-[120px]">단위</label>
                <input type="text" :class="inputStyle" class="w-3/4" v-model="unit" required />
              </div>
            </div>
            <!-- 관능 -->
            <div v-if="inspMode == 'sensory'">
              <div class="rounded-lg mb-2" style="border: 1px solid #dedede; padding: 15px">
                <!-- 점수 -->
                <div class="flex items-center mb-2">
                  <div :class="labelStyle" class="w-[120px]">최고점수</div>
                  <label :class="labelStyle" class="mr-[20px] text-sm">
                    <input
                      type="radio"
                      class="checkboxStyle"
                      name="tScore"
                      :value="5"
                      v-model="scoreMax"
                    />5점
                  </label>
                  <label :class="labelStyle" class="mr-[20px] text-sm">
                    <input
                      type="radio"
                      class="checkboxStyle"
                      name="tScore"
                      :value="10"
                      v-model="scoreMax"
                    />10점
                  </label>
                </div>
                <div class="mb-3">
                  <div :class="labelStyle" class="w-[120px] mb-2">채점기준 설정</div>
                  <!-- 점수 선택시 변경  -->
                  <div v-for="(tscore, idx) in scoreSet" :key="idx">
                    <label :class="labelStyle" class="flex items-center">
                      <span :class="labelStyle" class="w-[80px] text-sm">{{ tscore }} 점</span>
                      <input
                        type="text"
                        :class="inputStyle"
                        class="w-full"
                        v-model="scoreDesc[tscore]"
                      />
                    </label>
                  </div>
                </div>
                <div class="flex gap-2">
                  <div :class="labelStyle" class="w-[200px]">합격 기준점수</div>
                  <input
                    type="text"
                    :class="inputStyle"
                    placeholder="숫자를 입력하세요 (소수 둘째자리까지 입력가능)"
                    v-model="passScore"
                    @input="(e: Event) => (passScore = sanitizeDecimal(e))"
                    @blur="validatePassScoreOnBlur"
                    required
                  />
                  <div class="relative z-20 bg-transparent w-1/2">
                    <select :class="selectStyle" v-model="passSpec">
                      <option value="R1">이상</option>
                      <option value="R2">초과</option>
                    </select>
                    <span
                      class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
                    >
                      <svg
                        class="stroke-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                          stroke=""
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div class="rounded-lg mb-2" style="border: 1px solid #dedede; padding: 15px">
                <button
                  type="button"
                  class="btn-common btn-color"
                  style="margin: 0"
                  @click="addQuest"
                >
                  질문추가
                </button>
                <div v-for="(q, idx) in questions" :key="q.id" class="flex items-center mt-2 gap-2">
                  <label :class="labelStyle" class="w-[80px]">질문 {{ idx + 1 }}</label>
                  <input type="text" :class="inputStyle" v-model="q.text" required />
                  <button
                    type="button"
                    @click="removeQuest(q.id)"
                    class="w-[30px] rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs flex justify-center cursor-pointer hover:bg-gray-200"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
          </form>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped>
.checkboxStyle {
  accent-color: #3e5879;
  border: 1px solid #eee;
  margin-right: 8px;
  cursor: pointer;
}
.btn-insp-target-search {
  width: 150px;
}
h3 {
  font-weight: 500;
  color: #222;
}
</style>
