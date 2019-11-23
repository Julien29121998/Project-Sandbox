const fs = require('fs');
const deploy = require('../../utils/fn');


//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
exports.compile =  (funcName,code,lang,testData,trueCode) => {
  var suffix="";
  var truefuncName=funcName+'CORRECTION'
  //here we need to decide the suffix of src file depending on the language
  if(lang=="node") suffix="js";

  createFunction(lang,funcName,code,suffix);
  createFunction("Python",truefuncName,trueCode,"py");
  var function_res=deployFunction(lang,funcName);
  var correction_res=deployFunction("Python",truefuncName)
  var score = 0;
  if(function_res.result=correction_res.result){
    score =3;
  }
  return({score: score,time: function_res.time});
   
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
  res=deploy(yml);
  return({result : res.res, time : res.duration})

}

//then invoke both and compare IN PROGRESS


