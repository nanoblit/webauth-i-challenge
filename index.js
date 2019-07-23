const express = require('express');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const db = require('./data/db');
const sillyBcrypt = require('./sillyBcrypt');

const app = express();
app.use(express.json());
app.use(
  session({
    name: 'sessionId',
    secret: 'keep it secret, keep it long',
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false,
      httpOnly: true,
    },
    resave: false,
    saveUninitialized: true,
    store: new KnexSessionStore({
      knex: require('./data/dbConfig.js'),
      tablename: 'sessions',
      sidfieldname: 'sid',
      createtable: true,
      clearInterval: 1000 * 60 * 60,
    }),
  }),
);

function restricted(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(400).json({ message: 'No credentials provided' });
  }
}

async function checkCredentialsInBody(req, res, next) {
  try {
    const { name, password } = req.body;
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
  req.session.user = req.body;
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
