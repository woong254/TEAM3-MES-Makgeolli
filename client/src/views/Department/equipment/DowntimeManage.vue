<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
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
const starting = ref(false)
const currentCode = ref<string | null>(null)
const isRunning = () => !!currentCode.value

/* (optional) 담당자 모달 & 이미지 프리뷰 */

const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

async function startDowntime() {
  if (!createForm.equipCode.trim()) {
    alert('설비코드를 입력하세요.')
    return
  }
  if (starting.value || isRunning()) return

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
  } catch (e: any) {
    console.error(e)
    alert(e?.response?.data?.message || '비가동 시작 중 오류가 발생했습니다.')
  } finally {
    starting.value = false
  }
}

// ✅ 설비코드로 기본정보 불러오기
onMounted(async () => {
  const code = route.query.equipCode as string
  if (!code) {
    alert('선택된 설비가 없습니다.')
    router.push('/downtimelist')
    return
  }

  try {
    const { data } = await axios.get(`/api/equipment/${encodeURIComponent(code)}`)
    createForm.equipCode = data.equip_code
    createForm.equipName = data.equip_name
  } catch (err) {
    console.error(err)
    alert('설비 정보를 불러오는 중 오류가 발생했습니다.')
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
              </tbody>
            </table>
          </form>

          <div class="mt-6 w-full flex items-center justify-center">
            <button
              @click="startDowntime"
              class="btn-common btn-color disabled:opacity-50 w-48 h-12 text-base font-semibold whitespace-nowrap"
              :disabled="starting || !createForm.equipCode || isRunning()"
            >
              {{ starting ? '시작 중...' : isRunning() ? '진행중' : '비가동 시작' }}
            </button>
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
