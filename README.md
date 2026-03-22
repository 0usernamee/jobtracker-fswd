Start Instructions: 

Create an .env file and enter the following:
SESSION_SECRET=dev_session_secret_change_this
DATABASE_URL=postgresql://postgres.gsipwllnfjvxjppwxquu:COMP-4170-0@aws-1-us-east-2.pooler.supabase.com:5432/postgres

Next run the npm i command in a zsh terminal, and the app can be started with npm run dev.

If you dont want to create an accout you can use this account for testing:
Username: 123@test.ca
Password: 123

Diego's Contrabutions: edit status, questionare(status set), view notes, all buttons added to the dashboard cards, Write Express route to update status (POST /applications/:id/status), Connect dots to actual DB status values, Animate dots with JavaScript

Rehan's Contrabutions: Add new application form (paste job link, company, role, date), Edit and delete applications, PostgreSQL queries for inserting and fetching applications, EJS templates for the job card layout

Reagan's User registration and login pages, Password hashing (bcrypt), Session management (express-session), Logout functionality, Protecting routes so only logged-in users can access dashboard

Kunwar's Contrabutions: Dashboard stats (total applications, interviews, offers, rejections), Overall CSS styling and layout, Filtering/searching applications, Making sure everything looks clean and desktop-first 
