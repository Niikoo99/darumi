// Import the functions you need from the SDKs you need
import firebase from "firebase/app"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwvKGy2whzyxB4mhr1eSzAUszd5boX2MU",
  authDomain: "darumi.firebaseapp.com",
  projectId: "darumi",
  storageBucket: "darumi.appspot.com",
  messagingSenderId: "329493444736",
  appId: "1:329493444736:web:9b847772eccef0a4eb0e65"
};

// Initialize Firebase
export const firebaseApp = firebase.initializeApp(firebaseConfig)