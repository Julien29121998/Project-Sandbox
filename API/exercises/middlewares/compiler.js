const fs = require('fs');
const fn = require('../../utils/fn');
const createDir=require('./mkdir')



//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
exports.compile =  (exerciseId,code,lang,testData,trueCode,funcName) => {
  var suffix="";
  //here we need to decide the suffix of src file depending on the language
  if(lang=="node") suffix="js";
  if(lang=="csharp") suffix="csproj";
  if(lang=="python") suffix="py";
  code=box(testData,code,lang,funcName);
  trueCode=box(testData,trueCode,lang,funcName);
  createFunction(exerciseId,lang,funcName,code,suffix);
  createFunction(exerciseId+"C","python",funcName,trueCode,"py");
  var function_res=deployFunction(exerciseId,lang,funcName);
  var correction_res=deployFunction(exerciseId+"C","python",funcName)
  var score = 0;
  if(function_res.result==correction_res.result){
    score =3;
  }
  return({score: score,time: function_res.time});
   
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
await createDir.dirExists(`./functions/${exerciseId}/${lang}/${funcName}/src/`);
fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/src/${funcName}.${suffix}`, code, err => {
    if(err) return console.log(err);
    console.log('succeed in writing source file');
})
//create the configuration file
await createDir.dirExists(`./functions/${exerciseId}/${lang}/${funcName}/`);
fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`, ymlConf, err => {
    if(err) return console.log(err);
    console.log('succeed in writing yml config file');
})





}

//deploy the function created on the openfaas
async function deployFunction(exerciseId,lang,funcName)
{
  const yml = `./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`;
  res= await fn.deploy(yml);
  return({result : res.res, time : res.duration})

}


function box(testData,code,lang,funcName){
  if(lang=="node") {
    head=`function box${funcName}(){
    test=${testData}[0];`;
    end=`return(${funcName}(test))}`;
  }
  if(lang=="python") {
    head=`def box${funcName}():
      test=${testData}[0]
      `;
    end=`
     return(${funcName}(test))`;
  }
return(head+code+end);
}



