const express = require('express');
const msql = require('mysql');
const dotenv = require('dotenv');
const session = require("express-session");
const path = require("path");


const { createInvoice, retrievInvoice, storage, insertInvoice } = require('./pdfGenerator.js');
const port = process.env.SERVER_PORT || 3000;
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
        secret: "c98f945d6192994fdefe9f547dceb2340cf5abuyusif01",
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

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/static/images/favicon.ico'));
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

    if (req.session.loggedin) {
        if (Object.values(req.body).every(val => val === '')) {
            res.send("<script> alert('all fields cant be empty'); window.location.replace('/')</script>");
            return;
        }
        await insertInvoice(req.body, connection, res);
    }
    else {
        res.sendFile(__static_html + '/login.html');
    }
});


app.get('/retrieve', (req, res) => {

    if (req.session.loggedin) {
        res.sendFile(__static_html + '/retrieve.html');
        if (req.query.id) {
            console.log(req.query.id);
            retrievInvoice(parseInt(req.query.id), connection, res)
        }
    }
    else {
        res.sendFile(__static_html + '/login.html');
    }
});


app.post('/retrieve', async (req, res) => {

    if (req.session.loggedin) {
        if (req.query.id) {
            await retrievInvoice(parseInt(req.query.id), connection, res)
        }
        else {
            await retrievInvoice(parseInt(req.body._inumber) || 1, connection, res)
        }
    }
    else {
        res.sendFile(__static_html + '/login.html');
    }
    // if id exist means we calling this from the edit page else just normal call from the retrieve endpoitt

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


app.get("/dashboard", (req, res) => {

    if (req.session.loggedin) {
        res.sendFile(__static_html + '/dashboard.html');
    }
    else {
        res.sendFile(__static_html + '/login.html');
    }
});


app.get("/get_data", (req, res) => {

    if (req.session.loggedin) {
        const id = req.query.id;
        connection.query('SELECT * FROM invoice WHERE _inumber = ?', [id], async (error, results, fields) => {

            if (error) {
                console.log(error);
                res.status(500).send('Error retrieving data');
                return;
            }
            res.json(results[0]);
        });
    }
    else {
        res.sendFile(__static_html + '/login.html');
    }
});


app.get("/edit_data", (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(__static_html + '/edit.html');
    }
    else {
        res.sendFile(__static_html + '/login.html');
    }
});


app.post("/edit_data", (req, res) => {

    if (req.session.loggedin) {
        const { _inumber, _name, _addr, _tel, _email, _product, _size, _price, _ucontainer, _ncontainer, _depo, _currency, _delivery, _seller } = req.body;

        connection.query('UPDATE invoice SET _name = ?, _addr = ?, _tel = ?, _email = ?, _product = ?, _size = ?, _price = ?, _ucontainer = ?, _ncontainer = ?, _depo = ?, _currency = ?, _delivery = ?, _seller = ? WHERE _inumber = ?', [_name, _addr, _tel, _email, _product, _size, _price, _ucontainer, _ncontainer, _depo, _currency, _delivery, _seller, _inumber], async (error, results, fields) => {

            if (error) {
                console.log(error);
                res.status(500).send('Error updating data');
                return;
            }
        });
    }
    else {
        res.status(401).redirect('/');
    }
});


app.get("/all", (req, res) => {

    if (req.session.loggedin) {
        connection.query('SELECT * FROM invoice', async (error, results, fields) => {

            if (error) {
                console.log(error);
                res.status(500).send('Error retrieving data');
                return;
            }
            res.json(results);
        });
    }
    else {
        res.status(401).redirect('/');
    }
});


app.get("/view_all", (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(__static_html + '/view_all_invoices.html');
    }
    else {
        res.status(401).redirect('/');
    }
});


app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


app.listen(port, () => {
    console.log('Listening on port 3000');
});