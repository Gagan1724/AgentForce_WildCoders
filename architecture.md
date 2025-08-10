# Project Architecture

This document provides an overview of the project folders, and the technologies used.

---

## 📁 AgentForce_WildCoders/

This is the root directory for the entire project, consisting of both the backend API and the frontend application.

### 📁 backend/

This directory contains all the code for the backend API, built with FastAPI and Google Gemini API.

* -- /venv/: A virtual environment for isolating project dependencies.
* -- main.py: The main entry point for the FastAPI application. It manages all API endpoints and connects to the Google Gemini API.
* -- requirements.txt: Lists all Python dependencies required for the backend (FastAPI, Uvicorn, and google-generativeai).
* -- .env: Contains API key for Google Gemini.

### 📁 frontend/

This directory contains the UserInterface application built with React and makes API calls to the backend.

* -- /node_modules/: Stores all Node.js dependencies for the frontend project.
* -- /public/: Contains static assets (index.html file, favicon, and other public resources).
* -- /src/: The main source directory for the React application.
    * -- App.jsx: It serves as the root of the application's component tree.
    * -- index.js: Acts as entry point for the React application, which renders the App.jsx component into the index.html file.
* -- package.json: Defines project metadata and lists all Node.js dependencies and scripts for the frontend (e.g., start, build).
* -- package-lock.json: A file that locks down the specific versions of all dependencies.


### 📄 .gitignore

This file specifies which files and directories Git should ignore.



### 📄 README.md

This document provides a comprehensive project overview, including setup instructions, how to run the application, and deployment guidelines.

---

