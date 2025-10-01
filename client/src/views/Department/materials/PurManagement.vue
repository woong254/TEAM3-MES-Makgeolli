<script setup>
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import ComponentCard from '@/components/common/ComponentCard.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
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

const selectedRows = ref([])
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard
        title="발주서"
        :class="[
          'shadow-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
        ]"
      >
        <template #cardHeader>
          <div class="flex justify-end space-x-2 mb-2">
            <button type="button" class="btn-white btn-common">초기화</button>
            <button type="button" class="btn-white btn-common">조회</button>
            <button type="button" class="btn-color btn-common">등록/수정</button>
            <button type="button" class="btn-color btn-common">삭제</button>
          </div>
        </template>
        <DataTable
          :value="purChase"
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
            editor="input"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
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
      </ComponentCard>

      <ComponentCard
        title="발주자재"
        :class="[
          'shadow-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
        ]"
      >
        <template #cardHeader>
          <div class="flex justify-end space-x-2 mb-2">
            <button type="button" class="btn-white btn-common">행추가</button>
            <button type="button" class="btn-color btn-common">행삭제</button>
          </div>
        </template>

        <DataTable
          :value="purChaseMat"
          v-model:selection="selectedRows"
          showGridlines
          selectionMode="multiple"
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
          <DataCol field="MAT_SPEC" header="규격" :pt="{ columnHeaderContent: 'justify-center' }" />
          <DataCol field="MAT_UNIT" header="단위" :pt="{ columnHeaderContent: 'justify-center' }" />
        </DataTable>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped></style>
