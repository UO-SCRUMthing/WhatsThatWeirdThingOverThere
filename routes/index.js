var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "What's That Weird Thing Over There?" });
});

// GET Userlist page. /
router.get('/pinlist', function(req, res) {
    var db = req.db;
    var collection = db.get('whatsThatWeirdThing');
    collection.find({},{},function(e,docs) {
        res.render('pinlist', {
            "pinlist" : docs
        });
    });
});

// GET New User page. /
router.get('/newpin', function(req, res) {
    res.render('newpin', { title: 'Add New Pin' });
});

// POST to Add User Service /
router.post('/addpin', function(req, res) {

    var db = req.db;

    var userName = req.body.username;
    var userEmail = req.body.useremail;

    var collection = db.get('whatsThatWeirdThing');

    collection.insert({
        "username" : userName, 
        "email" : userEmail,
    }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database");
        } else {
            res.redirect("pinlist");
        }
    });
});

// WISP template
// {"name": "wisp name", "description": "desc of what was seen", "email": "user@wot.com", 
// "loc":{"lon":0, "lat":0}, "photo": "file path of photo1", "responses": ["response1", "response2"]}

// Example (Show nearby wisps):
// domain.com/api/wisps?lat=45.01&long=123.40&d=5.0&ts=2009-06-15T13:45:30
// currently it just returns all WISPs tho

router.get('/api/wisps', function(req, res) {
    response.contentType('application/json');
    var db = req.db;

    var lat = req.query.lat;
    var long = req.query.long;
    var dist = req.query.d;
    var deltatime = req.query.ts;

    var collection = db.get('whatsThatWeirdThing');
    collection.find({},{},function(error, docs) {
        res.status(200).json(docs);
    }    
})

module.exports = router;


