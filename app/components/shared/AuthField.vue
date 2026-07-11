<template>
  <div class="auth-field">
    <label class="auth-field__label" :for="id">{{ label }}</label>
    <div
      class="auth-field__wrap"
      :class="{
        'auth-field__wrap--password': isPassword,
        'auth-field__wrap--invalid': !!error,
      }"
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
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : undefined"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
      <UiAppButton
        v-if="isPassword"
        variant="icon-ghost"
        shape="rounded"
        class="auth-field__toggle"
        :aria-label="visible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'"
        @click="visible = !visible"
      >
        <IconsEyeOff v-if="visible" />
        <IconsEye v-else />
      </UiAppButton>
    </div>
    <UiFieldError :id="`${id}-error`" :message="error" />
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
  error?: string | null
}>(), {
  type: 'text',
  required: true,
  error: null,
})

defineEmits<{ 'update:modelValue': [v: string]; blur: [] }>()

const isPassword = computed(() => props.type === 'password')
const visible = ref(false)
const inputType = computed(() => {
  if (!isPassword.value) return props.type
  return visible.value ? 'text' : 'password'
})
</script>
