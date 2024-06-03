# link-sharing-app-api

## Authentification
The application allow you to have and account. 
The authentification is token-based (JWT) and is composed of 3 routes: 
1. POST /auth/signup to create an account
2. POST /auth/login to login
3. GET /auth/verify to verify you're logged

### Signup
To signup, you have to provide these data:
- email
- password
- firstName
- lastName

The following checks are done:
- None of them are empties
- The email format is valid
- The password guidelines are followd (at least 6 characters and contain at least one number, one lowercase and one uppercase letter)
- Dupplicate users (already existing email)

If everything is OK, your data are stored with a hashed version of your password. 