const fs = require('fs');
const path = require('path');
const {deploy,invoke,call} = require('../../utils/fn');
const createDir=require('./mkdir')


//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
exports.compile =  (req, res) => {
  const lang=req.body.lang;
  const funcName=req.body.funcName;
  const code=req.body.code;
  const exerciseId=req.params.exerciseId;
  var suffix="";
  var truefuncName=funcName+'CORRECTION'
  //here we need to decide the suffix of src file depending on the language
  if(lang=="node") suffix="js";
  if(lang=="csharp") suffix="csproj";

  createFunction(exerciseId,lang,funcName,code,suffix);
  //createFunction(exerciseId,"Python",truefuncName,truecode,"py");
  var result=deployFunction(exerciseId,lang,funcName);
  //deployFunction(exerciseId,"Python",truefuncName)
  
   
};

//create a new node function
async function createFunction(exerciseId,lang,funcName,code,suffix)
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
//create function directory of this exercise
await createDir.dirExists(`./functions/${exerciseId}/${lang}/${funcName}/src/${funcName}.${suffix}`);
fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/src/${funcName}.${suffix}`, code, err => {
    if(err) return console.log(err);
    console.log('succeed in writing source file');
})
//create the configuration file
await createDir.dirExists(`./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`);
fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`, ymlConf, err => {
    if(err) return console.log(err);
    console.log('succeed in writing yml config file');
})





}

//deploy the function created on the openfaas
async function deployFunction(exerciseId,lang,funcName)
{
  const yml = `./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`;
  //const yml="./functions/csharp/helloworld/helloworld.yml";
  var res=await deploy(yml);
  console.log(res.res);

}










