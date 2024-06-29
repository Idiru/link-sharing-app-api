# link-sharing-app-api

## Global

### Environment variables

- `PORT`: To define the port you want to use.
- `ORIGIN`: To define the front url (to avoid CORS issues)
- `TOKEN_SECRET`: To uncode the JWT tokens
- `MONGODB_URI`: To connect to your DB

## Authentification

The application allow you to have and account.
The authentification is token-based (JWT) and is composed of 3 routes:

1. POST /auth/signup to create an account
2. POST /auth/login to login
3. GET /auth/verify to verify you're logged

## Signup

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

## Content

### Overview

The content only allows the user to create a new link block for the moment.
The endpoints start by `/content`.

### Core functionalities

- <u>**Add content:**</u>
  To create a new link, you have to provide these data:

  - block
  - platform
  - url
  - title

  Here is the endpoint: `/create`

- <u>**Get content:**</u>
  You can access to a specific content data using a GET request if you have its id.

  Here is the endpoint: `/:contentId`

- <u>**Update content:**</u>
  Your can update all the data of an existing content (fields available above) using a POST request if you have its id.

  The endpoint is the same than the "Get content" above.

- <u>**Delete content:**</u>
  You can delete to a specific content data using a DELETE request if you have its id.

  The endpoint is the same than the "Get content" above.

In case the id is needed, we extract it from the payload of the request. 
The content is linked to a user, a dedicated column exists inside the user table of the DB. 
