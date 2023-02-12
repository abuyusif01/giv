const express = require('express');
const session = require("express-session");
const path = require("path");


const { createInvoice } = require('./pdfGenerator.js');

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
    createInvoice(req.body, './static/pdf/invoice.pdf');

    res.send("success");
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});