'use strict';
var http = require('http');

var port = process.env.PORT || 1337;
var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql2');
var HTMLPath = path.join(__dirname, "views");


var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hadi7076",
    database: "web1"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!!");
});


module.exports = { con };