const config = require('./common/config/env.config.js');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const AuthorizationRouter = require('./authorization/routes.config');
const UsersRouter = require('./users/routes.config');
const ExercisesRouter = require('./exercises/routes.config');
const TrainingsRouter =require('./trainings/routes.config');

const {deploy} = require('./utils/fn');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});

app.use(bodyParser.json());
AuthorizationRouter.routesConfig(app);
UsersRouter.routesConfig(app);
ExercisesRouter.routesConfig(app);
TrainingsRouter.routesConfig(app);


app.listen(config.port, function () {
    console.log('app listening at port %s', config.port);
});




// const fs = require('fs');
// const path = require('path');

// //deploy a test writted function
// let start = new Date();
// let ttl = 1000;
// const filename='csharp/helloworld'

//       const folders = filename.split(path.sep);
//       if (folders.length >= 2) {
//         const lang = folders[0];
//         const func = folders[1];
//         const yml = `./functions/${lang}/${func}/${func}.yml`;
//          deploy(yml);
//       }

// //create a new node function
// const lang="node";
// const funcName="hello";
// const code="print ";
// const ymlConf=`version: 1.0
// provider:
//   name: openfaas
//   gateway: http://127.0.0.1:8080
// functions:
//   ${funcName}:
//     lang: ${lang}
//     handler: ./functions/${lang}/${funcName}/src/
//     image: ${lang}_${funcName}:latest
// `

// fs.mkdirSync(`./functions/${lang}/${funcName}`);
// fs.mkdirSync(`./functions/${lang}/${funcName}/src`);
// fs.writeFileSync(`./functions/${lang}/${funcName}/src/${funcName}.js`, code, 'utf8' );

// //create yml file
// fs.writeFileSync(`./functions/${lang}/${funcName}/${funcName}.yml`,ymlConf,'utf8');    

