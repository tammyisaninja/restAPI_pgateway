const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser');
const teacherRoute = require('./routes/teachers');
const commonstudentRoute = require('./routes/commonstudents');
const suspendRoute = require('./routes/suspend');
const notifRoute = require('./routes/notifications');

// create connection
const db = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: '12345',
    database: 'school'
});

//Connect
db.connect((err)=> {
    if(err) {
        throw err;
    }
    console.log('MySql Connected');
});

const app = express();
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(function(req,res,next){
    req.db = db; //this db comes from app.js context where you define it
    next();
});
app.use('/api/register',teacherRoute);
app.use('/api/commonstudents',commonstudentRoute);
app.use('/api/suspend', suspendRoute);
app.use('/api/retrievefornotifications', notifRoute);

app.use((error, req, res, next) => {
    res.status(error.status || 500);    // status code the error has
    res.json({
        error: {
            message: error.message  // in the above case it would be Not found, generally they would have a message property
        }
    })
})

app.listen('3000', () => {
    console.log('Server started on port 3000');
}); 
