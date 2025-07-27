import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBmQO8JP9SxsUmHYS782yMpsVcoRk1_pVM",
  authDomain: "SmartTraffic.firebaseapp.com",
  databaseURL: "https://smarttraffic-75651-default-rtdb.firebaseio.com/",
  projectId: "smarttraffic-75651",
  storageBucket: "SmartTraffic.appspot.com",
  messagingSenderId: "398865577507",
  appId: "1:398865577507:web:5bc5c5441bea11158a6396",
  measurementId: "G-VLD5XT2R5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);