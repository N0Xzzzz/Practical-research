# STI College Cybersecurity Hub - Database Setup Guide

## Overview
Your website now has a **Node.js + Express + SQLite** backend that persists user login data. User credentials are stored securely with password hashing.

## Project Structure
```
PR2-main/
├── Pr/                          # Frontend (HTML, CSS, JavaScript)
│   ├── index.html
│   ├── script.js               # Updated to use backend API
│   ├── style.css
│   └── img/
└── backend/                     # Backend server
    ├── package.json            # Dependencies
    ├── server.js              # Express server with SQLite
    └── cybersecurity_hub.db   # Database (created on first run)
```

## Installation & Setup

### Step 1: Install Dependencies
```bash
cd /home/noxzz/Documents/PR2-main/backend
npm install
```

**Note:** If npm is not installed:
```bash
sudo apt-get install -y npm
# Then run: npm install
```

### Step 2: Start the Backend Server
```bash
cd /home/noxzz/Documents/PR2-main/backend
npm start
```

You should see:
```
✅ Backend server running on http://localhost:5000
📊 SQLite database: cybersecurity_hub.db
```

### Step 3: Open the Website
Open the frontend in your browser:
```
file:///home/noxzz/Documents/PR2-main/Pr/index.html
```

**Or** use a local web server:
```bash
cd /home/noxzz/Documents/PR2-main/Pr
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

## Database Features

### User Registration & Login
- **Sign Up:** Create new accounts (password must be 6+ characters)
- **Login:** Stored credentials with bcrypt hashing
- **Session Tracking:** Login times are recorded

### Security Topics Database
- 6 default topics pre-loaded (2FA, Account Recovery, Phishing, etc.)
- Search functionality queries the database
- Topics are stored in SQLite and loaded on app startup

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with credentials

### Topics
- `GET /api/topics` - Fetch all topics
- `GET /api/topics/search?q=search_term` - Search topics
- `GET /api/topics/:id` - Get single topic

### User Sessions
- `GET /api/users/:userId/sessions` - Get user login history

## Testing the Backend

### Create an Account
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Get All Topics
```bash
curl http://localhost:5000/api/topics
```

### Search Topics
```bash
curl http://localhost:5000/api/topics/search?q=phishing
```

## Database File
- **Location:** `/home/noxzz/Documents/PR2-main/backend/cybersecurity_hub.db`
- **Type:** SQLite3
- **Auto-created:** On first server start
- **Contains:** Users, Topics, Sessions tables

## Troubleshooting

### Backend Connection Error
If you see: `Cannot connect to backend. Check if server is running on http://localhost:5000`

**Solution:**
1. Ensure backend server is running: `npm start` in `/backend` folder
2. Backend must be on port 5000
3. Check firewall settings

### CORS Issues
The backend is configured with CORS enabled for all origins. If issues persist:
- Verify both frontend and backend are running
- Check browser console for errors (F12)

### Port Already in Use
If port 5000 is taken:
Edit `server.js` line: `const PORT = 5000;` to a different port, then update `script.js` with the new URL.

## Features Enabled by Database

✅ **Persistent User Accounts** - Accounts survive server restarts  
✅ **Password Security** - Passwords hashed with bcryptjs  
✅ **Login History** - Track when users log in  
✅ **Dynamic Topics** - Topics stored in database (easily add more!)  
✅ **Search Functionality** - Fast database queries  

## Next Steps

1. **Add More Topics:** Insert new topics into the database
2. **Enhance Authentication:** Add JWT tokens for better security
3. **User Profile:** Display user info and edit capabilities
4. **Admin Panel:** Manage topics and users
5. **Deployment:** Use Heroku, Railway, or AWS for production

## File Locations

| File | Path |
|------|------|
| Frontend | `/home/noxzz/Documents/PR2-main/Pr/` |
| Backend | `/home/noxzz/Documents/PR2-main/backend/` |
| Database | `/home/noxzz/Documents/PR2-main/backend/cybersecurity_hub.db` |
| Server Code | `/home/noxzz/Documents/PR2-main/backend/server.js` |
| Frontend Script | `/home/noxzz/Documents/PR2-main/Pr/script.js` |

---

**Questions?** Check the browser console (F12) and terminal logs for detailed error messages.
