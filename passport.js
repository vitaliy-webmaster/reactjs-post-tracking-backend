const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const keys = require('./config/keys');

// Load User Model
const User = mongoose.model('users');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    (email, password, done) => {
      console.log(email, ' ', password);
      User.findOne({ userType: 'local', email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: 'Incorrect email or password'
            });
          }

          bcrypt.compare(password, user.password).then((isMatch) => {
            if (!isMatch) {
              return done(null, false, {
                message: 'Incorrect email or password'
              });
            }
            return done(null, user, { message: 'Logged in successfully' });
          });
        })
        .catch((err) => done(err));
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: keys.googleRedirectURL,
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({
        userType: 'google',
        googleEmail: profile.emails[0].value
      }).then((existingUser) => {
        if (existingUser) {
          done(null, existingUser);
        } else {
          new User({
            userType: 'google',
            googleEmail: profile.emails[0].value,
            name: profile.displayName
          })
            .save()
            .then((user) => done(null, user));
        }
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: keys.facebookClientID,
      clientSecret: keys.facebookClientSecret,
      callbackURL: keys.facebookRedirectURL,
      profileFields: ['id', 'displayName', 'email'],
      proxy: true
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({
        userType: 'facebook',
        facebookEmail: profile.emails[0].value
      }).then((existingUser) => {
        if (existingUser) {
          console.log(profile);
          done(null, existingUser);
        } else {
          new User({
            userType: 'facebook',
            facebookEmail: profile.emails[0].value,
            name: profile.displayName
          })
            .save()
            .then((user) => {
              done(null, user);
            });
        }
      });
    }
  )
);

// Twitter Oauth1.0a Strategy
passport.use(
  new TwitterStrategy(
    {
      consumerKey: keys.twitterClientID,
      consumerSecret: keys.twitterClientSecret,
      callbackURL: keys.twitterRedirectURL,
      proxy: true
    },
    function(token, tokenSecret, profile, done) {
      console.log(profile);
      User.findOne({
        userType: 'twitter',
        twitterEmail: profile.username
      }).then((existingUser) => {
        if (existingUser) {
          console.log(profile);
          done(null, existingUser);
        } else {
          new User({
            userType: 'twitter',
            twitterEmail: profile.username,
            name: profile.displayName
          })
            .save()
            .then((user) => {
              done(null, user);
            });
        }
      });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: keys.JWTSecret
    },
    (jwtPayload, done) => {
      User.findById(jwtPayload.id)
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: 'Not authorized'
            });
          }
          return done(null, user, { message: 'Logged in successfully' });
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);
