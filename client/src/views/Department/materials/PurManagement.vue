<script setup>
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import flatPickr from 'vue-flatpickr-component'
import Modal from '@/components/ui/Modal.vue'
import sysdate from 'moment'
import 'flatpickr/dist/flatpickr.css'
import '@/assets/common.css'
import { ref, watch } from 'vue'

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const currentPageTitle = ref('발주관리')
const isPurModalOpen = ref(false)
const isMatModalOpen = ref(false)
const isBcncModalOpen = ref(false)
const selectMat = ref([])
const selectPur = ref()
const selectModalMat = ref([])
const selectModalBcnc = ref()

// 값 확인용
watch(selectPur, (newVal) => {
  console.log('selectPur changed:', newVal)
})

const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: baseInputClass + ' text-center',
}
const deleteSelectedRows = () => {
  purChaseMat.value = purChaseMat.value.filter((item) => !selectMat.value.includes(item))
  selectMat.value = []
}

const handleCloseModal = () => {
  isPurModalOpen.value = false
  isMatModalOpen.value = false
  isBcncModalOpen.value = false
  selectModalMat.value = []
  selectPur.value = null
  selectModalBcnc.value = null
}

const purChase = ref([
  {
    pur_code: 'BAL-001',
    pur_name: '20250930쌀발주',
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

const modalPur = ref([
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
  {
    pur_code: 'BAL-002',
    pur_name: '202501003보리발주',
    bcnc_name: '삼성물산',
    pur_date: sysdate().format('YYYY-MM-DD'),
    receipt_date: '2025-11-25',
    emp_name: '박봉근',
    remark: '보리 넉넉하게 주세요',
  },
])

const modalMat = ref([
  {
    mat_code: 'MAT-001',
    mat_name: '쌀',
    stock_qty: 500,
    safe_stock: 200,
    MAT_SPEC: '20kg',
    MAT_UNIT: '포대',
  },
  {
    mat_code: 'MAT-002',
    mat_name: '밀가루',
    stock_qty: 300,
    safe_stock: 100,
    MAT_SPEC: '20kg',
    MAT_UNIT: '포대',
  },
])

const modalBcnc = ref([
  {
    bcnc_code: 2001,
    bcnc_name: '농협',
    bcnc_type: '농축산물',
  },
  {
    bcnc_code: 2002,
    bcnc_name: 'CJ제일제당',
    bcnc_type: '효모/첨가물',
  },
])
</script>

<!--발주서 컴포넌트-->

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="발주서">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-white btn-common">초기화</button>
            <button type="button" class="btn-white btn-common" @click="isPurModalOpen = true">
              조회
            </button>
            <button type="button" class="btn-color btn-common">등록/수정</button>
            <button type="button" class="btn-color btn-common">삭제</button>
          </div>
        </template>
        <template #body-content>
          <DataTable
            :value="purChase"
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
              header="발주서명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 200px; padding: 8px"
            >
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="text"
                  :class="baseInputClass"
                  placeholder="발주서명을 입력해주세요."
                />
              </template>
            </DataCol>
            <DataCol
              field="bcnc_name"
              header="공급업체명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 200px"
            >
              <template #body="{ data, field }">
                <div class="relative">
                  <input
                    v-model="data[field]"
                    type="text"
                    readonly
                    @click="isBcncModalOpen = true"
                    :class="[baseInputClass, 'pr-10']"
                  />
                  <span
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  >
                    <!-- 돋보기 SVG -->
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.6 3.6a7.5 7.5 0 0013.05 13.05z"
                      />
                    </svg>
                  </span>
                </div>
              </template>
            </DataCol>
            <DataCol
              field="pur_date"
              header="발주일자"
              style="text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="receipt_date"
              header="입고일자"
              style="width: 200px; padding: 8px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data, field }">
                <div class="relative">
                  <flat-pickr
                    v-model="data[field]"
                    :config="flatpickrConfig"
                    placeholder="날짜를 선택해주세요."
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
              style="width: 300px; padding: 8px"
            >
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="text"
                  :class="baseInputClass"
                  placeholder="내용을 입력해주세요."
                />
              </template>
            </DataCol>
          </DataTable>
        </template>
      </ComponentCard>

      <!-- 발주자재 컴포넌트-->

      <ComponentCard title="발주자재">
        <template #header-right>
          <div class="flex justify-end space-x-2">
            <button type="button" class="btn-white btn-common" @click="isMatModalOpen = true">
              행추가
            </button>
            <button type="button" class="btn-color btn-common" @click="deleteSelectedRows">
              행삭제
            </button>
          </div>
        </template>
        <template #body-content>
          <DataTable
            :value="purChaseMat"
            v-model:selection="selectMat"
            showGridlines
            dataKey="mat_code"
          >
            <DataCol selectionMode="multiple" headerStyle="width: 37px" bodyStyle="width: 37px" />
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
              style="width: 220px; padding: 8px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="number"
                  min="1"
                  style="text-align: right"
                  :class="baseInputClass"
                  placeholder="발주수량을 입력해주세요."
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

    <!--발주서 조회 모달-->

    <Modal
      v-if="isPurModalOpen"
      :full-screen-backdrop="true"
      title-align="left"
      header-align="right"
      title="발주서 조회"
      width="1200px"
      @close="handleCloseModal"
    >
      <template #modal-header>
        <button type="button" class="btn-white btn-common">조회</button>
        <button type="button" class="btn-color btn-common">등록</button>
      </template>
      <template #modal-body>
        <div class="modal-container flex gap-2 mb-2">
          <div class="w-1/3">
            <label :class="labelStyle"> 발주서명 </label>
            <input type="text" :class="baseInputClass" style="width: 200px" />
          </div>
        </div>
        <div class="modal-container flex gap-2 mb-2">
          <DataTable
            :value="modalPur"
            show-gridlines
            v-model:selection="selectPur"
            datakey="pur_code"
            @row-click="onRowClick"
            style="width: 1200px"
          >
            <DataCol
              selectionMode="single"
              headerStyle="width: 37px"
              bodyStyle="width: 37px"
            ></DataCol>
            <DataCol
              field="pur_code"
              header="발주코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_name"
              header="발주서명"
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
              header="임고일자"
              style="text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="emp_name"
              header="담당자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol field="remark" header="비고" :pt="{ columnHeaderContent: 'justify-center' }" />
          </DataTable>
        </div>
      </template>
    </Modal>

    <!--발주자재 조회 모달-->

    <Modal
      v-if="isMatModalOpen"
      :full-screen-backdrop="true"
      title-align="left"
      header-align="right"
      title="발주자재 조회"
      width="800px"
      @close="handleCloseModal"
    >
      <template #modal-header>
        <button type="button" class="btn-white btn-common">조회</button>
        <button type="button" class="btn-color btn-common">등록</button>
      </template>
      <template #modal-body>
        <div class="modal-container flex gap-2 mb-2">
          <div class="w-1/3">
            <label :class="labelStyle"> 자재명 </label>
            <input type="text" :class="baseInputClass" style="width: 200px" />
          </div>
        </div>
        <div class="modal-container flex gap-2 mb-2">
          <DataTable
            :value="modalMat"
            show-gridlines
            v-model:selection="selectModalMat"
            datakey="mat_code"
            @row-click="onRowClick"
            style="width: 1200px"
          >
            <DataCol
              selectionMode="multiple"
              headerStyle="width: 37px"
              bodyStyle="width: 37px"
            ></DataCol>
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
        </div>
      </template>
    </Modal>

    <!-- 공급업체 조회 모달-->

    <Modal
      v-if="isBcncModalOpen"
      :full-screen-backdrop="true"
      title-align="left"
      header-align="right"
      title="공급업체 조회"
      width="600px"
      @close="handleCloseModal"
    >
      <template #modal-header>
        <button type="button" class="btn-white btn-common">조회</button>
        <button type="button" class="btn-color btn-common">등록</button>
      </template>
      <template #modal-body>
        <div class="modal-container flex gap-2 mb-2">
          <div class="w-1/3">
            <label :class="labelStyle"> 공급업체명 </label>
            <input type="text" :class="baseInputClass" style="width: 200px" />
          </div>
        </div>
        <div class="modal-container flex gap-2 mb-2">
          <DataTable
            :value="modalBcnc"
            show-gridlines
            v-model:selection="selectModalBcnc"
            datakey="bcnc_code"
            @row-click="onRowClick"
            style="width: 600px"
          >
            <DataCol
              selectionMode="single"
              headerStyle="width: 37px"
              bodyStyle="width: 37px"
            ></DataCol>
            <DataCol
              field="bcnc_code"
              header="공급업체코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_name"
              header="공급업체명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_type"
              header="업종"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
          </DataTable>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<style scoped>
.modal-container {
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
