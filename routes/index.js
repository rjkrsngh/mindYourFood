var express = require('express');
var router = express.Router();
var path = require('path');

// import connectToMongo from './MongoConnect.js'
var connector = require('../MongoConnect');

/* GET home page. */
router.get('/', (req, res, next) => {
    // res.sendFile(path.resolve(__dirname, '../views/home.html'));
    res.render('home', { title: 'mindYourFood' });
});

router.get('/login', (req, res, next) => {
    console.log('login req cookie: ', req.cookies);
    // res.sendFile(path.resolve(__dirname, '../views/login.html'));
    res.render('login', { title: 'mindYourFood' });
});

router.get('/signup', (req, res, next) => {
    // res.sendFile(path.resolve(__dirname, '../views/signup.html'));
    res.render('signup', { title: 'mindYourFood' });
});

router.get('/logout', (req, res, next) => {
    res.clearCookie('user');
    // delete session context from req
    delete req.session;
    res.redirect('/login');
});

// const loginFunc = async (req, res, next)=>{
// 	// fetch username and password from req
// 	// match it against the credentials in db
// 	// redirect to user page with url - /users
// 	var db = await connector.connectToMongo();
// 	const collection = db.collection('users');

// 	var username = req.body.username;
// 	var password = req.body.password;

// 	console.log(username, password);

// 	collection.find({'username': username}).toArray((err, docs)=>{
// 		if(err){
// 			res.json({
// 				'username':username,
// 				'login': 'unsuccessful'
// 			});		
// 		}
// 		else{
// 			// console.log(docs);
// 			// console.log(docs[0]['password'], docs[0].password);
// 			// if(password === docs[0].password){
// 			console.log(`${password} ${docs[0].password}`);
// 			if(password == docs[0].password){
// 				res.sendFile(path.resolve(__dirname, '../views/userHome.html'));
// 			}else{
// 				res.sendFile(path.resolve(__dirname, '../views/home.html'));
// 			}
// 			// res.json({
// 			// 	'message': 'server says hi'
// 			// })
// 		}
// 	});
// }



// const signUpFunc = async (req, res, next)=>{
// 	// add the credentials to db
// 	// log the user in
// 	// redirect to user page with url - /users
// 	var db = await connector.connectToMongo();
// 	var username = req.query.username;
// 	res.json({
// 		// why can't i send username in json response
// 		'username': username,
// 		'signup':'successful'
// 	});
// }

// router.post('/login', loginFunc);
// router.post('/signup', signUpFunc);

module.exports = router;