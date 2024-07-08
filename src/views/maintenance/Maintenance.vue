<template>
  <div class="maintenance-view">
    <nav class="navbar">
      <button 
        @click="showServiceHistory = false" 
        :class="{ active: !showServiceHistory }"
        class="toggle-button">
        Service Schedule
      </button>
      <button 
        @click="showServiceHistory = true" 
        :class="{ active: showServiceHistory }"
        class="toggle-button">
        Service History
      </button>
    </nav>
    <div v-if="!showServiceHistory">
      <h1>Service Schedule</h1>
      <ServiceSchedule />
    </div>
    <div v-if="showServiceHistory">
      <h1>Service History</h1>
      <ServiceHistory />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ServiceHistory from './ServiceHistory.vue'
import ServiceSchedule from './ServiceSchedule.vue'

const showServiceHistory = ref(false)
</script>

<style scoped>
.maintenance-view {
  padding: 1rem;
}

.navbar {
  display: flex;
  justify-content: center;
  background-color: #333;
  color: #fff;
  padding: 1rem;
}

.toggle-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  padding: 0.5rem 2rem;
  cursor: pointer;
  outline: none;
}

.toggle-button.active {
  font-weight: bold;
  text-decoration: underline;
}

h1 {
  text-align: center;
  margin-top: 1rem;
}

</style>
