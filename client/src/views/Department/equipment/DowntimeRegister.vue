<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// form 타입
type Form = {
  equipCode: string
  equipName: string
  manager: string
  downtimeType: string
  description: string
  progressStatus: string
  downtimeStart: string
  downtimeEnd: string | null
}

// 반응형 form
const form = reactive<Form>({
  equipCode: '',
  equipName: '',
  manager: '',
  downtimeType: '비계획정지',
  description: '',
  progressStatus: '진행중',
  downtimeStart: '',
  downtimeEnd: null,
})

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

function resetForm() {
  form.equipCode = ''
  form.equipName = ''
  form.downtimeType = '비계획정지'
  form.description = ''
  form.downtimeStart = ''
  form.downtimeEnd = null
  currentCode.value = null
}

async function startDowntime() {
  if (!form.equipCode.trim()) {
    alert('설비코드를 입력하세요.')
    return
  }
  if (starting.value || isRunning()) return

  try {
    starting.value = true
    const body = {
      equip_code: form.equipCode.trim(),
      equip_name: form.equipName.trim() || null,
      downtime_type: form.downtimeType || '비계획정지',
      description: form.description.trim() || null,
      progress_status: '진행중',
      downtime_start: form.downtimeStart.trim() || undefined,
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
    form.equipCode = data.equip_code
    form.equipName = data.equip_name
    form.manager = data.manager
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
                      v-model="form.equipCode"
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
                      v-model="form.equipName"
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
                      v-model="form.downtimeType"
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
                    <input
                      v-model="form.manager"
                      readonly
                      :disabled="isRunning() || starting"
                      type="text"
                      :class="inputStyle"
                    />
                  </td>
                </tr>

                <tr>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">비고</th>
                  <td colspan="3" class="border border-gray-200 p-2">
                    <textarea
                      v-model="form.description"
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
                      v-model="form.downtimeStart"
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
                      v-model="form.downtimeEnd"
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
              @click="startDowntime"
              class="btn-common btn-color disabled:opacity-50 w-48 h-12 text-base font-semibold whitespace-nowrap"
              :disabled="starting || !form.equipCode || isRunning()"
            >
              {{ starting ? '시작 중...' : isRunning() ? '진행중' : '비가동 시작' }}
            </button>
          </div>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>
