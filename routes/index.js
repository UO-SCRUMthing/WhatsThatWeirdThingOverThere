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

// https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R * arcsin(sqrt(a)); R = 6371 km
}

function pull_documents(db, lat, long, dist) {
        var collection = db.get('whatsThatWeirdThing');
        collection.find({})

}

router.get('/api/wisps', function(req, res) {
    var db = req.db;

    var lat = req.query.lat;
    var long = req.query.long;
    var dist = req.query.d;
    var deltatime = req.query.ts;

    var document_object = pull_documents(db, lat, long, dist);
    
    do_stuff(document_object);
    
    res.status(200).json(document_object);
})

module.exports = router;
