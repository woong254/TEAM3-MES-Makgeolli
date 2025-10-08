<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import '@/assets/common.css'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { ref, onBeforeMount, shallowRef, computed } from 'vue'
import axios from 'axios'

import equipSelectModal from './equipSelectModal.vue'

const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

const currentPageTitle = ref('설비 기준정보 관리')

interface EquipItem {
  equipCode: string // 설비코드
  equipName: string // 설비명
  equipType: string // 설비유형
  manager: string // 담당자
  equipStatus: string // 설비상태
  inspCycle: number // 점검주기 (예: 일수 or 주기 단위)
}
const searchForm = ref({
  equipCode: '',
  equipName: '',
  equipType: '',
  equipStatus: '',
})

const equipMent = ref([
  {
    equip_code: 'MG-003',
    equip_name: '발효기 A',
    equip_type: '발효기',
    manager: '신과장',
    equip_status: '가동중',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-002',
    equip_name: '발효기 B',
    equip_type: '발효기',
    manager: '이사원',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
  {
    equip_code: 'MG-001',
    equip_name: '발효기 C',
    equip_type: '발효기',
    manager: '김대리',
    equip_status: '비가동',
    insp_check: '30일',
  },
])

const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  wrap: true,
}
const orderStartDates = ref(null)
const selectedbox = ref([])

const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}
// const uploadFile = () => {

// }

const equipList = shallowRef<EquipItem[]>([])

const count = computed(
  () =>
    // ref 기반의 반응형 객체이므로 실제 값에 접근할 떄는 value 필드 사용
    // 동시에 Composition API에선 객체로 선언하지 않으므로 this로 접근 불가
    equipList.value.length,
)
const getEquipList = async () => {
  try {
    const result = await axios.get<EquipItem[]>('/api/equipment', {
      params: searchForm.value,
    })
    equipList.value = result.data
  } catch (err) {
    console.error(err)
    equipList.value = [] // 실패 시 기본값
  }
}
onBeforeMount(() => {
  getEquipList()
})
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle"> </PageBreadcrumb>
    <ComponentCard title="조회">
      <template #header-right>
        <div class="flex justify-end">
          <button @click="getEquipList" class="btn-common btn-color">초기화</button>
          <button class="btn-common btn-white">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label :class="labelStyle">설비코드</label>
            <input v-model="searchForm.equipCode" type="text" :class="inputStyle" />
          </div>
          <div>
            <label :class="labelStyle">설비명</label>
            <input v-model="searchForm.equipName" type="text" :class="inputStyle" />
          </div>
          <div>
            <label :class="labelStyle">설비유형</label>
            <input v-model="searchForm.equipType" type="text" :class="inputStyle" />
          </div>
          <div class="flex items-center gap-17 mb-2">
            <div :class="labelStyle">설비상태</div>
            <label :class="labelStyle"
              >가동
              <input type="radio" name="insp-using" class="checkboxStyle" checked />
            </label>
            <label :class="labelStyle"
              >비가동
              <input type="radio" name="insp-using" class="checkboxStyle" />
            </label>
          </div>
        </div>
      </template>
    </ComponentCard>

    <div class="flex gap-2 mt-2 width-full">
      <ComponentCard title="목록" className="shadow-sm w-1/2 overflow-y-auto">
        <template #header-right>
          <div class="flex justify-end">
            <button class="btn-common btn-color">삭제</button>
          </div>
        </template>
        <template #body-content>
          <DataTable
            :value="equipMent"
            showGridlines
            v-model:selection="selectedbox"
            dataKey="mat_code"
            scrollable
            scrollHeight="500px"
          >
            <DataCol selectionMode="multiple" headerStyle="width: 3rem" />
            <DataCol
              field="equip_code"
              header="설비코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="equip_name"
              header="설비명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="equip_type"
              header="설비유형"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="manager"
              header="담당자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="equip_status"
              header="설비상태"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="insp_check"
              header="점검예정일"
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
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <label :class="labelStyle">담당자</label>
                <input type="text" :class="inputStyle" />
              </div>
              <div>
                <button type="button" class="btn-common btn-color" @click="openModal">조회</button>
              </div>
            </div>
            <equipSelectModal :visible="isModalOpen" @close="closeModal" />
            <div>
              <label :class="labelStyle">제조사</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div class="relative w-full">
                <label :class="labelStyle">설치일자</label>
                <flat-pickr
                  v-model="orderStartDates"
                  :config="flatpickrConfig"
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
            <div>
              <label :class="labelStyle">설비이미지</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div>
              <label :class="labelStyle">모델명</label>
              <input type="text" :class="inputStyle" />
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div class="relative w-full">
                <label :class="labelStyle">제조일자</label>
                <flat-pickr
                  v-model="orderStartDates"
                  :config="flatpickrConfig"
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
            <div class="">
              <button class="btn-common btn-color" @click="uploadFile">파일첨부</button>
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
