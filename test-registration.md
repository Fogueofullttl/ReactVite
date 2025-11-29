# Testing Registration Endpoint

## 1. Test with curl (from Railway console or your local machine)

```bash
curl -X POST https://ttmfprtm.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User",
    "birthYear": "1990",
    "club": "Test Club"
  }'
```

Expected response (success):
```json
{
  "success": true,
  "user": {
    "uid": "...",
    "email": "test@example.com",
    "displayName": "Test User",
    "memberNumber": "PRTTM-000002",
    "role": "jugador"
  }
}
```

Expected error (if user exists):
```json
{
  "error": "Este correo electrónico ya está registrado"
}
```

## 2. Check Railway Logs

Go to Railway dashboard → Deployments → Latest deployment → View Logs

Look for:
- ✓ Firebase Admin initialized
- User registered: [email] ([member number])

Or errors like:
- ❌ Firebase Admin initialization failed
- ❌ Registration error: [error message]

## 3. Common Issues

### Issue: "Firebase Admin initialization failed"
**Solution**: Make sure FIREBASE_ADMIN_CREDENTIALS environment variable is set in Railway

### Issue: "Missing required fields"
**Solution**: Check that all fields are being sent: email, password, firstName, lastName, birthYear

### Issue: "Email already registered"
**Solution**: Delete user from:
1. Firebase Console → Authentication → Users
2. Firebase Console → Firestore → users collection

### Issue: Registration works but login fails
**Solution**: The user was created correctly, try logging in with the credentials you used during registration
