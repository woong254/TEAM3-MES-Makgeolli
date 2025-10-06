<script setup lang="ts">
import { ref } from 'vue'
import '@/assets/common.css'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import Column from 'primevue/column'
import 'primeicons/primeicons.css'
import Button from 'primevue/button'
import InspTargetSelectModal from './InspTargetSelectModal.vue' // import the modal component (검사대상조회)

const currentPageTitle = ref('품질검사 기준관리')

// 타입스크립트 -> 명시해주지 않으면 오류뜸
interface InspRow {
  t_id: string
  t_name: string
  t_type: string
  t_spec: string
  t_unit: string
}

// table data
const inspData = ref([
  {
    inspCode: 'QC0001',
    inspName: '쌀 외관검사',
    inspTarget: '쌀20kg(원재료)',
    inspUsing: 'Y',
  },
  {
    inspCode: 'QC0002',
    inspName: '알코올 도수 검사',
    inspTarget: '막걸리(반제품)',
    inspUsing: 'Y',
  },
  {
    inspCode: 'QC0003',
    inspName: '대장균 검사',
    inspTarget: '막걸리(반제품)',
    inspUsing: 'Y',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
])

// 검사대상
const inspTarget = ref<InspRow[]>([])

// 모달에서 선택한 검사대상(데이터)
const onInspChecked = (rows: any[]) => {
  // 여러 건 추가
  const merged = [...inspTarget.value, ...rows] //기존데이터(inspTarget.value) + 넘어온데이터(rows)
  // 중복 제거(de-duplicate)
  const dedup = Array.from(new Map(merged.map((r) => [r.t_id, r])).values())
  inspTarget.value = dedup
}

// 검사대상 삭제 (휴지통 버튼 클릭시)
const targetDel = (id: string) => {
  inspTarget.value = inspTarget.value.filter((row) => row.t_id !== id)
}

// table radio button
const selectedInspData = ref(null)

// modal event
const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
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

    <div class="flex gap-2 mt-2 width-full" style="height: 500px">
      <ComponentCard title="목록" className="shadow-sm w-1/2">
        <template #body-content>
          <DataTable
            :value="inspData"
            showGridlines
            scrollable
            scrollHeight="390px"
            size="small"
            :rows="10"
            class="text-sm"
            v-model:selection="selectedInspData"
          >
            <DataCol
              field="inspCheck"
              header=""
              :pt="{ columnHeaderContent: 'justify-center' }"
              selectionMode="single"
              style="width: 10px"
            />
            <DataCol
              field="inspCode"
              header="검사항목ID"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 120px"
              bodyStyle="text-align: center"
            />
            <DataCol
              field="inspName"
              header="검사대상명"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspTarget"
              header="검사대상"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspUsing"
              header="사용여부"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 100px; text-align: center"
            />
          </DataTable>
        </template>
      </ComponentCard>

      <ComponentCard title="등록" className="shadow-sm w-1/2 ">
        <template #header-right>
          <div class="flex justify-end">
            <button type="submit" class="btn-common btn-color" form="insp-form">등록</button>
            <button class="btn-common btn-white">삭제</button>
          </div>
        </template>
        <template #body-content>
          <form action="" id="insp-form" class="overflow-y-auto" style="height: 380px">
            <div class="flex gap-10 mb-4">
              <div class="w-3/4 flex items-center">
                <label :class="labelStyle" class="w-1/3"> 검사항목명 </label>
                <input type="text" :class="inputStyle" class="w-2/3" required />
              </div>
              <div class="w-1/4 flex items-center">
                <div :class="labelStyle" style="margin-right: 20px">사용여부</div>
                <label :class="labelStyle">
                  <input type="checkbox" class="checkboxStyle" />미사용
                </label>
              </div>
            </div>
            <div class="flex items-center gap-17 mb-2">
              <div :class="labelStyle">검사유형</div>
              <label :class="labelStyle">
                <input type="radio" name="insp-using" class="checkboxStyle" checked />범위
              </label>
              <label :class="labelStyle">
                <input type="radio" name="insp-using" class="checkboxStyle" />관능
              </label>
            </div>
            <div class="flex mb-2">
              <label :class="labelStyle" class="w-[140px]"> 검사방법 </label>
              <textarea
                placeholder="검사방법에 대해서 작성하세요"
                rows="4"
                :class="textareaStyle"
                class="w-4/5"
              ></textarea>
            </div>
            <div class="flex mb-4">
              <label :class="labelStyle" class="w-[140px]">파일첨부 </label>
              <input type="file" :class="fileStyle" />
            </div>
            <hr class="" />
            <div class="flex justify-between items-center mt-4 mb-4">
              <h3>검사대상조회</h3>
              <button
                type="button"
                @click="openModal"
                class="btn-common btn-color btn-insp-target-search"
              >
                검사대상조회
              </button>
            </div>
            <InspTargetSelectModal
              :visible="isModalOpen"
              @close="closeModal"
              @checked="onInspChecked"
            />
            <DataTable
              :value="inspTarget"
              datakey="t_id"
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
                field="t_id"
                header="자재/제품ID"
                :pt="{ columnHeaderContent: 'justify-center' }"
                bodyStyle="text-align: center"
              />
              <Column
                field="t_name"
                header="자재/제품명"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_type_name"
                header="품목구분"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_spec"
                header="규격"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_unit"
                header="단위"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column field="t_del" header="삭제" :pt="{ columnHeaderContent: 'justify-center' }">
                <!-- 스코프드 슬롯(scoped slot)
                  <template #body="slotProps"> slotProps.data로 접근
                  Destructuring -> { data } 
                -->
                <template #body="{ data }">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-trash"
                      variant="outlined"
                      class="p-button-text p-button-danger p-button-sm"
                      style="width: 20px; height: 15px; text-align: center"
                      @click="targetDel(data.t_id)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>

            <hr />
            <h3 class="mt-4 mb-3">검사내용</h3>
            <div class="flex items-center gap-4 mb-3">
              <label :class="labelStyle" class="w-1/3"> 최소범위 </label>
              <input type="text" :class="inputStyle" required />
              <div class="relative z-20 bg-transparent w-1/2">
                <select :class="selectStyle">
                  <option value="" selected>이상</option>
                  <option value="">초과</option>
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
            <div class="flex items-center gap-4 mb-3">
              <label :class="labelStyle" class="w-1/3"> 최대범위 </label>
              <input type="text" :class="inputStyle" required />
              <div class="relative z-20 bg-transparent w-1/2">
                <select :class="selectStyle">
                  <option value="" selected>이하</option>
                  <option value="">미만</option>
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
            <div class="flex items-center mb-4">
              <label :class="labelStyle" class="w-[166px]">단위</label>
              <input type="text" :class="inputStyle" required />
            </div>
          </form>
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
.btn-insp-target-search {
  width: 150px;
}
h3 {
  font-weight: 500;
  color: #222;
}
</style>
