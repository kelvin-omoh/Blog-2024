import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFnzViSGI36LM8UKIIbqenit0th4R97kA",
  authDomain: "voltaic-charter-393405.firebaseapp.com",
  projectId: "voltaic-charter-393405",
  storageBucket: "voltaic-charter-393405.appspot.com",
  messagingSenderId: "900540364932",
  appId: "1:900540364932:web:70a47472256ba8112f2ad1",
  measurementId: "G-D364BKDCRL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
