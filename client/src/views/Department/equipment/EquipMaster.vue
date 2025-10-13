<script setup lang="ts">
/* ========================
 * Imports
 * ======================== */
import { ref, shallowRef, computed, onBeforeMount } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import equipSelectModal from './equipSelectModal.vue'

/* ========================
 * Types
 * ======================== */
interface EquipItem {
  equipCode: string
  equipName: string
  equipType: string
  manager: string | null
  equipStatus: string | number | null
  inspCycle: number | null
  installDate: string | null
  modelName: string | null
  equipImage: string | null
  mfgDt: string | null
  maker: string | null
}
type CreateEquipPayload = Omit<EquipItem, 'equipImage'> & { equipImage?: string }

/* ========================
 * UI Const
 * ======================== */
const currentPageTitle = ref('설비 기준정보 관리')
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const flatpickrConfig = { dateFormat: 'Y-m-d', altInput: true, altFormat: 'Y-m-d', wrap: true }
const fileStyle =
  'focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400'

/* ========================
 * Utils (mappers & inits)
 * ======================== */
const toCamel = (r: any): EquipItem => ({
  equipCode: r.equipCode ?? r.equip_code ?? '',
  equipName: r.equipName ?? r.equip_name ?? '',
  equipType: r.equipType ?? r.equip_type ?? '',
  manager: r.manager ?? null,
  equipStatus: r.equipStatus ?? r.equip_status ?? null,
  inspCycle: r.inspCycle ?? r.insp_cycle ?? null,
  installDate: r.installDate ?? r.install_date ?? null,
  modelName: r.modelName ?? r.model_name ?? null,
  equipImage: r.equipImage ?? r.equip_image ?? null,
  mfgDt: r.mfgDt ?? r.mfg_dt ?? null,
  maker: r.maker ?? null,
})
const toSnake = (p: CreateEquipPayload) => ({
  equip_code: p.equipCode?.trim(),
  equip_name: p.equipName?.trim(),
  equip_type: p.equipType?.trim(),
  manager: p.manager ?? null,
  equip_status: p.equipStatus ?? null,
  insp_cycle: p.inspCycle ?? null,
  install_date: p.installDate || null,
  model_name: p.modelName || null,
  equip_image: p.equipImage || null,
  mfg_dt: p.mfgDt || null,
  maker: p.maker || null,
})
const initForm = (): CreateEquipPayload => ({
  equipCode: '',
  equipName: '',
  equipType: '',
  manager: '',
  equipStatus: '',
  inspCycle: 0,
  installDate: '',
  modelName: '',
  equipImage: '',
  mfgDt: '',
  maker: '',
})
const initSearch = () => ({ equipCode: '', equipName: '', equipType: '', equipStatus: '' })

/* ========================
 * State
 * ======================== */
const searchForm = ref(initSearch())
const equipList = shallowRef<EquipItem[]>([])
const selectedRow = ref<EquipItem | null>(null)
const createForm = ref<CreateEquipPayload>(initForm())
const count = computed(() => equipList.value.length)

/* (optional) 담당자 모달 & 이미지 프리뷰 */
const isModalOpen = ref(false)
const openModal = () => (isModalOpen.value = true)
const closeModal = () => (isModalOpen.value = false)
const fileInputEl = ref<HTMLInputElement | null>(null)
const eqpImageName = ref('선택된 파일 없음')
const eqpImagePreview = ref('')
const onFileChange = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) {
    eqpImageName.value = '선택된 파일 없음'
    eqpImagePreview.value = ''
    return
  }
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

/* ========================
 * API
 * ======================== */
//다건 조회
const getEquipList = async () => {
  try {
    const { data } = await axios.get('/api/equipment', { params: searchForm.value })
    equipList.value = (Array.isArray(data) ? data : []).map(toCamel)
  } catch (e) {
    console.error(e)
    equipList.value = []
  }
}

//수정/등록 함수
const saveEquip = async () => {
  // 필수값
  if (
    !createForm.value.equipCode?.trim() ||
    !createForm.value.equipName?.trim() ||
    !createForm.value.equipType?.trim()
  ) {
    alert('설비코드/설비명/설비유형은 필수입니다.')
    return
  }
  try {
    if (selectedRow.value) {
      const code = selectedRow.value.equipCode || createForm.value.equipCode
      await axios.put(`/api/equipment/${encodeURIComponent(code)}`, toSnake(createForm.value))
      alert('수정 완료!')
    } else {
      await axios.post('/api/equipment', toSnake(createForm.value))
      alert('등록 완료!')
    }
    await getEquipList()
  } catch (e) {
    console.error(e)
    alert('저장 실패')
  }
}
// (추가) 상세 단건 조회
const getEquipDetail = async (code: string): Promise<EquipItem | null> => {
  try {
    const { data } = await axios.get(`/api/equipment/${encodeURIComponent(code)}`)
    return toCamel(data)
  } catch (e) {
    console.error('상세 조회 실패:', e)
    return null
  }
}
// 삭제 함수
const deleteOne = async () => {
  if (!selectedRow.value) return
  const code = selectedRow.value.equipCode
  const ok = confirm(`[${code}] 설비를 삭제할까요?`)
  if (!ok) return

  try {
    await axios.delete(`/api/equipment/${encodeURIComponent(code)}`)
    alert('삭제 완료')
    selectedRow.value = null // 선택 해제
    resetCreateForm() // 오른쪽 폼 초기화(있으면)
    await getEquipList() // 목록 새로고침
  } catch (err: any) {
    console.error(err?.response ?? err)
    // FK 제약 등으로 삭제 실패할 수 있음
    alert(err?.response?.data?.message ?? '삭제 실패')
  }
}

/* ========================
 * Handlers
 * ======================== */
const resetSearchForm = () => Object.assign(searchForm.value, initSearch())
const resetCreateForm = () => {
  selectedRow.value = null
  createForm.value = initForm()
}

const fillFormFromRow = (row: EquipItem) => {
  createForm.value = { ...row, inspCycle: row.inspCycle ?? 0 }
}
// (수정) 클릭/선택 시 상세 먼저 가져와서 폼 채우기
const onRowClick = async (e: { data: EquipItem }) => {
  selectedRow.value = e.data
  const detail = await getEquipDetail(e.data.equipCode)
  fillFormFromRow(detail ?? e.data)
}
const onSelectionChange = async (e: { value: EquipItem | null }) => {
  if (!e.value) return
  selectedRow.value = e.value
  const detail = await getEquipDetail(e.value.equipCode)
  fillFormFromRow(detail ?? e.value)
}

/* ========================
 * Lifecycle
 * ======================== */
onBeforeMount(getEquipList)
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <!-- 조회 -->
    <ComponentCard title="조회" className="shadow-sm">
      <template #header-right>
        <div class="flex justify-end gap-2">
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
          <div class="flex items-center gap-6">
            <div :class="labelStyle">설비상태</div>
            <label class="flex items-center gap-2">
              <input
                v-model="searchForm.equipStatus"
                type="radio"
                name="equip-using"
                value="가동중"
              />
              가동중
            </label>
            <label class="flex items-center gap-2">
              <input
                v-model="searchForm.equipStatus"
                type="radio"
                name="equip-using"
                value="비가동"
              />
              비가동
            </label>
          </div>
        </div>
      </template>
    </ComponentCard>

    <div class="flex gap-2 mt-2 w-full" style="height: 550px">
      <!-- 목록 -->
      <ComponentCard title="목록" class="shadow-sm w-1/2">
        <template #header-right>
          <div class="flex justify-end">
            <button class="btn-common btn-color" :disabled="!selectedRow" @click="deleteOne">
              삭제
            </button>
          </div>
        </template>

        <template #body-content>
          <DataTable
            :value="equipList"
            showGridlines
            v-model:selection="selectedRow"
            dataKey="equipCode"
            scrollable
            scrollHeight="390px"
            class="text-sm"
            :rows="20"
            size="small"
            @row-click="onRowClick"
            @selection-change="onSelectionChange"
          >
            <DataCol selectionMode="single" headerStyle="width: 2.5rem" />
            <DataCol field="equipCode" header="설비코드" />
            <DataCol field="equipName" header="설비명" />
            <DataCol field="equipType" header="설비유형" sortable />
            <DataCol field="manager" header="담당자" sortable />
            <DataCol field="equipStatus" header="설비상태" sortable />
            <DataCol
              field="inspCycle"
              header="점검주기"
              sortable
              style="width: 110px; text-align: center"
            />
          </DataTable>
        </template>
      </ComponentCard>

      <!-- 등록/수정 -->
      <ComponentCard title="등록/수정" class="shadow-sm w-1/2">
        <template #header-right>
          <div class="flex justify-end gap-2">
            <button @click="saveEquip" class="btn-common btn-color">저장</button>
            <button @click="resetCreateForm" class="btn-common btn-white">신규</button>
          </div>
        </template>

        <template #body-content>
          <form @submit.prevent="saveEquip">
            <table class="w-full table-fixed border-collapse border border-gray-300">
              <colgroup>
                <col style="width: 120px" />
                <col />
                <col style="width: 120px" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">설비코드</th>
                  <td class="border border-gray-300 p-2">
                    <input
                      v-model="createForm.equipCode"
                      :disabled="!!selectedRow"
                      type="text"
                      :class="inputStyle"
                    />
                  </td>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">설비명</th>
                  <td class="border border-gray-300 p-2">
                    <input v-model="createForm.equipName" type="text" :class="inputStyle" />
                  </td>
                </tr>

                <tr>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">설비유형</th>
                  <td class="border border-gray-300 p-2">
                    <input v-model="createForm.equipType" type="text" :class="inputStyle" />
                  </td>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">담당자</th>
                  <td class="border border-gray-300 p-2">
                    <div class="relative">
                      <input
                        v-model="createForm.manager"
                        type="text"
                        :class="inputStyle + ' pr-10'"
                      />
                      <button
                        type="button"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                        @click="openModal"
                        title="담당자 찾기"
                      >
                        🔍
                      </button>
                    </div>
                  </td>
                </tr>

                <tr>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">제조사</th>
                  <td class="border border-gray-300 p-2">
                    <input v-model="createForm.maker" type="text" :class="inputStyle" />
                  </td>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">설치일자</th>
                  <td class="border border-gray-300 p-2">
                    <flat-pickr
                      v-model="createForm.installDate"
                      :disabled="!!selectedRow"
                      :config="flatpickrConfig"
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border px-4 py-2.5"
                    />
                  </td>
                </tr>

                <tr>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">모델명</th>
                  <td class="border border-gray-300 p-2">
                    <input v-model="createForm.modelName" type="text" :class="inputStyle" />
                  </td>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">
                    설비이미지
                  </th>
                  <td class="border border-gray-300 p-2">
                    <!-- <input
                      v-model="createForm.equipImage"
                      type="text"
                      :class="inputStyle"
                      placeholder="https://..."
                    /> -->
                    <input type="file" :class="fileStyle" id="inspFile" />
                  </td>
                </tr>

                <tr>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">제조일자</th>
                  <td class="border border-gray-300 p-2">
                    <flat-pickr
                      v-model="createForm.mfgDt"
                      :disabled="!!selectedRow"
                      :config="flatpickrConfig"
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border px-4 py-2.5"
                    />
                  </td>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">
                    점검주기(일)
                  </th>
                  <td class="border border-gray-300 p-2">
                    <input
                      v-model.number="createForm.inspCycle"
                      type="number"
                      :class="inputStyle"
                      placeholder="예: 30"
                    />
                  </td>
                </tr>

                <tr>
                  <th class="border border-gray-300 bg-gray-50 text-sm text-left p-2">설비상태</th>
                  <td class="border border-gray-300 p-2" colspan="3">
                    <select v-model="createForm.equipStatus" :class="inputStyle">
                      <option value="j2" readonly>비가동</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          <equipSelectModal :visible="isModalOpen" @close="closeModal" />
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>
