const express = require('express');
const msql = require('mysql');
const dotenv = require('dotenv');
const session = require("express-session");
const path = require("path");


const { createInvoice, retrievInvoice } = require('./pdfGenerator.js');

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
    res.sendFile(__static_html + '/index.html');
});

//  route for submit form
app.post('/submit', (req, res) => {
    console.log(req.body);
    createInvoice(req.body, connection);
    res.send("success");
});


app.get('/retrieve', (req, res) => {
    res.sendFile(__static_html + '/retrieve.html');
});


app.post('/retrieve', async (req, res) => {
    
    await retrievInvoice(parseInt(req.body._inumber) || 1, connection)
    res.send("success");
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});