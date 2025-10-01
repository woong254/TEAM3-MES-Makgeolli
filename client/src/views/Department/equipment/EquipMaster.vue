<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import '@/assets/common.css'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref } from 'vue'

const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

const currentPageTitle = ref('설비관리')
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle"> </PageBreadcrumb>
    <ComponentCard title="설비조회">
      <template #header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-color">초기화</button>
          <button class="btn-common btn-white">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">설비코드</label>
            <input type="text" :class="inputStyle" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">설비명</label>
            <input type="text" :class="inputStyle" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">설비유형</label>
            <input type="text" :class="inputStyle" />
          </div>
          <div class="flex items-center gap-4">
            <span class="block text-sm font-medium">설비상태</span>

            <label class="inline-flex items-center gap-2">
              <input
                type="radio"
                name="equip-status"
                value="running"
                class="h-4 w-4 accent-green-600"
              />
              <span class="text-sm">가동중</span>
            </label>

            <label class="inline-flex items-center gap-2">
              <input
                type="radio"
                name="equip-status"
                value="stopped"
                class="h-4 w-4 accent-green-600"
              />
              <span class="text-sm">비가동</span>
            </label>
          </div>
        </div>
      </template>
    </ComponentCard>
    <div class="flex gap-2 mt-2 width-full">
      <ComponentCard title="목록" className="shadow-sm w-1/2">
        <template #body-content>
          <DataTable :value="purChase" showGridlines :rows="1">
            <DataCol field="pur_code" header="" :pt="{ columnHeaderContent: 'justify-center' }" />
            <DataCol
              field="pur_code"
              header="설비코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_name"
              header="설비명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_code"
              header="설비유형"
              style="text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_name"
              header="담당자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_date"
              header="설비상태"
              style="text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="receipt_date"
              header="점검예정일"
              style="text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
          </DataTable>
        </template>
      </ComponentCard>
      <ComponentCard title="등록/수정" className="shadow-sm w-1/2">
        <template #header-right>
          <div class="flex justify-end">
            <button class="btn-common btn-color">저장</button>
            <button class="btn-common btn-white">신규</button>
          </div>
        </template>
        <template #body-content>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label :class="labelStyle">설비코드</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">설비명</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">설비유형</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">담당자</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">제조사</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">설치일자</label>
              <input type="date" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">설비이미지</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">모델명</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">제조일자</label>
              <input type="date" :class="inputStyle" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <button class="block text-sm font-medium mb-2 border px-5">파일첨부</button>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">점검주기</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">설비상태</label>
              <select box="text" :class="inputStyle" />
            </div>
          </div>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped></style>
