# WhatsThatWeirdThingOverThere

## To Install Node.js, npm, Express, and all the packages required to run the server:

__Install Node.js 9 through package manager with apt as per [directions from the Node.js website](https://nodejs.org/en/download/package-manager/):__
```
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs
```

__Install express:__ 
```
npm install -g express-generator
```

__Install all the packages required for the server:__

cd to the root directory of the webpage where package.json is located and run
```
npm install
```

The repo is missing the `adminSecrets.js` file with connection credentials to the mongoDB database hosted on mLab. The file also holds the credentials file for the gmail account used by `nodemailer` to send out notification emails. The required file has to expose variables called `MONGO_USER_NAME`, `MONGO_PASSWORD`, `GMAIL_ADDRESS`, and `GMAIL_PASSWORD`. 

__Create a `adminSecrets.js` file in the root directory like:__
```
exports.MONGO_USER_NAME = <username>;
exports.MONGO_PASSWORD = <password>;
exports.GMAIL_ADDRESS = <email address>;
exports.GMAIL_PASSWORD = <password>;
```

The server can now be able to be run by:
```
sudo PORT=80 npm start
```
