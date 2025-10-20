<script setup lang="ts">
/* ========================
 * Imports
 * ======================== */
import { ref, shallowRef, onMounted, watch } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import ComponentCardWoong from '@/components/common/ComponentCardButtonWoong.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'

import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import '@/assets/common.css'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

/* ========================
 * Types
 * ======================== */
interface EquipItem {
  equipCode: string
  equipName: string
  equipType: string
  equipTypeName?: string // ← 화면표시용
  manager: string | null
  equipStatus: string
  equipStatusName?: string // ← 화면표시용
  inspCycle: number | null
  installDate: string | null
  modelName: string | null
  equipImage: string | null
  mfgDt: string | null
  maker: string | null
}

/** 비가동 데이터(예시 스키마) */
interface DowntimeItem {
  downtimeCode: string // 고유키
  equipName: string
  equipCode: string
  downtimeType: string
  workerId: string | null
  downtimeStart: string // 시작 일시
  downtimeEnd: string | null // 종료 일시(이력일 때만 존재)
  progressStatus: string | null // 진행 상태(진행중 탭 용)
  description: string | null
  durationMin?: number | null // 이력 탭 용
}

/* ========================
 * UI Const
 * ======================== */
const currentPageTitle = ref('설비 기준정보 관리')
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

/* ========================
 * Utils (mappers & inits)
 * ======================== */
const toCamel = (r: any): EquipItem => ({
  equipCode: r.equipCode ?? r.equip_code ?? '',
  equipName: r.equipName ?? r.equip_name ?? '',
  equipType: r.equipType ?? r.equip_type ?? '',
  equipTypeName: r.equipTypeName ?? r.equip_type_name ?? '',
  manager: r.manager ?? null,
  equipStatus: r.equipStatus ?? r.equip_status ?? '',
  equipStatusName: r.equipStatusName ?? r.equip_status_name ?? '',
  inspCycle: r.inspCycle ?? r.insp_cycle ?? null,
  installDate: r.installDate ?? r.install_date ?? null,
  modelName: r.modelName ?? r.model_name ?? null,
  equipImage: r.equipImage ?? r.equip_image ?? null,
  mfgDt: r.mfgDt ?? r.mfg_dt ?? null,
  maker: r.maker ?? null,
})

const initSearch = () => ({ equipCode: '', equipName: '', equipType: '', equipStatus: 'j1' })

//등록페이지로 이동하는 라우터
const goDowntimeRegister = () => {
  if (!selectedRow.value) {
    alert('설비를 선택하세요.')
    return
  }
  // ✅ URL은 간단히 equipCode만 전달
  router.push({
    name: 'DownTimeRegister',
    query: { equipCode: selectedRow.value.equipCode },
  })
}

// ✅ 진행중/이력 목록 행 클릭 → 상세 페이지
const onClickDowntimeRow = (row: any) => {
  if (!row) return
  // 진행중 상세 라우트: 예) name: 'DowntimeDetailRunning'
  // 이력 상세 라우트가 따로 있으면 분기하세요.
  router.push({ name: 'DowntimeDetail', params: { code: row.downtimeId || row.downtimeCode } })
}

/* ========================
 * State
 * ======================== */
//조회 폼
const searchForm = ref(initSearch())
//설비 목록(테이블 데이터)
const equipList = shallowRef<EquipItem[]>([])
//설비 테이블에서 선택한 1행
const selectedRow = ref<EquipItem | null>(null)

/** 비가동 탭 상태 */
const activeTab = ref(0) // 0=진행중, 1=비가동 이력
//비가동 목록 데이터(각 탭 데이터).
const downInProgress = ref<DowntimeItem[]>([])
const downHistory = ref<DowntimeItem[]>([])

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

// 설비유형 공통코드
interface ViewType {
  code: string // ✅ 코드값
  name: string // ✅ 화면 표시용 이름
}

const TypeInfo = ref<ViewType[]>([])

const viewType = async () => {
  try {
    const result = await axios.get('/api/equipments')
    TypeInfo.value = result.data
  } catch (err) {
    console.error(err)
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

//  한 번에 새로고침
const refreshAll = async () => {
  await Promise.all([refreshPending(), refreshComplete(), getEquipList()])
}

/* ========================
 * Handlers
 * ======================== */

// utils/date.ts (혹은 현재 파일 상단)
function formatDt(iso?: string | null, tz = 'Asia/Seoul') {
  if (!iso) return ''
  const d = new Date(iso) // 서버가 Z(UTC)로 보내면 로컬/타임존 변환됨
  // 한국식 "YYYY. M. D. HH:MM" 형태
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  })
    .format(d)
    .replace(/\.\s/g, '-')
    .replace(/\.$/, '') // 2025-10-20 17:15 처럼
}

//조회 폼 초기화.
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

onMounted(async () => {
  // 초기 탭(진행중)과 이력 둘 다 한 번 로드해도 좋음
  await refreshAll()
  await viewType()
  await getEquipList()
  await refreshPending() // 진행중 비가동 탭
  await refreshComplete() // 이력 탭
})

//  등록 페이지에서 돌아올 때 ?refresh=1 로 오면 자동 새로고침
watch(
  () => route.query.refresh,
  async (v) => {
    if (v) await refreshAll()
  },
  { immediate: false },
)
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
              <select v-model="searchForm.equipType" :class="inputStyle">
                <option value="">설비유형 선택</option>
                <option v-for="(item, index) in TypeInfo" :key="index" :value="item.code">
                  {{ item.name }}
                </option>
              </select>
            </div>
            <div class="w-1/4">
              <div :class="labelStyle">설비상태</div>
              <label class="flex items-center gap-2">
                <input
                  v-model="searchForm.equipStatus"
                  type="radio"
                  name="equip-using"
                  value="j1"
                />
                가동중
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
            <button class="btn-common btn-color" @click="goDowntimeRegister">비가동</button>
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
            <DataCol field="equipTypeName" header="설비유형" sortable />
            <DataCol field="manager" header="담당자" sortable />
            <DataCol field="equipStatusName" header="설비상태" sortable />
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
      <ComponentCardWoong title="">
        <template #body-content>
          <!-- ✅ 슬롯 flatten 충돌 방지: 한 겹 감싸기 -->
          <div class="h-78">
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
                  @row-click="({ data }) => onClickDowntimeRow(data)"
                >
                  <DataCol field="equipCode" header="설비코드" />
                  <DataCol field="equipName" header="설비명" />
                  <DataCol field="downtimeType" header="비가동유형" />
                  <DataCol field="workerId" header="담당자" />
                  <DataCol field="downtimeStart" header="비가동시작일시" />
                  <DataCol field="downtimeEnd" header="비가동종료일시" />
                  <DataCol field="progressStatus" header="진행상태" />
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
                  @row-click="({ data }) => onClickDowntimeRow(data)"
                >
                  <DataCol field="equipCode" header="설비코드" />
                  <DataCol field="equipName" header="설비명" />
                  <DataCol field="downtimeType" header="비가동유형" />
                  <DataCol field="workerId" header="담당자" />
                  <!-- 시작일시 포맷 -->
                  <DataCol field="downtimeStart" header="비가동시작일시">
                    <template #body="{ data }">
                      {{ formatDt(data.downtimeStart) }}
                    </template>
                  </DataCol>

                  <!-- 종료일시 포맷 -->
                  <DataCol field="downtimeEnd" header="비가동종료일시">
                    <template #body="{ data }">
                      {{ formatDt(data.downtimeEnd) }}
                    </template>
                  </DataCol>
                  <DataCol field="progressStatus" header="진행상태" />
                </DataTable>
              </TabPanel>
            </TabView>
          </div>
        </template>
      </ComponentCardWoong>
    </div>
  </AdminLayout>
</template>
