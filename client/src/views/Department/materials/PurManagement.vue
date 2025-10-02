<script setup>
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import InputText from 'primevue/inputtext'
import flatPickr from 'vue-flatpickr-component'
import sysdate from 'moment'
import 'flatpickr/dist/flatpickr.css'
import '@/assets/common.css'
import { ref } from 'vue'
import InputNumber from 'primevue/inputnumber'

const makeDates = ref(null)
const currentPageTitle = ref('발주관리')

const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
}

const purChase = ref([
  {
    pur_code: 'BAL-001',
    pur_name: '20250930쌀발주',
    bcnc_code: 2001,
    bcnc_name: '농협',
    pur_date: sysdate().format('YYYY-MM-DD'),
    receipt_date: '2025-10-30',
    emp_name: '정지웅',
    remark: '쌀 많이 주세요~~',
  },
])

const purChaseMat = ref([
  {
    mat_code: 'MAT-001',
    mat_name: '쌀',
    stock_qty: 500,
    safe_stock: 200,
    pur_qty: 1000,
    MAT_SPEC: '20kg',
    MAT_UNIT: '포대',
  },
  {
    mat_code: 'MAT-002',
    mat_name: '밀가루',
    stock_qty: 300,
    safe_stock: 100,
    pur_qty: 500,
    MAT_SPEC: '20kg',
    MAT_UNIT: '포대',
  },
])

const selectedbox = ref([])

const deleteSelectedRows = () => {
  purChaseMat.value = purChaseMat.value.filter((item) => !selectedbox.value.includes(item))
  selectedbox.value = []
}
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="발주서">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-white btn-common">초기화</button>
            <button type="button" class="btn-white btn-common">조회</button>
            <button type="button" class="btn-color btn-common">등록/수정</button>
            <button type="button" class="btn-color btn-common">삭제</button>
          </div>
        </template>
        <template #body-content>
          <DataTable
            :value="purChase"
            class="custom-table"
            showGridlines
            @cell-edit-complete="
              (e) => {
                purChase[e.rowIndex][e.field] = e.newValue
              }
            "
          >
            <DataCol
              field="pur_code"
              header="발주코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_name"
              header="발주명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 200px"
            >
              <template #body="{ data, field }">
                <InputText
                  v-model="data[field]"
                  type="text"
                  class="dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </template>
            </DataCol>
            <DataCol
              field="bcnc_code"
              header="공급업체코드"
              style="text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_name"
              header="공급업체명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_date"
              header="발주일자"
              style="text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="receipt_date"
              header="입고일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data, field }">
                <div class="relative">
                  <flat-pickr
                    v-model="data[field]"
                    :config="flatpickrConfig"
                    style="text-align: center"
                    class="flatpickr-input dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="입고일자"
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
              </template>
            </DataCol>
            <DataCol
              field="emp_name"
              header="담당자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="remark"
              header="비고"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 300px"
            >
              <template #body="{ data, field }">
                <InputText
                  v-model="data[field]"
                  type="text"
                  class="dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </template>
            </DataCol>
          </DataTable>
        </template>
      </ComponentCard>

      <ComponentCard title="발주자재">
        <template #header-right>
          <div class="flex justify-end space-x-2">
            <button type="button" class="btn-white btn-common">행추가</button>
            <button type="button" class="btn-color btn-common" @click="deleteSelectedRows">
              행삭제
            </button>
          </div>
        </template>
        <template #body-content>
          <DataTable
            :value="purChaseMat"
            v-model:selection="selectedbox"
            showGridlines
            dataKey="mat_code"
            class="custom-table"
          >
            <DataCol selectionMode="multiple" headerStyle="width: 37px" />
            <DataCol
              field="mat_code"
              header="자재코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_name"
              header="자재명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="stock_qty"
              header="재고"
              style="text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="safe_stock"
              header="안전재고"
              style="text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_qty"
              header="발주수량"
              style="text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data, field }">
                <InputNumber
                  :modelValue="data[field]"
                  :min="1"
                  style="text-align: right"
                  class="cell-editor"
                  @update:modelValue="(val) => (data[field] = val < 1 ? 1 : val)"
                />
              </template>
            </DataCol>
            <DataCol
              field="MAT_SPEC"
              header="규격"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="MAT_UNIT"
              header="단위"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
          </DataTable>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped>
/* deep selector로 PrimeVue 내부 엘리먼트까지 도달시킴 */
::v-deep(.custom-table) table {
  table-layout: fixed !important;
}

/* td / th 패딩을 강제로 줄임 */
::v-deep(.custom-table) .p-datatable-thead > tr > th,
::v-deep(.custom-table) .p-datatable-tbody > tr > td {
  padding: 6px 6px !important; /* 필요하면 2px 6px 까지 줄여봐 */
  vertical-align: middle !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 행 높이 강제 고정 (포커스되어도 변하지 않도록) */
::v-deep(.custom-table) .p-datatable-tbody > tr {
  height: 40px !important; /* 더 작게 원하면 36px 등으로 조정 */
}

/* 편집용 InputText (cell-editor 클래스 사용) */
/* td의 padding이 줄어도 input이 셀 모두를 채우도록 box-sizing + height 처리 */
::v-deep(.custom-table) .cell-editor,
::v-deep(.custom-table) .p-datatable-tbody > tr > td .cell-editor,
::v-deep(.custom-table) .p-datatable .p-cell-editor input {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 6px 6px !important; /* td padding과 균형 맞춤 */
  box-sizing: border-box !important;
  line-height: 1 !important;
  font-size: 14px !important;
  border-radius: 4px !important; /* 원치 않으면 0으로 */
}

/* 포커스시 outline/box-shadow가 셀 크기 변경시키지 않게 */
::v-deep(.custom-table) .cell-editor:focus,
::v-deep(.custom-table) .p-datatable .p-cell-editor input:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* (옵션) PrimeVue 기본 클래스가 더 우선일 때를 대비한 최종 오버라이드 */
::v-deep(.custom-table) .p-datatable .p-inputtext {
  margin: 0 !important;
  height: 100% !important;
}

/* ✅ InputNumber wrapper 자체 스타일 */
::v-deep(.custom-table .p-inputnumber) {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

/* ✅ InputNumber 내부 input 요소 스타일 */
::v-deep(.custom-table .p-inputnumber .p-inputtext) {
  width: 100% !important;
  height: 100% !important;
  padding: 6px 6px !important;
  font-size: 14px !important;
  border-radius: 4px !important;
  box-sizing: border-box !important;
  text-align: right !important;
  margin: 0 !important;
}

/* ✅ 포커스 시 테두리 강조 (선택 사항) */
::v-deep(.custom-table .p-inputnumber .p-inputtext:focus) {
  box-shadow: none !important;
  outline: none !important;
}

::v-deep(.custom-table .p-inputnumber) {
  padding: 0 !important;
  margin: 0 !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
}

::v-deep(.custom-table .p-inputnumber-input) {
  padding: 6px 6px !important;
  height: 100% !important;
  box-sizing: border-box !important;
  text-align: right !important;
  margin: 0 !important;
  border-radius: 4px !important;
}

::v-deep(.custom-table .flatpickr-input) {
  border: 1px solid #ccc; /* 기본 테두리 */
  border-radius: 4px;
  padding: 6px;
  height: 100%;
  box-sizing: border-box;
}

::v-deep(.custom-table .flatpickr-input:focus) {
  outline: none !important;
}

[data-v-40f2626c] .custom-table .p-datatable-tbody > tr > td .p-inputnumber.cell-editor {
  padding: 0 !important;
}
</style>
