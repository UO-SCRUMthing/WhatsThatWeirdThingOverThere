const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const dbm = require('../managementModule');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// Route: Show all wisps created after a certain time
// example url: domain.com/api/wisps?lat=45.01&long=123.40&d=5.0&ts=1245073530000
// return template 
// [{"id":"UUIDv4","title":"wisp title","loc":{"lon":0,"lat":0}}, {...}, {...}]
router.get('/api/wisps', function(req, res) {
    // var lat = req.query.lat;
    // var long = req.query.long;
    // var dist = req.query.d;
    var deltatime = req.query.ts ? parseInt(req.query.ts) : 0;
    console.log("deltatime " + deltatime);

    const promise1 = new Promise(resolve => dbm.getWisps(resolve, req.db, deltatime));
    promise1.then(response => res.status(response.status).json(response.wisps));
    // new Promise(dbm.getWisps(req.db, deltatime), reject).then(result => response = result);
    // console.log(response);
    // res.status(response.status).json(response.wisps);    
});

// WISP template
// {"id":"UUIDv4","title":"wisp title","description":"desc of what was seen",
//  "email":"user@wot.com","loc":{"lon":0,"lat":0},"photos":["file/path/of/photo1"],
//  "responses":["response1","response2","..."],"creation_date":"UNIX timestamp"}

// Route: get wisps by email
router.get('/api/wisps/:email', function(req, res){
    const promise1 = new Promise(resolve => dbm.wispsByEmail(resolve, req.db, req.params.email));
    promise1.then(response => res.status(response.status).json(response.wisps)); 
});

// Route: get wisp by id
router.get('/api/wisp/:id', function(req, res){
    const promise1 = new Promise(resolve => dbm.wispById(resolve, req.db, req.params.id));
    promise1.then(response => res.status(response.status).json(response.wisp)).catch(console.log("id error"));
});

// Route: Create a wisp
router.post('/api/wisps', function(req, res) {
    const promise1 = new Promise(resolve => dbm.createWisp(resolve, req.db, req.body));
    promise1.then(response => res.status(response.status).json(response.wisp)); 
});

// Route: Respond to a wisp
router.post('/api/wisp/:id', function(req, res) {
    const promise1 = new Promise(resolve => dbm.respondToWisp(resolve, req.db, req.body, req.params.id));
    promise1.then(response => res.status(response.status).json(response.wisp));
});

// Route: Delete a wisp
router.delete('/api/wisp/:id', function(req, res) {
    const promise1 = new Promise(resolve => dbm.deleteWisp(resolve, req.db, req.params.id));
    promise1.then(response => res.status(response.status).json());
});

module.exports = router;


