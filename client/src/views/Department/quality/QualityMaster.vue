<script setup lang="ts">
import { ref, computed } from 'vue'
import '@/assets/common.css'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import Column from 'primevue/column'
import 'primeicons/primeicons.css'
import Button from 'primevue/button'
import InspTargetSelectModal from './InspTargetSelectModal.vue' // import the modal component (검사대상조회)

const currentPageTitle = ref('품질검사 기준관리')

// 타입스크립트 -> 명시해주지 않으면 오류뜸
interface InspRow {
  t_id: string
  t_name: string
  t_type: string
  t_spec: string
  t_unit: string
}
interface Question {
  id: number
  text: string
}

// table data
const inspData = ref([
  {
    inspCode: 'QC0001',
    inspName: '쌀 외관검사',
    inspTarget: '쌀20kg(원재료)',
    inspUsing: 'Y',
  },
  {
    inspCode: 'QC0002',
    inspName: '알코올 도수 검사',
    inspTarget: '막걸리(반제품)',
    inspUsing: 'Y',
  },
  {
    inspCode: 'QC0003',
    inspName: '대장균 검사',
    inspTarget: '막걸리(반제품)',
    inspUsing: 'Y',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
])

const inspName = ref('') //검사항목명
const inspUsing = ref(false) //미사용 체크박스(false, 체크안된상태)
const inspDesc = ref('') //검사방법
const inspTarget = ref<InspRow[]>([]) //검사대상
const minValue = ref('') // 범위 최소값
const maxValue = ref('') // 범위 최대값
const passScore = ref('') // 관능 합격 점수(평균)
const minSpec = ref('R1') // 이상/초과
const maxSpec = ref('R3') // 이하/미만

// 모달에서 선택한 검사대상(데이터)
const onInspChecked = (rows: any[]) => {
  // 여러 건 추가
  const merged = [...inspTarget.value, ...rows] //기존데이터(inspTarget.value) + 넘어온데이터(rows)
  // 중복 제거(de-duplicate)
  const dedup = Array.from(new Map(merged.map((r) => [r.t_id, r])).values())
  inspTarget.value = dedup
}
// 검사대상 삭제 (휴지통 버튼 클릭시)
const targetDel = (id: string) => {
  inspTarget.value = inspTarget.value.filter((row) => row.t_id !== id)
}

// 검사유형(범위/관능) 초기값 range
const inspMode = ref('range')

// 관능검사 - 점수 초기값
const scoreMax = ref(5)
const scoreSet = computed(() => {
  return scoreMax.value == 5 ? [5, 4, 3, 2, 1] : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
})

// 관능 질문 목록 (처음 1줄)
const questions = ref<Question[]>([{ id: 1, text: '' }])

// 관능 질문 추가
const addQuest = () => {
  questions.value.push({
    id: questions.value.length + 1, // 새 id
    text: '',
  })
}

// 관능 질문 제거
const removeQuest = (id: number) => {
  if (questions.value.length <= 1) {
    alert('최소 1개 이상의 질문이 필요합니다.') // 1개 최소 존재
    return
  }
  questions.value = questions.value.filter((q) => q.id !== id)
  // 라벨 번호 다시 1부터 재정렬(질문1,2,3...)
  questions.value = questions.value.map((q, i) => ({ ...q, id: i + 1 }))
}

// 유효성 검사(숫자-실수) > 잘못입력시 알람
const allowDecimal = (e: Event, model: { value: string }) => {
  const el = e.target as HTMLInputElement
  const raw = el.value
  let v = raw
  let msg = ''

  // 1) 숫자/점 외 문자 제거
  if (/[^0-9.]/.test(v)) {
    v = v.replace(/[^0-9.]/g, '')
    msg ||= '숫자만 입력해주세요.'
  }
  // 2) 소수점은 1개만 허용
  const dotCount = (v.match(/\./g) || []).length
  if (dotCount > 1) {
    v = v.replace(/(\..*)\./g, '$1')
    msg = '소수점은 한 번만 사용할 수 있어요.'
  }
  // 3) ".5" → "0.5"
  if (v.startsWith('.')) v = '0' + v
  // 4) 길이 제한(정수 4, 소수 2)
  let [intPart = '', decPart = ''] = v.split('.')
  if (intPart.length > 4) {
    intPart = intPart.slice(0, 4)
    msg = '정수는 최대 4자리까지 가능합니다.'
  }
  if (decPart.length > 2) {
    decPart = decPart.slice(0, 2)
    msg = '소수점은 둘째자리까지 가능합니다.'
  }
  // 5) 재조립: 입력이 "1."처럼 점으로 끝났다면 점 유지
  if (raw.endsWith('.') && dotCount <= 1 && decPart === '') {
    v = intPart ? intPart + '.' : '0.'
  } else {
    v = decPart !== '' ? `${intPart}.${decPart}` : intPart
  }
  // 변경되면 이유 안내
  if (v !== raw && msg) alert(msg)

  // let v = raw.replace(/[^0-9.]/g, '') // 숫자/점만
  // v = v.replace(/(\..*)\./g, '$1') // 점 하나만
  // if (v.startsWith('.')) v = '0' + v // ".5" -> "0.5"
  // // 정수 4자리 + 소수 2자리 제한 (DECIMAL(6,2) 형태)
  // v = v.replace(/^(\d{0,4})(\d+)?(?:\.(\d{0,2})?)?.*$/, (_, intPart, extra, decPart) => {
  //   let result = intPart
  //   if (decPart !== undefined) result += '.' + decPart
  //   return result
  // })
  // if (v !== raw) {
  //   alert('숫자만 입력해주세요(소수점 둘째자리까지 입력 가능, 예: 9999.99)')
  // }

  el.value = v // 실제 input 박스의 보이는 값도 교정
  model.value = v // v-model 바인딩 값도 동기화
}

// table radio button
const selectedInspData = ref(null)

// modal event
const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const textareaStyle =
  'dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 overflow-y-auto'
const fileStyle =
  'focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400'
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <ComponentCard title="조회" className="shadow-sm">
      <template v-slot:header-right>
        <div class="flex justify-end">
          <button class="btn-common btn-white">초기화</button>
          <button class="btn-common btn-color">조회</button>
        </div>
      </template>
      <template #body-content>
        <div class="flex gap-4">
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-name"> 검사항목명 </label>
            <input type="text" id="insp-name" :class="inputStyle" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-target-name"> 검사대상 </label>
            <input type="text" id="insp-target-name" :class="inputStyle" />
          </div>
          <div class="w-1/4">
            <label :class="labelStyle" for="insp-type"> 품목구분 </label>
            <div class="relative z-20 bg-transparent">
              <select id="insp-type" :class="selectStyle">
                <option value="a1">주자재</option>
                <option value="a2">부자재</option>
                <option value="a3">재공품</option>
                <option value="a4">반제품</option>
                <option value="a5">완제품</option>
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
                  xmlns="http://www.w3.org/2000/svg"
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
            <div :class="labelStyle">사용여부</div>
            <label :class="labelStyle">
              <input
                type="checkbox"
                name="insp-using"
                value="Y"
                class="checkboxStyle text-sm text-gray-800"
              />사용
            </label>
            <label :class="labelStyle">
              <input
                type="checkbox"
                name="insp-using"
                value="N"
                class="checkboxStyle text-sm text-gray-800"
              />미사용
            </label>
          </div>
        </div>
      </template>
    </ComponentCard>

    <div class="flex gap-2 mt-2 width-full" style="height: 500px">
      <ComponentCard title="목록" className="shadow-sm w-1/2">
        <template #body-content>
          <DataTable
            :value="inspData"
            showGridlines
            scrollable
            scrollHeight="390px"
            size="small"
            :rows="10"
            class="text-sm"
            v-model:selection="selectedInspData"
          >
            <DataCol
              field="inspCheck"
              header=""
              :pt="{ columnHeaderContent: 'justify-center' }"
              selectionMode="single"
              style="width: 10px"
            />
            <DataCol
              field="inspCode"
              header="검사항목ID"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 120px"
              bodyStyle="text-align: center"
            />
            <DataCol
              field="inspName"
              header="검사대상명"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspTarget"
              header="검사대상"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspUsing"
              header="사용여부"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 100px; text-align: center"
            />
          </DataTable>
        </template>
      </ComponentCard>

      <ComponentCard title="등록" className="shadow-sm w-1/2 ">
        <template #header-right>
          <div class="flex justify-end">
            <button type="button" class="btn-common btn-color" form="insp-form">등록</button>
            <button class="btn-common btn-white">삭제</button>
          </div>
        </template>
        <template #body-content>
          <form action="" id="insp-form" class="overflow-y-auto" style="height: 380px">
            <div class="flex mb-2 gap-2">
              <label :class="labelStyle" class="w-[152px]" for="inspName"> 검사항목명 </label>
              <input type="text" :class="inputStyle" id="inspName" v-model="inspName" required />
              <div class="justify-center w-1/3 ml-[10px]">
                <div :class="labelStyle">사용여부</div>
                <label :class="labelStyle">
                  <input type="checkbox" class="checkboxStyle" v-model="inspUsing" />미사용
                </label>
              </div>
            </div>
            <div class="flex items-center mb-2 w-full">
              <div :class="labelStyle" class="w-[100px]">검사유형</div>
              <div class="flex gap-10">
                <label :class="labelStyle">
                  <input
                    type="radio"
                    name="inspMode"
                    class="checkboxStyle"
                    value="range"
                    v-model="inspMode"
                  />
                  <span>범위</span>
                </label>
                <label :class="labelStyle">
                  <input
                    type="radio"
                    name="inspMode"
                    class="checkboxStyle"
                    value="sensory"
                    v-model="inspMode"
                  />
                  <span>관능</span>
                </label>
              </div>
            </div>
            <div class="flex mb-2">
              <label :class="labelStyle" class="w-[120px]" for="inspDesc"> 검사방법 </label>
              <textarea
                placeholder="검사방법에 대해서 작성하세요"
                rows="4"
                :class="textareaStyle"
                class=""
                id="inspDesc"
                v-model="inspDesc"
              ></textarea>
            </div>
            <div class="flex mb-4">
              <label :class="labelStyle" class="w-[120px]" for="inspFile">파일첨부 </label>
              <input type="file" :class="fileStyle" id="inspFile" />
            </div>
            <hr class="" />
            <div class="flex justify-between items-center mt-4 mb-4">
              <h3>검사대상조회</h3>
              <button
                type="button"
                @click="openModal"
                class="btn-common btn-color btn-insp-target-search"
              >
                검사대상조회
              </button>
            </div>
            <InspTargetSelectModal
              :visible="isModalOpen"
              @close="closeModal"
              @checked="onInspChecked"
            />
            <DataTable
              :value="inspTarget"
              dataKey="t_id"
              showGridlines
              scrollable
              size="small"
              :rows="5"
              class="text-sm mb-4"
            >
              <!-- 데이터가 없을 때 나타낼 방법 #empty슬롯 -->
              <template #empty>
                <div class="text-center">추가된 검사대상이 없습니다.</div>
              </template>
              <Column
                field="t_id"
                header="자재/제품ID"
                :pt="{ columnHeaderContent: 'justify-center' }"
                bodyStyle="text-align: center"
              />
              <Column
                field="t_name"
                header="자재/제품명"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_type_name"
                header="품목구분"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_spec"
                header="규격"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column
                field="t_unit"
                header="단위"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <Column field="t_del" header="삭제" :pt="{ columnHeaderContent: 'justify-center' }">
                <!-- 스코프드 슬롯(scoped slot)
                  <template #body="slotProps"> slotProps.data로 접근
                  Destructuring -> { data } 
                -->
                <template #body="{ data }">
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-trash"
                      variant="outlined"
                      class="p-button-text p-button-danger p-button-sm"
                      style="width: 20px; height: 15px; text-align: center"
                      @click="targetDel(data.t_id)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>

            <hr />
            <h3 class="mt-4 mb-3">검사내용</h3>
            <!-- 범위 -->
            <div v-if="inspMode == 'range'">
              <div class="flex items-center gap-4 mb-3">
                <label :class="labelStyle" class="w-[120px]"> 최소범위 </label>
                <div class="flex gap-2 w-full">
                  <input
                    type="text"
                    :class="inputStyle"
                    v-model="minValue"
                    placeholder="숫자를 입력하세요 (소수 둘째자리까지 입력 가능)"
                    @input="(e: Event) => allowDecimal(e, minValue)"
                    required
                  />
                  <div class="relative z-20 bg-transparent w-1/2">
                    <select :class="selectStyle" v-model="minSpec">
                      <option value="R1" selected>이상</option>
                      <option value="R2">초과</option>
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
                        xmlns="http://www.w3.org/2000/svg"
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
              </div>
              <div class="flex items-center mb-3 gap-4">
                <label :class="labelStyle" class="w-[120px]"> 최대범위 </label>
                <div class="flex gap-2 w-full">
                  <input
                    type="text"
                    :class="inputStyle"
                    v-model="maxValue"
                    placeholder="숫자를 입력하세요 (소수 둘째자리까지 입력 가능)"
                    @input="(e: Event) => allowDecimal(e, maxValue)"
                    required
                  />
                  <div class="relative z-20 bg-transparent w-1/2">
                    <select :class="selectStyle" v-model="maxSpec">
                      <option value="R3" selected>이하</option>
                      <option value="R4">미만</option>
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
                        xmlns="http://www.w3.org/2000/svg"
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
              </div>
              <div class="flex items-center mb-4 gap-4">
                <label :class="labelStyle" class="w-[120px]">단위</label>
                <input type="text" :class="inputStyle" class="w-3/4" required />
              </div>
            </div>
            <!-- 관능 -->
            <div v-if="inspMode == 'sensory'">
              <div class="rounded-lg mb-2" style="border: 1px solid #dedede; padding: 15px">
                <!-- 점수 -->
                <div class="flex items-center mb-2">
                  <div :class="labelStyle" class="w-[120px]">최고점수</div>
                  <label :class="labelStyle" class="mr-[20px] text-sm">
                    <input
                      type="radio"
                      class="checkboxStyle"
                      name="tScore"
                      :value="5"
                      v-model="scoreMax"
                    />5점
                  </label>
                  <label :class="labelStyle" class="mr-[20px] text-sm">
                    <input
                      type="radio"
                      class="checkboxStyle"
                      name="tScore"
                      :value="10"
                      v-model="scoreMax"
                    />10점
                  </label>
                </div>
                <div class="mb-3">
                  <div :class="labelStyle" class="w-[120px] mb-2">채점기준 설정</div>
                  <!-- 점수 선택시 변경  -->
                  <div v-for="(tscore, idx) in scoreSet" :key="idx">
                    <label :class="labelStyle" class="flex items-center">
                      <span :class="labelStyle" class="w-[80px] text-sm">{{ tscore }} 점</span>
                      <input type="text" :class="inputStyle" class="w-full" />
                    </label>
                  </div>
                </div>
                <div class="flex gap-2">
                  <div :class="labelStyle" class="w-[200px]">합격 기준점수</div>
                  <input
                    type="text"
                    :class="inputStyle"
                    placeholder="숫자를 입력하세요 (소수 둘째자리까지 입력가능)"
                    v-model="passScore"
                    @input="(e: Event) => allowDecimal(e, passScore)"
                    required
                  />
                  <div class="relative z-20 bg-transparent w-1/2">
                    <select :class="selectStyle" v-model="minSpec">
                      <option value="R1" selected>이상</option>
                      <option value="R2">초과</option>
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
                        xmlns="http://www.w3.org/2000/svg"
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
              </div>
              <div class="rounded-lg mb-2" style="border: 1px solid #dedede; padding: 15px">
                <button
                  type="button"
                  class="btn-common btn-color"
                  style="margin: 0"
                  @click="addQuest"
                >
                  질문추가 +
                </button>
                <div v-for="(q, idx) in questions" :key="q.id" class="flex items-center mt-2 gap-2">
                  <label :class="labelStyle" class="w-[80px]">질문 {{ idx + 1 }}</label>
                  <input type="text" :class="inputStyle" v-model="q.text" required />
                  <button
                    type="button"
                    @click="removeQuest(q.id)"
                    class="w-[30px] rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs flex justify-center cursor-pointer hover:bg-gray-200"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
          </form>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped>
.checkboxStyle {
  accent-color: #3e5879;
  border: 1px solid #eee;
  margin-right: 8px;
  cursor: pointer;
}
.btn-insp-target-search {
  width: 150px;
}
h3 {
  font-weight: 500;
  color: #222;
}
</style>
