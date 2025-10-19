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

const prevSelectedNo = ref<number | null>(null)

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
  makeRows.value = makeRows.value.map((row) => ({
    ...row,
  }))
  // 선택 상태 초기화
  selectMake.value = null
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

  const selectedRow = makeRows.value.find((row) => row.mk_ord_no === selectMake.value!.mk_ord_no)
  if (!selectedRow || !selectedRow.inpt_qty) {
    alert('선택한 지시의 투입수량을 작성하세요')
    return false
  }

  if (!selectEquip.value) {
    alert('설비를 선택하세요.')
    return false
  }

  if (!selectEmp.value) {
    alert('작업자를 선택하세요.')
    return false
  }

  // 최종 selectMake에도 반영
  selectMake.value.inpt_qty = selectedRow.inpt_qty

  return true
}

const goToProcess = async () => {
  if (isSubmitting.value) return
  if (!validateBeforeGoToProcess()) return

  const make = selectMake.value as MakeOrderDetail
  const equip = selectEquip.value as ChooseEquip
  const emp = selectEmp.value as ChooseEmp

  const makePayload = {
    mkd_no: make.mkd_no, // 1. 지시서 상세 목록
    prod_code: make.prod_code, // 4. 제품코드
    inpt_qty: make.inpt_qty, // 5. 현투입량
  }

  const equipPayload = {
    equip_code: equip.equip_code, // 2. 설비코드
  }

  const empPayload = {
    emp_id: emp.emp_id, // 3. 사원번호
  }

  console.log(makePayload)
  console.log(equipPayload)
  console.log(empPayload)

  try {
    isSubmitting.value = true
    const res = await axios.get('/api/goToProcess', {
      params: {
        makePayload: JSON.stringify(makePayload),
        equipPayload: JSON.stringify(equipPayload),
        empPayload: JSON.stringify(empPayload),
      },
    })
    router.push({
      path: '/processControl',
      query: { emp_id: emp.emp_id },
    })
    console.log(res)
  } catch (err) {
    console.error(err)
    alert('등록 실패')
  } finally {
    isSubmitting.value = false
  }
}

//preitteir 오류 input 빼내기
const onInputInptQty = (data: MakeOrderDetail) => {
  const max = Number(data.mk_num || 0)
  const cur = Number(data.inpt_qty || 0)

  // 1) 입력값을 0~max 범위로 보정
  data.inpt_qty = Math.min(max, Math.max(0, cur))

  // 2) 현재 선택행(selectMake)도 함께 동기화
  // 주의: <script setup>함수 내부에서는 ref는 .value로 접근
  if (selectMake.value && selectMake.value.mk_ord_no === data.mk_ord_no) {
    selectMake.value.inpt_qty = data.inpt_qty
  }
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
              <input
                type="text"
                :class="inputStyle"
                placeholder="제품 이름을 입력해주세요"
                required
              />
            </div>
            <div>
              <label :class="labelStyle"> 공정명 </label>
              <input type="text" :class="inputStyle" placeholder="공정을 입력해주세요" required />
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
                    style="text-align: right"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 5%"
                  />
                  <Column
                    field="comncode_dtnm"
                    header="단위"
                    style="text-align: right"
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
                      <input
                        v-model.number="data.inpt_qty"
                        type="number"
                        :min="0"
                        :max="Number(data.mk_num || 0)"
                        :class="baseInputClass"
                        style="text-align: right; height: 2rem"
                        @input="onInputInptQty(data)"
                        placeholder="투입"
                      />
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
                      <div style="text-align: right">
                        {{ Math.max(0, Number(data.mk_num || 0) - Number(data.inpt_qty || 0)) }}
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

<style>
.dense-table .p-datatable-thead > tr > th {
  padding: 0.25rem 0.5rem;
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
}
.dense-table .p-datatable-tbody > tr > td {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
  line-height: 1.2;
}
/* 헤더 높이 추가 축소 시 */
.dense-table .p-datatable-header {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
}
</style>
