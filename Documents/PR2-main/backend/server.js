const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'cybersecurity_hub.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize Database Tables
function initializeDatabase() {
  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      fullName TEXT,
      age INTEGER,
      year TEXT,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, () => {
    ensureUserColumns();
  });

  // Topics Table (for security topics)
  db.run(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      link TEXT,
      aliases TEXT
    )
  `, () => {
    // Insert default topics if table is empty
    db.all('SELECT COUNT(*) as count FROM topics', (err, result) => {
      if (err) return;
      if (result[0].count === 0) {
        insertDefaultTopics();
      }
    });
  });

  // User Sessions Table (for tracking logins)
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      loginTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
}

function ensureUserColumns() {
  db.all('PRAGMA table_info(users)', (err, rows) => {
    if (err) {
      console.error('Error checking user table columns:', err);
      return;
    }

    const columns = rows.map(row => row.name);
    if (!columns.includes('email')) {
      db.run('ALTER TABLE users ADD COLUMN email TEXT');
    }
    if (!columns.includes('fullName')) {
      db.run('ALTER TABLE users ADD COLUMN fullName TEXT');
    }
    if (!columns.includes('age')) {
      db.run('ALTER TABLE users ADD COLUMN age INTEGER');
    }
    if (!columns.includes('year')) {
      db.run('ALTER TABLE users ADD COLUMN year TEXT');
    }
  });
}

// Insert Default Topics
function insertDefaultTopics() {
  const topics = [
    {
      title: 'Two-Factor Authentication',
      category: 'Account Security',
      description: 'Adds an extra layer of security by requiring a second verification step.',
      link: 'https://support.google.com/accounts/answer/185839',
      aliases: ''
    },
    {
      title: 'Account Recovery',
      category: 'Account Security',
      description: 'Helps you regain access to your accounts if you forget your password.',
      link: 'https://support.google.com/accounts/answer/7682439',
      aliases: ''
    },
    {
      title: 'Social Media Security',
      category: 'Privacy',
      description: 'Protect your social media accounts by using strong passwords.',
      link: 'https://www.ncsc.gov.uk/guidance/social-media-how-to-use-it-safely',
      aliases: ''
    },
    {
      title: 'Phishing Awareness',
      category: 'Email Security',
      description: 'Phishing attacks trick users into revealing sensitive information.',
      link: 'https://www.ncsc.gov.uk/guidance/phishing#section_2',
      aliases: 'phishing,pishing'
    },
    {
      title: 'ELMS Account Recovery',
      category: 'School Accounts',
      description: 'Recover your ELMS account by visiting the Registrar\'s Office.',
      link: '',
      aliases: ''
    },
    {
      title: 'Use Strong Passwords',
      category: 'Account Security',
      description: 'Strong passwords protect your accounts from unauthorized access.',
      link: 'https://www.cisa.gov/secure-our-world/use-strong-passwords',
      aliases: ''
    }
  ];

  topics.forEach(topic => {
    db.run(
      'INSERT INTO topics (title, category, description, link, aliases) VALUES (?, ?, ?, ?, ?)',
      [topic.title, topic.category, topic.description, topic.link, topic.aliases]
    );
  });

  console.log('Default topics inserted');
}

// ==================== AUTH ENDPOINTS ====================

// SIGNUP
app.post('/api/auth/signup', (req, res) => {
  const { username, password, email, fullName, age, year } = req.body;

  if (!username || !password || !email || !fullName || !age || !year) {
    return res.status(400).json({ error: 'Username, password, name, email, age, and year are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const numericAge = parseInt(age, 10);
  if (Number.isNaN(numericAge) || numericAge <= 0) {
    return res.status(400).json({ error: 'Please enter a valid age' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    // Insert user
    db.run(
      'INSERT INTO users (username, email, fullName, age, year, password) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, fullName, numericAge, year, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        res.status(201).json({
          success: true,
          message: 'User created successfully',
          userId: this.lastID
        });
      }
    );
  });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Find user
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing passwords' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Log session
      db.run('INSERT INTO sessions (userId) VALUES (?)', [user.id]);

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          age: user.age,
          year: user.year
        }
      });
    });
  });
});

// ==================== TOPICS ENDPOINTS ====================

// GET ALL TOPICS
app.get('/api/topics', (req, res) => {
  db.all('SELECT * FROM topics', (err, topics) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching topics' });
    }

    // Parse aliases
    const parsedTopics = topics.map(topic => ({
      ...topic,
      aliases: topic.aliases ? topic.aliases.split(',') : []
    }));

    res.json(parsedTopics);
  });
});

// SEARCH TOPICS
app.get('/api/topics/search', (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchPattern = `%${searchTerm}%`;
  db.all(
    'SELECT * FROM topics WHERE title LIKE ? OR category LIKE ? OR description LIKE ?',
    [searchPattern, searchPattern, searchPattern],
    (err, topics) => {
      if (err) {
        return res.status(500).json({ error: 'Error searching topics' });
      }

      const parsedTopics = topics.map(topic => ({
        ...topic,
        aliases: topic.aliases ? topic.aliases.split(',') : []
      }));

      res.json(parsedTopics);
    }
  );
});

// GET SINGLE TOPIC
app.get('/api/topics/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM topics WHERE id = ?', [id], (err, topic) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching topic' });
    }

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json({
      ...topic,
      aliases: topic.aliases ? topic.aliases.split(',') : []
    });
  });
});

// ==================== USER ENDPOINTS ====================

// GET USER SESSIONS
app.get('/api/users/:userId/sessions', (req, res) => {
  const { userId } = req.params;

  db.all(
    'SELECT * FROM sessions WHERE userId = ? ORDER BY loginTime DESC',
    [userId],
    (err, sessions) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching sessions' });
      }

      res.json(sessions);
    }
  );
});

// GET USER INFO
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  db.get('SELECT id, username, fullName, email, age, year, createdAt FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error fetching user' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log('📊 SQLite database: cybersecurity_hub.db');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    console.log('Database connection closed');
    process.exit(0);
  });
});
