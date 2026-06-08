import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const configStr = fs.readFileSync('./firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const snapshot = await getDocs(collection(db, "users"));
  console.log("Total users:", snapshot.docs.length);
  snapshot.docs.forEach(doc => {
    console.log(doc.id, "UN:", doc.data().username, "REF:", doc.data().referrerId);
  });
  console.log("DONE");
  process.exit(0);
}
check();
