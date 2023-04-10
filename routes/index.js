var express = require('express');
var router = express.Router();
var model = require('../models/user');
var bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


const saltRounds = 10;




router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});



router.get('/register', function (req, res, next) {
	return res.render('registration.ejs');
});


router.post('/api/register', function(req, res, next) {
	
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {
			model.User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					model.User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}
						
						bcrypt.hash(personInfo.password, saltRounds, function (err,   hash){
						console.log(hash);
						var newPerson = new model.User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: hash,
							passwordConf: hash,
							profileimg: "/img/profile.png"
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					});
					res.send({"Success":"You are regestered,You can login now."});
				});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/api/login', function (req, res, next) {
	//console.log(req.body);
	model.User.findOne({email:req.body.email},function(err,data){
		if(data){
			bcrypt.compare(req.body.password, data.password, function (err, result){
			if(result){
				const token = jwt.sign(
					{ user_id: data._id, email: data.email },
					"testkey",
					{
					  expiresIn: "2h",
					}
				  );
				//console.log("Done Login");
				// req.session.userId = data.unique_id;
				console.log(data);
				//console.log(req.session.userId);
				res.cookie('token', token).send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}})
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	if (req.cookies.token){
		const decoded = jwt.verify(req.cookies.token, "testkey");
		model.Blacklistjwt.findOne({token:req.cookies.token},function(err,result){
			if(!result){
				model.User.findOne({email:decoded.email},function(err,data){
					console.log(data);
					if(!data){
						res.redirect('/login');
					}else{
						//console.log("found");
						return res.render('data.ejs', {"name":data.username,"email":data.email,"image":data.profileimg});
					}
				});
			}else{
				res.redirect('/login');
			}
		});
		
	}
	else
		res.redirect('/login');

});

router.get('/logout', function (req, res, next) {

	var newlogout = new model.Blacklistjwt({
		token: req.cookies.token
	});
	newlogout.save(function(err, result){
		if(err)
			console.log(err);
		else
			console.log('Success');
	});

	res.clearCookie('token');
	return res.redirect('/login');

});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/api/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	model.User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;