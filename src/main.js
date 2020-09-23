
import Vue from 'vue'
import App from './App.vue'

import vuetify from './plugins/vuetify';
import router from './router'
import {auth} from './fb';
Vue.config.devtools = true;


Vue.config.productionTip = false

let app = null;
auth.onAuthStateChanged(() => {
    if (!app) {
        app = new Vue({
          vuetify,
          router,
          render: h => h(App)
        }).$mount('#app')
    }
})

