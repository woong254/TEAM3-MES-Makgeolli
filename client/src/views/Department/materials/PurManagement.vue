<script setup>
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import InputText from 'primevue/inputtext'
import '@/assets/common.css'
import { ref } from 'vue'

const currentPageTitle = ref('발주관리')

const purChase = ref([
  {
    pur_code: 'BAL-001',
    pur_name: '20250930쌀발주',
    bcnc_code: 2001,
    bcnc_name: '농협',
    pur_date: '2025-09-30',
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
            editMode="cell"
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
              style="width: 300px"
            >
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" type="text" class="cell-editor" />
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
        </template>
      </ComponentCard>

      <ComponentCard title="발주자재">
        <template #header-right>
          <div class="flex justify-end space-x-2">
            <button type="button" class="btn-white btn-common">행추가</button>
            <button type="button" class="btn-color btn-common">행삭제</button>
          </div>
        </template>
        <template #body-content>
          <DataTable
            :value="purChaseMat"
            v-model:selection="selectedbox"
            showGridlines
            dataKey="mat_code"
          >
            <DataCol selectionMode="multiple" headerStyle="width: 3rem" />
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
  padding: 4px 6px !important; /* 필요하면 2px 6px 까지 줄여봐 */
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
  padding: 4px 6px !important; /* td padding과 균형 맞춤 */
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
  border: 1px solid #53c28b !important; /* 원치 않으면 제거 */
}

/* (옵션) PrimeVue 기본 클래스가 더 우선일 때를 대비한 최종 오버라이드 */
::v-deep(.custom-table) .p-datatable .p-inputtext {
  margin: 0 !important;
  height: 100% !important;
}
</style>
