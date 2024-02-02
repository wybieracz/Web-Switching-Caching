# Web-Switching-Caching
Simple web app for Web technologies in applications on Gdansk University of Technology. Main idea of this project is to show web caching and web switching features in web application.
## Technologies
* Python
* FastAPI
* Atlas MongoDB
* Nginx
* JavaScript
* React
* React Router
* TailwindCSS
* NextUI
## Features
* Create account and login
* Edit user settings
* Fetch user data using cached endpoint
## System architecture
![architecture](/screenshots/architecture.png)
Frontend is set up using an Nginx Server. What is more it communicates with backend via Nginx Proxy, on which caching and auto balancing is configurated. Two instances of backend use outside database Atlas MongoDB and response to the frontned requests via Nginx Proxy.
## Getting started
1. Install Docker Desktop.
2. Create account on [Atlas MongoDB](https://account.mongodb.com).
3. Create your organization, database `lab` with collection `users`.
4. Clone repository.
5. In `docker-compose.yml` assign your connection string to the `MONGODB_URI` property.
6. Open repository folder and run with `docker-compose up --build`.
## Screenshots
![register](/screenshots/register.png)
![register_bad](/screenshots/panel.png)
![login](/screenshots/logout.png)
App allows to create account and login. Registration and login form is validated. Main panel allows to edit user's data, and trigger `getuserById` cached endpoint. Every acction is confirmed by notification.
