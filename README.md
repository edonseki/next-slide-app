# NextSlide Open Source Project

This repository contains a set of applications aimed at managing slides during presentations. It comprises three main components: a Node.js backend, a React frontend for presenters, and a combination of a React app and a Chrome extension for a popup functionality within the browser.

## 1. bck-nextslide.app (Node.js Backend)

- **Usage:** This serves as the backend for the application.
- **Start:** Run it as a typical Node.js backend application.
- **Environment:** No specific environment settings required.
- **Default Run Steps:**
  ```bash
  cd bck-nextslide.app
  npm install
  npm start
  ```

## 2. frnt-nextslide.app (React Frontend)

- **Usage:** Intended for presenters to manage slides.
- **Environment:** Set the `REACT_APP_API_URL` variable to determine the backend API endpoint from `bck-nextslide.app`.
- **Default Run Steps:**
  ```bash
  cd frnt-nextslide.app
  npm install
  REACT_APP_API_URL=http://backend-api-url npm start
  ```

## 3. rct-nextslide.app (React App and Chrome Extension Container)

### a) react-next-slide (React App for Chrome Extension Popup)

- **Usage:** Generates the popup for the Chrome extension.
- **Environment:** Requires `REACT_APP_PRESENT_URL` to specify the link of `frnt-nextslide.app` for generating the presentation URL.
- **Default Run Steps:**
  ```bash
  cd rct-nextslide.app/react-next-slide
  npm install
  REACT_APP_PRESENT_URL=http://frontend-url npm run build
  ```

### b) chrome-extension (Chrome Extension)

- **Usage:** Requires manual loading into Chrome to function.
- **Setup:** Modify the `background.js` file to adopt the constant `API_URL` for determining the API to use.
- **Default Run Steps:** Load the extension manually into Chrome.
