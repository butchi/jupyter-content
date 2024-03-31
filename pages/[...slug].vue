<template>
  <main>
    <ContentDoc>
      <template #default="{ doc }">
        <article>
          <ContentRenderer :value="doc"></ContentRenderer>
        </article>
      </template>
      <template #not-found>
        <p>
            コンテンツが見つかりません
        </p>
      </template>
    </ContentDoc>
  </main>
</template>