<script setup>
  import axios from 'axios'

  const props = defineProps({
    reaction: { type: String, default: '' },
    message: { type: Object, default: '' }
  })

  const addReaction = () => {
    axios.post(`http://localhost:3000/add-reaction/${props.message.id}`, {
      reaction: props.reaction
    })
  }
</script>

<template>
  <div class="w-fit py-1 cursor-pointer" @click="addReaction">
    <slot />
  </div>
</template>