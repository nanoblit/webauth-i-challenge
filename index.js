const express = require('express');
const db = require('./data/db');

const app = express();
app.use(express.json());

app.get('/api/users', async (req, res, next) => {
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
      req.status(400).json({ error: 'Name and password are required' });
    } else if (await db.getUserByName(body.name)) {
      req.status(400).json({ error: 'Name must be unique' });
    } else {
      const user = await db.addUser(body);
      res.status(201).json(user);
    }
  } catch (error) {
    next(error);
  }
});

app.post('/api/login', async (req, res, next) => {});

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
