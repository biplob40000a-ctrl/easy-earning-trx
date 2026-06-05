import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    await setDoc(doc(db, 'state', 'test_doc'), { test: true });
    console.log("Success");
    process.exit(0);
  } catch (e) {
    console.error("Error", e);
    process.exit(1);
  }
}
run();
