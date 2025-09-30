<script setup>
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import ComponentCard from '@/components/common/ComponentCard.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Button from '@/components/ui/Button.vue'
import { ref } from 'vue'

const currentPageTitle = ref('발주관리')

const colDefs = ref([
  { field: 'pur_code', flex: 1 },
  { field: 'pur_name', flex: 1 },
  { field: 'bcnc_code', flex: 1 },
  { field: 'bcnc_name', flex: 1 },
  { field: 'pur_date', flex: 1 },
  { field: 'receipt_date', flex: 1 },
  { field: 'emp_name', flex: 1 },
  { field: 'remark', flex: 1 },
])

const rowData = ref([
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
        <AgGridVue
          class="ag-theme-alpine"
          domLayout="autoheight"
          :columnDefs="colDefs"
          :rowData="rowData"
          width="100%"
        />
      </ComponentCard>
    </div>
  </AdminLayout>
</template>
