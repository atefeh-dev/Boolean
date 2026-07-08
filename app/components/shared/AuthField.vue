<template>
  <div class="auth-field">
    <label class="auth-field__label" :for="id">{{ label }}</label>
    <div
      class="auth-field__wrap"
      :class="{ 'auth-field__wrap--password': isPassword }"
    >
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="auth-field__toggle"
        :aria-label="visible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'"
        @click="visible = !visible"
      >
        <IconsEyeOff v-if="visible" />
        <IconsEye v-else />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  id: string
  label: string
  type?: string
  name?: string
  autocomplete?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}>(), {
  type: 'text',
  required: true,
})

defineEmits<{ 'update:modelValue': [v: string] }>()

const isPassword = computed(() => props.type === 'password')
const visible = ref(false)
const inputType = computed(() => {
  if (!isPassword.value) return props.type
  return visible.value ? 'text' : 'password'
})
</script>
