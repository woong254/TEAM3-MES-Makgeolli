<script setup lang="ts">
import { ref } from 'vue'
import '@/assets/common.css'

import ComponentCard from '@/components/common/ComponentCardButton.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const currentPageTitle = ref('품질검사 기준관리')

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <ComponentCard title="조회" className="shadow-sm">
      <template v-slot:header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-white">초기화</button>
          <button class="btn-common btn-color">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="flex gap-4">
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-name"> 검사항목명 </label>
            <input type="text" id="insp-name" :class="inputStyle" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-target-name"> 검사대상 </label>
            <input type="text" id="insp-target-name" :class="inputStyle" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-type"> 품목구분 </label>
            <div class="relative z-20 bg-transparent">
              <select id="insp-type" :class="selectStyle">
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
          <div class="w-1/4">
            <div :class="labelStyle">사용여부</div>
            <label :class="labelStyle">
              <input
                type="checkbox"
                name="insp-using"
                value="Y"
                class="checkboxStyle text-sm text-gray-800"
              />사용
            </label>
            <label :class="labelStyle">
              <input
                type="checkbox"
                name="insp-using"
                value="N"
                class="checkboxStyle text-sm text-gray-800"
              />미사용
            </label>
          </div>
        </div>
      </template>
    </ComponentCard>

    <div class="flex gap-2 mt-2 width-full">
      <ComponentCard title="목록" className="shadow-sm w-1/2"> </ComponentCard>
      <ComponentCard title="등록" className="shadow-sm w-1/2">
        <template #header-right>
          <div class="flex justify-end">
            <button class="btn-common btn-color">등록</button>
            <button class="btn-common btn-white">삭제</button>
          </div>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped>
.checkboxStyle {
  accent-color: #3e5879;
  border: 1px solid #eee;
  margin-right: 8px;
  cursor: pointer;
}
</style>
