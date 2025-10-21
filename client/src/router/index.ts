import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'eCommerce Dashboard',
      },
    },
    {
      path: '/error_404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },

    // 영업
    {
      path: '/of',
      name: '주문서조회',
      component: () => import('../views/Department/sales/OrderForm.vue'),
      meta: {
        title: '주문서조회',
      },
    },
    {
      path: '/ofm',
      name: '주문서관리',
      component: () => import('../views/Department/sales/OrderFormManage.vue'),
      meta: {
        title: '주문서관리',
      },
    },
    {
      path: '/ep-instore',
      name: '완제품입고조회',
      component: () => import('../views/Department/sales/EpInstore.vue'),
      meta: {
        title: '완제품입고조회',
      },
    },
    {
      path: '/ep-instoremanage',
      name: '완제품입고관리',
      component: () => import('../views/Department/sales/EpInstoreManage.vue'),
      meta: {
        title: '완제품입고관리',
      },
    },
    {
      path: '/ep-outstore',
      name: '완제품출고조회',
      component: () => import('../views/Department/sales/EpOutstore.vue'),
      meta: {
        title: '완제품출고조회',
      },
    },
    {
      path: '/ep-outstoremanage',
      name: '완제품출고관리',
      component: () => import('../views/Department/sales/EpOutstoreManage.vue'),
      meta: {
        title: '완제품출고관리',
      },
    },

    // 생산
    {
      path: '/prodOrd',
      name: '생산지시관리',
      component: () => import('../views/Department/production/prodOrd.vue'),
      meta: {
        title: '생산지시관리',
      },
    },
    {
      path: '/prodOrdManage',
      name: '공정실적관리',
      component: () => import('../views/Department/production/ProdOrdManage.vue'),
      meta: {
        title: '공정실적관리',
      },
    },
    {
      path: '/processControl',
      name: 'processControl',
      component: () => import('../views/Department/production/ProcessControl.vue'),
      meta: {
        title: '공정제어',
      },
    },

    // 자재
    {
      path: '/purManagement',
      name: '발주관리',
      component: () => import('../views/Department/materials/PurManagement.vue'),
      meta: {
        title: '발주관리',
      },
    },
    {
      path: '/receiptManagement',
      name: '입고관리',
      component: () => import('../views/Department/materials/ReceiptManagement.vue'),
      meta: {
        title: '입고관리',
      },
    },
    {
      path: '/purListPage',
      name: '발주조회',
      component: () => import('../views/Department/materials/PurList.vue'),
      meta: {
        title: '발주조회',
      },
    },
    {
      path: '/matListPage',
      name: '자재조회',
      component: () => import('../views/Department/materials/MatList.vue'),
      meta: {
        title: '자재조회',
      },
    },
    // 품질
    {
      path: '/quamaster',
      name: 'QualityMaster',
      component: () => import('../views/Department/quality/QualityMaster.vue'),
      meta: {
        title: '품질검사 기준관리',
      },
    },
    {
      path: '/matinsplist',
      name: 'MatInspList',
      component: () => import('../views/Department/quality/MatInspList.vue'),
      meta: {
        title: '자재입고검사 조회',
      },
    },
    {
      path: '/matinspmanage',
      name: 'MatInsManage',
      component: () => import('../views/Department/quality/MatInsManage.vue'),
      meta: {
        title: '자재입고검사 관리',
      },
    },
    {
      path: '/procinsplist',
      name: 'ProcInspList',
      component: () => import('../views/Department/quality/ProcInspList.vue'),
      meta: {
        title: '공정검사 조회',
      },
    },
    {
      path: '/procinspmanage',
      name: 'ProcInspManage',
      component: () => import('../views/Department/quality/ProcInspManage.vue'),
      meta: {
        title: '공정검사 관리',
      },
    },
    {
      path: '/prodinsplist',
      name: 'ProdInspList',
      component: () => import('../views/Department/quality/ProdInspList.vue'),
      meta: {
        title: '완제품검사 조회',
      },
    },
    {
      path: '/prodinspmanage',
      name: 'ProdInspManage',
      component: () => import('../views/Department/quality/ProdInspManage.vue'),
      meta: {
        title: '완제품검사 관리',
      },
    },
    {
      path: '/defectmaster',
      name: 'DefectMaster',
      component: () => import('../views/Department/quality/DefectMaster.vue'),
      meta: {
        title: '불량기준관리',
      },
    },

    // 설비
    {
      path: '/equipmaster',
      name: 'EquipMaster',
      component: () => import('../views/Department/equipment/EquipMaster.vue'),
      meta: {
        title: '설비관리',
      },
    },
    {
      path: '/downtimelist',
      name: 'DownTimeList',
      component: () => import('../views/Department/equipment/DowntimeList.vue'),
      meta: {
        title: '비가동 설비 조회',
      },
    },
    {
      path: '/downtimemanage',
      name: 'DownTimeManage',
      component: () => import('../views/Department/equipment/DowntimeManage.vue'),
      meta: {
        title: '비가동 설비 관리',
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `Vue.js ${to.meta.title} | TailAdmin - Vue.js Tailwind CSS Dashboard Template`
  next()
})
