<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import DataTable from 'primevue/datatable' // datatable 컴포넌트 import
import Column from 'primevue/column'
// import InputText from 'primevue/inputtext' // PrimeVue InputText 컴포넌트 import
import { ref, computed, onMounted } from 'vue' // computed import 추가
// flatPickr 달력
import flatPickr from 'vue-flatpickr-component' // flatPickr 달력 컴포넌트 import
import 'flatpickr/dist/flatpickr.css' // flatPickr 달력 css import
import { Korean } from 'flatpickr/dist/l10n/ko.js' // 달련 한글 import
import '@/assets/common.css' // 한솔누나 css import
import axios from 'axios' // axios 연결

const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

// 주문서관리-주문서조회검색 검색input 인터페이스
interface SearchCondition {
  insp_name: string
  prod_name: string
  ep_start_date: string // 유통기한 시작일
  ep_end_date: string // 유통기한 시작일
  Is: string // 주문완료
  Pass: string // 검사완료
}
// 주문제품 테이블 인터페이스 (Product 인터페이스를 대체)
interface OrderItem {
  insp_id: string
  insp_name: string
  prod_code: string
  prod_name: string
  prod_spec: string
  prod_unit: string
  pass_qty: number
  epep_dt: string
  ep_lot: string
  comncode_dtnm: string
  remark: string
}
// 입고할때 내보내는 값들
interface EpIsRequest {
  insp_id: string
  prod_code: string
  pass_qty: number
  epep_dt: string
  remark: string
}

// 선택한 제품들
const selectedProducts = ref<OrderItem[]>([])
// products ref에 OrderItem[] 타입을 명시적으로 지정
const products = ref<OrderItem[]>([])
// 주문서조회검색 input태그 데이터 초기값
const search = ref<SearchCondition>({
  insp_name: '',
  prod_name: '',
  ep_start_date: '', // 유통기한 시작일
  ep_end_date: '', // 유통기한 시작일
  Is: '', // 주문완료
  Pass: '', // 검사완료
})

// 페이지 타이틀
const currentPageTitle = ref('완제품입고관리')

// 유통기한 시작일 설정 (종료일이 있다면 maxDate 설정)
const epStartDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 종료일이 설정되어 있으면 해당 날짜를 최대 날짜로 설정하여 범위를 제한
  maxDate: search.value.ep_end_date,
  locale: Korean,
}))

// 유통기한 종료일 설정 (시작일이 있다면 minDate 설정)
const epEndDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 시작일이 설정되어 있으면 해당 날짜를 최소 날짜로 설정하여 범위를 제한
  minDate: search.value.ep_start_date,
  locale: Korean,
}))

// 주문서 조회 검색 버튼 누르면 실행하는 함수
const submitSearchForm = () => {
  console.log(search.value)

  // 컴포넌트가 마운트될 때 주문서조회 데이터 가져오기
  getEpIsManage()
}

// 완제품 입고 관리 검색 조회 버튼 눌렀을때 데이터 가져오는 함수
const getEpIsManage = async () => {
  try {
    const result = await axios.get('/api/viewEpIsManage', {
      params: search.value,
    })
    const rows = result.data

    if (rows.length === 0) {
      alert('조회 결과가 없습니다.')
      products.value = []
      return
    }
    selectedProducts.value = []
    products.value = rows
    console.log('조회버튼 누르고 나오는 products.value 값:', products.value)
    // if (showAlert) alert('조회성공!')
  } catch (err) {
    console.error('getEpIsManage 오류:', err)
  }
}

// 주문서 조회 검색에 있는 초기화 버튼 누르면 실행되는 함수
const resetSearchForm = () => {
  search.value.prod_name = '' // v-model 값 초기화
  search.value.ep_start_date = ''
  search.value.ep_end_date = ''
  search.value.Is = ''
  search.value.Pass = ''
}

// 입고버튼 기능
const submitEpIs = async () => {
  const obj: EpIsRequest[] = selectedProducts.value.map((item) => ({
    insp_id: item.insp_id,
    prod_code: item.prod_code,
    pass_qty: item.pass_qty,
    epep_dt: item.epep_dt,
    remark: item.remark || '',
  }))
  console.log(obj)

  try {
    if (selectedProducts.value.length === 0) {
      alert('입고할 제품을 선택해주세요')
      return
    }
    // 저장
    const result = await axios.post('/api/insertEpIs', obj)
    const addRes = result.data

    if (!addRes.isSuccessed) {
      alert('입고가 이루어지지 않았습니다. 데이터를 확인해보세요.')
      return
    }
    if (addRes.isSuccessed) {
      alert('입고성공')
      getEpIsManage()
      rowUnselectHook()
      return
    }
  } catch (err) {
    console.error('추가 중 오류 발생', err)
    alert('서버 요청 중 오류가 발생했습니다.')
  }
}
// 전체선택 기본값 false
const selectAll = ref(false)
// comncode_dtnm가 없는 행 선택
const isSelectableRow = (row: OrderItem) => !row.comncode_dtnm || row.comncode_dtnm.trim() === ''

// comncode_dtnm가 있는 행은 비활성화
const rowClassHook = (row: OrderItem) => {
  return row.comncode_dtnm && row.comncode_dtnm.trim() !== '' ? 'disabled-row' : ''
}

// 전체 선택 변경
const selectAllChangeHook = (event: { checked: boolean }) => {
  selectAll.value = event.checked
  if (event.checked) {
    selectedProducts.value = products.value.filter(isSelectableRow)
  } else {
    selectedProducts.value = []
  }
}

// 한 행 선택 해제 시 전체 체크 해제
const rowUnselectHook = () => {
  selectAll.value = false
}

// 첫 화면에 바로 조회 되도록
onMounted(() => {
  getEpIsManage()
})
</script>
<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <form @submit.prevent="submitSearchForm" action="">
        <ComponentCard title="완제품 입고 관리 검색">
          <template #header-right>
            <div class="">
              <button type="button" class="btn-white btn-common" @click="resetSearchForm">
                초기화
              </button>
              <button type="button" class="btn-color btn-common" @click="submitSearchForm">
                조회
              </button>
            </div>
          </template>
          <template #body-content>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  검사명
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=""
                  v-model="search.insp_name"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  제품명
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=""
                  v-model="search.prod_name"
                  required
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  유통기한
                </label>
                <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <!-- 유통기한 시작일 -->
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="search.ep_start_date"
                      :config="epStartDateConfig"
                      class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder=""
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
                  <!-- 유통기한 종료일 -->
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="search.ep_end_date"
                      :config="epEndDateConfig"
                      class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder=""
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
              <div class="w-1/4">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  입고상태
                </div>
                <div class="flex items-center gap-3">
                  <label class="flex items-center text-sm text-gray-800 whitespace-nowrap">
                    <input
                      type="checkbox"
                      true-value="입고완료"
                      false-value=""
                      v-model="search.Is"
                      class="mr-1"
                    />입고완료
                  </label>
                  <label class="flex items-center text-sm text-gray-800 whitespace-nowrap">
                    <input
                      type="checkbox"
                      true-value="검사완료"
                      false-value=""
                      v-model="search.Pass"
                      class="mr-1"
                    />검사완료
                  </label>
                </div>
              </div>
            </div>
          </template>
        </ComponentCard>
      </form>
    </div>
    <form action="" id="submitEpIs" @submit.prevent="submitEpIs">
      <div class="space-y-5 sm:space-y-6 mt-2">
        <ComponentCard title="완제품 입고 관리">
          <template #header-right>
            <div class="flex items-center">
              <button type="submit" class="btn-color btn-common">입고</button>
            </div>
          </template>
          <template #body-content>
            <div ref="tableWrapper" class="order-table-wrapper h-120">
              <!-- :rowClass는 동적으로 css클래스를 적용하는거,  -->
              <!-- :select-all="selectAll" selectAll이 true면 전체 선택 체크박스가 체크된 상태로 표시 -->
              <!-- @select-all-change="selectAllChangeHook" 전체 선택 이벤트 발생할때, 전체 선택 시 비활성화 된 행빼고 선택하게 -->
              <!-- @row-unselect="rowUnselectHook" 전체선택된 상태에서 하나라도 행이 선택해제한다면 동시에 전체선택도 해제 -->
              <DataTable
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="insp_id"
                tableStyle="max-width: 100%;"
                selectionMode="multiple"
                :rowClass="rowClassHook"
                :select-all="selectAll"
                @select-all-change="selectAllChangeHook"
                @row-unselect="rowUnselectHook"
                showGridlines
                scrollable
                scrollHeight="480px"
                size="small"
                class="text-sm"
              >
                <template #empty>
                  <div class="text-center">조회를 먼저해주세요!</div>
                </template>
                <Column selectionMode="multiple" headerStyle="width: 1%" field="insp_id"></Column>
                <Column
                  field="insp_id"
                  header="검사ID"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 150px; text-align: center"
                ></Column>
                <Column
                  field="insp_name"
                  header="검사명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 250px"
                ></Column>
                <Column
                  field="prod_code"
                  header="제품코드"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 200px; text-align: center"
                ></Column>
                <Column
                  field="prod_name"
                  header="제품명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 200px"
                ></Column>
                <Column
                  field="prod_spec"
                  header="규격"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 50px; text-align: left"
                ></Column>
                <Column
                  field="prod_unit"
                  header="단위"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 80px"
                ></Column>
                <Column
                  field="pass_qty"
                  header="수량"
                  style="min-width: 80px; text-align: right"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                ></Column>
                <Column
                  field="epep_dt"
                  header="유통기한"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px; text-align: center"
                ></Column>
                <Column
                  field="ep_lot"
                  header="제품lot번호"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 200px; text-align: center"
                ></Column>
                <Column
                  field="comncode_dtnm"
                  header="입고상태"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px"
                ></Column>
                <Column
                  field="remark"
                  header="비고"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 150px"
                >
                  <template #body="{ data }">
                    <input v-model="data.remark" type="text" :class="baseInputClass" />
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </ComponentCard>
      </div>
    </form>
  </AdminLayout>
</template>

<style scoped>
input {
  height: 40px; /* input 높이 */
  line-height: 40px; /* line-height를 input 높이와 같게 */
  padding: 0 10px; /* 좌우 패딩 */
}
:deep(.disabled-row) {
  opacity: 0.6; /* 불투명도 흐릿하게 만드는거 */
  pointer-events: none; /* 클릭 선택 못하게 */
  user-select: none; /* 사용자가 드래그 하지 못하게 */
}
:deep(.disabled-row .p-checkbox-box) {
  /* 비활성화 될경우 체크박스 배경색 */
  background-color: #f5f5f5 !important;
  /* 비활성화 될경우 체크박스 선색 */
  border-color: #ccc !important;
}
</style>
