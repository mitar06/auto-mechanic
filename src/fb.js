import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// firebase init - add your own config here
const firebaseConfig = {
    apiKey: "AIzaSyD1g0jMYvfyX8vNTgW6sOq3maIo7I5HoOo",
    authDomain: "mechanic-10310.firebaseapp.com",
    databaseURL: "https://mechanic-10310.firebaseio.com",
    projectId: "mechanic-10310",
    storageBucket: "mechanic-10310.appspot.com",
    messagingSenderId: "757566484834",
    appId: "1:757566484834:web:48853678e3d5a8d6107c3b",
    measurementId: "G-LK42CEY78M"
  };
firebase.initializeApp(firebaseConfig)

// utils
const db = firebase.firestore()
const auth = firebase.auth()

// collection references

// export utils/refs
export {
  db,
  auth
}


