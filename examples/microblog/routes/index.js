var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { title: '首页' });
});

router.get('/hello', function(req, res, next) {
	res.send('The time is ' + new Date().toString());
});

router.get('/u/:user', function(req, res, next) {

});

router.post('/post', function(req, res, next) {

});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {

	res.render('reg',{
		title:'用户注册',
	});
});

router.post('/reg',checkNotLogin);
router.post('/reg', function(req, res, next) {
	if(req.body['password-repeat'] != req.body['password']) {
		req.flash('error','两次输入的口令不一致');
		return res.redirect('/reg');
	}

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		name: req.body.username,
		password: password,
	});

	User.get(newUser.name, function(err, user) {
		if(user)
			err = 'Username already exists.';
		if(err) {
			req.flash('error',err);
			return res.redirect('/reg');
		}

		newUser.save(function(err) {
			if(err) {
				req.flash('error',err);
				return res.redirect('/reg');
			}

			req.session.user = newUser;
			req.flash('success','注册成功');
			res.redirect('/');
		});
	});
});

router.get('/login',checkNotLogin);
router.get('/login', function(req, res, next) {
	res.render('login', {
		title: '用户登入',
	});
});

router.post('/login',checkNotLogin);
router.post('/login', function(req, res, next) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username, function(err, user) {
		if(!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error','用户口令错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success','登入成功');
		res.redirect('/');
	});
});

router.get('/logout',checkLogin);
router.get('/logout', function(req, res, next) {
	req.session.user = null;
	req.flash('success','登出成功');
	res.redirect('/');
});

function checkLogin(req, res, next) {
	if(!req.session.user) {
		req.flash('error','未登入');
		return res.redirect('/login');
	}

	next();
}

function checkNotLogin(req, res, next) {
	if(req.session.user) {
		req.flash('error','已登入');
		return res.redirect('/');
	}

	next();
}


module.exports = router;
