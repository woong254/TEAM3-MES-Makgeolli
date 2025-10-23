<script setup lang="ts">
/* ========================
 * Imports
 * ======================== */
import { ref, shallowRef, onMounted, computed } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import equipSelectModal from './equipSelectModal.vue'
import 'primeicons/primeicons.css'
import '@/assets/common.css'

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
type CreateEquipPayload = Omit<EquipItem, 'equipImage'> & { equipImage?: string }

// 사원정보
interface EmpInfoInterface {
  emp_name: '' // 사원이름
}

/* ========================
 * UI Const
 * ======================== */
const currentPageTitle = ref('설비 기준정보 관리')
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const today = new Date()
today.setHours(0, 0, 0, 0)

const flatpickrAltClass = `${inputStyle} pr-10 text-center`

const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: flatpickrAltClass,
  allowInput: false, // 직접 입력 금지
  clickOpens: false, // 수동 open()
  maxDate: today, // 오늘/이전만 선택 가능
  onReady: (_d, _s, instance) => {
    // altInput 클릭 불가하게 처리 (래퍼 div 클릭만 가능)
    if (instance.altInput) {
      instance.altInput.setAttribute('tabindex', '-1')
      instance.altInput.readOnly = true
      instance.altInput.style.pointerEvents = 'none'
    }
  },
}

const inputDisabled =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30'
const inputStyleClick =
  'dark:bg-dark-900 h-11 w-full rounded-sm border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

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
const toSnake = (p: CreateEquipPayload) => ({
  equip_code: p.equipCode?.trim(),
  equip_name: p.equipName?.trim(),
  equip_type: p.equipType?.trim(),
  manager: p.manager ?? null,
  equip_status: p.equipStatus || 'j1',
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
  equipStatus: 'j1',
  inspCycle: 0,
  installDate: '',
  modelName: '',
  equipImage: '',
  mfgDt: '',
  maker: '',
})
const initSearch = () => ({ equipCode: '', equipName: '', equipType: '', equipStatus: '' })

const empinfo = ref<EmpInfoInterface>({
  emp_name: '', // 사원이름
})
const SelectEmp = (value: EmpInfoInterface) => {
  empinfo.value.emp_name = value.emp_name
  createForm.value.manager = value.emp_name // ✅ 저장 소스 동기화
  closeModal()
}

/* ========================
 * State
 * ======================== */
const searchForm = ref(initSearch())
const equipList = shallowRef<EquipItem[]>([])
const selectedRow = ref<EquipItem | null>(null)
const createForm = ref<CreateEquipPayload>(initForm())
const isEditing = computed(() => !!selectedRow.value)
// ▼ 설치/제조일자 피커 열기용 ref & 함수 추가
const installPicker = ref<any>(null)
const mfgPicker = ref<any>(null)

const openInstallPicker = () => installPicker.value?.fp?.open()
const openMfgPicker = () => mfgPicker.value?.fp?.open()

/* (optional) 담당자 모달 & 이미지 프리뷰 */

const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
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

//수정/등록 함수
const saveEquip = async () => {
  // 필수값
  if (
    !createForm.value.equipName?.trim() ||
    !createForm.value.equipType?.trim() ||
    !createForm.value.installDate?.trim() ||
    !createForm.value.mfgDt?.trim()
  ) {
    alert('설비명/설비유형/설치일자/제조일자는 필수입니다.')
    return
  }
  try {
    if (selectedRow.value) {
      const code = selectedRow.value.equipCode || createForm.value.equipCode
      await axios.put(`/api/equipment/${encodeURIComponent(code)}`, toSnake(createForm.value))
      alert('수정이 완료되었습니다!')
    } else {
      await axios.post('/api/equipment', toSnake(createForm.value))
      alert('등록이 완료되었습니다!')
    }
    await getEquipList()
  } catch (e) {
    console.error(e)
    alert('저장을 실패하였습니다.')
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
    alert('삭제가 완료되었습니다.')
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
  empinfo.value.emp_name = '' // ✅ 모달용 값도 초기화
}

const fillFormFromRow = (row: EquipItem) => {
  createForm.value = {
    ...(row as CreateEquipPayload),
    inspCycle: row.inspCycle ?? 0,
    equipStatus: row.equipStatus || 'j2',
  }
}

const clampInspCycle = (e: Event) => {
  const el = e.target as HTMLInputElement
  // 숫자만 남기기 (복붙/IME 등 대비)
  const onlyDigits = el.value.replace(/[^0-9]/g, '')
  if (onlyDigits === '') {
    // 빈 입력은 허용 (사용자 입력 중일 수 있음)
    createForm.value.inspCycle = null as any // 또는 기본값 1로 고정하려면: createForm.inspCycle = 1
    el.value = ''
    return
  }
  const n = parseInt(onlyDigits, 10)
  const clamped = Math.min(365, Math.max(1, Math.floor(n)))
  // 즉시 보정
  if (String(clamped) !== el.value) el.value = String(clamped)
  createForm.value.inspCycle = clamped
}

const blockInvalidKeys = (e: KeyboardEvent) => {
  // 숫자, 방향키, 백스페이스, 탭 등만 허용
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
  // 숫자 키(상단/넘버패드)
  const isDigit = e.key >= '0' && e.key <= '9'
  const isNumpadDigit = e.code?.startsWith('Numpad') && /\d$/.test(e.code)

  // 마이너스, 플러스, e, ., , 등은 차단
  if (!(isDigit || isNumpadDigit || allowed.includes(e.key))) {
    e.preventDefault()
  }
}

const onRowSelect = async (e: { data: EquipItem }) => {
  selectedRow.value = e.data
  const detail = await getEquipDetail(e.data.equipCode).catch(() => null)
  fillFormFromRow(detail ?? e.data)
}

/* ========================
 * Lifecycle
 * ======================== */

onMounted(async () => {
  await viewType()
  await getEquipList()
})
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <!-- 조회 -->
    <div class="space-y-5 sm:space-y-6 mt-2">
      <ComponentCard title="조회" className="shadow-sm">
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
                  <svg
                    class="stroke-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
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
              <label class="flex items-center gap-2">
                <input
                  v-model="searchForm.equipStatus"
                  type="radio"
                  name="equip-using"
                  value="j2"
                />
                비가동
              </label>
              <!-- <label class="flex items-center gap-2">
                <input
                  v-model="searchForm.equipStatus"
                  type="radio"
                  name="equip-using"
                  value="j5"
                />
                가동대기
              </label> -->
            </div>
          </div>
        </template>
      </ComponentCard>
    </div>

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
            @row-select="onRowSelect"
          >
            <DataCol selectionMode="single" headerStyle="width: 2.5rem; text-align: center" />
            <DataCol
              field="equipCode"
              header="설비코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="min-width: 100px; text-align: center"
            />
            <DataCol
              field="equipName"
              header="설비명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="min-width: 100px"
              sortable
            />
            <DataCol field="equipTypeName" header="설비유형" />
            <DataCol field="manager" header="담당자" />
            <DataCol field="equipStatusName" header="설비상태" />
            <DataCol
              field="inspCycle"
              header="점검주기(일)"
              style="width: 110px; text-align: right"
            />
          </DataTable>
        </template>
      </ComponentCard>

      <!-- 등록/수정 -->
      <ComponentCard title="등록/수정" class="shadow-sm w-1/2">
        <template #header-right>
          <div class="flex justify-end gap-2">
            <!-- 저장 버튼: 편집모드면 '수정', 아니면 '등록' -->
            <button @click="saveEquip" class="btn-common btn-color">
              {{ isEditing ? '수정' : '등록' }}
            </button>

            <!-- 초기화 버튼: 항상 초기화 동작, 누르면 신규 모드로 전환됨 -->
            <button @click="resetCreateForm" class="btn-common btn-white">초기화</button>
          </div>
        </template>

        <template #body-content>
          <form @submit.prevent="saveEquip">
            <div class="flex-1 flex items-center justify-center py-4">
              <table class="w-auto table-fixed border-collapse border border-gray-300 mx-auto">
                <colgroup>
                  <col style="width: 120px" />
                  <col />
                  <col style="width: 120px" />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      <span style="font-weight: bold"
                        >설비코드<span style="color: red">*</span></span
                      >
                    </th>
                    <td class="border border-gray-300 p-2">
                      <input
                        v-model="createForm.equipCode"
                        :disabled="!!selectedRow"
                        type="text"
                        :class="inputDisabled"
                        style="outline: none"
                        readonly
                      />
                    </td>
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      <span style="font-weight: bold">설비명<span style="color: red">*</span></span>
                    </th>
                    <td class="border border-gray-300 p-2">
                      <input v-model="createForm.equipName" type="text" :class="inputStyle" />
                    </td>
                  </tr>

                  <tr>
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      <span style="font-weight: bold"
                        >설비유형<span style="color: red">*</span></span
                      >
                    </th>
                    <td class="border border-gray-300 p-2">
                      <div class="relative z-20 bg-transparent">
                        <select v-model="createForm.equipType" :class="selectStyle">
                          <option value="">설비유형 선택</option>
                          <option v-for="(item, index) in TypeInfo" :key="index" :value="item.code">
                            {{ item.name }}
                          </option>
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
                        <!-- 수정모드일 때 수정 허용하고 싶다면 disabled 제거 -->
                        <button
                          v-if="selectedRow"
                          type="button"
                          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                          title="유형 변경"
                        ></button>
                      </div>
                    </td>
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      담당자
                    </th>
                    <td class="border border-gray-300 p-2">
                      <div class="relative">
                        <input
                          type="text"
                          placeholder="담당자를 선택해주세요"
                          :class="inputStyleClick"
                          class="w-2/3 cursor-pointer hover:bg-gray-100 duration-300"
                          readonly
                          @click="openModal"
                          v-model="createForm.manager"
                        />
                        <button
                          type="button"
                          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                          @click="openModal"
                          title="담당자 찾기"
                        >
                          <span class="pi pi-search"></span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      모델명
                    </th>
                    <td class="border border-gray-300 p-2">
                      <input v-model="createForm.modelName" type="text" :class="inputStyle" />
                    </td>
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      제조사
                    </th>
                    <td class="border border-gray-300 p-2">
                      <input v-model="createForm.maker" type="text" :class="inputStyle" />
                    </td>
                  </tr>

                  <tr>
                    <!-- 설치일자 -->
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      <span style="font-weight: bold"
                        >설치일자<span style="color: red">*</span></span
                      >
                    </th>
                    <td class="border border-gray-300 p-2">
                      <div class="relative w-full cursor-pointer" @click="openInstallPicker">
                        <flat-pickr
                          ref="installPicker"
                          v-model="createForm.installDate"
                          :config="flatpickrConfig"
                          class="dark:bg-dark-900 h-11 w-full rounded-lg border px-4 py-2.5 duration-300"
                          :class="inputStyleClick"
                        />
                        <svg
                          class="absolute right-3 top-1/2 -translate-y-1/2 z-10 fill-current text-gray-500 pointer-events-none"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                          />
                        </svg>
                      </div>
                    </td>

                    <!-- 제조일자 -->
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      <span style="font-weight: bold"
                        >제조일자<span style="color: red">*</span></span
                      >
                    </th>
                    <td class="border border-gray-300 p-2">
                      <div class="relative w-full cursor-pointer" @click="openMfgPicker">
                        <flat-pickr
                          ref="mfgPicker"
                          v-model="createForm.mfgDt"
                          :config="flatpickrConfig"
                          class="dark:bg-dark-900 h-11 w-full rounded-lg border px-4 py-2.5 duration-300"
                          :class="inputStyleClick"
                        />
                        <svg
                          class="absolute right-3 top-1/2 -translate-y-1/2 z-10 fill-current text-gray-500 pointer-events-none"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                          />
                        </svg>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      설비상태
                    </th>
                    <td class="border border-gray-300 p-2">
                      <input
                        :class="inputDisabled"
                        :value="
                          { j1: '가동중', j2: '비가동', j5: '가동대기' }[createForm.equipStatus] ??
                          ''
                        "
                        disabled
                      />
                    </td>
                    <th class="border border-gray-300 bg-gray-50 text-sm text-center p-2">
                      점검주기(일)
                    </th>
                    <td class="border border-gray-300 p-2">
                      <input
                        v-model.number="createForm.inspCycle"
                        type="number"
                        min="1"
                        max="365"
                        :class="inputStyle"
                        style="text-align: right; height: 2.5rem"
                        placeholder="예: 30"
                        @keydown="blockInvalidKeys"
                        @input="clampInspCycle"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>

          <equipSelectModal
            @selectedEmpValue="SelectEmp"
            :visible="isModalOpen"
            @close="closeModal"
          />
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped></style>
