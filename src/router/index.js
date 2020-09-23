import Vue from 'vue'
import VueRouter from 'vue-router'
import About from '../views/About.vue'
import Login from '../components/Login.vue'  
import Dashboard from '../views/Dashboard.vue'
import Deductables from '../views/Deductables.vue'
import AddTask from '../views/AddTask.vue'
import Administration from '../views/AdministrationTest.vue'
import WebShop from '../views/WebShop.vue'
import Employees from '../views/Employees.vue'
import Phonebook from '../views/Phonebook.vue'
import Finances from '../views/Finances.vue'
import firebase from 'firebase'
Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/login'
  },
  {
    path : '/login',
    name : 'Login',
    component : Login
  },
  {
    path : '/addTask',
    name : 'addTask',
    component : AddTask,
    meta : {
      requiresAuth : true
    }
  },
  {
    path : '/deductables',
    name : 'rashodi',
    component : Deductables,
    meta : {
      requiresAuth : true
    }
  },
  {
    path : '/phonebook',
    name : 'Phonebook',
    component : Phonebook,
    meta : {
      requiresAuth : true
    }
  },
  {
    path : '/administration',
    name : 'Administration',
    component : Administration,
    meta : {
      requiresAuth : true
    }
  },
  {
    path: '/finances',
    name: 'Finansije',
    component: Finances,
    meta : {
      requiresAuth : true
    }
  },
  {
    path : '/employees',
    name : 'Employees',
    component : Employees,
    meta : {
      requiresAuth : true
    }
  },
  {
    path : '/dashboard',
    name : 'Dashboard',
    component : Dashboard,
    meta : {
      requiresAuth : true
    }
  },
  {
    path : '/webshop',
    name : 'Web Shop',
    component : WebShop,
    meta : {
      requiresAuth : true
    }
  },
  {
    path : '/termini',
    name : 'Termini',
    component : Administration,
    meta : {
      requiresAuth : true
    }
  },
  {
    path : '/dijelovi',
    name : 'Dijelovi',
    component : Administration,
    meta : {
      requiresAuth : true
    }
  },
  {
    path: '/about',
    name: 'O nama',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: About,
    meta : {
      requiresAuth : true
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next) => {
  const currentUser = firebase.auth().currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !currentUser) next('login');
  else if (!requiresAuth && currentUser) next('dashboard');
  else next();
});


export default router
