<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

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

type DowntimeStartPayload = {
  equip_code: string
  equip_name: string | null
  downtime_type: string
  description: string | null
  progress_status: '진행중'
  downtime_start?: string
}

const form = ref({
  equipCode: '',
  equipName: '',
  downtimeType: '비계획정지',
  description: '',
  startAt: '', // 선택 시 전송, 미입력 시 서버 NOW
  endAt: '', // 등록 화면에서는 표시만(전송 X)
})

const starting = ref(false)
const currentCode = ref<string | null>(null)
const isRunning = () => !!currentCode.value

function resetForm() {
  form.value = {
    equipCode: '',
    equipName: '',
    downtimeType: '비계획정지',
    description: '',
    startAt: '',
    endAt: '',
  }
  currentCode.value = null
}

async function startDowntime() {
  if (!form.value.equipCode.trim()) {
    alert('설비코드를 입력하세요.')
    return
  }
  if (starting.value || isRunning()) return

  try {
    starting.value = true

    const body: DowntimeStartPayload = {
      equip_code: form.value.equipCode.trim(),
      equip_name: form.value.equipName.trim() || null,
      downtime_type: form.value.downtimeType || '비계획정지',
      description: form.value.description.trim() || null,
      progress_status: '진행중',
    }
    if (form.value.startAt.trim()) body.downtime_start = form.value.startAt.trim()

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
                <!-- 설비코드 / 설비명 -->
                <tr>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">
                    설비코드
                  </th>
                  <td class="border border-gray-200 p-2">
                    <input
                      v-model="form.equipCode"
                      :disabled="isRunning() || starting"
                      type="text"
                      :class="inputStyle"
                      placeholder="EQ-001"
                    />
                  </td>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">설비명</th>
                  <td class="border border-gray-200 p-2">
                    <input
                      v-model="form.equipName"
                      :disabled="isRunning() || starting"
                      type="text"
                      :class="inputStyle"
                      placeholder="프레스 1호기"
                    />
                  </td>
                </tr>

                <!-- 비가동유형 / 담당자(선택 입력란 자리만 유지) -->
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
                      type="text"
                      :class="inputStyle"
                      placeholder="선택/입력"
                      :disabled="isRunning() || starting"
                    />
                  </td>
                </tr>

                <!-- 비고 -->
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

                <!-- 시작/종료 일시 -->
                <tr>
                  <th class="border border-gray-200 bg-gray-50 text-sm text-center p-2">
                    비가동 시작일시
                  </th>
                  <td class="border border-gray-200 p-2">
                    <flat-pickr
                      v-model="form.startAt"
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
                      v-model="form.endAt"
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

          <!-- 버튼 -->
          <div class="mt-6 flex items-center justify-center gap-2">
            <button
              @click="startDowntime"
              class="btn-common btn-color disabled:opacity-50"
              :disabled="starting || !form.equipCode || isRunning()"
              title="설비코드 입력 후 시작"
            >
              {{ starting ? '시작 중...' : isRunning() ? '진행중' : '비가동 시작' }}
            </button>

            <button
              @click="resetForm"
              class="btn-common btn-white"
              :disabled="starting || isRunning()"
              title="진행중에는 초기화 불가"
            >
              신규
            </button>
          </div>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>
