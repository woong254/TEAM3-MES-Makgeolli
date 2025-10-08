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
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form_elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic_tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line_chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar_chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/PurManagement',
      name: 'PurManagement',
      component: () => import('../views/Department/materials/PurManagement.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
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

    // 자재

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
      path: '/equipment',
      name: 'EquipMaster',
      component: () => import('../views/Department/equipment/EquipMaster.vue'),
      meta: {
        title: '설비관리',
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `Vue.js ${to.meta.title} | TailAdmin - Vue.js Tailwind CSS Dashboard Template`
  next()
})
