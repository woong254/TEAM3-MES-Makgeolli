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
  installDate: string //설치일자
  modelName: string //모델명
  equipImage: string //설비이미지
  mfgDt: string //제조일자
  maker: string //제조사
}
const searchForm = ref({
  equipCode: '',
  equipName: '',
  equipType: '',
  equipStatus: '',
})
const resetSearchForm = () => {
  searchForm.value.equipCode = '' // v-model 값 초기화
  searchForm.value.equipName = ''
  searchForm.value.equipType = ''
  searchForm.value.equipStatus = ''
}

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
const fileInputEl = ref<HTMLInputElement | null>(null)
const eqpImageName = ref('선택된 파일 없음')
const eqpImagePreview = ref('')

const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) {
    eqpImageName.value = '선택된 파일 없음'
    eqpImagePreview.value = ''
    return
  }
  const f = files[0]
  eqpImageName.value = f.name

  if (f.type?.startsWith('image/')) {
    const r = new FileReader()
    r.onload = () => (eqpImagePreview.value = (r.result as string) || '')
    r.readAsDataURL(f)
  } else {
    eqpImagePreview.value = ''
  }
}

const clearImage = () => {
  if (fileInputEl.value) fileInputEl.value.value = ''
  eqpImageName.value = '선택된 파일 없음'
  eqpImagePreview.value = ''
}
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
    <ComponentCard title="조회" className="shadow-sm">
      <template #header-right>
        <div class="flex justify-end">
          <button @click="resetSearchForm" class="btn-common btn-color">초기화</button>
          <button @click="getEquipList" class="btn-common btn-white">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="flex gap-4">
          <div class="w-1/4">
            <label :class="labelStyle">설비코드</label>
            <input v-model="searchForm.equipCode" type="text" :class="inputStyle" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle">설비명</label>
            <input v-model="searchForm.equipName" type="text" :class="inputStyle" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle">설비유형</label>
            <input v-model="searchForm.equipType" type="text" :class="inputStyle" />
          </div>
          <div class="flex items-center gap-17 mb-2">
            <div :class="labelStyle">설비상태</div>
            <label :class="labelStyle"
              >가동
              <input
                v-model="searchForm.equipStatus"
                type="radio"
                name="equip-using"
                class="checkboxStyle"
                checked
              />
            </label>
            <label :class="labelStyle"
              >비가동
              <input
                v-model="searchForm.equipStatus"
                type="radio"
                name="equip-using"
                class="checkboxStyle"
              />
            </label>
          </div>
        </div>
      </template>
    </ComponentCard>

    <div class="flex gap-2 mt-2 width-full" style="height: 550px">
      <ComponentCard title="목록" className="shadow-sm w-1/2">
        <template #header-right>
          <div class="flex justify-end">
            <button class="btn-common btn-color">삭제</button>
          </div>
        </template>
        <template #body-content>
          <DataTable
            :value="equipList"
            showGridlines
            v-model:selection="selectedbox"
            dataKey="equip_code"
            scrollable
            scrollHeight="390px"
            class="text-sm"
            :rows="20"
            size="small"
          >
            <DataCol
              field="equipCheck"
              header=""
              :pt="{ columnHeaderContent: 'justify-center' }"
              selectionMode="single"
              style="width: 10px"
            />
            <DataCol
              field="equip_code"
              header="설비코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="equip_name"
              header="설비명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: center"
            />
            <DataCol
              field="equip_type"
              header="설비유형"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="manager"
              header="담당자"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="equip_status"
              header="설비상태"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="insp_cycle"
              header="점검예정일"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 110px; text-align: center"
            />
          </DataTable>
        </template>
      </ComponentCard>
      <ComponentCard title="등록/수정" class="shadow-sm w-1/2">
        <!-- 상단 버튼 -->
        <template #header-right>
          <div class="flex justify-end gap-2">
            <button @click="getEquipList" class="btn-common btn-color">저장</button>
            <button class="btn-common btn-white">신규</button>
          </div>
        </template>

        <!-- ✅ 등록 폼 (라벨2 + 입력4) x 2 = 한 줄 4칸 -->
        <template #body-content>
          <!-- 스크롤/고정높이 제거 -->
          <form id="equip-form">
            <table class="w-full table-fixed border-collapse border border-gray-300">
              <colgroup>
                <col style="width: 120px" />
                <col />
                <col style="width: 120px" />
                <col />
              </colgroup>

              <tbody>
                <!-- 1행: 설비코드 / 설비명 -->
                <tr>
                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    설비코드
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <input type="text" :class="inputStyle" />
                  </td>

                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    설비명
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <input type="text" :class="inputStyle" />
                  </td>
                </tr>

                <!-- 2행: 설비유형 / 담당자(내장 돋보기) -->
                <tr>
                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    설비유형
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <input type="text" :class="inputStyle" />
                  </td>

                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    담당자
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <div class="relative">
                      <!-- 입력 오른쪽에 아이콘 여백 -->
                      <input type="text" :class="inputStyle + ' pr-10'" />
                      <!-- 돋보기 아이콘 버튼 -->
                      <button
                        type="button"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-600"
                        @click="openModal"
                        aria-label="담당자 찾기"
                        title="담당자 찾기"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" class="fill-current">
                          <path
                            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- 3행: 제조사 / 설치일자 -->
                <tr>
                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    제조사
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <input type="text" :class="inputStyle" />
                  </td>

                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    설치일자
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <div class="relative">
                      <flat-pickr
                        v-model="orderStartDates"
                        :config="flatpickrConfig"
                        class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                      <span
                        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        <!-- 달력 아이콘 -->
                        <svg class="fill-current" width="20" height="20" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                          />
                        </svg>
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- 4행: 모델명 / (오른쪽) 설비이미지 - 2행 rowspan 시작 -->
                <tr>
                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    모델명
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <input type="text" :class="inputStyle" />
                  </td>

                  <!-- 설비이미지: 라벨+셀 모두 2행 차지 -->
                  <th
                    rowspan="2"
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2 align-top"
                  >
                    설비이미지
                  </th>
                  <td rowspan="2" class="border border-gray-300 p-2 align-top">
                    <!-- 숨김 파일 입력 -->
                    <input
                      ref="fileInputEl"
                      id="eqpImage"
                      type="file"
                      accept="image/*"
                      class="sr-only"
                      @change="onFileChange"
                    />

                    <!-- 인풋 그룹 -->
                    <div class="flex w-full min-w-0">
                      <!-- ✅ min-w-0: 내부 요소 올바른 축소 -->
                      <!-- 파일명 인풋: 줄어들어도 됨 -->
                      <input
                        :value="eqpImageName"
                        readonly
                        class="dark:bg-dark-900 h-11 flex-1 rounded-l-lg rounded-r-none border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:z-10 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                      <!-- 파일 첨부 버튼: 줄바꿈 금지 + 수축 금지 + 최소폭 -->
                      <label
                        for="eqpImage"
                        class="inline-flex items-center justify-center h-11 px-4 rounded-r-lg border border-l-0 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-brand-500/30 whitespace-nowrap shrink-0 min-w-[96px]"
                        title="이미지 선택"
                      >
                        파일 첨부
                      </label>
                    </div>

                    <div class="mt-2 flex items-center gap-2">
                      <button
                        v-if="eqpImagePreview"
                        type="button"
                        class="btn-common btn-white"
                        @click="clearImage"
                      >
                        제거
                      </button>
                      <span class="text-xs text-gray-500">JPG/PNG, 최대 10MB</span>
                    </div>

                    <img
                      v-if="eqpImagePreview"
                      :src="eqpImagePreview"
                      alt="이미지 미리보기"
                      class="mt-2 w-24 h-24 rounded-lg border object-cover"
                    />
                  </td>
                </tr>

                <!-- 5행: 제조일자 / (오른쪽은 이미지가 차지) -->
                <tr>
                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    제조일자
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <div class="relative">
                      <flat-pickr
                        v-model="orderStartDates"
                        :config="flatpickrConfig"
                        class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                      <span
                        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        <svg class="fill-current" width="20" height="20" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                          />
                        </svg>
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- 6행: 점검주기 / 설비상태 -->
                <tr>
                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    점검주기
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <input type="text" :class="inputStyle" placeholder="예: 30(일)" />
                  </td>

                  <th
                    class="border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 text-left p-2"
                  >
                    설비상태
                  </th>
                  <td class="border border-gray-300 p-2 align-middle">
                    <select :class="inputStyle">
                      <option value="">선택</option>
                      <option value="RUN">가동</option>
                      <option value="STOP">비가동</option>
                      <option value="MAINT">점검중</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          <!-- 담당자 검색 모달은 폼 바깥 -->
          <equipSelectModal :visible="isModalOpen" @close="closeModal" />
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped></style>
