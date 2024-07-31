<template>
  <div class="app">
    <Sidebar />
    <div class="main-content">
      <header>
        <h1>Car Booking System
          <div class="profile-container" @click="toggleDropdown">
            <!-- <span class="material-icons">account_circle</span> -->
            <div class="initials">{{ userInitials }}</div>
            <div v-if="showDropdown" class="dropdown">
              <p>{{ user.fullName }}</p>
              <p>{{ user.email }}</p>
              <router-link to="/login" @click="logout">Logout</router-link>
            </div>
          </div>
        </h1>
      </header>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import { computed, ref } from 'vue';
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const user = JSON.parse(localStorage.getItem('user') || '{}');

const userInitials = computed(() => {
  if (user.firstName && user.lastName) {
    return user.firstName[0] + user.lastName[0];
  }
  return '';
});

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

</script>

<style lang="scss">
:root {
  --primary: #4ade80;
  --grey: #64784b;
  --dark: #1e293b;
  --dark-alt: #334155;
  --light: #f1f5f9;
  --sidebar-width: 300px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Fira sans', sans-serif;
}

body {
  background: var(--light)
}

button {
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  // background: none;
  color: var(--dark-alt);
  background: #4ade80;
}

.app {
  display: flex;
}
.main-content {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;

  header {
    background-color: var(--grey);
    color: var(--light);
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;

    h1 {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;

    .profile-container {
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;
        
        .initials {
          background-color: var(--primary);
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.25rem;
          margin-left: 1rem;
        }

        .dropdown {
          position: absolute;
          top: 3rem;
          right: 0;
          background-color: var(--dark-alt);
          border: 1px solid var(--grey);
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          width: 150px;
          z-index: 1000;

          p {
            margin: 0 0 0.5rem 0;
            color: var(--light);
            font-size: 0.875rem;
          }
          
          a {
            display: block;
            padding: 0.25rem 0;
            text-decoration: none;
            color: var(--primary);
            font-size: 0.875rem;
            text-align: center;

            &:hover {
              background-color: var(--grey);
              color: var(--light);
            }
          }
        }
      }
    }
  }

main {
  flex: 1 1 0;
  padding: 2rem;

  @media (max-width: 768px) {
    padding-left: 6rem;
  }
}
}

</style>
