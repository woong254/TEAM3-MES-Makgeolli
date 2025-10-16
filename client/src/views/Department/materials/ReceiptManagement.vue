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
import userDateUtils from '@/utils/useDates.js' // 날짜 유틸
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const currentPageTitle = ref('입고관리')
import axios from 'axios'
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

  // ====== 필수값 검증 ======
  if (!r.prod_date) return alert('제조일자를 입력해주세요')
  if (!r.exp_date) return alert('유통기한을 입력해주세요')
  if (!r.pre_receipt_date) return alert('가입고일자를 입력해주세요')
  if (!r.bcnc_code || !r.bcnc_name) return alert('매입처를 선택해주세요')
  if (!r.mat_code || !r.mat_name) return alert('자재를 선택해주세요')

  const qtyNum = Number(r.receipt_qty)
  if (!Number.isFinite(qtyNum) || qtyNum <= 0) return alert('입고량을 입력해주세요')

  // 수량 정수화(서버에는 정수로) — 화면 표시 포맷은 그대로 유지
  const receipt_qty = Math.max(1, Math.floor(qtyNum))

  isSavingIis.value = true
  try {
    const payload = {
      prod_date: r.prod_date,
      exp_date: r.exp_date,
      pre_receipt_date: r.pre_receipt_date,
      bcnc_code: r.bcnc_code,
      mat_code: r.mat_code,
      receipt_qty, // 정수
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
    // 성공/실패 관계없이 reset 1회
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
  await refreshBoth() // 진입 시 두 탭 모두 채우기
})

const deleteIis = async () => {
  const ids = (selectPending.value || []).map((r) => r.iis_id)
  if (!ids.length) return alert('삭제할 행을 선택하세요.')
  if (!confirm(`${ids.length}건을 삭제하시겠습니까?`)) return

  try {
    const { data } = await axios.post('/api/iis/delete', { ids })
    if (data?.ok) {
      const kill = new Set(ids)
      pending.value = pending.value.filter((r) => !kill.has(r.iis_id))
      selectPending.value = []
      alert(`삭제되었습니다. (${data.deleted ?? ids.length}건)`)
    } else {
      alert(data?.msg || '삭제 실패')
    }
  } catch (e) {
    console.error(e)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const registerIis = async () => {
  if (isRegistering.value) return

  // 검사완료 탭에서 체크된 행들
  const ids = (selectComplete.value || []).map((r) => r.iis_id)
  if (!ids.length) return alert('입고등록할 행을 선택하세요.')

  if (!confirm(`${ids.length}건을 입고등록 하시겠습니까?`)) return

  isRegistering.value = true
  try {
    // 백엔드 트랜잭션 호출(검사완료 → 입고)
    const { data } = await axios.post('/api/iis/register', { ids })

    if (data?.ok) {
      // 성공하면 목록 갱신 + 선택 해제
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
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="가입고">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-white btn-common" @click="isPurMatModalOpen = true">
              조회
            </button>
            <button type="button" class="btn-white btn-common" @click="resetBtn">초기화</button>
            <button type="button" class="btn-color btn-common" @click="submitIis">등록</button>
          </div>
        </template>
        <template #body-content>
          <DataTable :value="iis" show-gridlines>
            <DataCol
              field="pre_receipt_date"
              header="가입고일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 150px; text-align: center"
            >
            </DataCol>
            <DataCol
              field="bcnc_code"
              header="매입처코드"
              style="width: 120px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_name"
              header="매입처명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="padding: 8px"
            >
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
              style="width: 180px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_name"
              header="자재명"
              style="width: 190px; padding: 8px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
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
              style="width: 100px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_unit"
              header="단위"
              style="width: 100px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="receipt_qty"
              header="입고량"
              style="width: 120px; padding: 8px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="number"
                  min="1"
                  style="text-align: right"
                  :class="baseInputClass"
                  @blur="
                    data[field] = (
                      Number.isFinite(+data[field]) ? Math.max(1, Math.floor(+data[field])) : 1
                    ).toFixed(2)
                  "
                />
              </template>
            </DataCol>
            <DataCol
              field="prod_date"
              header="제조일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 150px; padding: 8px"
            >
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
              header="유통기한"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 150px; padding: 8px"
            >
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
      <ComponentWoong style="height: 500px">
        <template #body-content>
          <div class="relative">
            <div class="flex justify-end space-x-2 mb-1 absolute right-0 top-0 z-10">
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
          </div>
          <TabView
            @tab-change="onTabChange"
            :pt="{
              navContainer: { class: 'pr-40' },
            }"
          >
            <TabPanel header="검사대기">
              <DataTable
                :value="pending"
                v-model:selection="selectPending"
                data-key="iis_id"
                show-gridlines
                scrollable
                scroll-height="350px"
              >
                <template #empty>
                  <div class="text-center">검사대기중인 자재가 없습니다.</div>
                </template>
                <DataCol
                  selection-mode="multiple"
                  headerStyle="width: 37px"
                  bodyStyle="width: 37px"
                />
                <DataCol
                  field="pur_code"
                  header="발주코드"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="pur_name"
                  header="발주서명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="pre_receipt_date"
                  header="가입고일자"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: center"
                />
                <DataCol
                  field="exp_date"
                  header="유통기한"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: center"
                />
                <DataCol
                  field="prod_date"
                  header="제조일자"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: center"
                />
                <DataCol
                  field="bcnc_name"
                  header="매입처명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="mat_code"
                  header="자재코드"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="mat_name"
                  header="자재명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="mat_spec"
                  header="규격"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="mat_unit"
                  header="단위"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="receipt_qty"
                  header="입고량"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: right"
                />
              </DataTable>
            </TabPanel>
            <TabPanel header="검사완료">
              <DataTable
                :value="complete"
                show-gridlines
                v-model:selection="selectComplete"
                data-key="iis_id"
                scrollable
                scroll-height="350px"
              >
                <template #empty>
                  <div class="text-center">검사완료된 자재가 없습니다.</div>
                </template>
                <DataCol
                  selection-mode="multiple"
                  headerStyle="width: 37px"
                  bodyStyle="width: 37px"
                />
                <DataCol
                  field="pur_code"
                  header="발주코드"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="pur_name"
                  header="발주서명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="pre_receipt_date"
                  header="가입고일자"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: center"
                />
                <DataCol
                  field="bcnc_name"
                  header="매입처명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="mat_code"
                  header="자재코드"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="mat_name"
                  header="자재명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="mat_spec"
                  header="규격"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="mat_unit"
                  header="단위"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="receipt_qty"
                  header="입고량"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: right"
                />
                <DataCol
                  field="pass_qty"
                  header="합격량"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: right"
                />
                <DataCol
                  field="prod_date"
                  header="제조일자"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: center"
                />
                <DataCol
                  field="exp_date"
                  header="유통기한"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: center"
                />
              </DataTable>
            </TabPanel>
          </TabView>
        </template>
      </ComponentWoong>
    </div>
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
.p-tabview-panels {
  padding: 0 !important;
}
</style>
