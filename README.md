# DevBootcamps API

> A real world backend API for bootcamps directory app that provides online personal development courses
 
The API is live at: 

```
https://devbootcamps.xyz
```
**Note:** The API gateway is safe, and the client connection is secured with an SSL certificate

## Deployment
The API is deployed to `production` on Digital Ocean and uses `nginx` as a reverse proxy between the client, and the backend service.

## Introduction
The intent of this project is to show how a real world API is designed and implemented using:

1. Node.js
2. Express.js
3. MongoDB

I have followed and applied best design and programming practices, and considered the security, integrity and efficiency.

 ## Features 
 This API provides various common functionalities required for real world web applications such as:
 
 * Authorization and authentication mechanisms
 * API security
 * Dozens of clear, strict and easy to use endpoints for several resources (e.g. courses, users)

## Hitting the API Endpoints 
### API Documentation
> There are two ways to view the API documentation

* Visit the API documentation at https://devbootcamps.xyz  (yep, a cheap DNS...). To hit the endpoints, 
please replace `{{URL}}` with the base URL

* Alternatively, you may visit the public documentation published via Postman [here](https://documenter.getpostman.com/view/7464231/SzzrXZMH?version=latest),
which is slightly different to the one above. This can also be accessed locally at `public/index.html` which is generated 
using `docgen` tool that parses the postman API JSON specification into a webpage. To access the index.html locally, 
either visit your localhost `127.0.0.1:<port>` or `127.0.0.1:<port>/index.html` to view the documentation or simply click on `public/indext.html`.

**Note:** replace the variable `{{URL}}` in the documentation endpoints with the live API base URL to hit the live API, or your localhost `127.0.0.1:<port>` in case you're running locally

 ## Usage
```
# Install required dependencies in package.json
npm install
```
 ### Configuring the API
Check the `config.pub.env` for API configuration details and replace the `REDACTED` values with your own 
settings then rename it to `config.env` and include it in your `.gitignore` 

 ### Starting the API
```
# Run the API in development environment 
npm run dev

# Run the API in production environment
npm run start
```

## Version
v1.0.0

## License
MIT

## Acknowledgement
This project is a learning outcome of Brad Traversy's Node.js course in addition to many personal API design and code improvements and fixes.