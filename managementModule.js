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

const mailOptions = {
    from: credentials.GMAIL_ACCOUNT,
    to: null,
    subject: null,
    text: null
};

function sendMail(doc) {
    mailOptions.text = "Greetings User,\nSomeone has responded to your request for information about '" + doc.title + "'. Go to your list of WISPs in What's That to see the response.\n-The What's That Team";
    mailOptions.to = doc.email;
    mailOptions.subject = "Your pin '" + doc.title + "' was just responded to for the first time!";

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

module.exports.getWisps = function (callback, db, deltatime) {
    var collection = db.get('whatsThatWeirdThing');

    collection.find({"creation_date": {"$gte": deltatime}}, {}, function(error, docs) {
        if (error) {
            // console.log("ERROR");
            callback({status: 500, wisps: []});
        } else {
            var wispLocations = [];
            for (var i = 0; i < docs.length; i++) {
                wispLocations[i] = {"id": docs[i].id, "title": docs[i].title, "loc": docs[i].loc};
            }
            callback({status: 200, wisps: wispLocations});
        }
    }); 
}

module.exports.wispsByEmail = function (callback, db, email) {
    var collection = db.get('whatsThatWeirdThing');
    collection.find({"email": email},{}, function(error, docs) {
        if (error) {
            callback({status: 500, wisps: []});
        } else {
            if (docs != null) {
                var wispsEmails = [];
                for (var i = 0; i < docs.length; i++) {
                    wispsEmails[i] = {"id": docs[i].id, "title": docs[i].title, "loc": docs[i].loc};
                }
                callback({status: 200, wisps: wispsEmails});
            } else {
                callback({status: 404, wisps: []});
            }
        }
    });
}

module.exports.wispById = function (callback, db, id) {
    var collection = db.get('whatsThatWeirdThing');

    collection.findOne({"id": id},{}, function(error, doc) {
        if (error) {
            callback({status: 500, wisps: {}});
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
                callback({status: 200, wisp: doc});
            } else {
                callback({status: 404, wisp: {}});
            }
        }
    });
}

module.exports.createWisp = function (callback, db, body) {
    var collection = db.get('whatsThatWeirdThing');
    var regEmail = /\w+@\w+\.\w+/;

    var emptyRequest = (!body.title && !body.description) || !body.email || body.lon == null || body.lat == null;
    var lengthTest = body.title.length > 160 || body.description.length > 2000 || !regEmail.test(body.email);

    if (emptyRequest || lengthTest) {
        callback({status: 400, wisp: {}});
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
            callback({status: 500, wisp: {}});
        } else {
            new_wisp.photos[0] = body.image;
            callback({status: 200, wisp: new_wisp});
        }
    });
}

module.exports.respondToWisp = function (callback, db, body, id) {
    var collection = db.get('whatsThatWeirdThing');
    var clientErrorStatus = {status: 400, wisp: {}};
    var serverErrorStatus = {status: 500, wisp: {}};

    if (body.message) {
        if (body.message.length > 1500 || body.message.length < 10) {
                callback(clientErrorStatus);
                return;
        }
    } else {
        callback(clientErrorStatus);
        return;
    }

    collection.findOne({"id": id},{}, function(error, doc) {
        if (error) {
            callback(serverErrorStatus);
        } else {
            if (doc.responses.length == 0) {
                sendMail(doc);
            } 

            doc.responses.push(body.message);
            collection.update({"id": doc.id}, {$set: {"responses": doc.responses}}, function(error, count, status) {
                if (error) {
                    callback(serverErrorStatus);
                } else {
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
                    callback({status: 200, wisp: doc});
                }
            });
        }
    });
}

module.exports.deleteWisp = function (callback, db, id) {
    var collection = db.get('whatsThatWeirdThing');

    collection.remove({"$and": [{"id": id}, {"responses": []}]}, {}, function(error, doc) {
        var statusObj;
        if (error) {
            statusObj = {status: 500, wisps: []};
        } else {
            statusObj = {status: 200, wisps: []};
        }
        callback(statusObj);
    });
}