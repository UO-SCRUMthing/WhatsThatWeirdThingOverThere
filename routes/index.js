var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
const uuidv4 = require('uuid/v4');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "What's That Weird Thing Over There?" });
});

// return template 
// [{"id":"UUIDv4","title":"wisp title","loc":{"lon":0,"lat":0}}, {...}, {...}]

// Route: Show nearby wisps
router.get('/api/wisps', function(req, res) {
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
            var wispLocations = [];
            for (var i = 0; i < docs.length; i++) {
                wispLocations[i] = {"id": docs[i].id, "title": docs[i].title, "loc": docs[i].loc}
            }
            res.status(200).json(wispLocations);
        }
    });     
});

// WISP template
// {"id":"UUIDv4","title":"wisp title","description":"desc of what was seen",
//  "email":"user@wot.com","loc":{"lon":0,"lat":0},"photos":["file/path/of/photo1"],
//  "responses":["response1","response2","..."],"creation_date":"UNIX timestamp"}

// Route: get wisp by id
router.get('/api/wisp/:id', function(req, res){
    var db = req.db;
    var collection = db.get('whatsThatWeirdThing');

    var id = req.params.id;
    collection.findOne({"id": id},{}, function(error, doc) {
        if (error) {
            res.send("There was a problem retreiving the WISP from the database"); 
        } else {
            if (doc != null) {
                delete doc._id
                res.status(200).json(doc);
            } else {
                res.status(404).json();
            }
        }
    });
});

// Route: Create a wisp
router.post('/api/wisps', function(req, res) {
    var db = req.db;
    var collection = db.get('whatsThatWeirdThing');
    var new_wisp = {"id": uuidv4(), "title": req.body.title, "description": req.body.description, "loc":{"lon": req.body.lon, "lat": req.body.lat}, 
                    "email": req.body.email, "photos":["file/path/of/photo1"], "responses":[], "creation_date": new Date().getTime()};

    collection.insert(new_wisp, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database");
        } else {
            res.status(200).json(new_wisp);
        }
    });
});

// Route: Respond a wisp
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


