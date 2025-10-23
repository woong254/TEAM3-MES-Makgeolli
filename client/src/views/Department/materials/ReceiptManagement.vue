<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import ComponentWoong from '@/components/common/ComponentCardButtonWoong.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import sysdate from 'moment'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { Korean } from 'flatpickr/dist/l10n/ko.js'
import '@/assets/common.css'
import { ref, computed, onMounted } from 'vue'
import IisBcncModal from './MatModal/IisBcncModal.vue'
import RadioMatModal from './MatModal/RadioMatModal.vue'
import PurMatModal from './MatModal/PurMatModal.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'

const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const currentPageTitle = ref('입고관리')

const isBcncModalOpen = ref(false)
const isMatModalOpen = ref(false)
const isPurMatModalOpen = ref(false)
const selectComplete = ref([])
const isRegistering = ref(false)
const selectPending = ref([])
const isSavingIis = ref(false)
const activeTab = ref(0)

const iis = ref([
  {
    prod_date: null,
    exp_date: null,
    pre_receipt_date: sysdate().format('YYYY-MM-DD'),
    bcnc_code: '',
    bcnc_name: '',
    mat_code: '',
    mat_name: '',
    mat_spec: '',
    mat_unit: '',
    receipt_qty: '',
  },
])

const pending = ref([])
const complete = ref([])

/** 수량 표시: 항상 소수점 2자리(, 포함) */
const fmtQty = (v) => {
  if (v === null || v === undefined || v === '') return ''
  let s = v
  if (typeof s === 'string') s = s.replace(/[, ]+/g, '').trim()
  const n = Number(s)
  if (!Number.isFinite(n)) return String(v)
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** yyyy-MM-dd 로 통일 */
const toYmd = (v) => {
  if (!v) return null
  try {
    return userDateUtils.dateFormat(v, 'yyyy-MM-dd')
  } catch {
    const d = new Date(v)
    if (isNaN(d)) return null
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
  }
}

const prodFlatpickrConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: `${baseInputClass} text-center px-8`,
  maxDate: iis.value[0]?.pre_receipt_date || sysdate().format('YYYY-MM-DD'),
  locale: Korean,
}))

const expFlatpickrConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: `${baseInputClass} text-center px-8`,
  minDate: iis.value[0]?.pre_receipt_date || sysdate().format('YYYY-MM-DD'),
  locale: Korean,
}))

const handleCloseModal = () => {
  isBcncModalOpen.value = false
  isMatModalOpen.value = false
  isPurMatModalOpen.value = false
}

const onSelectMat = (selectedMat) => {
  iis.value[0].mat_code = selectedMat.mat_code
  iis.value[0].mat_name = selectedMat.mat_name
  iis.value[0].mat_spec = selectedMat.mat_spec
  iis.value[0].mat_unit = selectedMat.mat_unit
}

const onSelectBcnc = (selectedBcnc) => {
  iis.value[0].bcnc_code = selectedBcnc.bcnc_code
  iis.value[0].bcnc_name = selectedBcnc.bcnc_name
}

const resetBtn = async () => {
  const today = sysdate().format('YYYY-MM-DD')
  iis.value = [
    {
      prod_date: null,
      exp_date: '',
      pre_receipt_date: today,
      bcnc_code: '',
      bcnc_name: '',
      mat_code: '',
      mat_name: '',
      mat_spec: '',
      mat_unit: '',
      receipt_qty: '',
    },
  ]
}

const onTabChange = async (e) => {
  activeTab.value = e.index
  selectComplete.value = []
  selectPending.value = []
  if (e.index === 0) await refreshPending()
  else await refreshComplete()
}

const submitIis = async () => {
  if (isSavingIis.value) return
  const r = iis.value?.[0] || {}

  if (!r.prod_date) return alert('제조일자를 입력해주세요')
  if (!r.exp_date) return alert('유통기한을 입력해주세요')
  if (!r.pre_receipt_date) return alert('가입고일자를 입력해주세요')
  if (!r.bcnc_code || !r.bcnc_name) return alert('매입처를 선택해주세요')
  if (!r.mat_code || !r.mat_name) return alert('자재를 선택해주세요')

  const qtyNum = Number(r.receipt_qty)
  if (!Number.isFinite(qtyNum) || qtyNum <= 0) return alert('입고량을 입력해주세요')

  const receipt_qty = Math.max(1, Math.floor(qtyNum))

  isSavingIis.value = true
  try {
    const payload = {
      prod_date: r.prod_date,
      exp_date: r.exp_date,
      pre_receipt_date: r.pre_receipt_date,
      bcnc_code: r.bcnc_code,
      mat_code: r.mat_code,
      receipt_qty,
    }

    const { data } = await axios.post('/api/iis/insert', payload)
    if (data?.ok) {
      alert('가입고 등록에 성공했습니다.')
      await refreshBoth()
    } else {
      alert('미입고된 수량보다 입고수량이 많습니다')
      iis.value[0].receipt_qty = ''
    }
  } catch (e) {
    console.error(e)
    alert('가입고 등록 중 오류가 발생했습니다.')
  } finally {
    isSavingIis.value = false
  }
}

const loadIisList = async (status) => {
  try {
    const { data } = await axios.get('/api/iis/list', { params: { status } })
    return Array.isArray(data)
      ? data.map((r) => ({
          ...r,
          prod_date: toYmd(r.prod_date),
          exp_date: toYmd(r.exp_date),
          pre_receipt_date: toYmd(r.pre_receipt_date),
        }))
      : []
  } catch (e) {
    console.error(e)
    alert(`${status} 목록 조회 중 오류가 발생했습니다.`)
    return []
  }
}
const refreshPending = async () => {
  pending.value = await loadIisList('검사대기')
}
const refreshComplete = async () => {
  complete.value = await loadIisList('검사완료')
}
const refreshBoth = async () => {
  await Promise.all([refreshPending(), refreshComplete()])
}
onMounted(async () => {
  await refreshBoth()
})

const deleteIis = async () => {
  const selected = (selectPending.value || []).map((r) => ({ ...r }))
  const ids = selected.map((r) => r.iis_id)

  if (!ids.length) return alert('삭제할 행을 선택하세요.')
  if (!confirm(`${ids.length}건을 삭제하시겠습니까?`)) return

  try {
    const { data } = await axios.post('/api/iis/delete', { ids })

    await refreshBoth()

    const pendingSet = new Set((pending.value || []).map((r) => r.iis_id))
    const completeSet = new Set((complete.value || []).map((r) => r.iis_id))

    const notDeleted = selected.filter((s) => pendingSet.has(s.iis_id) || completeSet.has(s.iis_id))
    const deletedCnt = data.deleted ?? ids.length - notDeleted.length

    let msg = `${deletedCnt}건이 삭제 되었습니다.`
    if (notDeleted.length) {
      const lines = notDeleted.map((s) => {
        const reason = completeSet.has(s.iis_id)
          ? '검사완료 상태로 변경되어 삭제되지 않았습니다.'
          : '삭제 조건을 충족하지 않아 삭제되지 않았습니다.'
        return `• ${s.pur_name ?? '-'} ${s.pre_receipt_date ?? '-'} ${s.bcnc_name ?? '-'} ${s.mat_name ?? '-'} ${s.mat_spec ?? '-'} ${s.mat_unit ?? '-'} ${s.receipt_qty ?? '-'} ${reason}`
      })
      msg += `\n\n아래 ${notDeleted.length}건은 삭제되지 않았습니다:\n` + lines.join('\n')
    }

    selectPending.value = []

    alert(msg)
  } catch (e) {
    console.error(e)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const registerIis = async () => {
  if (isRegistering.value) return
  const ids = (selectComplete.value || []).map((r) => r.iis_id)
  if (!ids.length) return alert('입고등록할 행을 선택하세요.')
  if (!confirm(`${ids.length}건을 입고등록 하시겠습니까?`)) return

  isRegistering.value = true
  try {
    const { data } = await axios.post('/api/iis/register', { ids })

    if (data?.ok) {
      await refreshBoth()
      selectComplete.value = []
      alert(`입고등록 완료! (${data.done ?? ids.length}건)`)
    } else {
      alert(data?.message || '입고등록 실패')
    }
  } catch (e) {
    console.error(e)
    alert('입고등록 중 오류가 발생했습니다.')
  } finally {
    isRegistering.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-5 sm:space-y-3">
      <!-- 상단: 가입고 카드 -->
      <ComponentCard title="가입고">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-white btn-common" @click="resetBtn">초기화</button>
            <button type="button" class="btn-color btn-common" @click="isPurMatModalOpen = true">
              조회
            </button>
            <button type="button" class="btn-color btn-common" @click="submitIis">등록</button>
          </div>
        </template>

        <template #body-content>
          <!-- (원본) 가입고 입력 테이블 -->
          <DataTable :value="iis" show-gridlines>
            <DataCol
              field="pre_receipt_date"
              header="가입고일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 120px; text-align: center"
              class="text-sm"
            />
            <DataCol
              field="bcnc_code"
              header="매입처코드"
              style="width: 110px; text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
              class="text-sm"
            />
            <DataCol
              field="bcnc_name"
              :pt="{ columnHeaderContent: 'justify-center' }"
              class="text-sm"
              style="padding: 8px"
            >
              <template #header>
                <span style="font-weight: bold">매입처명<span style="color: red">*</span></span>
              </template>
              <template #body="{ data, field }">
                <div class="relative">
                  <input
                    v-model="data[field]"
                    type="text"
                    readonly
                    @click="isBcncModalOpen = true"
                    :class="[baseInputClass, 'pr-10']"
                  />
                  <span
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.6 3.6a7.5 7.5 0 0013.05 13.05z"
                      />
                    </svg>
                  </span>
                </div>
              </template>
            </DataCol>
            <DataCol
              field="mat_code"
              header="자재코드"
              style="width: 180px; text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
              class="text-sm"
            />
            <DataCol
              field="mat_name"
              style="width: 190px; padding: 8px"
              :pt="{ columnHeaderContent: 'justify-center' }"
              class="text-sm"
            >
              <template #header>
                <span style="font-weight: bold">자재명<span style="color: red">*</span></span>
              </template>
              <template #body="{ data, field }">
                <div class="relative">
                  <input
                    v-model="data[field]"
                    type="text"
                    readonly
                    @click="isMatModalOpen = true"
                    :class="[baseInputClass, 'pr-10']"
                  />
                  <span
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.6 3.6a7.5 7.5 0 0013.05 13.05z"
                      />
                    </svg>
                  </span>
                </div>
              </template>
            </DataCol>
            <DataCol
              field="mat_spec"
              header="규격"
              style="width: 160px"
              :pt="{ columnHeaderContent: 'justify-center' }"
              class="text-sm"
            />
            <DataCol
              field="mat_unit"
              header="단위"
              style="width: 100px"
              :pt="{ columnHeaderContent: 'justify-center' }"
              class="text-sm"
            />
            <DataCol
              field="receipt_qty"
              style="width: 120px; padding: 8px"
              :pt="{ columnHeaderContent: 'justify-center' }"
              class="text-sm"
            >
              <template #header>
                <span style="font-weight: bold">입고량<span style="color: red">*</span></span>
              </template>
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="number"
                  min="1"
                  style="text-align: right"
                  :class="baseInputClass"
                  @blur="
                    data[field] = (
                      Number.isFinite(+data[field]) ? Math.max(1, +data[field]) : 1
                    ).toFixed(2)
                  "
                />
              </template>
            </DataCol>
            <DataCol
              field="prod_date"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 150px; padding: 8px"
              class="text-sm"
            >
              <template #header>
                <span style="font-weight: bold">제조일자<span style="color: red">*</span></span>
              </template>
              <template #body="{ data, field }">
                <div class="relative">
                  <flat-pickr v-model="data[field]" :config="prodFlatpickrConfig" />
                  <span
                    class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                    aria-hidden="true"
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
                      />
                    </svg>
                  </span>
                </div>
              </template>
            </DataCol>
            <DataCol
              field="exp_date"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 150px; padding: 8px"
              class="text-sm"
            >
              <template #header>
                <span style="font-weight: bold">유통기한<span style="color: red">*</span></span>
              </template>
              <template #body="{ data, field }">
                <div class="relative">
                  <flat-pickr v-model="data[field]" :config="expFlatpickrConfig" />
                  <span
                    class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                    aria-hidden="true"
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
                      />
                    </svg>
                  </span>
                </div>
              </template>
            </DataCol>
          </DataTable>
        </template>
      </ComponentCard>

      <!-- 하단: 검사대기/검사완료 카드 -->
      <ComponentWoong style="height: 526px">
        <template #body-content>
          <div class="relative">
            <div class="absolute right-0 top-0 z-10 flex space-x-2">
              <button
                v-if="activeTab != 0"
                type="button"
                class="btn-color btn-common"
                @click="registerIis"
              >
                등록
              </button>
              <button
                v-if="activeTab != 1"
                type="button"
                class="btn-white btn-common"
                @click="deleteIis"
              >
                삭제
              </button>
            </div>

            <TabView
              @tab-change="onTabChange"
              :pt="{ navContainer: { class: 'pr-40' } }"
              class="mt-0"
            >
              <!-- 검사대기 -->
              <TabPanel header="검사대기">
                <DataTable
                  :value="pending"
                  v-model:selection="selectPending"
                  data-key="iis_id"
                  show-gridlines
                  size="small"
                  scrollable
                  scroll-height="400px"
                >
                  <template #empty>
                    <div class="text-center text-sm">검사대기중인 자재가 없습니다.</div>
                  </template>
                  <DataCol
                    selection-mode="multiple"
                    headerStyle="width:37px"
                    bodyStyle="width:37px"
                    class="text-sm"
                  />
                  <DataCol
                    field="pur_code"
                    header="발주코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                    class="text-sm"
                  />
                  <DataCol
                    field="pur_name"
                    header="발주서명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <DataCol
                    field="pre_receipt_date"
                    header="가입고일자"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                    class="text-sm"
                  />
                  <DataCol
                    field="bcnc_name"
                    header="매입처명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <DataCol
                    field="mat_code"
                    header="자재코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                    class="text-sm"
                  />
                  <DataCol
                    field="mat_name"
                    header="자재명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <DataCol
                    field="mat_spec"
                    header="규격"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <DataCol
                    field="mat_unit"
                    header="단위"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <!-- ✅ .00 고정 표시 -->
                  <DataCol
                    field="receipt_qty"
                    header="입고량"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                    style="text-align: right"
                  >
                    <template #body="{ data }">{{ fmtQty(data.receipt_qty) }}</template>
                  </DataCol>
                  <DataCol
                    field="prod_date"
                    header="제조일자"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                    style="text-align: center"
                  />
                  <DataCol
                    field="exp_date"
                    header="유통기한"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                    style="text-align: center"
                  />
                </DataTable>
              </TabPanel>

              <!-- 검사완료 -->
              <TabPanel header="검사완료">
                <DataTable
                  :value="complete"
                  show-gridlines
                  v-model:selection="selectComplete"
                  data-key="iis_id"
                  size="small"
                  scrollable
                  scroll-height="400px"
                >
                  <template #empty>
                    <div class="text-center text-sm">검사완료된 자재가 없습니다.</div>
                  </template>
                  <DataCol
                    selection-mode="multiple"
                    headerStyle="width:37px"
                    bodyStyle="width:37px"
                    class="text-sm"
                  />
                  <DataCol
                    field="pur_code"
                    header="발주코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                    class="text-sm"
                  />
                  <DataCol
                    field="pur_name"
                    header="발주서명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <DataCol
                    field="pre_receipt_date"
                    header="가입고일자"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                    style="text-align: center"
                  />
                  <DataCol
                    field="bcnc_name"
                    header="매입처명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <DataCol
                    field="mat_code"
                    header="자재코드"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: center"
                    class="text-sm"
                  />
                  <DataCol
                    field="mat_name"
                    header="자재명"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <DataCol
                    field="mat_spec"
                    header="규격"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <DataCol
                    field="mat_unit"
                    header="단위"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                  />
                  <!-- ✅ .00 고정 표시 -->
                  <DataCol
                    field="receipt_qty"
                    header="입고량"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                    style="text-align: right"
                  >
                    <template #body="{ data }">{{ fmtQty(data.receipt_qty) }}</template>
                  </DataCol>
                  <DataCol
                    field="pass_qty"
                    header="합격량"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                    style="text-align: right"
                  >
                    <template #body="{ data }">{{ fmtQty(data.pass_qty) }}</template>
                  </DataCol>
                  <DataCol
                    field="prod_date"
                    header="제조일자"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                    style="text-align: center"
                  />
                  <DataCol
                    field="exp_date"
                    header="유통기한"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    class="text-sm"
                    style="text-align: center"
                  />
                </DataTable>
              </TabPanel>
            </TabView>
          </div>
        </template>
      </ComponentWoong>
    </div>

    <!-- 모달 -->
    <IisBcncModal
      v-model="isBcncModalOpen"
      :blocked-codes="iis[0]?.bcnc_code ? [iis[0].bcnc_code] : []"
      :blocked-names="iis[0]?.bcnc_name ? [iis[0].bcnc_name] : []"
      @close="handleCloseModal"
      @select="onSelectBcnc"
      :matCode="iis[0]?.mat_code"
    />
    <RadioMatModal
      v-model="isMatModalOpen"
      :blocked-codes="iis[0]?.mat_code ? [iis[0].mat_code] : []"
      :blocked-names="iis[0]?.mat_name ? [iis[0].mat_name] : []"
      @close="handleCloseModal"
      @select="onSelectMat"
      :bcncCode="iis[0]?.bcnc_code"
    />
    <PurMatModal v-model="isPurMatModalOpen" @close="handleCloseModal" />
  </AdminLayout>
</template>

<style>
/* 기존 유지 */
.p-tabview-panels {
  padding: 0 !important;
}

/* 탭 컨테이너가 상단에 여분의 마진을 주는 경우 제거 */
.no-top-gap {
  margin-top: 0 !important;
}

/* PrimeVue TabView 상단 마진 제거 */
:deep(.p-tabview) {
  margin-top: 0 !important;
}
</style>
