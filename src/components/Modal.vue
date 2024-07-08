<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal">
        <header class="modal-header">
          <slot name="header"></slot>
          <button @click="close">&times;</button>
        </header>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['close'])

const close = () => {
emit('close')
}
</script>
  
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  margin-top: 1rem;
}

button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
  