var express = require('express');
var router = express.Router();
var path = require('path');
var connector = require('../MongoConnect');
const assert = require('assert');
const moment = require('moment');

const validateAndLogIn = async (req, res, next) => {
    var db = await connector.connectToMongo();
    const collection = db.collection('users');

    console.log('req cookie: ', req.cookies);

    // to know whether it is a login or a signup action
    var loginUserName = req.body.username;
    var signupUserName = req.body.user_name;

    if (loginUserName) {
        await collection.find({ 'username': loginUserName }).toArray((err, docs) => {
            if (err) {
                res.json({
                    'username': loginUserName,
                    'login': 'unsuccessful'
                });
            } else if (docs.length == 0) {
                res.redirect('/login');
            } else {
                let password = req.body.password;
                if (password == docs[0].password) {
                    // create user object
                    let user = {
                        name: loginUserName,
                        pass: password
                    };

                    // save the user object in the cookie
                    if (req.cookies.user == undefined) {
                        res.cookie('user', user, { maxAge: 900000, httpOnly: true });
                    } else {
                        console.log('log in cookie: ', req.cookies);
                    }
                    res.render('userHome', { title: 'mindYourFood' });
                } else {
                    res.redirect('/login');
                }
            }
        });
    } else if (signupUserName) {
        let firstname = req.body.first_name;
        let lastname = req.body.last_name;
        let dailyLimit = req.body.calorie_per_day;
        let phoneNum = req.body.phone_number;
        let email = req.body.user_email;
        let password = req.body.user_password;

        if ((!firstname) || (!password)) {
            res.redirect('/signup');
            res.end();
        } else {
            await collection.find({ 'username': signupUserName }).toArray((err, docs) => {
                if (err) {
                    // handle error
                } else if (docs.length > 0) {
                    // user already exists, redirect to login page
                    res.redirect('/login');
                } else {
                    collection.insert({
                        'firstName': firstname,
                        'lastName': lastname,
                        'password': password,
                        'calories_per_day': dailyLimit,
                        'phone': phoneNum,
                        'email': email,
                        'username': signupUserName,
                        'meals': []
                    }, (err) => {
                        // handle insertion error
                    });

                    let user = {
                        name: signupUserName,
                        pass: password
                    };

                    // save the user object in the cookie
                    if (req.cookies.user == undefined) {
                        res.cookie('user', user, { maxAge: 900000, httpOnly: true });
                        // console.log('adding user data in cookie after signup: ', res.cookie.user.name);
                    }
                    res.render('userHome', { title: 'mindYourFood' });
                }
            });
        }
    } else {
        // if the user is logged in and has made a modification to his/her meal in the db,
        // the user must be redirected to the user home page
        if (req.cookies.user) {
            res.render('userHome', { title: 'mindYourFood' });
        }
    }
}

const addMealToDatabase = async (req, res, next) => {
    var db = await connector.connectToMongo();
    const collection = db.collection('users');

    let foodName = req.body.food_name;
    let calorieInFood = req.body.calorie;
    let foodDescription = req.body.description;
    let consumptionTime = req.body.timestamp;

    let username = req.cookies.user.name;

    collection.update({ 'username': username }, {
        $push: {
            meals: {
                // "datetime": new Date(),
                "datetime": new Date(consumptionTime),
                "food_name": foodName,
                "calorie": calorieInFood,
                "description": foodDescription
            }
        }
    }, (err) => {
        if (err) {
            console.error('error updating data');
        } else {
            console.log('meal info added to database');
            res.redirect('/users');
        }
    });
}


const getAddedMealsFromDB = async (req, res, next) => {
    var db = await connector.connectToMongo();
    const collection = db.collection('users');

    let username = req.cookies.user.name;
    collection.find({ 'username': username }).toArray((err, docs) => {
        if (err) {
            // handle error
        } else {
            console.log('sending data from backend!');
            res.json({
                'userdata': docs[0]
            })
        }
    });
}

const handleEditMealReq = async (req, res, next) => {
    var db = await connector.connectToMongo();
    const collection = db.collection('users');
    let username = req.cookies.user.name;

    console.log('edit req received!');
    console.log('old object: ', req.body.old);
    console.log('new object: ', req.body.new);

    // insert the new data into the database
    await collection.update({ 'username': username }, {
        $push: {
            meals: {
                "datetime": new Date(req.body.new.datetime),
                "food_name": req.body.new.foodname,
                "calorie": req.body.new.calorie,
                "description": req.body.old.description
            }
        }
    }, (err) => {
        if (err) {
            console.error('error-1 editing meal info');
        }
    });
    // remove the old data from the database
    collection.update({ username: username }, {
        $pull: {
            meals: {
                food_name: req.body.old.food_name,
                datetime: new Date(req.body.old.datetime),
                calorie: req.body.old.calorie,
                description: req.body.old.description
            }
        }
    }, (err) => {
        if (err) {
            // handle error
            console.error('error-2 editing meal info');
        }
    });
    res.status(204);
    res.json({
        status: 'successful'
    })
}

const handleDeleteMealReq = async (req, res, next) => {
    console.log('delete req received');
    var db = await connector.connectToMongo();
    const collection = db.collection('users');

    let username = req.cookies.user.name;
    let foodName = req.body.foodname;
    console.log(`delete called for food: ${req.body.foodname} of user: ${username}`);
    collection.update({ username: username }, { $pull: { meals: { food_name: foodName } } }, (err) => {
        if (err) {
            // handle error
        } else {
            res.json({
                'delete-status': 'successful'
            });
        }
    });
}

// working
router.get('/list', getAddedMealsFromDB);
router.get('/', (req, res, next) => {
    if (req.cookies.user) {
        res.render('userHome', { title: 'mindYourFood' });
    }
});
// router.get('/add', (req, res, next) => {
//     res.sendFile(path.resolve(__dirname, '../views/addmeals.html'));
// });


router.post('/', validateAndLogIn);
router.post('/add', addMealToDatabase);
router.post('/edit', handleEditMealReq);


router.delete('/delete', handleDeleteMealReq);

module.exports = router;