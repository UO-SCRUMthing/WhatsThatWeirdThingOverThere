var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
const uuidv4 = require('uuid/v4');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


// Route: Show nearby wisps
// example url: domain.com/api/wisps?lat=45.01&long=123.40&d=5.0&ts=1245073530000
// return template 
// [{"id":"UUIDv4","title":"wisp title","loc":{"lon":0,"lat":0}}, {...}, {...}]
router.get('/api/wisps', function(req, res) {
    var db = req.db;
    var collection = db.get('whatsThatWeirdThing');

    var lat = req.query.lat;
    var long = req.query.long;
    var dist = req.query.d;
    var deltatime = req.query.ts;
    collection.find({},{},function(error, docs) {
        if (error) {
            res.ststus(500).json();
        } else {
            var wispLocations = [];
            for (var i = 0; i < docs.length; i++) {
                wispLocations[i] = {"id": docs[i].id, "title": docs[i].title, "loc": docs[i].loc}
            }
            res.status(200).json(wispLocations);
        }
    });     
});

// Route: get wisps by email
router.get('/api/wisps/:email', function(req, res){
    var collection = req.db.get('whatsThatWeirdThing');
    var email = req.params.email;

    collection.find({"email": email},{}, function(error, wispsByEmail) {
        if (error) {
            res.ststus(500).json(); 
        } else {
            if (wispsByEmail != null) {
                for (var i = 0; i < wispsByEmail.length; i++) {
                    delete wispsByEmailp[i]._id;
                }
                res.status(200).json(wispsByEmail);
            } else {
                res.status(404).json();
            }
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
            res.ststus(500).json(); 
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
                    "email": req.body.email, "photos":[], "responses":[], "creation_date": new Date().getTime()};

    collection.insert(new_wisp, function (error, doc) {
        if (error) {
            res.ststus(500).json();
        } else {
            res.status(200).json(new_wisp);
        }
    });
});

// Route: Respond to a wisp
router.post('/api/wisp/:id', function(req, res) {
    var collection = req.db.get('whatsThatWeirdThing');
    var id = req.params.id;

    collection.update({"id":id}, {$push: {"responses": req.body.message}});
    collection.findOne({"id": id},{}, function(error, doc) {
        if (error) {
            res.ststus(500).json();
        } else {
            delete doc._id
            res.status(200).json(doc);
        }
    });
});

// // Route: Respond to a wisp
// router.post('/api/wisp/:id', function(req, res) {
//     var collection = req.db.get('whatsThatWeirdThing');
//     var id = req.params.id;

//     // collection.update({"id":id}, {$push: {"responses": req.body.message}});
//     collection.findOne({"id": id},{}, function(error, doc) {
//         if (error) {
//             res.ststus(500).json();
//         } else {
//             if (doc.responses.length != 0) {
//                 doc.responses.push(req.body.message);
//                 collection.save(doc);
//             }
//             delete doc._id;
//             res.status(200).json(doc);
//         }
//     });
// });

// Route: Delete a wisp
router.delete('/api/wisp/:id', function(req, res) {
    var collection = req.db.get('whatsThatWeirdThing');
    var id = req.params.id;

    collection.delete({"id": id}, function(error, doc) {
        if (error) {
            res.ststus(500).json();
        } else {
            res.status(200).json();
        }
    });
});

module.exports = router;


