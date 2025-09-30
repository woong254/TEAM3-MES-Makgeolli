<script setup>
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import ComponentCard from '@/components/common/ComponentCard.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Button from '@/components/ui/Button.vue'
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
  {
    pur_code: 'BAL-002',
    pur_name: '20251001보리발주',
    bcnc_code: 2002,
    bcnc_name: '보리상사',
    pur_date: '2025-10-01',
    receipt_date: '2025-10-31',
    emp_name: '김지민',
    remark: '보리 조금만 주세요~',
  },
])
const selectedRows = ref([])
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="발주서">
        <div class="flex justify-end space-x-2 mb-2">
          <Button size="sm" variant="outline"> 초기화 </Button>
          <Button size="sm" variant="outline"> 조회 </Button>
          <Button size="sm" variant="primary"> 등록/수정 </Button>
          <Button size="sm" variant="primary"> 삭제 </Button>
        </div>
        <DataTable
          :value="purChase"
          v-model:selection="selectedRows"
          showGridlines
          selectionMode="multiple"
          dataKey="pur_code"
        >
          <DataCol selectionMode="multiple" headerStyle="width: 3rem" />
          <DataCol
            field="pur_code"
            header="발주코드"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="pur_name"
            header="발주명"
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
    </div>
  </AdminLayout>
</template>
