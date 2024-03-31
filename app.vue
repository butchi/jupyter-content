<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style lang="postcss">
.source.code pre {
  padding: 1em;

  border: 1px solid hsl(0, 0%, 85%);

  background-color: hsl(0, 0%, 95%);

  border-radius: 3px;
}

.text.html {
  + .text.plain {
    display: none;
  }
}
</style>