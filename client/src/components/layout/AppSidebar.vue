<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div :class="['py-8 flex', !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start']">
      <router-link to="/">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="dark:hidden"
          src="/images/logo/logo.svg"
          alt="Logo"
          width="150"
          height="40"
        />
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="hidden dark:block"
          src="/images/logo/logo-dark.svg"
          alt="Logo"
          width="150"
          height="40"
        />
        <img v-else src="/images/logo/logo-icon.svg" alt="Logo" width="32" height="32" />
      </router-link>
    </div>
    <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
                !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">{{
                    item.name
                  }}</span>
                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-brand-500': isSubmenuOpen(groupIndex, index),
                      },
                    ]"
                  />
                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">{{
                    item.name
                  }}</span>
                </router-link>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) && (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <template v-if="subItem.path">
                          <router-link
                            :to="subItem.path"
                            :class="[
                              'menu-dropdown-item',
                              {
                                'menu-dropdown-item-active': isActive(subItem.path),
                                'menu-dropdown-item-inactive': !isActive(subItem.path),
                              },
                            ]"
                          >
                            {{ subItem.name }}
                            <span class="flex items-center gap-1 ml-auto">
                              <span
                                v-if="subItem.new"
                                :class="[
                                  'menu-dropdown-badge',
                                  {
                                    'menu-dropdown-badge-active': isActive(subItem.path),
                                    'menu-dropdown-badge-inactive': !isActive(subItem.path),
                                  },
                                ]"
                              >
                                new
                              </span>
                              <span
                                v-if="subItem.pro"
                                :class="[
                                  'menu-dropdown-badge',
                                  {
                                    'menu-dropdown-badge-active': isActive(subItem.path),
                                    'menu-dropdown-badge-inactive': !isActive(subItem.path),
                                  },
                                ]"
                              >
                                pro
                              </span>
                            </span>
                          </router-link>
                        </template>
                        <template v-else>
                          <div class="menu-dropdown-item menu-dropdown-item-inactive">
                            {{ subItem.name }}
                          </div>
                        </template>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import {
  GridIcon,
  CalenderIcon,

  ChevronDownIcon,
  HorizontalDots,
  PageIcon,
  TableIcon,
  ListIcon,
  PlugInIcon,
} from "../../icons";

import BoxCubeIcon from '@/icons/BoxCubeIcon.vue'
import { useSidebar } from '@/composables/useSidebar'
import Signin from '@/views/Auth/Signin.vue'

const route = useRoute()

interface SubItem {
  name: string
  path?: string
  new?: boolean
  pro?: boolean
}

interface Item {
  icon: unknown
  name: string
  path?: string
  subItems?: SubItem[]
}

interface MenuGroup {
  title: string
  items: Item[]
}

const {
  isExpanded,
  isMobileOpen,
  isHovered,
  openSubmenu,
  closedSubmenus,
  toggleSubmenu: toggleSubmenuAction,
} = useSidebar()

const menuGroups: MenuGroup[] = [
  // 템플릿 기본 메뉴 (다 만들고 삭제할 것)
  {
    title: '템플릿 기본 메뉴',
    items: [
      {
        icon: BoxCubeIcon,
        name: 'Ui Elements',
        subItems: [
          { name: "Ecommerce", path: "/", pro: false },
          { name: "404 Page", path: "/error-404", pro: false },
          { name: "Bar Chart", path: "/bar-chart", pro: false },
          { name: "Alerts", path: "/alerts", pro: false },
          { name: "Avatars", path: "/avatars", pro: false },
          { name: "Badge", path: "/badge", pro: false },
          { name: "Buttons", path: "/buttons", pro: false },
          { name: "Images", path: "/images", pro: false },
          { name: "Videos", path: "/videos", pro: false },
          { name: "Basic Tables", path: "/basic-tables", pro: false },
          { name: "Form Elements", path: "/form-elements", pro: false },
        ],
      },
      {
        icon: PlugInIcon,
        name: 'Authentication',
        subItems: [
          { name: 'Signin', path: '/signin', pro: false },
          { name: 'Signup', path: '/signup', pro: false },
        ],
      },
    ],
  },
  {
    title: 'Menu',
    items: [
      {
        icon: BoxCubeIcon,
        name: '기준정보',
        subItems: [
          { name: 'Ecommerce', path: '/', pro: false },
          { name: '404 Page', path: '/error-404', pro: false },
          { name: 'Bar Chart', path: '/bar-chart', pro: false },
          { name: 'Alerts', path: '/alerts', pro: false },
          { name: 'Avatars', path: '/avatars', pro: false },
          { name: 'Badge', path: '/badge', pro: false },
          { name: 'Buttons', path: '/buttons', pro: false },
          { name: 'Images', path: '/images', pro: false },
          { name: 'Videos', path: '/videos', pro: false },
        ],
      },
      {
        icon: GridIcon,
        name: '영업',
        subItems: [
          { name: '주문서조회', path: '/of', pro: false },
          { name: '주문서관리', path: '/ofm', pro: false },
          { name: '완제품입고조회', path: '/ep-instore', pro: false },
          { name: '완제품입고관리', path: '/ep-instoremanage', pro: false },
          { name: '완제품출고조회', path: '/ep-outstore', pro: false },
          { name: '완제품출고관리', path: '/ep-outstoremanage', pro: false },
        ],
      },
      {
        icon: PlugInIcon,
        name: '생산',
        subItems: [
          { name: '생산지시관리', path: '/prodOrd', pro: false },
        ],
      },
      {
        icon: BoxCubeIcon,
        name: '자재',
        subItems: [
          { name: '입고관리', path: '/signin', pro: false },
          { name: '발주관리', path: '/purManagement', pro: false },
          { name: '발주조회', path: '/signup', pro: false },
          { name: '자재조회', path: '/signup', pro: false },
          { name: 'MPR관리', path: '/signup', pro: false },
        ],
      },
      {
        icon: PlugInIcon,
        name: '품질',
        subItems: [
          { name: '품질검사 기준관리', path: '/quamaster', pro: false },
          { name: '자재입고검사 조회', path: '/signup', pro: false },
          { name: '자재입고검사 관리', path: '/signup', pro: false },
          { name: '공정검사 조회', path: '/signup', pro: false },
          { name: '공정검사 관리', path: '/signup', pro: false },
          { name: '완제품검사 조회', path: '/signup', pro: false },
          { name: '완제품검사 관리', path: '/signup', pro: false },
          { name: '불량 기준 관리', path: '/signup', pro: false },
        ],
      },
      {
        icon: PlugInIcon,
        name: '설비',
        subItems: [
          { name: '설비관리', path: '/equipment', pro: false },
          { name: '비가동 설비조회', path: '/', pro: false },
          { name: '비가동 설비관리', path: '/', pro: false },
          { name: '점검관리', path: '/', pro: false },
          { name: '점검항목조회', path: '/', pro: false },
          { name: '수리관리', path: '/signup', pro: false },
          { name: '수리이력조회', path: '/signup', pro: false },
        ],
      },
    ],
  },
]

const isActive = (path: string) => route.path === path

const toggleSubmenu = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`
  toggleSubmenuAction(key)
}

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.some((group: MenuGroup) =>
    group.items.some(
      (item: Item) =>
        !!item.subItems &&
        item.subItems.some((subItem: SubItem) => !!subItem.path && isActive(subItem.path)),
    ),
  )
})

const isSubmenuOpen = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`
  // If user manually closed this submenu, respect that and keep it closed
  if (closedSubmenus.value.includes(key)) return false
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      !!menuGroups[groupIndex].items[itemIndex].subItems &&
      menuGroups[groupIndex].items[itemIndex].subItems!.some(
        (subItem: SubItem) => !!subItem.path && isActive(subItem.path!),
      ))
  )
}

const startTransition = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = 'auto'
  const height = htmlEl.scrollHeight
  htmlEl.style.height = '0px'
  void htmlEl.offsetHeight // force reflow
  htmlEl.style.height = height + 'px'
}

const endTransition = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = ''
}
</script>
