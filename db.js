var pg = require('pg');
const { Pool, Client } = require('pg')

const connectionString = 'postgresql://Admin:password@localhost/recipebookdb'; //for localhost
const client = new Client({
  connectionString: connectionString,
});
const pool = new Pool({
  connectionString: connectionString,
});

// var client = new pg.Client({
//     user: "zmoghsxduyicpd",
//     password: "2985714f2e86972b1368556dcc23934ea117a5b3836f05e360535df61a87937f",
//     database: "dbi701jafqoq2a",
//     port: 5432,
//     host: "ec2-174-129-221-240.compute-1.amazonaws.com",
//     ssl: 'require'
// });
// var pool = new pg.Pool({
//     user: "zmoghsxduyicpd",
//     password: "2985714f2e86972b1368556dcc23934ea117a5b3836f05e360535df61a87937f",
//     database: "dbi701jafqoq2a",
//     port: 5432,
//     host: "ec2-174-129-221-240.compute-1.amazonaws.com",
//     ssl: 'require'
// });


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
