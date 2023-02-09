<script setup>
  const props = defineProps({
    message: { type: Object, default: '' }
  })
</script>

<template>
  <div class="mt-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
    <slot></slot>
    <ReactionBox :message="message" reaction="👍">
      👍 {{ message.reactions.length }} reakcji
    </ReactionBox>
  </div>
</template>