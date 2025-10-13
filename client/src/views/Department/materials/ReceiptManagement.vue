<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'

import '@/assets/common.css'
import { ref } from 'vue'
const currentPageTitle = ref('발주관리')
</script>
<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="가입고">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-color btn-common">등록</button>
          </div>
        </template>
        <template #body-content>
          <DataTable :value="iis" show-gridlines>
            <DataCol
              field="pre_receipt_date"
              header="가입고일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="exp_date"
              header="유통기한"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="prod_date"
              header="제조일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
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
              field="bcnc_code"
              header="매입처번호"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_name"
              header="매입처명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pre_receipt_date"
              header="입고수량"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_spec"
              header="규격"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_unit"
              header="단위"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol field="remark" header="비고" :pt="{ columnHeaderContent: 'justify-center' }" />
          </DataTable>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>
