<template>
  <main class="home-page">
      <div class="dashboard">
        <div class="cards-container">
          <router-link class="card" to="/bookings">
            <span class="material-icons">event_available</span>
            <span class="text">View Bookings</span>
          </router-link>
          <router-link class="card" to="/customers">
            <span class="material-icons">group</span>
            <span class="text">Registered Users</span>
          </router-link>
          <router-link class="card" to="/suppliers">
            <span class="material-icons">groups</span>
            <span class="text">Suppliers List</span>
          </router-link>
          <router-link class="card" to="/assets">
            <span class="material-icons">directions_car</span>
            <span class="text">Vehicles List</span>
          </router-link>
          <router-link class="card" to="/maintenance">
            <span class="material-icons">construction</span>
            <span class="text">Services</span>
          </router-link>
          <router-link class="card" to="/reports">
            <span class="material-icons">summarize</span>
            <span class="text">Reports</span>
          </router-link>
        </div>
      </div>
  </main>

</template>
  
<script setup>

</script>
  
<style lang="scss">
  .home-page {
    // padding: 2rem;
    padding: 0;
    text-align: center;
  
    .dashboard {
      display: flex;
      justify-content: center;
      // align-items: center;
      align-items: flex-start;
      min-height: 100vh;
      background-color: var(--light-grey);
    }
  }
  .cards-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    max-width: 1200px;
    width: 100%;
    // padding: 1rem;
    padding: 0;
  }
  
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--dark);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    text-decoration: none;
    color: var(--light);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

    .material-icons {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: var(--primary);
    }

    .text {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--light);
    }

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
      background-color: var(--grey);
    }
}
</style>
