<!-- 자재입고검사 관리 -->
<script setup lang="ts">
import { ref } from 'vue'
import '@/assets/common.css'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import 'primeicons/primeicons.css'
import Button from 'primevue/button'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const currentPageTitle = ref('자재입고검사 관리')

const inspData = ref([
  {
    inspCode: 'QC0001',
    inspName: '쌀 외관검사',
    inspTarget: '쌀20kg(원재료)',
    inspUsing: 'Y',
  },
])

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const inputStyle2 =
  'dark:bg-dark-900 h-7 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const textareaStyle =
  'dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 overflow-y-auto'
const fileStyle =
  'focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400'
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <ComponentCard title="조회" className="shadow-sm" class="mb-2">
      <template #header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-white">초기화</button>
          <button class="btn-common btn-color">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="flex gap-4">
          <div class="w-1/4">
            <label :class="labelStyle"> 검사명 </label>
            <input type="text" :class="inputStyle" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              검사일시
            </label>
            <div class="flex items-center gap-2">
              <div class="relative">
                <flat-pickr
                  v-model="date"
                  :config="flatpickrConfig"
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:b≈order-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=" "
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
              <div>-</div>
              <div class="relative">
                <flat-pickr
                  v-model="date"
                  :config="flatpickrConfig"
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:b≈order-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=" "
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
            </div>
          </div>
        </div>
      </template>
    </ComponentCard>
    <ComponentCard title="등록" className="shadow-sm">
      <template #header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-color">PDF</button>
          <button class="btn-common btn-color">등록</button>
          <button class="btn-common btn-white">삭제</button>
        </div>
      </template>
      <template #body-content>
        <div class="h-[390px] overflow-auto">
          <div class="rounded-lg border border-gray-200 shadow-sm p-4 mb-2">
            <h3 class="text-md mb-2 font-medium">기본정보</h3>
            <div class="w-full flex items-center mb-2">
              <label :class="labelStyle" class="w-[86px]"> 검사명 </label>
              <input type="text" :class="inputStyle2" class="w-2/3" />
            </div>
            <div class="flex flex-wrap justify-between gap-2">
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 발주번호 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 발주명 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 발주일자 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 자재코드 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 자재명 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 거래처 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 규격 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 단위 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 주문수량 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 품목구분 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 검사자 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
              <div class="w-1/5 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 검사일시 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
              </div>
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 class="text-md mb-2 font-medium">수량입력</h3>
            <div class="flex flex-wrap mb-2">
              <div class="w-1/3 flex items-center">
                <label :class="labelStyle" class="w-[120px]">입고량 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
              <div class="w-1/3 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 검사량 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
            </div>
            <div class="flex flex-wrap mb-2">
              <div class="w-1/3 flex items-center">
                <label :class="labelStyle" class="w-[120px]">불량량 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
              <div class="w-1/3 flex items-center">
                <label :class="labelStyle" class="w-[120px]"> 합격량 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
            </div>
            <div class="flex flex-wrap mb-2">
              <div class="text-sm w-[80px]">불량유형</div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[180px]">이물질 혼입 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
              <div class="w-1/4 flex items-center">
                <label :class="labelStyle" class="w-[180px]"> 유통기한 경과 </label>
                <input type="text" :class="inputStyle2" class="w-2/3" />
                <div class="text-sm w-[100px] ml-2">단위</div>
              </div>
            </div>
            <div class="w-full flex">
              <label :class="labelStyle" class="w-[85px]">비고 </label>
              <input type="text" :class="inputStyle2" />
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 class="text-md mb-2 font-medium">검사 기준 항목</h3>
            <h4>범위 검사</h4>
            <!-- 테이블 -->
            <DataTable
              :value="inspData"
              dataKey="t_id"
              showGridlines
              scrollable
              size="small"
              :rows="5"
              class="text-sm mb-4"
            >
              <!-- 데이터가 없을 때 나타낼 방법 #empty슬롯 -->
              <template #empty>
                <div class="text-center">추가된 검사대상이 없습니다.</div>
              </template>
              <Column
                field="insp_name"
                header="항목"
                :pt="{ columnHeaderContent: 'justify-center' }"
                bodyStyle="text-align: center"
              />
              <Column
                field="insp_method"
                header="검사방법"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="file_name"
                header="첨부파일"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="range_stand"
                header="범위기준"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="insp_unit"
                header="단위"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="mea_values"
                header="측정값 입력"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_unit"
                header="판정"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
            </DataTable>
            <h4>관능 검사</h4>
            <!-- 테이블 -->
          </div>
        </div>
      </template>
    </ComponentCard>
  </AdminLayout>
</template>

<style scoped></style>
