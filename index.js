const express = require('express');
const db = require('./data/db');
const sillyBcrypt = require('./sillyBcrypt');

const app = express();
app.use(express.json());

async function restricted(req, res, next) {
  try {
    const { name, password } = req.headers;
    const user = await db.getUserByName(name);
    // Make secure using hashing
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'You shall not pass!' });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

async function checkCredentialsInBody(req, res, next) {
  try {
    const { name, password } = req.body;
    const user = await db.getUserByName(name);
    // Make secure using hashing
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'You shall not pass!' });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

app.get('/api/users', restricted, async (req, res, next) => {
  try {
    const users = await db.getUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

app.post('/api/register', async (req, res, next) => {
  try {
    const { body } = req;
    if (!body.name || !body.password) {
      res.status(400).json({ error: 'Name and password are required' });
    } else if (await db.getUserByName(body.name)) {
      res.status(400).json({ error: 'Name must be unique' });
    } else {
      const user = await db.addUser(body);
      res.status(201).json(user);
    }
  } catch (error) {
    next(error);
  }
});

app.post('/api/login', checkCredentialsInBody, (req, res, next) => {
  res.status(200).json('Logged in');
});

app.use((err, req, res) => {
  console.error('ERROR:', err);
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});

app.listen(4000, () => {
  console.log('listening on 4000');
});
