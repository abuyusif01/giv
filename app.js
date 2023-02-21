const express = require('express');
const msql = require('mysql');
const dotenv = require('dotenv');
const session = require("express-session");
const path = require("path");


const { createInvoice, retrievInvoice, storage } = require('./pdfGenerator.js');

dotenv.config();

const connection = msql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


const app = express();
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

const __static_html = path.join(__dirname, "static").replace(/\\/g, "\\\\") + "/html";

// express config for static files, json and other stuff
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "static/css")));
app.use(express.static(path.join(__dirname, "static/js")));
app.use(express.json());


app.get('/', (req, res) => {

    if (req.session.loggedin) {
        res.sendFile(__static_html + '/index.html');
    }
    else {
        res.sendFile(__static_html + '/login.html');
    }
});

//  route for submit form
app.post('/submit', async (req, res) => {
    await createInvoice(req.body, connection, res);
});


app.get('/retrieve', (req, res) => {
    res.sendFile(__static_html + '/retrieve.html');
});


app.post('/retrieve', async (req, res) => {
    await retrievInvoice(parseInt(req.body._inumber) || 1, connection, res)
});


app.post('/auth', async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], async (error, results, fields) => {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});


app.post('/signup', (req, res) => {


    const { username, password, access } = req.body;

    if (access != "136da060403c23249e5b9d0ca278") {
        res.send("Please enter a valid access code")
        return;
    }
    if (username && password) {
        connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], async (error, results, fields) => {

            if (results.affectedRows > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});


app.get("/signup", (req, res) => {
    res.sendFile(__static_html + '/signup.html');
});
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

// save those things and display based on files on the system
// create db that stores the invoice number and the file name for this functionallity