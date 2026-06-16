1. Ejecutar el script, el correo debe estar previamente registrado en firebase auth

```bash
node scripts/set-admin-claim.js correo@ejemplo.com
```

NOTA: Para eliminar todos los claims personalizados
```bash
await admin.auth().setCustomUserClaims(uid, null);
```