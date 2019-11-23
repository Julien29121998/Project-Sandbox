const fs = require('fs');
const path = require('path');
const {deploy,invoke} = require('../../utils/fn');


//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
<<<<<<< HEAD
exports.compile =  (req, res) => {
  const lang=req.body.lang;
  const funcName=req.body.funcName;
  const code=req.body.code;
  const exerciseId=req.body.exerciseId;
=======
exports.compile =  (funcName,code,lang,testData,trueCode) => {
>>>>>>> 07264cde7ea8ce363e4f75c91c02c94a8f02575d
  var suffix="";
  var truefuncName=funcName+'CORRECTION'
  //here we need to decide the suffix of src file depending on the language
  if(lang=="node") suffix="js";

<<<<<<< HEAD
  createFunction(exerciseId,lang,funcName,code,suffix);
  deployFunction(exerciseId,lang,funcName);
=======
  createFunction(lang,funcName,code,suffix);
  createFunction("Python",truefuncName,truecode,"py");
  deployFunction(lang,funcName);
  deployFunction("Python",truefuncName)
>>>>>>> 07264cde7ea8ce363e4f75c91c02c94a8f02575d
   
};

//create a new node function
function createFunction(exerciseId,lang,funcName,code,suffix)
{

  //create default yml configuration using the info above
  const ymlConf=`version: 1.0
provider:
  name: openfaas
  gateway: http://127.0.0.1:8080
functions:
  ${funcName}:
    lang: ${lang}
    handler: ./functions/${lang}/${funcName}/src/
    image: ${lang}_${funcName}:latest
`
  //create function directories and sre file
  fs.stat(`./functions/${exerciseId}/`,function(err, stat){
    if(!stat) 
      fs.mkdirSync(`./functions/${exerciseId}/${lang}/${funcName}`);
  })
  fs.stat(`./functions/${exerciseId}/${lang}`,function(err, stat){
    if(!stat) 
      fs.mkdirSync(`./functions/${exerciseId}/${lang}/${funcName}`);
  })
  fs.stat(`./functions/${exerciseId}/${lang}/${funcName}`,function(err, stat){
    if(!stat) 
      fs.mkdirSync(`./functions/${exerciseId}/${lang}/${funcName}`);
  })
  fs.stat(`./functions/${exerciseId}/${lang}/${funcName}/src`,function(err, stat){
    if(!stat) 
      fs.mkdirSync(`./functions/${exerciseId}/${lang}/${funcName}/src`);
  })
  fs.writeFileSync(`./functions/${exerciseId}/${lang}/${funcName}/src/${funcName}.${suffix}`, code, 'utf8' );
  fs.writeFileSync(`./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`,ymlConf,'utf8');  
}


//deploy the function created on the openfaas
function deployFunction(exerciseId,lang,funcName)
{
  const yml = `./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`;
  deploy(yml);

}

//then invoke both and compare IN PROGRESS


