
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; 


const firebaseConfig = {
  apiKey: "AIzaSyARH73Hu4wps6ZxSUIDC7zHbD97eTlKhPY",
  authDomain: "socialex-317b1.firebaseapp.com",
  projectId: "socialex-317b1",
  storageBucket: "socialex-317b1.appspot.com",
  messagingSenderId: "810599669703",
  appId: "1:810599669703:web:fe1213206736b768c743e2"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
