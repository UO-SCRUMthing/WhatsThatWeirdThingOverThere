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

module.exports = router;
