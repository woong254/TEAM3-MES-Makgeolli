<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue';
// import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import firstLogo from "../../../public/images/logo/firstLogo.png";
// import { ref } from 'vue';

// const currentPageTitle = ref('메인화면');
</script>

<template>
  <AdminLayout>
    <!-- <PageBreadcrumb :pageTitle="currentPageTitle" /> -->
      <main class="hero">
        <img class="logo" :src="firstLogo" alt="First Logo" />

        <section class="copy">
          <p class="line">오늘도 활기차게</p>
          <p class="line">안전한 막걸리</p>
        </section>
      </main>
  </AdminLayout>
</template>


<style scoped>
:root {
  --logo-size: 20px;        /* 로고 지름 느낌 */
  --line-gap: 18px;         /* 문구 줄 간격 */
  --font-lg: clamp(22px, 3.2vw, 36px); /* 반응형 폰트 */
  --text-color: #111;       /* 본문 색상 */
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: var(--text-color);
}

.logo {
  width: var(--logo-size);
  height: var(--logo-size);
  object-fit: contain;
  display: block;
}

.copy {
  margin-top: 100px;
}

.line {
  font-size: var(--font-lg);
  line-height: 1.5;
  letter-spacing: -0.01em;
  margin: 0;
}

.copy .line + .line {
  margin-top: var(--line-gap);
}
</style>
