# Frontend Scripts Guide

This project includes batch scripts to help with setup, development, and deployment of the frontend application.

## Available Scripts

### 1. setup_frontend.bat
Installs all necessary dependencies for the frontend project.

**Usage:**
- Double-click the file, or
- Run from command line: `setup_frontend.bat`

**What it does:**
- Runs `npm install` to install all dependencies
- Checks if node_modules already exists
- Provides helpful error messages if installation fails

### 2. run_frontend.bat
Starts the development server for local development.

**Usage:**
- Double-click the file, or
- Run from command line: `run_frontend.bat`

**What it does:**
- Runs `npm run dev` to start the Vite development server
- Opens the application at http://localhost:5173
- Includes error checking and helpful messages

### 3. deploy_frontend.bat
Builds the project for production and deploys it (if configured).

**Usage:**
- Double-click the file, or
- Run from command line: `deploy_frontend.bat`

**What it does:**
- Runs `npm run build` to create a production build
- If deploy script exists in package.json, runs `npm run deploy` for GitHub Pages
- Provides instructions for manual deployment if needed

## Prerequisites

- Node.js must be installed on your system
- npm (comes with Node.js) must be available in your PATH

## Notes

- The scripts will automatically change to the correct directory
- Error handling is included to provide helpful feedback
- The development server can be stopped with Ctrl+C
- Built files are placed in the `dist` folder
