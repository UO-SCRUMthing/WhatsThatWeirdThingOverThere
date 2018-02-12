# WhatsThatWeirdThingOverThere

## To Install Node.js, npm, express, and all the packages required to run the server:

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
cd the root directory of the webpage with package.json and run
```
npm install
```

The repo is missing the adminSecrets.js file with connection credentials to the mongoDB database hosted on mLab. The required file has to expose variables called `MONGO_USER_NAME` and `MONGO_PASSWORD`. 

Create a file like:
```
exports.MONGO_USER_NAME = <username>;
exports.MONGO_PASSWORD = <password>;
```

The server should now be able to be run by:
```
npm start
```
