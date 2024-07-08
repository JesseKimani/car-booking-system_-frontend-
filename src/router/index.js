import { createRouter, createWebHistory } from 'vue-router';

import Login from '../views/auth/Login.vue';

import Dashboard from '../views/Dashboard.vue'
import Assets from '../views/Assets.vue';
import Customers from '../views/Customers.vue'
import Suppliers from '../views/Suppliers.vue';
import Stores from '../views/stores/Stores.vue';
import Products from '../views/stores/Products.vue';
import Fuel from '../views/stores/Fuel.vue';
import Maintenance from '../views/maintenance/Maintenance.vue';
import Bookings from '../views/booking/Bookings.vue';
import CarRental from '../views/booking/CarRental.vue';
import Transfers from '../views/booking/Transfers.vue'
import Distribution from '../views/booking/Distribution.vue';
import Leases from '../views/booking/Leases.vue';
import Finance from '../views/finance/Finance.vue';
import Expenses from '../views/finance/Expenses.vue';
import Income from '../views/finance/Income.vue';
import Reports from '../views/reports/Reports.vue';
import CarRentalReports from '../views/reports/CarRentalReports.vue';
import MaintenanceReport from '../views/reports/MaintenanceReport.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            component: Login
        },
        {
            path: '/',
            component: Dashboard,
            meta: { requiresAuth: true }
        },
        {
            path: '/bookings',
            component: Bookings,
            meta: { requiresAuth:true },
            children: [
                {
                    path: '',
                    name: 'CarRental',
                    component: CarRental
                },
                {
                    path: 'distribution',
                    name: 'Distribution',
                    component: Distribution
                },
                {
                    path: 'leases',
                    name: 'Leases',
                    component: Leases
                },
                {
                    path: 'transfers',
                    name: 'Transfers',
                    component: Transfers
                }
            ],
        },
        {
            path: '/assets',
            component: Assets,
            meta: { requiresAuth: true }
        },
        {
            path: '/customers',
            component: Customers,
            meta: { requiresAuth: true }
        },
        {
            path: '/suppliers',
            component: Suppliers,
            meta: { requiresAuth: true }
        },
        {
            path: '/stores',
            component: Stores,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'Products',
                    component: Products
                },
                {
                    path: '/stores/fuel',
                    name: 'Fuel',
                    component: Fuel
                },
            ],
        },
        {
            path: '/maintenance',
            component: Maintenance,
            meta: { requiresAuth: true }
        },
        {
            path: '/finance',
            component: Finance,
            meta: { requiresAuth:true },
            children: [
                {
                    path: '',
                    name: 'Income',
                    component: Income
                },
                {
                    path: 'expenses',
                    name: 'Expenses',
                    component: Expenses
                },
            ],
        },
        {
            path: '/reports',
            name: 'Reports',
            component: Reports
        },
        {
            path: '/car_rental_reports',
            name: 'CarRentalReports',
            component: CarRentalReports
        },
        {
            path: '/maintenance_reports',
            name: 'MaintenanceReport',
            component: MaintenanceReport
        }
    ]
})

router.beforeEach((to, from, next) => {
    const loggedIn = !!localStorage.getItem('token');

    if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
        next('login');
    } else {
        next();
    }
});

export default router