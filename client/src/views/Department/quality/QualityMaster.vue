<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <!-- 조회 -->
    <div class="btn-box">
      <button class="reset">초기화</button>
      <button class="search">조회</button>
    </div>
    <div class="search-box">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          검사항목명
        </label>
        <input
          type="text"
          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          검사대상
        </label>
        <input
          type="text"
          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
      <!-- Select Input -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          품목구분
        </label>
        <div class="relative z-20 bg-transparent">
          <select
            class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          >
            <option value="">원자재</option>
            <option value="marketing">부자재</option>
            <option value="template">재공품</option>
            <option value="development">반제품</option>
            <option value="development">완제품</option>
          </select>
          <span
            class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
          >
            <svg
              class="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke=""
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <!-- Default Checkbox -->
      <div>
        <label
          for="checkboxLabelOne"
          class="flex items-center text-sm font-medium text-gray-700 cursor-pointer select-none dark:text-gray-400"
        >
          <div class="relative">
            <input type="checkbox" id="checkboxLabelOne" class="sr-only" />
            <div
              class="mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500"
            >
              <span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                    stroke="white"
                    stroke-width="1.94437"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          사용
        </label>
        <label
          for="checkboxLabelOne"
          class="flex items-center text-sm font-medium text-gray-700 cursor-pointer select-none dark:text-gray-400"
        >
          <div class="relative">
            <input type="checkbox" id="checkboxLabelOne" class="sr-only" />
            <div
              class="mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500"
            >
              <span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                    stroke="white"
                    stroke-width="1.94437"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          미사용
        </label>
      </div>
    </div>

    <!-- 목록/등록 -->
    <div class="container">
      <div class="left">
        <h2>목록</h2>
        <div class="ag-theme-alpine" style="height: 500px; width: 100%">
          <AgGridVue style="width: 500px; height: 0px;" :rowData="rowData" :columnDefs="colDefs" :defaultColDef="defaultColDef" />
        </div>
        <!-- <table>
          <thead>
            <tr>
              <th></th>
              <th>검사항목ID</th>
              <th>검사대상명</th>
              <th>검사대상</th>
              <th>사용여부</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="radio" /></td>
              <td>검사항목들어갈부분</td>
              <td>검사대상명</td>
              <td>완제품</td>
              <td>사용</td>
            </tr>
          </tbody>
        </table> -->
      </div>
      <div class="right">
        <h2>등록</h2>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref } from 'vue'
const currentPageTitle = ref('품질검사 기준관리')

import type { ColDef } from 'ag-grid-community'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'

ModuleRegistry.registerModules([AllCommunityModule])

// Row Data Interface
interface IRow {
  make: string
  model: string
  price: number
  electric: boolean
}

// Define the component configuration

const rowData = ref<IRow[]>([
  { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
  { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
  { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
  { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
  { make: 'Fiat', model: '500', price: 15774, electric: false },
  { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
])

const colDefs = ref<ColDef<IRow>[]>([
  { field: 'make' },
  { field: 'model' },
  { field: 'price' },
  { field: 'electric' },
])

const defaultColDef = {
  flex: 1,
}
</script>

<style scoped>
.btn-box {
  display: flex;
  justify-content: right;
  margin-bottom: 10px;
}
button.reset {
  width: 100px;
  background-color: #fff;
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 0px 5px;
  transition: 0.3s;
}
button.reset:hover {
  background-color: #eee;
}
button.search {
  width: 100px;
  background-color: #213555;
  color: #fff;
  padding: 8px 20px;
  border-radius: 8px;
  margin: 0px 5px;
  transition: 0.3s;
}
button.search:hover {
  background-color: #3e5879;
}
.search-box {
  width: 100%;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.1);
}
.search-box > div {
  width: 20%;
  display: flex;
  flex-direction: column;
  margin: 0 5px;
}
label {
  margin-bottom: 10px;
}
input {
  width: 100%;
  background-color: #fff;
  border: 1px solid #eee;
  padding: 8px 10px;
  border-radius: 8px;
}
select {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px 10px;
}

.container {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.container div {
  width: 50%;
  border-radius: 8px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  padding: 20px;
  min-height: 580px;
}
</style>
