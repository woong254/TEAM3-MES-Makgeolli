<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import '@/assets/common.css'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 달력 import
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { Korean } from 'flatpickr/dist/l10n/ko.js'

import { useRouter } from 'vue-router'

const router = useRouter()

// 지시사항 검색 조건
interface SearchMakeOrder {
  prod_name: string // 제품명
  proc_name: string // 공정명
  make_order_start_date: string // 지시서 작성일
  make_order_end_date: string // 지시서 작성일
}

// 지시 상품들
interface MakeOrderDetail {
  no: number // 선택을 위한 임의 번호
  mkd_no: number
  mk_ord_no: string // 지시코드
  writing_date: string // 지시날짜
  mk_name: string // 지시명
  prod_code: string // 제품코드
  prod_name: string // 제품명
  prod_spec: string // 제품규격
  comncode_dtnm: string // 관리단위
  mk_num: number // 생산수량, 초기값 100에 맞춰 number 타입으로 설정
  seq_no: number // 우선순위 -> 공정 순서
  proc_id: string // 공정코드
  proc_name: string // 공정명
  total_inpt_qty: string // 실적상태
  inpt_qty: number
  remaining_qty: number // 잔여수량
  total_input: number
}

interface ChooseEquip {
  equip_code: string // 설비 코드
  equip_name: string // 설비명
  comncode_dtnm: string // 설비상태
}

interface ChooseEmp {
  emp_id: string // 사원번호
  emp_name: string // 사원명
}

// 검색 조건 초기화
const searchMakeOrder = ref<SearchMakeOrder>({
  prod_name: '',
  proc_name: '',
  make_order_start_date: '',
  make_order_end_date: '',
})

// 목록 상태
const makeRows = ref<MakeOrderDetail[]>([])
const equipRows = ref<ChooseEquip[]>([])
const empRows = ref<ChooseEmp[]>([])

// 선택 상태
const selectMake = ref<MakeOrderDetail | null>(null)
const selectEquip = ref<ChooseEquip | null>(null)
const selectEmp = ref<ChooseEmp | null>(null)

// 지시일 범위 시작
const startDateRange = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  maxDate: searchMakeOrder.value.make_order_end_date,
  locale: Korean,
}))

// 지시일 범위 끝
const endDateRange = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  minDate: searchMakeOrder.value.make_order_start_date,
  locale: Korean,
}))

const state = ref({
  selected: null as MakeOrderDetail | null,
})

// const prevSelectedNo = ref<number | null>(null)

// 선택한 지시건이 가진 공정명
const selectProcName = (e: { data: MakeOrderDetail }) => {
  const item = e.data

  // 이전 선택과 다를 때만 초기화하고 싶다면 조건 추가
  if (!state.value.selected || state.value.selected.mk_ord_no !== item.mk_ord_no) {
    resetInputsAndSelections()
  }

  state.value = { ...state.value, selected: item }
  selectMake.value = item

  void onRowSelectEquip(item.proc_name)
}

const resetInputsAndSelections = () => {
  // 투입수량 초기화
  // makeRows.value = makeRows.value.map((row) => ({
  //   ...row,
  // }))
  // makeRows 배열 자체를 초기화하는 것은 데이터 유실을 가져올 수 있으므로
  // 투입수량 초기화가 필요하다면 forEach를 통해 inpt_qty를 0으로 설정하거나,
  // 현재 로직에서는 reset을 막는게 더 합리적입니다. (기존 코드 주석 처리)

  // 선택 상태 초기화
  // selectMake.value = null // 이 부분은 PrimeVue가 처리함
  selectEquip.value = null
  equipRows.value = []
}

const equipError = ref<string | null>(null)

// 선택한 지시건을 기준으로 사용 가능한 설비 조회
const onRowSelectEquip = async (procName: string) => {
  try {
    isEquipLoading.value = true
    equipError.value = null
    const res = await axios.get('/api/prodOrdManage/equipments', { params: { procName } })
    equipRows.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error(e)
    equipRows.value = []
    equipError.value = '설비를 불러오지 못했습니다.'
  } finally {
    isEquipLoading.value = false
  }
}

// 최초 로드
onMounted(async () => {
  const res = await axios.get('/api/prodOrdManage')
  makeRows.value = res.data.makeRows ?? []
  empRows.value = res.data.empRows ?? []

  // 두번째 공정부터 이전 단계의 합격량이 잔여수량으로 보이게 함
  for (let i = 0; i < makeRows.value.length; i++) {
    const item = makeRows.value[i]
    if (item.seq_no > 1) {
      try {
        // 현재 공정에서의 투입 수량 total_input
        const totalInput = await axios.post('/api/nowProcessInputQty', {
          mk_list: item.mkd_no,
          seq_no: item.seq_no,
        })
        item.total_input = totalInput.data.success ? Number(totalInput.data.inputQty || 0) : 0

        // 다음 공정의 최대 지시 수량을 위한 mk_num
        const apiRes = await axios.post('/api/nextProcessMaxQty', {
          mk_list: item.mkd_no,
          seq_no: item.seq_no,
        })
        item.mk_num = apiRes.data.success ? Number(apiRes.data.maxQty || 0) : 0
      } catch (err) {
        console.error('공정 mk_num 자동 세팅 오류:', err)
        item.mk_num = 0
      }
    }
  }

  if (selectMake.value && !isSelectableRow(selectMake.value)) {
    selectMake.value = null
  }
})

const isEquipLoading = ref(false)
// 저장
const isSubmitting = ref(false)

// 유효성 검사
const validateBeforeGoToProcess = () => {
  if (!selectMake.value) {
    alert('지시 목록에서 제품(행)을 선택하세요.')
    return false
  }

  // --------------------------------------------------------------------------------------
  // [수정 위치 1] 투입 수량 유효성 검사 로직 수정
  // selectMake.value는 이미 makeRows.value의 해당 객체를 참조하며,
  // inpt_qty 입력 시 onInputInptQty 함수에 의해 실시간으로 업데이트됩니다.
  // 따라서 별도로 makeRows.value에서 다시 찾을 필요 없이 selectMake.value의 inpt_qty를 확인합니다.
  // --------------------------------------------------------------------------------------
  const currentInptQty = selectMake.value.inpt_qty
  if (!currentInptQty || currentInptQty <= 0) {
    // 투입 수량이 0보다 커야 함을 명시
    alert('투입수량을 0보다 크게 작성하세요.')
    return false
  }
  // --------------------------------------------------------------------------------------

  if (!selectEquip.value) {
    alert('설비를 선택하세요.')
    return false
  }

  if (!selectEmp.value) {
    alert('작업자를 선택하세요.')
    return false
  } // inpt_qty는 이미 최신 값이므로 이 코드는 제거 또는 주석 처리
  // selectMake.value.inpt_qty = currentInptQty

  return true
}

const goToProcess = async () => {
  // 1. 중복 클릭 방지 및 상태 확인
  if (isSubmitting.value) return // 2. 유효성 검사
  if (!validateBeforeGoToProcess()) return

  const make = selectMake.value as MakeOrderDetail
  const equip = selectEquip.value as ChooseEquip
  const emp = selectEmp.value as ChooseEmp // 공정 제어를 시작하기 위해 서버로 전송할 데이터 페이로드

  const payload = {
    mkd_no: make.mkd_no,
    prod_code: make.prod_code,
    inpt_qty: make.inpt_qty, // 현 투입량 (최신값)
    equip_code: equip.equip_code, // 설비코드
    emp_id: emp.emp_id, // 사원번호
    proc_id: make.proc_id,
    mk_ord_no: make.mk_ord_no,
    seq_no: make.seq_no, // 우선순위
    now_procs: make.proc_name, // 공정명
  }

  console.log('Process Start Payload:', payload)

  try {
    isSubmitting.value = true // 버튼 텍스트 '이동 중'으로 변경
    // 3. 서버 호출: 공정 시작 상태를 서버에 등록하므로 POST 요청이 적절합니다.
    // (서버 API는 이 요청을 처리하고, 성공 시 200/201 응답을 주어야 합니다)

    const res = await axios.post('/api/startProcess', payload)
    console.log('API Response (Process Started):', res) // API 호출 성공 시에만 페이지 이동
    router.push({
      path: '/processControl',
      query: {
        emp_id: emp.emp_id,
        equip_code: equip.equip_code,
        mkd_no: make.mkd_no, // 다음 페이지에서 데이터를 조회하는 데 필요한 최소한의 정보를 쿼리로 전달
        now_procs: payload.now_procs,
      },
    }) // 페이지 이동에 성공하면 이 컴포넌트는 언마운트되므로 isSubmitting을 false로 되돌릴 필요가 없습니다.
  } catch (err) {
    // 4. 에러 처리: API 실패 시 isSubmitting을 false로 되돌려 버튼을 활성화하고 사용자에게 오류 알림
    console.error('공정 시작 API 오류:', err)
    alert('공정 제어 시작 요청 실패. 서버 응답을 확인하세요.')
    isSubmitting.value = false // 에러 발생 시 버튼 상태 복구
  } // finally 블록은 성공 시에는 불필요하지만, 만약 API가 응답 후 router.push가 실패할 경우를 대비하여
  // isSubmitting.value = false 를 남겨둘 수도 있지만, 여기서는 catch에서 명시적으로 처리했습니다.
}

// 지시 가능 수량
const onInputInptQty = (data: MakeOrderDetail) => {
  const max = Number(data.mk_num || 0)
  const cur = Number(data.inpt_qty || 0)

  const newInptQty = Math.min(max, Math.max(0, cur))

  // 2. makeRows 배열에서 해당 행의 인덱스를 찾습니다.
  const index = makeRows.value.findIndex((row) => row.mkd_no === data.mkd_no)

  console.log(index)

  if (index !== -1) {
    // 3. 새로운 inpt_qty를 가진 새로운 객체를 생성합니다.
    const updatedRow = {
      ...makeRows.value[index], // 기존 데이터 복사
      inpt_qty: newInptQty, // 새로운 inpt_qty 할당
    }

    // 4. makeRows 배열의 요소를 새로운 객체로 교체하여 PrimeVue/Vue에 변경을 명시적으로 알립니다.
    makeRows.value[index] = updatedRow

    // 5. 현재 선택된 행이 수정된 행이라면, selectMake.value도 동기화합니다.
    if (selectMake.value && selectMake.value.mk_ord_no === updatedRow.mk_ord_no) {
      // Vue의 반응성을 유지하며 값을 할당해야 합니다.
      // selectMake.value는 makeRows의 객체를 참조할 수 있으므로,
      // makeRows[index] = updatedRow 이후 이 코드는 사실상 불필요할 수 있지만,
      // 안전을 위해 명시적으로 동기화합니다.
      selectMake.value.inpt_qty = newInptQty
    }
  }
}

// mk_num: 문자 0 -> 숫자 0으로 변환
const isSelectableRow = (data: MakeOrderDetail): boolean => {
  const mkNum = Math.max(0, Number(data.mk_num || 0) - Number(data.total_input || 0))
  return mkNum > 0 // false 반환
}

// comncode_dtnm가 있는 행은 비활성화
const rowClassHook = (data: MakeOrderDetail) => {
  return !isSelectableRow(data) ? 'disabled-row' : ''
}

const currentPageTitle = ref('공정 실적 관리')

const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-1 mt-2">
      <ComponentCard title="지시제품검색">
        <template #header-right>
          <div class="">
            <button type="button" class="btn-white btn-common">초기화</button>
            <button type="button" class="btn-color btn-common">조회</button>
          </div>
        </template>
        <template #body-content>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label :class="labelStyle"> 제품명 </label>
              <input type="text" :class="inputStyle" required />
            </div>
            <div>
              <label :class="labelStyle"> 공정명 </label>
              <input type="text" :class="inputStyle" required />
            </div>
            <div>
              <label :class="labelStyle"> 지시날짜 </label>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div class="relative w-45">
                  <flat-pickr
                    v-model="searchMakeOrder.make_order_start_date"
                    :config="startDateRange"
                    class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="범위 시작"
                    type="date"
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
                <span>ㅡ</span>
                <div class="relative w-45">
                  <flat-pickr
                    v-model="searchMakeOrder.make_order_end_date"
                    :config="endDateRange"
                    class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="범위 끝"
                    type="date"
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
      <form @submit.prevent="" action="">
        <!-- 지시 제품 선택 -->
        <div class="space-y-5 sm:space-y-6 mt-2">
          <ComponentCard title="작업지시목록">
            <template #header-right>
              <div class="flex items-center">
                <button
                  type="button"
                  class="btn-color btn-common"
                  @click="goToProcess"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? '이동 중' : '공정 제어' }}
                </button>
              </div>
            </template>
            <template #body-content>
              <div ref="tableWrapper" class="order-table-wrapper h-63">
                <DataTable
                  dataKey="no"
                  tableStyle="max-width: 100%;"
                  class="fixed-data dense-table"
                  showGridlines
                  scrollable
                  scrollHeight="250px"
                  editMode="cell"
                  size="small"
                  :value="makeRows"
                  selectionMode="single"
                  @row-select="selectProcName"
                  v-model:selection="selectMake"
                  :rowSelectable="isSelectableRow"
                  :rowClass="rowClassHook"
                >
                  <template #empty>
                    <div class="text-center">지시건이 없습니다</div>
                  </template>

                  <Column
                    selectionMode="single"
                    headerStyle="width: 1%"
                    field="no"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                  />

                  <Column
                    field="mk_ord_no"
                    header="작업지시코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                    headerStyle="width: 10%"
                  />
                  <Column
                    field="writing_date"
                    header="지시일자"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                    headerStyle="width: 7%"
                  />
                  <Column
                    field="mk_name"
                    header="작업지시명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 10%"
                  />
                  <Column
                    field="prod_code"
                    header="제품코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 10%"
                  />
                  <Column
                    field="prod_name"
                    header="제품명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 15%"
                  />
                  <Column
                    field="prod_spec"
                    header="규격"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 5%"
                  />
                  <Column
                    field="comncode_dtnm"
                    header="단위"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 5%"
                  />

                  <Column
                    field="inpt_qty"
                    header="투입수량"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: right"
                    headerStyle="width: 7%"
                  >
                    <template #body="{ data }">
                      <template v-if="Number(data.mk_num || 0) > 0">
                        <input
                          v-model.number="data.inpt_qty"
                          type="number"
                          :min="0"
                          :max="Number(data.mk_num || 0)"
                          :class="baseInputClass"
                          style="text-align: right; height: 2rem"
                          @input="onInputInptQty(data)"
                        />
                      </template>
                      <template v-else>
                        <span style="display: block; text-align: center">-</span>
                      </template>
                    </template>
                  </Column>
                  <Column
                    field="remaining_qty"
                    header="잔여수량"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: right"
                    headerStyle="width: 5%"
                  >
                    <template #body="{ data }">
                      <div style="text-align: right" :min="0" :max="Number(data.mk_num || 0)">
                        {{ Math.max(0, Number(data.mk_num || 0) - Number(data.total_input || 0)) }}
                      </div>
                    </template>
                  </Column>

                  <Column
                    field="seq_no"
                    header="공정순서"
                    style="text-align: right"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="dense-table"
                    headerStyle="width: 5%"
                  />
                  <Column
                    field="proc_id"
                    header="공정코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 7%"
                  />
                  <Column
                    field="proc_name"
                    header="공정명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 7%"
                  />
                  <Column
                    field="total_inpt_qty"
                    header="실적상태"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 7%"
                  />
                </DataTable>
              </div>
            </template>
          </ComponentCard>
        </div>
        <div class="flex gap-2 mt-2 width-full">
          <!-- 설비 선택 -->
          <ComponentCard title="설비 선택" className="shadow-sm w-3/5">
            <template #body-content>
              <div ref="tableWrapper" class="order-table-wrapper h-47">
                <DataTable
                  dataKey="equip_code"
                  tableStyle="max-width: 100%;"
                  class="fixed-data dense-table"
                  showGridlines
                  scrollable
                  scrollHeight="180px"
                  editMode="cell"
                  size="small"
                  :value="equipRows"
                  v-model:selection="selectEquip"
                >
                  <template #empty>
                    <div class="text-center">
                      {{
                        isEquipLoading
                          ? '설비를 불러오는 중...'
                          : equipError || '지시 목록을 선택해주세요'
                      }}
                    </div>
                  </template>
                  <Column
                    selectionMode="single"
                    headerStyle="width: 5%"
                    field="no"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                  />
                  <Column
                    field="equip_code"
                    header="설비코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                  />
                  <Column
                    field="equip_name"
                    header="설비명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                  />
                  <Column
                    field="comncode_dtnm"
                    header="설비상태"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                  />
                </DataTable>
              </div>
            </template>
          </ComponentCard>
          <!-- 작업자 선택 -->
          <ComponentCard title="작업자 선택" className="shadow-sm w-2/5">
            <template #body-content>
              <div ref="tableWrapper" class="order-table-wrapper h-47">
                <DataTable
                  dataKey="emp_id"
                  tableStyle="max-width: 100%;"
                  class="fixed-data dense-table"
                  showGridlines
                  scrollable
                  scrollHeight="180px"
                  editMode="cell"
                  size="small"
                  :value="empRows"
                  v-model:selection="selectEmp"
                >
                  <template #empty>
                    <div class="text-center">사원이 없습니다</div>
                  </template>
                  <Column
                    selectionMode="single"
                    headerStyle="width: 5%"
                    field="no"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                  />

                  <Column
                    field="emp_id"
                    header="사원번호"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                  />
                  <Column
                    field="emp_name"
                    header="사원명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                  />
                </DataTable>
              </div>
            </template>
          </ComponentCard>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<style scoped>
:deep(.dense-table .p-datatable-thead > tr > th) {
  padding: 0.25rem 0.5rem;
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
}
:deep(.dense-table .p-datatable-tbody > tr > td) {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
  line-height: 1.2;
}
/* 헤더 높이 추가 축소 시 */
:deep(.dense-table .p-datatable-header) {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
}

:deep(.disabled-row) {
  opacity: 0.6; /* 불투명도 흐릿하게 만드는거 */
  pointer-events: none; /* 클릭 선택 못하게 */
  user-select: none; /* 사용자가 드래그 하지 못하게 */
}
:deep(.disabled-row .p-radiobutton) {
  /* 비활성화 될경우 체크박스 배경색 */
  background-color: #f5f5f5;
  /* 비활성화 될경우 체크박스 선색 */
  border-color: #ccc;
}
</style>
