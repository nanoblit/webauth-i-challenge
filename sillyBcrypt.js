const md5 = require('md5');
const generateHash = require('random-hash').default;

function generatePassword(rawPassword, randomHash, iterations) {
  let password = `${rawPassword}${randomHash}`;
  for (let i = 0; i < iterations; i++) {
    password = md5(password);
  }

  return `${iterations}$${randomHash}$${password}`;
}

function hash(rawPassword, iterations) {
  const randomHash = generateHash({ length: 18 });
  return generatePassword(rawPassword, randomHash, iterations);
}

function compare(rawPassword, hashedPassword) {
  const firstSeparatorPos = hashedPassword.indexOf('$');
  const secondSeparatorPos = hashedPassword.indexOf('$', firstSeparatorPos + 1);
  const iterations = Number(hashedPassword.slice(0, firstSeparatorPos));
  const randomHash = hashedPassword.slice(firstSeparatorPos + 1, secondSeparatorPos);
  const newHashedPassword = generatePassword(rawPassword, randomHash, iterations);

  return newHashedPassword === hashedPassword;
}

module.exports = { hash, compare };
