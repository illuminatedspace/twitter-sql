'use strict';
const express = require('express');
const router = express.Router();
// const tweetBank = require('../tweetBank');
const client = require('../db');

module.exports = io => {

  // a reusable function
  const respondWithAllTweets = (req, res, next) => {
    var query = 'SELECT name, content AS text, tweets.id AS id FROM tweets, users WHERE tweets.user_id = users.id;'
    client.query(query, function (err, result) {
      if (err) {
        throw new Error('client.query is erring');
      }
      var allTheTweets = result.rows;
      res.render('index', {
      title: 'Twitter.js',
      tweets: allTheTweets,
      showForm: true
    });
    });

  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', (req, res, next) => {
    var query = 'SELECT name, content AS text, tweets.id AS id FROM tweets, users WHERE users.name = $1 AND tweets.user_id = users.id;'
    let username = req.params.username;
    console.log(req.params.username);
    client.query(query, [username], function (err, result) {
      if (err) {
        throw new Error('client.query is erring');
      }
      var usersTweets = result.rows;
      console.log(usersTweets);
      res.render('index', {
      title: 'Twitter.js',
      tweets: usersTweets,
      showForm: true
    });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', (req, res, next) => {
    var query = 'SELECT name, content AS text, tweets.id AS id FROM tweets, users WHERE tweets.id = $1 AND users.id = tweets.user_id;'
    let tweetID = req.params.id;
    client.query(query, [tweetID], function (err, result) {
      if (err) {
        throw new Error('client.query is erring');
      }
      var tweet = result.rows;
      console.log(tweet);
      res.render('index', {
      title: 'Twitter.js',
      tweets: tweet,
      showForm: true
    });
    });
  });

  // create a new tweet
  router.post('/tweets', (req, res, next) => {
    console.log(req.body);
    function insertTweet(userID, text) {
      var query = 'INSERT INTO tweets (user_id, content) VALUES ($1, $2);';
      client.query(query, [userID, text], function (err, result) {
        if (err) {return}
        // console.log('created tweet');
      res.redirect('/');
      })
    }
    var userIDquery = 'SELECT id FROM users WHERE $1 = name';
    var username = req.body.name;
    // console.log(username);
    client.query(userIDquery, [username], function (err, result) {
      console.log(result.rows);
      if (err) { throw new Error()}
      if (result.rows.length === 0) {
        console.log('user does not exist');
        var query = 'INSERT INTO users (id, name) VALUES (DEFAULT, $1) RETURNING id;';
        client.query(query, [req.body.name], function(err, result) {
          if (err) {return}
          var id = result.rows[0].id;
        // console.log(result.rows);
          insertTweet(id, req.body.text);
        })
      } else {
        console.log('user does exist');
        insertTweet(result.rows[0].id, req.body.text);
      }
    })
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', => (req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
