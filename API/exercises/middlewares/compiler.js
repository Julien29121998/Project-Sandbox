const fs = require('fs');
const path = require('path');
const {deploy,invoke} = require('../../utils/fn');


//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
exports.compile =  (funcName,code,lang,testData,trueCode) => {
  var suffix="";
  //here we need to decide the suffix of src file depending on the language
  if(lang=="node") suffix="js";

  createFunction(lang,funcName,code,suffix);
  deployFunction(lang,funcName);
   
};

//create a new node function
function createFunction(lang,funcName,code,suffix)
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
  fs.stat(`./functions/${lang}`,function(err, stat){
    if(!stat) 
      fs.mkdirSync(`./functions/${lang}/${funcName}`);
  })
  fs.stat(`./functions/${lang}/${funcName}`,function(err, stat){
    if(!stat) 
      fs.mkdirSync(`./functions/${lang}/${funcName}`);
  })
  fs.stat(`./functions/${lang}/${funcName}/src`,function(err, stat){
    if(!stat) 
      fs.mkdirSync(`./functions/${lang}/${funcName}/src`);
  })
  fs.writeFileSync(`./functions/${lang}/${funcName}/src/${funcName}.${suffix}`, code, 'utf8' );
  fs.writeFileSync(`./functions/${lang}/${funcName}/${funcName}.yml`,ymlConf,'utf8');  
}


//deploy the function created on the openfaas
function deployFunction(lang,funcName)
{
  const yml = `./functions/${lang}/${funcName}/${funcName}.yml`;
  deploy(yml);

}


