var pg = require('pg');
const { Pool, Client } = require('pg')

const connectionString = 'postgresql://Admin:password@localhost/recipebookdb'; //for localhost
const client = new Client({
  connectionString: connectionString,
});
const pool = new Pool({
  connectionString: connectionString,
});


client.connect((err) => {
  if (err) {
    console.error('connection error client', err.stack);
  } else {
    console.log('connected db');
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('connection error pool', err.stack);
  } else {
    console.log('connected pool');
  }
});

module.exports.client = client;
module.exports.pool = pool;
