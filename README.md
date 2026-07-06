# Daily Rhythm — signup form + backend

## Project structure
```
daily-rhythm/
  server.js       <- backend (Express)
  package.json
  .gitignore
  public/
    index.html    <- your landing page + form (was daily_routine_landing_main.html)
```

## Run locally
```
npm install
npm start
```
Then open http://localhost:3000 in your browser — the server serves the page itself now,
no need to double-click the HTML file separately.

## Deploy online (Render.com, free tier)

1. Push this whole folder to a GitHub repo (see steps below).
2. Go to https://render.com, sign up (GitHub login is easiest).
3. Click **New → Web Service**, connect your GitHub repo.
4. Settings:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: Node
5. Click **Create Web Service**. Render gives you a live URL like `https://daily-rhythm.onrender.com`.
6. That's it — the same URL serves both the page and the `/submit` API, since the frontend
   uses a relative path now.

## Push to GitHub (step by step)
```
cd daily-rhythm
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
(Create the empty repo on github.com first, then run the commands above.)

## Notes
- Passwords are hashed with bcrypt before being saved — never stored in plain text.
- `users.json` is a flat file, fine for testing/small projects. If this gets real traffic,
  move to a proper database (Postgres, MongoDB, etc.) — a JSON file will break under
  concurrent writes, and on most free hosts it also gets wiped on every redeploy since
  the filesystem isn't persistent.
- Check saved signups anytime (names/emails only, no passwords) at:
  `https://your-live-url.onrender.com/users`
