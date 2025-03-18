import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { ServiceAccount } from "firebase-admin";

dotenv.config();

// Verifica que las credenciales existan en el .env
if (!process.env.FIREBASE_CREDENTIALS) {
  throw new Error('FIREBASE_CREDENTIALS no está definida en el .env');
}

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// Inicializa Firebase solo si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}



export { admin };