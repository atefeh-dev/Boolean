<template>
  <div class="field">
    <label class="field-label" :for="id">{{ label }}</label>
    <div class="field-wrap field-wrap--password">
      <input
        :id="id"
        :value="modelValue"
        :type="visible ? 'text' : 'password'"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        required
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <UiAppButton
        variant="icon-ghost"
        shape="rounded"
        class="field-wrap__toggle"
        :aria-label="visible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'"
        :aria-pressed="visible"
        @click="visible = !visible"
      >
        <IconsEyeOff v-if="visible" />
        <IconsEye v-else />
      </UiAppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    id: string
    label: string
    name?: string
    autocomplete?: string
    placeholder?: string
  }>(),
  {
    name: 'password',
    autocomplete: 'current-password',
    placeholder: '••••••••',
  }
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const visible = ref(false)
</script>
