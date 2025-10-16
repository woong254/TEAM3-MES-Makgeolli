<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import '@/assets/common.css'
import { ref, computed } from 'vue'

// 달력 import
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { Korean } from 'flatpickr/dist/l10n/ko.js'
import { ChipPassThroughAttributes } from 'primevue/chip'

// 지시사항 검색 조건
interface SearchMakeOrder {
  prod_name: string // 제품명
  proc_name: string // 공정명
  make_order_start_date: string // 지시서 작성일
  make_order_end_date: string // 지시서 작성일
}

// 지시 상품들
interface MakeOrderDetail {
  make_code: string // 지시코드
  make_order_date: string // 지시날짜
  make_name: string // 지시명
  prod_code: string // 제품코드
  prod_name: string // 제품명
  prod_spec: string // 제품규격
  prod_unit: string // 관리단위
  make_qty: number // 생산수량, 초기값 100에 맞춰 number 타입으로 설정
  make_priority: number // 우선순위 -> 공정 순서
  flow_id: string // 공정코드
  proc_id: string // 공정명
}

interface ChooseEquip {
  no: number // 순서
  equip_code: string // 설비 코드
  equip_name: string // 설비명
  equip_status: string // 설비상태
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

// 라디오 버튼으로 선택한 값 저장하는 배열
const makeRows = ref<MakeOrderDetail[]>([])
const equipRows = ref<ChooseEquip[]>([])
const empRows = ref<ChooseEmp[]>([])

// 라디오 버튼
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

const currentPageTitle = ref('공정제어')

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
      <ComponentCard title="지시내용">
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
              <label :class="labelStyle"> 설비명 </label>
              <input type="text" :class="inputStyle" placeholder="공정을 입력해주세요" required />
            </div>
            <div>
              <label :class="labelStyle"> 작업자명 </label>
              <input type="text" :class="inputStyle" placeholder="공정을 입력해주세요" required />
            </div>
            <div>
              <label :class="labelStyle"> 작업지시일 </label>
              <div>
                <div>
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
              </div>
            </div>
          </div>
        </template>
      </ComponentCard>
      <form @submit.prevent="" action="">
        <div class="flex gap-2 mt-2 width-full">
          <!-- 설비 선택 -->
          <ComponentCard title="자재투입" className="shadow-sm w-3/5">
            <template #body-content> </template>
          </ComponentCard>
          <!-- 작업자 선택 -->
          <ComponentCard title="작업자 선택" className="shadow-sm w-2/5">
            <template #body-content>
              <div ref="tableWrapper" class="order-table-wrapper h-47">
                <DataTable
                  dataKey="no"
                  tableStyle="max-width: 100%;"
                  class="fixed-data"
                  showGridlines
                  scrollable
                  scrollHeight="250px"
                  editMode="cell"
                  size="small"
                  :value="empRows"
                  v-model:selection="selectEmp"
                >
                  <Column selectionMode="single" />
                  <Column
                    field="emp_id"
                    header="사원번호"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                  />
                  <Column
                    field="string"
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
