const express = require('express');
const db = require('./data/db');
const sillyBcrypt = require('./sillyBcrypt');

const app = express();
app.use(express.json());

async function checkCredentials(name, password, res, next) {
  try {
    const user = await db.getUserByName(name);
    if (!user || !sillyBcrypt.compare(password, user.password)) {
      res.status(401).json({ error: 'You shall not pass!' });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

async function restricted(req, res, next) {
  const { name, password } = req.headers;
  checkCredentials(name, password, res, next);
}

async function checkCredentialsInBody(req, res, next) {
  const { name, password } = req.body;
  checkCredentials(name, password, res, next);
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
      const password = sillyBcrypt.hash(body.password, 12);
      const user = await db.addUser({ ...body, password });
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
