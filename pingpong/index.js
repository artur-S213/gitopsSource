const { Client } = require('pg');
const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

let counter = 0;
let savedCounter = null;

// Init for DB
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL');
        return createTableIfNotExists();
    })
    .catch(err => console.error('Connection error', err.stack));

const createTableIfNotExists = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS counter_table (
            id SERIAL PRIMARY KEY,
            counter_value INT NOT NULL
        );
    `;

    try {
        await client.query(createTableQuery);
        console.log('Table "counter_table" is ready.');
    } catch (err) {
        console.error('Error creating table', err.stack);
    }
};


const storeValue = async (value) => {
    try {
        const res = await client.query('INSERT INTO counter_table (counter_value) VALUES ($1) RETURNING counter_value', [value]);
        console.log('Value inserted:', res.rows[0].counter_value);
        savedCounter = res.rows[0].counter_value;
    } catch (err) {
        console.error('Error inserting value', err.stack);
    }
};




app.get('/pingpong', (req, res) => {
    //   res.send({ message: 'Hello from Kubernetes!' });
    // res.send(`Counter = ${counter++}`);
    counter++;
    storeValue(counter);
    res.send(`
        <p>Request Counter = ${counter++}</p>
        <p>Database Value = ${savedCounter}</p>
        `);
});

// app.post('/pingpong', (req, res) => {
//     const receivedData = req.body;
//     console.log('Received data:', receivedData);
//     //   res.send({ status: 'success', receivedData });
//     res.send(counter);
// });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
