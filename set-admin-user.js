// scripts/set-admin-claim.js
import { config } from 'dotenv';
import admin from 'firebase-admin';

// Cargar variables de entorno desde el archivo .env
config();

// Obtener la clave de servicio (stringificada) desde las variables
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY no está definida en .env');
  process.exit(1);
}

// Parsear el JSON (ya viene como string en una línea)
let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
  console.error('❌ Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
  process.exit(1);
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function setAdminClaim(email) {
  if (!email) {
    console.error('❌ Debes proporcionar un correo electrónico.');
    console.log('Uso: node scripts/set-admin-claim.js usuario@ejemplo.com');
    process.exit(1);
  }

  try {
    // Buscar el usuario por correo electrónico
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;

    // Definir los claims personalizados (ej. admin: true)
    const customClaims = { admin: true };

    // Asignar los claims al usuario
    await admin.auth().setCustomUserClaims(uid, customClaims);

    console.log(`✅ Custom claim asignado correctamente a ${email} (UID: ${uid})`);
    console.log('Claims:', customClaims);
  } catch (error) {
    console.error('❌ Error al asignar el claim:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log(`No existe un usuario con el correo: ${email}`);
    }
  }
}

// Obtener el correo desde los argumentos de línea de comandos
const email = process.argv[2];
setAdminClaim(email);