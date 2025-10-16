<script setup lang="ts">
/* ========================
 * Imports
 * ======================== */
import { ref, shallowRef, computed, onBeforeMount, onMounted } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import equipSelectModal from './equipSelectModal.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import '@/assets/common.css'

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

/** 비가동 데이터(예시 스키마) */
interface DowntimeItem {
  downtimeId: string // 고유키
  equipCode: string
  equipName: string
  equipType: string
  manager: string | null
  startAt: string // 시작 일시
  endAt?: string | null // 종료 일시(이력일 때만 존재)
  progress?: string | null // 진행 상태(진행중 탭 용)
  reason?: string | null
  durationMin?: number | null // 이력 탭 용
}

/* ========================
 * UI Const
 * ======================== */
const currentPageTitle = ref('설비 기준정보 관리')
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const flatpickrConfig = { dateFormat: 'Y-m-d', altInput: true, altFormat: 'Y-m-d', wrap: true }
const fileStyle =
  'focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400'

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
const initSearch = () => ({ equipCode: '', equipName: '', equipType: '', equipStatus: '' })

/* ========================
 * State
 * ======================== */
const searchForm = ref(initSearch())
const equipList = shallowRef<EquipItem[]>([])
const selectedRow = ref<EquipItem | null>(null)
const count = computed(() => equipList.value.length)

/** 비가동 탭 상태 */
const activeTab = ref(0) // 0=진행중, 1=비가동 이력
const downInProgress = ref<DowntimeItem[]>([])
const downHistory = ref<DowntimeItem[]>([])

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
//다건 조회 (설비 기준정보)
const getEquipList = async () => {
  try {
    const { data } = await axios.get('/api/equipment', { params: searchForm.value })
    equipList.value = (Array.isArray(data) ? data : []).map(toCamel)
  } catch (e) {
    console.error(e)
    equipList.value = []
  }
}

// 상세 단건 조회
const getEquipDetail = async (code: string): Promise<EquipItem | null> => {
  try {
    const { data } = await axios.get(`/api/equipment/${encodeURIComponent(code)}`)
    return toCamel(data)
  } catch (e) {
    console.error('상세 조회 실패:', e)
    return null
  }
}

/** 비가동 진행중 목록 */
const refreshPending = async () => {
  try {
    const { data } = await axios.get('/api/downtime', { params: { status: 'running' } })
    downInProgress.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('진행중 조회 실패:', e)
    downInProgress.value = []
  }
}

/** 비가동 이력 목록 */
const refreshComplete = async () => {
  try {
    const { data } = await axios.get('/api/downtime', { params: { status: 'history' } })
    downHistory.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('이력 조회 실패:', e)
    downHistory.value = []
  }
}

/* ========================
 * Handlers
 * ======================== */
const resetSearchForm = () => Object.assign(searchForm.value, initSearch())

const fillFormFromRow = (row: EquipItem) => {
  createForm.value = { ...row, inspCycle: row.inspCycle ?? 0 }
}
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

/** 탭 변경 */
const onTabChange = async (e: { index: number }) => {
  activeTab.value = e.index
  if (e.index === 0) await refreshPending()
  else await refreshComplete()
}

/* ========================
 * Lifecycle
 * ======================== */
onBeforeMount(async () => {
  await getEquipList()
})
onMounted(async () => {
  // 초기 탭(진행중)과 이력 둘 다 한 번 로드해도 좋음
  await refreshPending()
  await refreshComplete()
})

/* (등록/수정에서 쓰면) 폼 상태 — 필요하면 그대로 추가 */
const createForm = ref<CreateEquipPayload>({
  equipCode: '',
  equipName: '',
  equipType: '',
  manager: '',
  equipStatus: 'j2',
  inspCycle: 0,
  installDate: '',
  modelName: '',
  equipImage: '',
  mfgDt: '',
  maker: '',
})
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <!-- 조회 -->
    <div class="space-y-5 sm:space-y-6 mt-2">
      <ComponentCard title="조회">
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
    </div>

    <!-- 기준정보 설비 목록 -->
    <div class="space-y-5 sm:space-y-6 mt-2">
      <ComponentCard title="설비목록">
        <template #header-right>
          <div class="flex justify-end">
            <button class="btn-common btn-color">비가동</button>
          </div>
        </template>

        <template #body-content>
          <DataTable
            :value="equipList"
            showGridlines
            v-model:selection="selectedRow"
            dataKey="equipCode"
            scrollable
            scrollHeight="150px"
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
    </div>

    <!-- 비가동 목록 (탭) -->
    <!-- 비가동 목록 (탭) -->
    <div class="space-y-5 sm:space-y-6 mt-2">
      <ComponentCard title="">
        <template #body-content>
          <!-- ✅ 슬롯 flatten 충돌 방지: 한 겹 감싸기 -->
          <div>
            <TabView
              v-model:activeIndex="activeTab"
              @tab-change="onTabChange"
              :pt="{ navContainer: { class: 'pr-40' } }"
            >
              <!-- 진행중 -->
              <TabPanel header="진행중">
                <!-- ✅ v-if 불필요: TabPanel이 가시성 관리 -->
                <DataTable
                  :value="downInProgress"
                  showGridlines
                  dataKey="downtimeId"
                  scrollable
                  scrollHeight="220px"
                  class="text-sm"
                  :rows="20"
                  size="small"
                >
                  <DataCol field="equipCode" header="설비코드" />
                  <DataCol field="equipName" header="설비명" />
                  <DataCol field="equipType" header="설비유형" />
                  <DataCol field="manager" header="담당자" />
                  <DataCol field="startAt" header="비가동 시작" />
                  <DataCol field="reason" header="사유" />
                  <DataCol field="progress" header="진행상태" />
                </DataTable>
              </TabPanel>

              <!-- 비가동 이력 -->
              <TabPanel header="비가동 이력">
                <DataTable
                  :value="downHistory"
                  showGridlines
                  dataKey="downtimeId"
                  scrollable
                  scrollHeight="220px"
                  class="text-sm"
                  :rows="20"
                  size="small"
                >
                  <DataCol field="equipCode" header="설비코드" />
                  <DataCol field="equipName" header="설비명" />
                  <DataCol field="equipType" header="설비유형" />
                  <DataCol field="manager" header="담당자" />
                  <DataCol field="startAt" header="시작" />
                  <DataCol field="endAt" header="종료" />
                  <DataCol field="durationMin" header="소요(분)" />
                  <DataCol field="reason" header="사유" />
                </DataTable>
              </TabPanel>
            </TabView>
          </div>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>
