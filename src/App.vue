<template>
  <v-app class="grey lighten-4">
    <navbar/>
      <v-content>
       <v-container fluid>
        <router-view></router-view>
         </v-container>
         
      </v-content>
      
</v-app>
</template>


<script>
import Navbar from './components/Navbar.vue'
export default {
    data(){
      return {

      }
    },
    components : {
      navbar : Navbar
    }

}
</script>
