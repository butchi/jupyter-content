import IpynbModule from './ipynb-module.mjs'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    IpynbModule,
    '@nuxt/content',
  ]
})
