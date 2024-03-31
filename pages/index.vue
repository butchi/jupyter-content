<template>
  <main>
    <ContentList path="/" v-slot="{ list }">
      <div v-for="article in list" :key="article._path">
        <h2><nuxt-link :to="article._path + '/'">{{ article.title }}</nuxt-link></h2>
        <p>{{ article.description }}</p>
        <!-- <ContentRenderer :value="article" class="doc"></ContentRenderer> -->
      </div>
    </ContentList>
  </main>
</template>
