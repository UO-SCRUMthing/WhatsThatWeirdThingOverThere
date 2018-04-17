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

    var response;
    dbm.getWisps(req.db, deltatime).then(result => response = result);
    console.log(response);
    res.status(response.status).json(response.wisps);    
});

// WISP template
// {"id":"UUIDv4","title":"wisp title","description":"desc of what was seen",
//  "email":"user@wot.com","loc":{"lon":0,"lat":0},"photos":["file/path/of/photo1"],
//  "responses":["response1","response2","..."],"creation_date":"UNIX timestamp"}

// Route: get wisps by email
router.get('/api/wisps/:email', function(req, res){
    var response;
    dbm.wispsByEmail(req.db, req.params.email).then(result => response = result);
    res.status(response.status).json(response.wisps); 
});

// Route: get wisp by id
router.get('/api/wisp/:id', function(req, res){
    var response;
    dbm.wispById(req.db, req.params.id).then(result => response = result);
    res.status(response.status).json(response.wisp); 
});

// Route: Create a wisp
router.post('/api/wisps', function(req, res) {
    var response;
    dbm.createWisp(req.db, req.body).then(result => response = result);
    res.status(response.status).json(response.wisp); 
});

// Route: Respond to a wisp
router.post('/api/wisp/:id', function(req, res) {
    var response;
    dbm.respondToWisp(req.db, req.body, req.params.id).then(result => response = result);
    res.status(response.status).json(response.wisp);
});

// Route: Delete a wisp
router.delete('/api/wisp/:id', function(req, res) {
    var response;
    dbm.deleteWisp(req.db, req.params.id).then(result => response = result);
    res.status(response.status).json();
});

module.exports = router;


