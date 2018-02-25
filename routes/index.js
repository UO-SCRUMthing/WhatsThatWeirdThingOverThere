var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
const uuidv4 = require('uuid/v4');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "What's That Weird Thing Over There?" });
});

// // GET Userlist page. /
// router.get('/pinlist', function(req, res) {
//     var db = req.db;
//     var collection = db.get('whatsThatWeirdThing');
//     collection.find({},{},function(e,docs) {
//         res.render('pinlist', {
//             "pinlist" : docs
//         });
//     });
// });

// // GET New User page. /
// router.get('/newpin', function(req, res) {
//     res.render('newpin', { title: 'Add New Pin' });
// });

// // POST to Add User Service /
// router.post('/addpin', function(req, res) {

//     var db = req.db;

//     var userName = req.body.username;
//     var userEmail = req.body.useremail;

//     var collection = db.get('whatsThatWeirdThing');

//     collection.insert({
//         "username" : userName, 
//         "email" : userEmail,
//     }, function (err, doc) {
//         if (err) {
//             res.send("There was a problem adding the information to the database");
//         } else {
//             res.redirect("pinlist");
//         }
//     });
// });

// WISP template
// {"name": "wisp name", "description": "desc of what was seen", "email": "user@wot.com", 
// "loc":{"lon":0, "lat":0}, "photo": ["file path of photo1"], "responses": ["response1", "response2"], 
// "creation_date": "UTC date string"}

// Example (Show nearby wisps):
// domain.com/api/wisps?lat=45.01&long=123.40&d=5.0&ts=2009-06-15T13:45:30 
//     currently it just returns all WISPs 
// or 
// domain.com/api/wisps?id=value
//     which will get a wisp by id number

router.get('/api/wisps', function(req, res) {
    // res.contentType('application/json');
    var db = req.db;
    var collection = db.get('whatsThatWeirdThing');

    // var lat = req.query.lat;
    // var long = req.query.long;
    // var dist = req.query.d;
    // var deltatime = req.query.ts;
    collection.find({},{},function(error, docs) {
        if (error) {
            res.send("There was a problem retreiving information from the database");
        } else {
            res.status(200).json(docs);
        }
    });     
});

router.get('/api/wisp/:id', function(req, res){
    var db = req.db;
    var collection = db.get('whatsThatWeirdThing');

    var id = req.params.id;
    collection.findOne({"id": id},{}, function(error, docs) {
        if (error) {
            res.send("There was a problem retreiving the WISP from the database"); 
        } else {
            res.status(200).json(docs);
        }
    });
});

router.post('/api/wisps', function(req, res) {
    var db = req.db;
    var collection = db.get('whatsThatWeirdThing');
    var new_wisp = {"id":uuidv4(), "title": req.body.title, "description": req.body.description, "loc":{"lon": req.body.lon, "lat": req.body.lat}, 
                    "email": req.body.email, "photo":["file/path/of/photo1"], "responses":[], "creation_date": new Date().getTime()};

    collection.insert(new_wisp, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database");
        } else {
            res.status(200).json(new_wisp);
        }
    });
});

router.post('/api/wisp/:id', function(req, res) {
    var collection = req.db.get('whatsThatWeirdThing');
    var id = req.params.id;

    collection.updateOne({"id":id}, {$push: {"responses": req.body.message}});
    collection.findOne({"id": id},{}, function(error, docs) {
        if (error) {
            res.send("There was a problem retreiving the WISP from the database"); 
        } else {
            res.status(200).json(docs);
        }
    });

});

module.exports = router;


