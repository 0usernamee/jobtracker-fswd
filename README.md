Start Instructions: 

1. Clone this git repo.
2. Create a .env file in the root folder and enter the following:
SESSION_SECRET=dev_session_secret_change_this
DATABASE_URL=postgresql://postgres.gsipwllnfjvxjppwxquu:COMP-4170-0@aws-1-us-east-2.pooler.supabase.com:5432/postgres

3. Next run the "npm i" command in your terminal

4. the app can be started with the "npm run dev" command in your terminal.

Optional. 
If you dont want to create an accout you can use this account for testing:
Username: 123@test.ca
Password: 123


Diego's Contributions: edit status, questionare(status set), view notes, all buttons added to the dashboard cards, Write Express route to update status (POST /applications/:id/status), Connect dots to actual DB status values, Animate dots with JavaScript, EJS Code & funcionality created a dedicated route and page for the initial status setup after a new application is created, added the note popup, built the logic to display the note for the current active stage of each listing. Attended all meetings.

Rehan's Built the applications table and all CRUD routes (add, view, edit, delete) Created the EJS templates for the application list, add form, and edit form Migrated the database from local PostgreSQL to Supabase for deployment Fixed the dashboard route to show real stats from the database Added "Remember Me" to login and fixed auth to properly check sessions and validate registration, manged the SQL database, fixed session management. Attended all meetings.

Reagan's Contributions: Set up project foundation folder structure, dependencies, and Express app configuration. Created the config/db.js database connection file. Created the users tables. Built the register and login pages with form validation and error handling, including duplicate email detection and invalid credential messages. Implemented bcrypt password hashing so passwords are never stored as plain text. Set up session management using express-session to keep users logged in across pages. Built auth middleware so only logged in users can access the dashboard. Added logout functionality that ends the session and redirects to the login page.

Kunwar's Contributions: Dashboard stats/layout (total applications, interviews, offers, rejections, add/edit form and applications list, expand/minimize list view). Overall CSS styling and layout, Filtering/searching applications, Light/dark theme and a consistent color palette. Polished auth screens (logo, spacing, form alignment). Added small touches: dismissible save/update messages, job links show site icons in the list where possible. Attended all meetings.
