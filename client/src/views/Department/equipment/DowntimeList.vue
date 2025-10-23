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

const currentPageTitle = ref('비가동 설비 관리')

const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

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

// 설비목록 > [비가동] 버튼: 항상 "등록" 모드로
const goDowntimeRegister = () => {
  if (!selectedRow.value) {
    alert('설비를 선택하세요.')
    return
  }
  router.push({
    name: 'DownTimeManage', // ← 라우터 설정과 같은 name으로 통일
    query: {
      equipCode: selectedRow.value.equipCode,
    },
  })
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

/* ========================
 * State
 * ======================== */
const selectdownInProgress = ref<DowntimeItem | null>(null)
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

/** 비가동 진행중 목록 */
// 기존 onClickDowntimeRow 제거하고 아래로 대체
const ending = ref(false)

const endRunningDowntime = async () => {
  if (activeTab.value !== 0) return
  const row = selectdownInProgress.value
  if (!row) return alert('진행중 목록에서 종료할 행을 선택하세요.')

  if (!confirm(`[${row.equipName}] 비가동을 종료할까요?`)) return

  try {
    ending.value = true
    await axios.put(`/api/downtime/${encodeURIComponent(row.downtimeCode)}/end`, {
      // 필요 시 설명/명시적 종료시각 전달
      description: row.description ?? null,
      progressStatus: '완료',
      // downtimeEnd: new Date().toISOString(),
    })

    // 목록 새로고침 + 이력 탭으로 이동
    await Promise.all([refreshPending(), refreshComplete(), getEquipList()])
    activeTab.value = 1
    selectdownInProgress.value = null
    alert('비가동을 종료했습니다.')
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '종료 처리에 실패했습니다.')
  } finally {
    ending.value = false
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
function formatDt(iso?: string | null, opt: { weekday?: boolean } = {}) {
  if (!iso) return ''
  const d = new Date(iso)
  const s = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(opt.weekday ? { weekday: 'short' } : {}),
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(d) // 예: "2025. 10. 21. 화 10:46" 또는 "2025. 10. 21. 10:46"

  // 공백과 점을 정리해서: "2025.10.21 10:46" 또는 "2025.10.21 (화) 10:46"
  if (opt.weekday && /[월화수목금토일]/.test(s)) {
    return s
      .replace(/\.\s/g, '.')
      .replace(/\s([월화수목금토일])\s/, ' ($1) ')
      .replace(/\.$/, '')
      .replace(/(\d{4}\.\d{2}\.\d{2})/, '$1') // "2025.10.21 (화) 10:46"
  }
  return s
    .replace(/\.\s/g, '.')
    .replace(/\.$/, '')
    .replace(/(\d{4}\.\d{2}\.\d{2})\./, '$1 ') // 날짜와 시간 사이엔 공백!
}
//조회 폼 초기화.
const resetSearchForm = () => Object.assign(searchForm.value, initSearch())

const onRowClick = (e: { data: EquipItem }) => {
  selectedRow.value = e.data // 버튼 활성화 용
}
const onSelectionChange = (e: { value: EquipItem | null }) => {
  selectedRow.value = e.value // 버튼 활성화 용
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

    <ComponentCard title="조회">
      <template #header-right>
        <div class="flex justify-end gap-2">
          <button @click="resetSearchForm" class="btn-common btn-white">초기화</button>
          <button @click="getEquipList" class="btn-common btn-color">조회</button>
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
            <div class="relative z-20 bg-transparent">
              <select v-model="searchForm.equipType" :class="selectStyle">
                <option value="">설비유형 선택</option>
                <option v-for="(item, index) in TypeInfo" :key="index" :value="item.code">
                  {{ item.name }}
                </option>
              </select>
              <span
                class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
              >
                <svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
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
          <div class="hidden">
            <div :class="labelStyle">설비상태</div>
            <label class="flex items-center gap-2">
              <input v-model="searchForm.equipStatus" type="radio" name="equip-using" value="j1" />
              가동중
            </label>
          </div>
        </div>
      </template>
    </ComponentCard>

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
            <DataCol
              field="equipCode"
              header="설비코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="min-width: 100px"
              bodyStyle="text-align: center"
            />
            <DataCol
              field="equipName"
              header="설비명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="min-width: 100px"
            />
            <DataCol
              field="equipTypeName"
              header="설비유형"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="min-width: 100px"
            />
            <DataCol
              field="manager"
              header="담당자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="min-width: 100px"
            />
            <DataCol
              field="equipStatusName"
              header="설비상태"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="min-width: 100px"
            />
            <DataCol
              field="inspCycle"
              header="점검주기(일)"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="min-width: 100px"
              bodyStyle="text-align: right"
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
          <div class="relative">
            <div class="absolute right-0 top-0 z-10 flex space-x-2">
              <button
                v-if="activeTab != 1"
                type="button"
                class="btn-color btn-common"
                @click="endRunningDowntime"
                :disabled="ending || !selectdownInProgress"
                style="width: 120px"
              >
                비가동 종료
              </button>
            </div>
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
                  dataKey="downtimeCode"
                  scrollable
                  scrollHeight="220px"
                  class="text-sm"
                  :rows="20"
                  size="small"
                  v-model:selection="selectdownInProgress"
                >
                  <DataCol
                    selection-mode="single"
                    headerStyle="width:37px"
                    bodyStyle="width:37px"
                  />

                  <DataCol
                    field="equipCode"
                    header="설비코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                    bodyStyle="text-align: center"
                  />
                  <DataCol
                    field="equipName"
                    header="설비명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                  />
                  <DataCol
                    field="downtimeType"
                    header="비가동유형"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                  />
                  <DataCol
                    field="workerId"
                    header="담당자"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                  />
                  <!-- ✅ 시작일시/종료일시 포맷 적용 -->
                  <DataCol
                    field="downtimeStart"
                    header="비가동시작일시"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                    bodyStyle="text-align: center"
                  >
                    <template #body="{ data }">
                      {{ formatDt(data.downtimeStart) }}
                    </template>
                  </DataCol>
                  <DataCol
                    field="downtimeEnd"
                    header="비가동종료일시"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                    bodyStyle="text-align: center"
                  >
                    <template #body="{ data }">
                      {{ data.downtimeEnd ? formatDt(data.downtimeEnd) : '—' }}
                    </template>
                  </DataCol>
                  <DataCol
                    field="progressStatus"
                    header="진행상태"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                  />
                </DataTable>
              </TabPanel>

              <!-- 비가동 이력 -->
              <TabPanel header="비가동 이력">
                <DataTable
                  :value="downHistory"
                  showGridlines
                  dataKey="downtimeCode"
                  scrollable
                  scrollHeight="220px"
                  class="text-sm"
                  :rows="20"
                  size="small"
                >
                  <DataCol
                    field="equipCode"
                    header="설비코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                    bodyStyle="text-align: center"
                  />
                  <DataCol
                    field="equipName"
                    header="설비명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                  />
                  <DataCol
                    field="downtimeType"
                    header="비가동유형"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                  />
                  <DataCol
                    field="workerId"
                    header="담당자"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                  />
                  <!-- 시작일시 포맷 -->
                  <DataCol
                    field="downtimeStart"
                    header="비가동시작일시"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                    bodyStyle="text-align: center"
                  >
                    <template #body="{ data }">
                      {{ formatDt(data.downtimeStart) }}
                    </template>
                  </DataCol>

                  <!-- 종료일시 포맷 -->
                  <DataCol
                    field="downtimeEnd"
                    header="비가동종료일시"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                    bodyStyle="text-align: center"
                  >
                    <template #body="{ data }">
                      {{ formatDt(data.downtimeEnd) }}
                    </template>
                  </DataCol>
                  <DataCol
                    field="progressStatus"
                    header="진행상태"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="min-width: 100px"
                  />
                </DataTable>
              </TabPanel>
            </TabView>
          </div>
        </template>
      </ComponentCardWoong>
    </div>
  </AdminLayout>
</template>
<style>
/* 기존 유지 */
.p-tabview-panels {
  padding: 0 !important;
}
</style>
