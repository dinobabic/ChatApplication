# ChatApplication

## Overview

Welcome to the Chat Application project! This web application provides a platform for real-time messaging, built using Spring Boot and React. It has been Dockerized for easy deployment and utilizes Nginx as a reverse proxy.

## Features

- User Registration: Users can sign up for an account, user must provide username, email address, password, first and last name and profile image.
- Real-time Messaging: Users can exchange messages and images in real time.
- Seen Status: Messages show a seen status when the recipient has viewed them.
- Users can delete messages; if a message has not been seen yet, other users won't be notified about the deletion.

## Issues

### 1. Profile Image Persistence During Registration

- **Problem:**
  While registering, there is an issue where profile images may not be persisted to the database. Despite efforts to prevent this by avoiding page reloads upon user registration button clicks, the error persists. This discrepancy was not encountered during local testing.

### 2. Message Seen Status Not Automatically Refreshed

- **Problem:**
  After deploying the application, an issue emerged with the automatic refresh of message seen status. Although WebSocket notifications are sent to users, the seen status is not updated as expected.

http://www.kajimaapp.com/ -> Link to deployed version of application.
