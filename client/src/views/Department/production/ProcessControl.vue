<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import '@/assets/common.css'
import { ref, onMounted } from 'vue'
import axios from 'axios' // axios 연결

// 제목이름 지정 변수
const currentPageTitle = ref('공정제어')

// css 지정 변수
const inputStyle =
  'font-bold dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-lg text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'font-bold block text-lg text-gray-700 dark:text-gray-400 mb-2'

// 공정제어 화면 출력 데이터 타입
interface processFormItem {
  mk_num: number
  prod_name: string
  writing_date: string
  equip_name: string
  proc_name: string
  emp_name: string
}

// 공정제어 화면 출력 데이터 초기값
const processForm = ref<processFormItem>({
  mk_num: 0,
  prod_name: '',
  writing_date: '',
  equip_name: '',
  proc_name: '',
  emp_name: '',
})

// 서버에서 가져온 데이터를 저장할 반응형 변수 선언
const makeData = ref()
const equipData = ref()
const empData = ref()

// 화면이 켜질때 가져올 데이터 함수
const fetchProcessData = async () => {
  try {
    const response = await axios.get('/api/getSavedProcessData')
    makeData.value = response.data.processData.make
    equipData.value = response.data.processData.equip
    empData.value = response.data.processData.emp
    processForm.value.prod_name = response.data.dbResult.prod_name
    processForm.value.writing_date = response.data.dbResult.writing_date
    processForm.value.equip_name = response.data.dbResult.equip_name
    processForm.value.proc_name = response.data.dbResult.proc_name
    processForm.value.emp_name = response.data.dbResult.emp_name
    processForm.value.mk_num = makeData.value.inpt_qty
  } catch (err) {
    console.error('fetchProcessData에서 오류가 생겼습니다. 오류내용 : ', err)
  }
}

// 작업시작 버튼 누르면 시작하는 함수
const processStart = async () => {
  console.log(processForm.value)
  try {
    const result = await axios.post('/api/addProcessForm')
    const addRes = result.data
    if (!addRes.isSuccessed) {
      alert('작업시작실패')
      return
    } else {
      alert('작업시작성공')
    }
  } catch (err) {
    console.error('processStart 오류 : ', err)
  }
}

// 화면이 켜질때 나타남
onMounted(() => {
  fetchProcessData()
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
        <!-- 설비 선택 -->
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
                <input
                  type="text"
                  :class="inputStyle"
                  required
                  readonly
                  v-model="processForm"
                  style="text-align: right"
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
                  v-model="processForm"
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
                  v-model="processForm"
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
                  v-model="processForm"
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
                  v-model="processForm"
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
        <!-- 작업자 선택 -->
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
                  v-model="processForm"
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
                  v-model="processForm"
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
        <button type="button" class="btn-reset btn-common btn-color" style="margin-left: 10px">
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
  background-color: #228b22;
  border: 1px solid #ddd;
  color: #fff;
}
.btn-white:hover {
  background-color: #3fdb3f;
}
.btn-color {
  background-color: #d22323;
  color: #fff;
}
.btn-color:hover {
  background-color: #f14242;
}
</style>
