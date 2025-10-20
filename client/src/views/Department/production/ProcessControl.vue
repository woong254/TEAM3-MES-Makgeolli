<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import '@/assets/common.css'
import { ref, onMounted, onUnmounted } from 'vue' // onUnmounted 추가
import axios from 'axios' // axios 연결
import { useRoute } from 'vue-router'

const route = useRoute()
const empId = route.query.emp_id as string
console.log('넘어온 사원번호:', empId)

// 제목이름 지정 변수
const currentPageTitle = ref('공정제어')

// css 지정 변수
const inputStyle =
  'font-bold dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-lg text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'font-bold block text-lg text-gray-700 dark:text-gray-400 mb-2'

// 공정제어 화면 출력 데이터 타입
interface processFormItem {
  procs_no: number
  mk_num: number
  prod_name: string
  writing_date: string
  equip_name: string
  proc_name: string
  emp_name: string
  inpt_qty: number
}

// 공정제어 화면 출력 데이터 초기값
const processForm = ref<processFormItem>({
  procs_no: 0,
  mk_num: 0,
  prod_name: '',
  writing_date: '',
  equip_name: '',
  proc_name: '',
  emp_name: '',
  inpt_qty: 0,
})

// 작업시작 버튼 누르고 나온 결과값 받는 함수
const sf = ref({
  prev_input_qty: 0, // 기투입량
  remain_qty: 0, // 미투입량
  procs_bgntm: '작업시작을 해주세요', // 작업시작시간
})

// 작업종료 버튼 누르고 나온 결과값 받는 함수
const ed = ref({
  procs_endtm: '작업종료를 해주세요', // 작업종료시간
  procs_no: 0,
  mk_qty: 0, // 생산량 (실시간 업데이트 대상)
  fail_qty: 0,
  pass_qty: 0,
})

// 작업시작 버튼 누르면 시작하는 함수의 매개변수 데이터 타입
interface processRequest {
  procs_no: number
}

// --------------------------------------------------------------------------------
// [추가된 로직] 실시간 생산량 업데이트 (Polling) 관련 로직
// --------------------------------------------------------------------------------

// Polling Interval ID 저장
let pollingInterval: number | null = null

/**
 * 현재 공정의 생산량, 상태 등 최신 정보를 서버에서 가져와 화면에 반영합니다.
 */
const fetchCurrentQty = async () => {
  if (processForm.value.procs_no === 0) return // 공정 번호가 없으면 실행하지 않음
  try {
    // 서버의 getCurrentProcessQty API 호출
    const response = await axios.get('/api/getCurrentProcessQty', {
      params: { procs_no: processForm.value.procs_no },
    })
    const currentData = response.data.result

    if (currentData) {
      // 1. 생산량(mk_qty) 실시간 업데이트
      ed.value.mk_qty = currentData.mk_qty ?? 0

      // 2. 서버에서 작업이 't3' (완료) 상태로 변경되었는지 확인
      if (currentData.procs_st === 't3') {
        stopPolling()

        // 최종 결과값 반영 (자동/수동 완료된 경우)
        ed.value.procs_endtm = currentData.procs_endtm || '완료'
        ed.value.fail_qty = currentData.fail_qty ?? 0
        ed.value.pass_qty = currentData.pass_qty ?? 0
        sf.value.procs_bgntm = currentData.procs_bgntm || '작업 시작'

        alert('작업이 완료 상태로 변경되었습니다.')
      } else if (currentData.procs_st === 't2') {
        // 작업이 진행 중인데 시작 시간이 업데이트 안됐을 경우 반영
        if (currentData.procs_bgntm) {
          sf.value.procs_bgntm = currentData.procs_bgntm
        }
      }
    }
  } catch (err) {
    console.error('fetchCurrentQty 오류:', err)
  }
}

/**
 * 실시간 업데이트를 위한 폴링을 시작합니다.
 */
const startPolling = () => {
  if (pollingInterval) return // 이미 실행 중이면 중복 실행 방지

  // 즉시 한번 업데이트
  fetchCurrentQty()

  // 1초마다 반복 (서버 시뮬레이션은 2초마다 증가하지만, 1초마다 확인하여 빠르게 반응)
  pollingInterval = setInterval(fetchCurrentQty, 1000) as unknown as number
  console.log('Polling started.')
}

/**
 * 실시간 업데이트를 위한 폴링을 중지합니다.
 */
const stopPolling = () => {
  if (pollingInterval !== null) {
    clearInterval(pollingInterval)
    pollingInterval = null
    console.log('Polling stopped.')
  }
}

/**
 * 컴포넌트 로드 후, 기존 작업 상태를 확인하고 폴링을 시작합니다.
 */
const checkAndStartPolling = (procsNo: number) => {
  if (procsNo !== 0) {
    // procs_no를 얻은 후, 현재 상태를 조회하고 t2면 폴링 시작
    fetchCurrentQty()
    startPolling() // 일단 시작하고, fetchCurrentQty에서 t3면 중지
  }
}

// --------------------------------------------------------------------------------
// [수정된 로직] 기존 데이터 로드 함수 및 버튼 함수
// --------------------------------------------------------------------------------

// 화면이 켜질때 가져올 데이터 함수
const fetchProcessData = async () => {
  try {
    const response = await axios.get('/api/getProcessData', {
      params: {
        emp_id: empId,
      },
    })
    const dbResult = response.data.result[0]
    console.log(dbResult)

    // 기본 정보 업데이트
    processForm.value.procs_no = dbResult.procs_no
    processForm.value.prod_name = dbResult.prod_name
    processForm.value.writing_date = dbResult.writing_date
    processForm.value.equip_name = dbResult.equip_name
    processForm.value.proc_name = dbResult.now_procs
    processForm.value.emp_name = dbResult.emp_name
    processForm.value.mk_num = dbResult.mk_num
    processForm.value.inpt_qty = dbResult.inpt_qty

    // 기존 작업이 진행 중이거나 완료 상태인지 확인하고 폴링 시작
    checkAndStartPolling(dbResult.procs_no)
  } catch (err) {
    console.error('fetchProcessData에서 오류가 생겼습니다. 오류내용 : ', err)
  }
}

// 작업시작 버튼 누르면 시작하는 함수
const processStart = async () => {
  const obj: processRequest = {
    procs_no: processForm.value.procs_no,
  }
  try {
    const response = await axios.post('/api/processStart', obj)
    console.log('작업시작 버튼 누르고 받은 데이터 response : ', response)

    if (!response.data.isSuccessed) {
      alert('작업시작실패')
      return
    } else {
      alert('작업시작성공')
      // 작업 시작 시간 업데이트
      sf.value.procs_bgntm = response.data.result.procs_bgntm

      // [핵심] 작업 시작 성공 후, 실시간 생산량 폴링 시작
      startPolling()
    }
  } catch (err) {
    console.error('processStart 오류 : ', err)
  }
}

// 작업종료버튼 눌렀을때 실행
const processEnd = async () => {
  const endObj = {
    procs_no: processForm.value.procs_no,
    // mk_qty는 서버에서 최종적으로 inpt_qty로 확정하므로, 클라이언트에서 보낼 필요 없음
  }
  try {
    const response = await axios.post('/api/modifyProcessForm', endObj)
    console.log('modifyProcessForm:', response)

    if (!response.data.isSuccessed) {
      alert('작업종료실패')
      return
    } else {
      alert('작업종료성공')
      ed.value = response.data.result // end data (mk_qty, procs_endtm 포함)

      // [핵심] 작업 종료 성공 후, 실시간 생산량 폴링 중지
      stopPolling()
    }
  } catch (error) {
    console.error('processEnd오류 : ', error)
  }
}

// 화면이 켜질때 나타남
onMounted(() => {
  fetchProcessData()
})

// [핵심] 컴포넌트가 사라질 때 setInterval 정리
onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-3 mt-2">
      <ComponentCard title="지시내용">
        <template #body-content>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label :class="labelStyle"> 제품명 </label>
              <input
                type="text"
                :class="inputStyle"
                required
                readonly
                :value="processForm.prod_name"
              />
            </div>
            <div>
              <label :class="labelStyle"> 공정명 </label>
              <input
                type="text"
                :class="inputStyle"
                required
                readonly
                :value="processForm.proc_name"
              />
            </div>
            <div>
              <label :class="labelStyle"> 설비명 </label>
              <input
                type="text"
                :class="inputStyle"
                required
                readonly
                :value="processForm.equip_name"
              />
            </div>
            <div>
              <label :class="labelStyle"> 작업자명 </label>
              <input
                type="text"
                :class="inputStyle"
                required
                readonly
                :value="processForm.emp_name"
              />
            </div>
            <div>
              <label :class="labelStyle"> 작업지시일 </label>
              <input
                type="text"
                :class="inputStyle"
                required
                readonly
                :value="processForm.writing_date"
                style="text-align: center"
              />
            </div>
          </div>
        </template>
      </ComponentCard>

      <div class="flex gap-2 mt-2 width-full">
        <!-- 작업량 -->
        <ComponentCard title="작업량" className="shadow-sm w-3/5 h-80">
          <template #body-content>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mr-10 mt-3">
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-14">지시량</label>
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  :value="processForm.mk_num"
                  style="text-align: right"
                />
              </div>
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10">생산량</label>
                <!-- [핵심] v-model로 실시간 업데이트, 스타일 적용 -->
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="ed.mk_qty"
                  style="text-align: right; background-color: #e6ffe6; color: #228b22"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mr-10">
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >기투입량</label
                >
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="sf.prev_input_qty"
                  style="text-align: right"
                />
              </div>
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10">불량량</label>
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="ed.fail_qty"
                  style="text-align: right"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mr-10">
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >미투입량</label
                >
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="sf.remain_qty"
                  style="text-align: right"
                />
              </div>
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10">합격량</label>
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="ed.pass_qty"
                  style="text-align: right"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mr-10">
              <div class="flex items-center">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >현투입량</label
                >
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="processForm.inpt_qty"
                  style="text-align: right"
                />
              </div>
            </div>
          </template>
        </ComponentCard>
        <!-- 작업날짜 -->
        <ComponentCard title="작업날짜" className="shadow-sm w-2/5 h-80">
          <template #body-content>
            <div class="flex flex-col justify-center h-full space-y-4 px-4 bg-white mr-10">
              <!-- 작업시작일 -->
              <div class="flex items-center space-x-2 mt-15">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >작업시작일</label
                >
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="sf.procs_bgntm"
                  style="text-align: center"
                />
              </div>

              <!-- 작업종료일 -->
              <div class="flex items-center space-x-2">
                <label :class="labelStyle" class="mr-2 whitespace-nowrap ml-10 mr-10"
                  >작업종료일</label
                >
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="ed.procs_endtm"
                  style="text-align: center"
                />
              </div>
            </div>
          </template>
        </ComponentCard>
      </div>
      <div style="text-align: center; font-size: 25px; font-weight: bold" class="mt-5">
        <button
          type="button"
          class="btn-reset btn-common btn-white"
          style="margin-right: 10px"
          @click="processStart"
        >
          작업시작
        </button>
        <button
          type="button"
          class="btn-reset btn-common btn-color"
          style="margin-left: 10px"
          @click="processEnd"
        >
          작업종료
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.btn-common {
  width: 200px;
  padding: 8px 20px;
  border-radius: 20px;
  margin: 0 5px;
  transition: all 0.3s;
  height: 100px;
}
.btn-white {
  background-color: #213555;
  color: #fff;
}
.btn-white:hover {
  background-color: #3e5879;
}
.btn-color {
  background-color: #fff;
  border: 1px solid #ddd;
  color: black;
}
.btn-color:hover {
  background-color: #eee;
}
</style>
