<template>
<v-app>
    <v-container>
        <v-layout justify-center>

            <v-flex lg3 md6 sm6 xs10>
                <v-img src="https://via.placeholder.com/150

C/O https://placeholder.com/" contain height=150></v-img>
                <v-alert type="error" v-if="loginError">
                   {{errorText}}
                </v-alert>
                <v-form dark>
                    <v-text-field v-model="email" label="Email"></v-text-field>
                    <v-text-field v-model="password" :type="'password'" label="Password"></v-text-field>
                    <v-btn text class="success" @click.prevent="submit()">Sign In</v-btn>
                </v-form>
            </v-flex>
        </v-layout>
    </v-container>
</v-app>
</template>

<script>
import firebase from 'firebase'
export default {
    data() {
        return {
            email: '',
            password: '',
            loginError: false,
            errorText : ''

        }
    },
    methods: {
        submit() {
            firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(() => {
                
                this.$router.replace('administration').catch(() => {})

            }).catch(error => {
                this.loginError = true;
                this.errorText = error.message
            })

        }

    }
}
</script>
