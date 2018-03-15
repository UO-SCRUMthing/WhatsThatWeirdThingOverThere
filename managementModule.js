const uuidv4 = require('uuid/v4');
const nodemailer = require('nodemailer');
const credentials = require('./adminSecrets');
const fs = require('fs');
const os = require('os');

var imageDirectory = os.homedir() + "/Images/";
!fs.existsSync(imageDirectory) && fs.mkdirSync(imageDirectory);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: credentials.GMAIL_ACCOUNT,
        pass: credentials.GMAIL_PASSWORD
    },
});
    // tls: { rejectUnauthorized: false }

const mailOptions = {
    from: credentials.GMAIL_ACCOUNT,
    to: null,
    subject: null,
    text: null
};

// string generated by canvas.toDataURL()
// var img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0"
//     + "NAAAAKElEQVQ4jWNgYGD4Twzu6FhFFGYYNXDUwGFpIAk2E4dHDRw1cDgaCAASFOffhEIO"
//     + "3gAAAABJRU5ErkJggg==";

// adapted from https://gist.github.com/madhums/e749dca107e26d72b64d
function saveImage(img, outputName) {
    // strip off the data: url prefix to get just the base64-encoded bytes
    var reg = /\/(\w+);/;
    var match = reg.exec(img);
    var extension = "." + match[1];
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFile(imageDirectory + outputName + extension, buf, function(err) { 
        if (err) throw err;
        console.log("Saved!");
    });
    return imageDirectory + outputName + extension;
}

function readBase64Image(filePath) {
    var regFileExtension = /.+\.(\w{3,4})/;
    var fileExtension = regFileExtension.exec(filePath)[1];

    return "data:image/" + fileExtension + ";base64," + fs.readFileSync(filePath, 'base64');
}

module.exports.getWisps = function (db, deltatime, res) {
    // passing in res to fix async call issue, there are better ways to do this, but I do not have the time currently to figure them out.
    var collection = db.get('whatsThatWeirdThing');

    collection.find({"creation_date": {"$gte": deltatime}}, {}, function(error, docs) {
        if (error) {
            // return {status: 500, wisps: []};
            res.status(500).json();
        } else {
            var wispLocations = [];
            for (var i = 0; i < docs.length; i++) {
                wispLocations[i] = {"id": docs[i].id, "title": docs[i].title, "loc": docs[i].loc};
            }
            // return {status: 200, wisps: wispLocations};
            res.status(200).json(wispLocations);
        }
    }); 
}

module.exports.wispsByEmail = function (db, email, res) {
    // passing in res to fix async call issue, there are better ways to do this, but I do not have the time currently to figure them out.
    var collection = db.get('whatsThatWeirdThing');
    collection.find({"email": email},{}, function(error, docs) {
        if (error) {
            // return {status: 500, wisps: []};
            res.status(500).json(); 
        } else {
            if (docs != null) {
                var wispsEmails = [];
                for (var i = 0; i < docs.length; i++) {
                    wispsEmails[i] = {"id": docs[i].id, "title": docs[i].title, "loc": docs[i].loc};
                }
                // return {status: 200, wisps: wispsEmails};
                res.status(200).json(wispsEmails);
            } else {
                // return {status: 404, wisps: []};
                res.status(404).json();
            }
        }
    });
}

module.exports.wispById = function (db, id, res) {
    // passing in res to fix async call issue, there are better ways to do this, but I do not have the time currently to figure them out.
    var collection = db.get('whatsThatWeirdThing');

    collection.findOne({"id": id},{}, function(error, doc) {
        if (error) {
            // return {status: 500, wisps: {}};
            res.status(500).json(); 
        } else {
            if (doc != null) {
                delete doc._id
                if (doc.photos[0]) {
                    for (var i = 0; i < doc.photos.length; i++) {
                        try {
                            doc.photos[i] = readBase64Image(doc.photos[i]);
                            // console.log(doc.photos[i]);
                        } catch (error) {
                            if (error.code === 'ENOENT') {
                                console.log("File not found!");
                            } else {
                                throw error;
                            }
                        }
                    }
                }
                // return {status: 200, wisp: doc};
                res.status(200).json(doc);
            } else {
                // return {status: 404, wisp: {}};
                res.status(404).json();
            }
        }
    });
}

module.exports.createWisp = function (db, body, res) {
    // passing in res to fix async call issue, there are better ways to do this, but I do not have the time currently to figure them out.
    var collection = db.get('whatsThatWeirdThing');
    var regEmail = /\w+@\w+\.\w+/;

    if ((!body.title && !body.description) || !body.email || body.lon == null || body.lat == null) {
        // return {status: 400, wisp: {}};
        res.status(400).json();
        return;
    } else if (body.title.length > 160 || body.description.length > 2000 || !regEmail.test(body.email)) {
        // return {status: 400, wisp: {}};
        res.status(400).json();
        return;
    }

    var id = uuidv4();
    var fullPhotoPath = "";
    if (body.image) {
        fullPhotoPath = saveImage(body.image, id); 
    }
    var new_wisp = {"id": id, "title": body.title, "description": body.description, 
                    "loc":{"lon": body.lon, "lat": body.lat}, "email": body.email,
                    "photos":[fullPhotoPath], "responses":[], "creation_date": new Date().getTime()};

    collection.insert(new_wisp, function (error, doc) {
        if (error) {
            // return {status: 500, wisp: {}};
            res.status(500).json();
        } else {
            // return {status: 200, wisp: new_wisp};
            new_wisp.photos[0] = body.image;
            res.status(200).json(new_wisp);
        }
    });
}

module.exports.respondToWisp = function (db, body, id, res) {
    // passing in res to fix async call issue, there are better ways to do this, but I do not have the time currently to figure them out.
    var collection = db.get('whatsThatWeirdThing');

    if (!body.message) {
        // return {status: 400, wisp: {}};
        res.status(400).json();
        return;
    } else if (body.message.length > 1500 || body.message.length < 10) {
        // return {status: 400, wisp: {}};
        res.status(400).json();
        return;
    }

    collection.findOne({"id": id},{}, function(error, doc) {
        if (error) {
            return {status: 500, wisp: {}};
        } else {
            if (doc.responses.length == 0) {
                mailOptions.text = "Greetings User,\nSomeone has responded to your request for information about " + doc.title + ". Go to your list of WISPs in What's That to see the response.\n-The What's That Team";
                mailOptions.to = doc.email;
                mailOptions.subject = "Your pin " + doc.title + " was just responded to for the first time!";
                if (mailOptions.to && mailOptions.text) {
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                            console.log(info);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
            } 

            doc.responses.push(body.message);
            collection.update({"id": doc.id}, {$set: {"responses": doc.responses}}, function(error, count, status) {
                if (error) {
                    // return {status: 500, wisp: {}};
                    res.status(500).json();
                } else {
                    // console.log("WISP " + doc.id + "responsed to! " + count + " " + status);
                    delete doc._id; 
                    if (doc.photos[0]) {
                        for (var i = 0; i < doc.photos.length; i++) {
                            try {
                                doc.photos[i] = readBase64Image(doc.photos[i]);
                                // console.log(doc.photos[i]);
                            } catch (error) {
                                if (error.code === 'ENOENT') {
                                    console.log("File not found!");
                                } else {
                                    throw error;
                                }
                            }
                        }
                    }
                    // return {status: 200, wisp: doc};
                    res.status(200).json(doc);
                }
            });
        }
    });
}

module.exports.deleteWisp = function (db, id, res) {
    // passing in res to fix async call issue, there are better ways to do this, but I do not have the time currently to figure them out.
    var collection = db.get('whatsThatWeirdThing');

    collection.remove({"$and": [{"id": id}, {"responses": []}]}, {}, function(error, doc) {
        if (error) {
            res.status(500).json();
        } else {
            res.status(200).json();
        }
    });
}