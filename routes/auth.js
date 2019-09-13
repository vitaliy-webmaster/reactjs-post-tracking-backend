const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const keys = require('../config/keys');

// Load User Model
require('../models/User');
const User = mongoose.model('users');

// POST registration
router.post('/register', (req, res) => {
  let errors = [];
  const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const email = req.body.email && req.body.email.trim();
  const password = req.body.password && req.body.password.trim();
  const password2 = req.body.password2 && req.body.password2.trim();
  const name = req.body.name && req.body.name.trim();

  if (!req.body) {
    errors.push({
      status: 'registration-error',
      message: 'Будь-ласка введіть реєстраційні дані'
    });
  }

  if (!email) {
    errors.push({
      status: 'registration-error',
      message: 'Будь-ласка введіть вашу електронну адресу'
    });
  }

  if (email) {
    if (!(email.length > 0 && regExp.test(email))) {
      errors.push({
        status: 'registration-error',
        message: 'Некорректно введена електронна адреса'
      });
    }
  }

  if (!password) {
    errors.push({
      status: 'registration-error',
      message: 'Будь-ласка введіть ваш пароль'
    });
  }

  if (password && password.length < 6) {
    errors.push({
      status: 'registration-error',
      message: 'Пароль має складатися з мінімум 6 символів'
    });
  }

  if (password !== password2) {
    errors.push({
      status: 'registration-error',
      message: 'Введені паролі не співпадають'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  } else {
    User.findOne({ userType: 'local', email: email }).then((user) => {
      if (user) {
        return res.status(400).json({
          status: 'registration-error',
          message: 'Користувач с таким логіном вже існує'
        });
      } else {
        const newUser = {
          userType: 'local',
          email: email,
          password: password,
          name: name
        };

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            new User(newUser)
              .save()
              .then((user) => {
                return res.status(200).json({
                  status: 'registration-success',
                  message:
                    'Реєстрація виконана успішно, тепер ви можете авторизуватись'
                });
              })
              .catch((err) => {
                console.log(err);
                return res.status(400).json({
                  status: 'registration-error',
                  message: 'Внутрішня помилка сервера'
                });
              });
          });
        });
      }
    });
  }
});

// @route   POST auth/login
// @desc    Makes user's login / Returning JWT Token
// @access  Public
router.post('/login', (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    (err, user, messageObj) => {
      if (err) {
        return res.status(400).json({
          status: 'login-error',
          message: 'Внутрішня помилка сервера'
        });
      }

      if (!user) {
        return res.status(400).json({
          status: 'login-error',
          message: 'Логін / Пароль введено невірно'
        });
      }

      const payload = {
        id: user.id,
        email: user.email,
        name: user.name
      };

      req.login(user, { session: false }, (err) => {
        const token = jwt.sign(payload, keys.JWTSecret, {
          expiresIn: 24 * 60 * 60
        });
        return res.json({ token });
      });
    }
  )(req, res);
});

// @route   GET auth/google
// @desc    Makes user's authentication
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    prompt: 'select_account',
    session: false,
    scope: ['email', 'profile']
  })
);

// @route   GET auth/google/callback
// @desc    Get redirections from google server
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: keys.currentFrontendURL + 'auth/callback_failed'
  }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      userType: req.user.userType,
      googleEmail: req.user.googleEmail,
      name: req.user.name
    };

    const token = jwt.sign(payload, keys.JWTSecret, {
      expiresIn: 24 * 60 * 60
    });

    console.log(token);

    res.redirect(keys.currentFrontendURL + 'auth/callback?token=' + token);
  }
);

// @route   GET auth/facebook
// @desc    Makes user's authentication
// @access  Public
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    // authType: "reauthenticate",
    session: false,
    scope: ['email']
  })
);

// @route   GET auth/facebook/callback
// @desc    Get redirections from facebook server
// @access  Public
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: keys.currentFrontendURL + 'auth/callback_failed'
  }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      userType: req.user.userType,
      facebookEmail: req.user.facebookEmail,
      name: req.user.name
    };

    const token = jwt.sign(payload, keys.JWTSecret, {
      expiresIn: 24 * 60 * 60
    });

    console.log(token);

    res.redirect(keys.currentFrontendURL + 'auth/callback?token=' + token);
  }
);

// @route   GET auth/twitter
// @desc    Makes user's authentication
// @access  Public
router.get('/twitter', passport.authenticate('twitter', { session: false }));

// @route   GET auth/twitter/callback
// @desc    Get redirections from twitter server
// @access  Public
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    session: false,
    failureRedirect: keys.currentFrontendURL + 'auth/callback_failed'
  }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      userType: req.user.userType,
      twitterEmail: req.user.twitterEmail,
      name: req.user.name
    };

    const token = jwt.sign(payload, keys.JWTSecret, {
      expiresIn: 24 * 60 * 60
    });

    console.log(token);

    res.redirect(keys.currentFrontendURL + 'auth/callback?token=' + token);
  }
);

module.exports = router;
