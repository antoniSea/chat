<script setup>
const props = defineProps({
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <input :placeholder="placeholder" :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
  </div>
</template>