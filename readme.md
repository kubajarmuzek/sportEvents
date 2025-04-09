# Tournament Management System

This project is a complete web and mobile application for managing sports tournaments. It was developed as part of an engineering thesis at the Poznań University of Technology and addresses the growing demand for digital tools supporting amateur and professional tournament organization.

## Project Overview

The system consists of:
- A **web application** for tournament organizers.
- A **mobile application** for participants.
- A **backend with a database** that handles business logic, scheduling, and data persistence.

## Purpose

The goal was to design and implement a modular and extensible IT system that allows:
- Creating and managing tournaments.
- Forming and managing teams.
- Signing up as a player or team.
- Generating schedules automatically for different formats.
- Recording match results and displaying standings.

## Features

### General
- Secure user registration and login.
- Role-based interface (organizer vs participant).
- Data validation and error handling.
- Real-time updates and result tracking.

### Supported Tournament Formats
- **Knockout (Cup)**
- **Round-robin (League)**
- **Double elimination**
- **Group stage with knockout phase**

### Organizer Features (Web & Mobile)
- Tournament creation and editing.
- Location selection with Mapbox API integration.
- Managing teams and participant requests.
- Starting tournaments and generating schedules.
- Inputting match results.
- Viewing match progress and standings.

### Participant Features (Mobile)
- Browse available and past tournaments.
- View tournament details.
- Join or create a team.
- Accept/reject team join requests.
- Track tournament results and standings.

## Technology Stack

### Web Application
- **React.js**
- **Axios** (API communication)
- **CSS Modules** (component-level styling)

### Mobile Application
- **React Native**
- **React Navigation** (screen transitions)
- **Axios** and **AsyncStorage**

### Backend
- **Node.js** with **Express.js**
- **Sequelize** ORM
- **MySQL** relational database
- REST API architecture

## Database Design

The database consists of key relational tables:
- `Users`
- `Participants`
- `Teams`
- `Tournaments`
- `Matches`
- `MatchSets`

Data integrity is ensured using foreign keys and ENUM constraints. Sensitive data such as passwords are stored using bcrypt hashing.

## Tournament Scheduling Algorithms

Each format includes an automatic schedule generation algorithm:

- **Knockout**: Bye rounds are added when necessary. Matches are shuffled to avoid pairing biases.
- **Round-robin**: Uses rotation method to schedule all matches.
- **Double elimination**: Manages upper/lower brackets and finals.
- **Group stage + knockout**: Teams are grouped randomly and paired in playoffs based on rankings.