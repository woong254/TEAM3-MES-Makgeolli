<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { useRoute, useRouter } from 'vue-router'
import equipSelectModal from './equipSelectModal.vue'
import 'primeicons/primeicons.css'

const route = useRoute()
const router = useRouter()

// form 타입
type Form = {
  equipCode: string
  equipName: string
  workerId: string
  downtimeType: string
  description: string
  progressStatus: string
  downtimeStart: string
  downtimeEnd: string | null
}

// 반응형 form
const createForm = reactive<Form>({
  equipCode: '',
  equipName: '',
  workerId: '',
  downtimeType: '비계획정지',
  description: '',
  progressStatus: '진행중',
  downtimeStart: '',
  downtimeEnd: null,
})

// 사원정보
interface EmpInfoInterface {
  emp_name: string // 사원이름
}

const SelectEmp = (value: EmpInfoInterface) => {
  createForm.workerId = value.emp_name // ✅ 저장 소스 동기화, value는 ref속성일때만 쓰고 reactive는 바로접근가능 value x
  closeModal()
}

const currentPageTitle = ref('비가동 등록')
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

// 날짜+시간 픽커 설정
const dtConfig = {
  enableTime: true,
  time_24hr: true,
  dateFormat: 'Y-m-d H:i',
  altInput: true,
  altFormat: 'Y-m-d H:i',
}

// 상태값
const mode = ref<'register' | 'detail'>((route.query.mode as any) || 'register')
const currentCode = ref<string | null>(null)
const starting = ref(false)
const ending = ref(false)
const isDetail = computed(() => currentCode.value !== null)
const isRunning = () => !!currentCode.value

/* (optional) 담당자 모달 & 이미지 프리뷰 */

const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// 상세 1건 조회
async function fetchDetail(code: string) {
  const { data } = await axios.get(`/api/downtime/${encodeURIComponent(code)}`)
  currentCode.value = data.downtimeCode ?? data.downtime_code
  createForm.equipCode = data.equipCode ?? data.equip_code
  createForm.equipName = data.equipName ?? data.equip_name
  createForm.downtimeType = data.downtimeType ?? data.downtime_type
  createForm.workerId = data.workerId ?? data.worker_id ?? ''
  createForm.description = data.description ?? ''
  createForm.downtimeStart = data.downtimeStart ?? data.downtime_start
  createForm.downtimeEnd = data.downtimeEnd ?? data.downtime_end ?? null
  createForm.progressStatus = data.progressStatus ?? data.progress_status ?? '진행중'
}

// 설비코드로 진입: 설비 기본정보 + 진행중 여부 확인
async function loadByEquipCode(equipCode: string) {
  // 1) 설비 기본정보
  const { data: equip } = await axios.get(`/api/equipment/${encodeURIComponent(equipCode)}`)
  createForm.equipCode = equip.equip_code
  createForm.equipName = equip.equip_name

  // 2) 진행중 비가동 여부(해당 설비)
  const { data: running } = await axios.get('/api/downtime', {
    params: { status: 'running', equip_code: equipCode },
  })
  if (Array.isArray(running) && running.length > 0) {
    await fetchDetail(running[0].downtimeCode ?? running[0].downtime_code)
  } else {
    currentCode.value = null // 등록 모드 유지
    createForm.progressStatus = '진행중'
    createForm.downtimeEnd = null
  }
}

async function startDowntime() {
  if (!createForm.equipCode.trim()) return alert('설비코드를 확인하세요.')
  if (!createForm.workerId.trim()) return alert('담당자를 입력/선택하세요.')
  if (isDetail.value || starting.value) return

  try {
    starting.value = true
    const body = {
      equip_code: createForm.equipCode.trim(),
      equip_name: createForm.equipName.trim() || null,
      worker_id: createForm.workerId.trim(),
      downtime_type: createForm.downtimeType || '비계획정지',
      description: createForm.description.trim() || null,
      progress_status: '진행중',
      downtime_start: createForm.downtimeStart.trim() || undefined,
    }

    const { data } = await axios.post('/api/downtime', body)
    currentCode.value = data?.downtime_code || null
    alert('비가동이 시작되었습니다.')
    if (currentCode.value) await fetchDetail(currentCode.value)
  } catch (e: any) {
    console.error(e)
    alert(e?.response?.data?.message || '비가동 시작 중 오류가 발생했습니다.')
  } finally {
    starting.value = false
  }
}

// 비가동 종료(상세 모드에서만)
async function endDowntime() {
  if (!currentCode.value) return
  if (!confirm('비가동을 종료하시겠습니까?')) return
  try {
    ending.value = true
    await axios.put(`/api/downtime/${encodeURIComponent(currentCode.value)}/end`, {
      progress_status: '완료', // 서버에서 NOW()로 종료시간 처리
    })
    alert('비가동이 종료되었습니다.')
    // 종료 후: 같은 설비 기준으로 모드 재판단(대부분 등록 모드로 복귀)
    await loadByEquipCode(createForm.equipCode)
  } catch (e: any) {
    console.error(e)
    alert(e?.response?.data?.message || '종료 처리 중 오류가 발생했습니다.')
  } finally {
    ending.value = false
  }
}

/* ===== 초기 진입 로직 ===== */
onMounted(async () => {
  // 1) 상세 딥링크 지원: ?downtimeCode=...
  const downtimeCode = route.query.downtimeCode as string | undefined
  if (downtimeCode) {
    try {
      await fetchDetail(downtimeCode)
      return
    } catch (err) {
      console.error(err)
      alert('상세 정보를 불러오지 못했습니다.')
    }
  }

  // 2) 기본 진입: ?equipCode=...
  const equipCode = route.query.equipCode as string | undefined
  if (!equipCode) {
    alert('선택된 설비가 없습니다.')
    router.push('/downtimelist')
    return
  }
  try {
    await loadByEquipCode(equipCode)
  } catch (err) {
    console.error(err)
    alert('정보를 불러오는 중 오류가 발생했습니다.')
  }
})
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="flex gap-2 mt-2 w-full">
      <ComponentCard title="비가동 등록">
        <template #body-content>
          <form @submit.prevent="startDowntime">
            <table class="w-full table-fixed border-collapse border border-gray-200">
              <colgroup>
                <col style="width: 120px" />
                <col />
                <col style="width: 120px" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">
                    설비코드
                  </th>
                  <td class="border border-gray-200 p-2">
                    <input
                      v-model="createForm.equipCode"
                      readonly
                      :disabled="isRunning() || starting"
                      type="text"
                      :class="inputStyle"
                      placeholder="설비코드를 입력해주세요"
                    />
                  </td>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">설비명</th>
                  <td class="border border-gray-200 p-2">
                    <input
                      v-model="createForm.equipName"
                      readonly
                      :disabled="isRunning() || starting"
                      type="text"
                      :class="inputStyle"
                      placeholder="설비명을 입력해주세요"
                    />
                  </td>
                </tr>

                <tr>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">
                    비가동유형
                  </th>
                  <td class="border border-gray-200 p-2">
                    <select
                      v-model="createForm.downtimeType"
                      :class="inputStyle"
                      :disabled="isRunning() || starting"
                    >
                      <option value="비계획정지">비계획정지</option>
                      <option value="계획정지">계획정지</option>
                      <option value="점검/수리">점검/수리</option>
                    </select>
                  </td>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">담당자</th>
                  <td class="border border-gray-200 p-2">
                    <div class="relative">
                      <input
                        v-model="createForm.workerId"
                        :disabled="isRunning() || starting"
                        type="text"
                        :class="inputStyle"
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
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">비고</th>
                  <td colspan="3" class="border border-gray-200 p-2">
                    <textarea
                      v-model="createForm.description"
                      :class="inputStyle"
                      rows="4"
                      placeholder="비고를 입력하세요"
                      class="w-full resize-none rounded-lg border p-2"
                      style="height: 120px"
                      :disabled="isRunning()"
                    />
                  </td>
                </tr>

                <tr>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">
                    비가동 시작일시
                  </th>
                  <td class="border border-gray-200 p-2">
                    <flat-pickr
                      v-model="createForm.downtimeStart"
                      :config="dtConfig"
                      :class="inputStyle"
                      :disabled="isRunning() || starting"
                      placeholder="미입력 시 현재시간으로 저장"
                    />
                  </td>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">
                    비가동 종료일시
                  </th>
                  <td class="border border-gray-200 p-2">
                    <flat-pickr
                      v-model="createForm.downtimeEnd"
                      :config="dtConfig"
                      :class="inputStyle"
                      :disabled="true"
                      placeholder="종료 화면에서 설정"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          <div class="mt-6 w-full flex items-center justify-center">
            <button
              v-if="!isDetail"
              @click="startDowntime"
              class="btn-common btn-color disabled:opacity-50 w-48 h-12 text-base font-semibold whitespace-nowrap"
              :disabled="starting || !createForm.equipCode || isRunning()"
            >
              {{ starting ? '시작 중...' : isRunning() ? '진행중' : '비가동 시작' }}
            </button>
            <!-- 상세(진행중) 모드: 진행중(비활성) + 종료 -->
            <template v-else>
              <button
                class="btn-common btn-white cursor-not-allowed opacity-70 w-36 h-12 text-base font-semibold"
                disabled
              >
                진행중
              </button>

              <button
                class="btn-common btn-color disabled:opacity-50 w-48 h-12 text-base font-semibold"
                :disabled="ending"
                @click="endDowntime"
              >
                {{ ending ? '종료 중...' : '비가동 종료' }}
              </button>
            </template>
          </div>
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
