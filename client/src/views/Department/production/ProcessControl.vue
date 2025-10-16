<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import '@/assets/common.css'
import { ref } from 'vue'

import { useProcessStore } from '@/stores/useProcessStore'

const currentPageTitle = ref('공정제어')

const inputStyle =
  'font-bold dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-lg text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'font-bold block text-lg text-gray-700 dark:text-gray-400 mb-2'
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-1 mt-2">
      <ComponentCard title="지시내용">
        <template #body-content>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label :class="labelStyle"> 제품명 </label>
              <input type="text" :class="inputStyle" required readonly />
            </div>
            <div>
              <label :class="labelStyle"> 공정명 </label>
              <input type="text" :class="inputStyle" required readonly />
            </div>
            <div>
              <label :class="labelStyle"> 설비명 </label>
              <input type="text" :class="inputStyle" required readonly />
            </div>
            <div>
              <label :class="labelStyle"> 작업자명 </label>
              <input type="text" :class="inputStyle" required readonly />
            </div>
            <div>
              <label :class="labelStyle"> 작업지시일 </label>
              <input type="text" :class="inputStyle" required readonly />
            </div>
          </div>
        </template>
      </ComponentCard>

      <div class="flex gap-2 mt-2 width-full">
        <!-- 설비 선택 -->
        <ComponentCard title="자재투입" className="shadow-sm w-3/5 h-80">
          <template #body-content>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mr-10">
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-13">지시량</label>
                <input type="text" :class="inputStyle" required readonly />
              </div>
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10">생산량</label>
                <input type="text" :class="inputStyle" required readonly />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mr-10">
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >기투입량</label
                >
                <input type="text" :class="inputStyle" required readonly />
              </div>
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10">불량량</label>
                <input type="text" :class="inputStyle" required readonly />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mr-10">
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >미투입량</label
                >
                <input type="text" :class="inputStyle" required readonly />
              </div>
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10">합격량</label>
                <input type="text" :class="inputStyle" required readonly />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mr-10">
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >현투입량</label
                >
                <input type="text" :class="inputStyle" required readonly />
              </div>
            </div>
          </template>
        </ComponentCard>
        <!-- 작업자 선택 -->
        <ComponentCard title="날짜" className="shadow-sm w-2/5 h-80">
          <template #body-content>
            <div class="flex flex-col justify-center h-full space-y-4 px-4 bg-white mr-10">
              <!-- 작업시작일 -->
              <div class="flex items-center space-x-2 mt-15">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >작업시작일</label
                >
                <input type="text" :class="inputStyle" required readonly />
              </div>

              <!-- 작업종료일 -->
              <div class="flex items-center space-x-2">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >작업종료일</label
                >
                <input type="text" :class="inputStyle" required readonly />
              </div>
            </div>
          </template>
        </ComponentCard>
      </div>
      <div style="text-align: center; font-size: 25px; font-weight: bold" class="mt-5">
        <button type="button" class="btn-reset btn-common btn-white" style="margin-right: 10px">
          작업시작
        </button>
        <button type="button" class="btn-reset btn-common btn-color" style="margin-left: 10px">
          작업종료
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.btn-common {
  width: 200px;
  padding: 8px 20px;
  border-radius: 20px;
  margin: 0 5px;
  transition: all 0.3s;
  height: 100px;
}
.btn-white {
  background-color: #228b22;
  border: 1px solid #ddd;
  color: #fff;
}
.btn-white:hover {
  background-color: #3fdb3f;
}
.btn-color {
  background-color: #d22323;
  color: #fff;
}
.btn-color:hover {
  background-color: #f14242;
}
</style>
