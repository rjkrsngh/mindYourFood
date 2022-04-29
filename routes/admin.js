var express = require('express');
var router = express.Router();
var path = require('path');
var connector = require('../MongoConnect');
const assert = require('assert');
const moment = require('moment');

const validateAdminCredentials = async (req, res, next) => {
    var db = await connector.connectToMongo();
    const collection = db.collection('admin');
    console.log('login data received: ', req.body);
    await collection.find({ adminName: req.body.username }).toArray((err, data) => {
        if (err) {
            res.render('adminLogin');
        } else if (data.length == 0) {
            console.log('No such user');
            res.render('adminLogin');
        } else {
            if (data[0].password == req.body.password) {
                console.log('password matched!');
                let adminObj = {
                    username: req.body.username,
                    password: req.body.password
                }
                if (!req.cookies.user) {
                    console.log('no cookie found. setting it...')
                    res.cookie('user', adminObj, { maxAge: 900000, httpOnly: true });
                } else {
                    console.log('already a user, admin cookie: ', req.cookies);
                }
                res.render('adminHome');
            } else {
                // if password does not match
                console.log('invalid credentials');
                // res.status(403);
                res.redirect('/admin/login');
            }
        }
    });
}

const listAllUsers = async (req, res, next) => {
    console.log('list user req received from admin');
    var db = await connector.connectToMongo();
    const collection = db.collection('users');

    await collection.find({}, { username: 1 }).toArray((err, data) => {
        if (err) {
            //handle find error
        } else {
            let users = []
            for (let i = 0; i < data.length; i++) {
                users.push(data[i].username);
            }
            res.json({
                'users': users
            });
        }
    });
}

router.get('/list', listAllUsers);

router.post('/home', validateAdminCredentials);

router.get('/', (req, res, next) => {
    res.render('admin', { title: 'mindYourFood' });
});

router.get('/login', (req, res, next) => {
    res.render('adminLogin');
});

router.get('/logout', (req, res, next) => {
    res.clearCookie('user');
    // delete session context from req
    delete req.session;
    res.redirect('/');
});

module.exports = router;