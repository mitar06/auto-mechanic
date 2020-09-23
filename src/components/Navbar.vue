<template>
<nav>
<v-app-bar color="#DDFFEB" app dense flat>

  

<v-img
    class=""
    src="../assets/logo.png"
    max-height="140"
    max-width="140"
    contain
  ></v-img>

</v-app-bar>
    <v-navigation-drawer dark v-model="drawer" expand-on-hover app permanent color="primary" v-if="user" >
        <v-layout column align-center>
            <v-flex class=" mb-3">
               
            </v-flex>
        </v-layout>
        <v-list>
            <v-list-item v-for="link in links" :key="link.text" router :to="link.route">

                <v-list-item-title :prepend-icon="link.icon" class="white--text">
                    <v-icon left>{{link.icon}}</v-icon> {{link.text}}
                </v-list-item-title>

            </v-list-item>
            <v-list-item router to="/termini">
                    <v-icon left>mdi-calendar-account</v-icon>
                    <v-list-item-title prepend-icon=" ">Termini</v-list-item-title>
                </v-list-item>
                <v-list-item router to="/dijelovi">
                    <v-icon left>mdi-message-cog</v-icon>
                    <v-list-item-title prepend-icon=" ">Dijelovi</v-list-item-title>
                </v-list-item>
             <v-list-item router to="/addTask">
                    <v-icon left>mdi-playlist-plus</v-icon>
                    <v-list-item-title prepend-icon=" ">Dodaj radni nalog</v-list-item-title>
                </v-list-item>
                 <v-list-item router to="/employees">
                    <v-icon left>mdi-account</v-icon>
                    <v-list-item-title prepend-icon=" ">Zaposleni</v-list-item-title>
                </v-list-item>
                 <v-list-item router to="/about">
                    <v-icon left>mdi-chat-alert-outline</v-icon>
                    <v-list-item-title prepend-icon=" ">O nama(kontakt)</v-list-item-title>
                </v-list-item>
                  <v-list-item router to="/webshop">
                    <v-icon left>mdi-cart-outline</v-icon>
                    <v-list-item-title prepend-icon=" ">Web shop</v-list-item-title>
                </v-list-item>
        </v-list>
         <template v-slot:append>
        <v-list-item color="black" @click="signOut">
                    <v-icon left color="black">mdi-power</v-icon>
                    <v-list-item-title color="black" prepend-icon=""  dark rounded>Odjava</v-list-item-title>
                </v-list-item>
      </template>
    </v-navigation-drawer>
</nav>
</template>

<script>
import firebase from 'firebase'
export default {
    data() {
        return {
            drawer: true,
            links: [{
                    icon: 'mdi-view-dashboard-variant',
                    text: 'Glavna',
                    route: '/dashboard'
                },
                {
                    icon: 'mdi-monitor-dashboard',
                    text: 'Administracija',
                    route: '/administration'
                },
                {
                    icon: 'mdi-format-list-bulleted-square',
                    text: 'Finansije ',
                    route: '/finances'
                },
                {
                    icon: 'mdi-cash-minus',
                    text: 'Rashodi',
                    route: '/deductables'
                },
                 {
                    icon: 'mdi-deskphone',
                    text: 'Imenik',
                    route: '/Phonebook'
                },

            ],
            admins: [
                ['Management', 'people_outline'],
                ['Settings', 'settings'],
            ],
            cruds: [
                ['Create', 'add'],
                ['Read', 'insert_drive_file'],
                ['Update', 'update'],
                ['Delete', 'delete'],
            ],
            user: "",
            admin: false,
            

        }
    },
    methods :{
        signOut(){
            firebase.auth().signOut().then(()=>{
                alert('Signed out');

            })
        }
    },
    created(){
        firebase.auth().onAuthStateChanged((user)=>{
            if(user){
                this.user = user;
            }else{
                this.user = null;
                 this.$router.replace('/login')
            }
        });
    }
    

}
</script>
