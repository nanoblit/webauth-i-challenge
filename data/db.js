const knex = require('knex');
const db = knex(require('../knexfile').development);

function getUsers() {
  return db('users');
}

function getUserByName(name) {
  return db('users')
    .where({ name })
    .first();
}

function addUser(data) {
  return db('users').insert(data);
}

module.exports = { getUsers, getUserByName, addUser };
