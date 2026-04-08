# Flashify: A Flashcard Learning Web Application

Flashify is a single-page flashcard learning web application that allows users to create a flashcard set, add terms and definitions, manage cards with edit and delete actions, and study them in an interactive review mode. The project demonstrates the use of HTML, CSS, JavaScript, Node.js, Express, and MySQL in one complete database-driven application.

## Problem This Website Solves

Students often need an easier way to keep their revision content organised and test themselves without relying on paper flashcards or switching between multiple pages or apps. Flashify was created to make studying more convenient by keeping the full revision process in one place. Users can create and manage their own flashcards, then move directly into study mode to review them, track their progress, and see their final results. This makes the website useful for real student learning while also showing clear integration between the front end, back end, and database.

## Technical Stack

### Frontend
- HTML5 for the page structure and layout
- Vanilla JavaScript for single-page behaviour, DOM updates, study mode logic, modals, keyboard support, and API communication

### Styling
- CSS3 for layout, responsive behaviour, interactive states, flashcard animations, and the overall visual presentation
- A polished visual style using gradients, shadows, hover effects, and modal-based interactions

### Backend
- Node.js as the runtime environment
- Express.js as the web server and API layer

### Data
- MySQL for permanent data storage
- `mysql2` for database connection and SQL queries

### Routing and Data Flow
- Front-end `fetch()` requests communicate with Express API routes
- Express validates incoming data and sends queries to MySQL
- MySQL stores flashcard set details and flashcard records
- JSON responses are returned to the front end and used to update the page dynamically

### Deployment
- The application was developed and tested locally on `http://localhost:3000`
- No external deployment platform was used for this version

## Main Features

- Create and save a flashcard set title and description
- Add, view, edit, and delete flashcards
- Dynamic updates without page reloads
- Interactive study mode
- Flip-card animation to reveal answers
- Mark answers as correct or incorrect
- Flashcards disappear after use
- Live progress and score tracking
- Final results summary with percentage score
- Keyboard support for flipping cards with the spacebar
- Responsive layout for different screen sizes
- MySQL-backed data storage
- Express API with full CRUD functionality
- Auto-save for flashcard set details
- UI with gradients, shadows, hover effects, and modals

## Folder Structure

- **public/** – contains the front-end files used by the application.
  - **index.html** – contains the main page structure and all sections used by the single-page interface.
  - **script.js** – handles the front-end functionality, including adding, editing, deleting, and studying flashcards.
  - **style.css** – contains the main styling, layout, colours, and visual design of the website.
  - **style-glass-palette.css** – contains an alternative stylesheet developed during the design refinement process, featuring glass-style effects, gradients, shadows, and enhanced visual depth.

- **db.js** – manages the MySQL database connection and creates the required tables.
- **server.js** – runs the Express server and handles API routes for flashcard and set data.
- **package.json** – stores the project metadata, dependencies, and npm scripts.
- **package-lock.json** – records the exact installed dependency versions.
- **README.md** – provides project documentation, setup instructions, and an overview of the application.
- **.gitignore** – prevents unnecessary or sensitive files from being uploaded to GitHub.

## Installation

- Open the project folder in a terminal.
- Install dependencies by running `npm install`.
- Create a `.env` file in the root folder and add your database connection details:
  - `DB_HOST=localhost`
  - `DB_PORT=3306`
  - `DB_USER=your_mysql_username`
  - `DB_PASSWORD=your_mysql_password`
  - `DB_NAME=flashcard_db`
  - `PORT=3000`
- Start the server by running `npm start`.
- Open the application in your browser at `http://localhost:3000`.

## Challenges Overcome

One of the biggest challenges in this project was making the app behave like a true single-page application while still keeping the code simple and understandable. Instead of using multiple HTML pages, the interface had to switch between setup mode, study mode, and results mode dynamically with JavaScript while still feeling smooth and structured. :contentReference[oaicite:2]{index=2}

Another challenge was building the study workflow so that cards could flip, be marked as correct or incorrect, be removed from the queue, and keep the progress calculations accurate throughout the session. This required careful state handling so the card display, progress bar, counters, and final score all stayed in sync. :contentReference[oaicite:3]{index=3}

It was also important to make keyboard support work properly so the spacebar could flip cards in study mode without interfering with text inputs or modals. This improved accessibility and made the app feel more polished to use. :contentReference[oaicite:4]{index=4}

On the presentation side, I refined the visual design to make the interface feel more polished and modern while keeping the blue colour palette professional and suitable for the assignment. This improved the overall presentation without changing the core functionality of the website. :contentReference[oaicite:5]{index=5}
