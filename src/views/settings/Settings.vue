<template>
  <div>
    <div class="buttons">
      <button
        v-for="(button, index) in buttons"
        :key="index"
        :class="{ active: activeButton === index }"
        @click="selectButton(index, button.path)"
      >
        {{ button.name }}
      </button>
    </div>
    <router-view></router-view>
  </div>
</template>  

<script>
export default {
  data() {
    return {
      buttons: [
        { name: 'Asset Makes', path: '' },
        { name: 'Asset Groups', path: 'asset_groups' },
        { name: 'Area Offices/Branches', path: 'area_offices' },
        { name: 'Departments', path: 'company_departments' },
        { name: 'Drivers', path: 'drivers' },
        { name: 'Positions', path: 'positions' },
        { name: 'Supplier Categories', path: 'supplier_categories' },
        { name: 'Expense Types', path: 'expense_types'},
        { name: 'Payment Methods', path: 'payment_methods' },
        { name: 'Fuel Types', path: 'fuel_types'}
      ],
      activeButton: 0
    };
  },
  methods: {
    selectButton(index, path) {
      this.activeButton = index;
      this.$router.push({ path: path ? `/settings/${path}` : '/settings' });
    }
  },
  created() {
    // Set the default active button based on the current route
    const currentPath = this.$route.path.split('/').pop();
    const defaultIndex = this.buttons.findIndex(button => button.path === currentPath);
    this.activeButton = defaultIndex !== -1 ? defaultIndex : 0;
  }
};
</script>

<style>
.buttons {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
}

button.active {
  background-color: #007bff;
  color: white;
}
</style>
