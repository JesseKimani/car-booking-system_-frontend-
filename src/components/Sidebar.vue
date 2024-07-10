<template>
  <aside :class="`${is_expanded && 'is-expanded'}`">
    <div class="logo">
      <img src="../assets/fgtlogo.png" alt="FGT">
    </div>

    <div class="menu-toggle-wrap">
      <button class="menu-toggle" @click="ToggleMenu">
        <span class="material-icons">keyboard_double_arrow_right</span>
      </button>
    </div>

    <h3>Menu</h3>
    <div class="menu">
      <router-link class="button" to="/">
        <span class="material-icons">home</span>
        <span class="text">Dashboard</span>
      </router-link>
      <router-link class="button" to="/assets">
        <span class="material-icons">directions_car</span>
        <span class="text">Assets</span>
      </router-link>
      <router-link class="button" to="/bookings">
        <span class="material-icons">event_available</span>
        <span class="text">Bookings</span>
      </router-link>
      <router-link class="button" to="/customers">
        <span class="material-icons">group</span>
        <span class="text">Customers</span>
      </router-link>
      <router-link class="button" to="/suppliers">
        <span class="material-icons">groups</span>
        <span class="text">Suppliers</span>
      </router-link>
      <router-link class="button" to="/stores">
        <span class="material-icons">local_convenience_store</span>
        <span class="text">Store</span>
      </router-link>
      <router-link class="button" to="/maintenance">
        <span class="material-icons">construction</span>
        <span class="text">Maintenance</span>
      </router-link>
      <router-link class="button" to="/finance">
        <span class="material-icons">paid</span>
        <span class="text">Finance</span>
      </router-link>
      <router-link class="button" to="/reports">
        <span class="material-icons">summarize</span>
        <span class="text">Reports</span>
      </router-link>
      <router-link class="button" to="/settings">
        <span class="material-icons">settings</span>
        <span class="text">Settings/Setup Data</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const is_expanded = ref(localStorage.getItem("is_expanded") === "true")

const ToggleMenu = () => {
  is_expanded.value = !is_expanded.value

  localStorage.setItem("is_expanded", is_expanded.value)
}

</script>

<style lang="scss" scoped>
aside {
    display: flex;
    flex-direction: column;
    width: calc(2rem + 32px);
    min-height: 100vh;
    overflow: hidden;
    background-color: var(--dark);
    color: var(--light);
    transition: 0.2s ease-out;

    .flex {
      flex: 1 1 0;
    }

    .logo {
      margin-bottom: 1rem;

      img {
        width: 3rem;
      }
    }

    .menu-toggle-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;

      position: relative;
      top: 0;
      transition: 0.2s ease-out;

      .menu-toggle {
        transition: 0.2s ease-out;

        .material-icons {
          font-size: 2rem;
          color: var(--light);
        }
      }

      &:hover {
        .material-icons {
          color: var(--light);
          transform: translateX(0.5rem);
        }
      }
    }

    h3, .button .text {
      opacity: 0;
      transition: 0.3s ease-out;
    }

    h3 {
      color: var(--grey);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;

      opacity: 1;
      transition: 0.3s ease-out;
    }

    .menu {
      margin: 0 -1rem;

      .button {
        display: flex;
        align-items: center;
        text-decoration: none;

        padding: 0.5rem 1rem;
        transition: 0.2s ease-out;

        .material-icons {
          font-size: 2rem;
          color: var(--light);
          transition: 0.2s ease-out;
        }

        .text {
          color: var(--light);
          transition: 0.2s ease-out;
        }

        &:hover, &.router-link-exact-active {
          background-color: var(--dark-alt);
          
          .material-icons, .text {
            color: var(--primary);
          }
        }

        &.router-link-exact-active {
          border-right: 5px solid var(--primary);
        }
      }
    }

    &.is-expanded {
      width: var(--sidebar-width);

      .menu-toggle-wrap {
        top: -3rem;
        .menu-toggle {
          transform: rotate(-180deg);
        }
      }

      h3, .button .text {
        opacity: 1;
      }

      .button {
        .material-icons {
          margin-right: 1rem;
        }
      }

    }

}
</style>
