<template>
  <main class="reports-page">
    <h1>Fleet Reports</h1>
      <div class="reports">
        <div class="cards-container">
          <router-link class="card" to="/car_rental_reports">
            <span class="material-icons">car_rental</span>
            <span class="text">Car Rental Reports</span>
          </router-link>
          <router-link class="card" to="/lease_reports">
            <span class="material-icons">summarize</span>
            <span class="text">Lease Reports</span>
          </router-link>
          <router-link class="card" to="/distribution_reports">
            <span class="material-icons">event_available</span>
            <span class="text">Distribution Reports</span>
          </router-link>
          <router-link class="card" to="/transfer_reports">
            <span class="material-icons">summarize</span>
            <span class="text">Transfer Reports</span>
          </router-link>
          <router-link class="card" to="/maintenance_reports">
            <span class="material-icons">car_repair</span>
            <span class="text">Maintenance History</span>
          </router-link>
          <router-link class="card" to="/trip_reports">
            <span class="material-icons">directions_car</span>
            <span class="text">Trips Report</span>
          </router-link>
        </div>
      </div>
  </main>

</template>
  
<script setup>

</script>
  
<style lang="scss">
  .reports-page {
    // padding: 2rem;
    padding: 0;
    text-align: center;
  
    .reports {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      background-color: var(--light-grey);
      // background-color: aquamarine;
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
    // background-color: aquamarine;
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
      // color: var(--grey);
    }

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
      background-color: var(--grey);
    }
}
</style>
