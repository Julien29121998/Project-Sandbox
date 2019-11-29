const fs = require('fs');
const path = require('path');
const {deploy,invoke,call} = require('../../utils/fn');
const createDir=require('./mkdir');
const {box,isFunction}=require('./box');
const {getNodeCodeTemplet,getNodeFunctionCodeTemplet,getPythonCodeTemplet,getPythonFunctionCodeTemplet}=require('./getCodeTemplet');
const {getYmlTemplet,getPackageConf}=require('./getConfigTemplet');

//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
exports.compile =  async (exerciseId,code,chosenLanguage,testData,trueCode,name) => {
  const lang=chosenLanguage;
  var funcName=name+"_solution";
  var trueFuncName=funcName+"c";
  var suffix="";
  //here we need to decide the suffix of src file depending on the language
  if(lang=="node") suffix="js";
  if(lang=="csharp") suffix="csproj";
  if(lang=="python")  suffix="py"
  code=await box(testData,code,lang,funcName);
  trueCode=await box(testData,trueCode,lang,trueFuncName);
  funcName="boxed"+funcName;
  trueFuncName="boxed"+trueFuncName;
  await createFunction(exerciseId,lang,funcName,code,suffix);
  await createFunction(exerciseId+"c",lang,trueFuncName,trueCode,suffix);
  var function_res=await deployFunction(exerciseId,lang,funcName);
  var correction_res=await deployFunction(exerciseId+"c",lang,trueFuncName)
  var score = 0;
  if(function_res.res==correction_res.res){
    score =3;
  }
  console.log("result:"+function_res.res);
  console.log("true answer:"+correction_res.res);
  console.log("point: "+score);
  return({score: score,time: function_res.duration}); 
  //return function_res;
};

//create a new node function
async function createFunction(exerciseId,lang,funcName,code,suffix)
{
  if(lang=="node")
    createNodeFunction(exerciseId,lang,funcName,code,suffix);
  if(lang=="python")
    createPythonFunction(exerciseId,lang,funcName,code,suffix);
  
  
}

async function createNodeFunction(exerciseId,lang,funcName,code,suffix)
{
  var ymlConf=getYmlTemplet(exerciseId,lang,funcName);
  var packageConf=getPackageConf(funcName);
  var isCodeFunction=await isFunction(code,lang);
  var codeContext;
  if(!isCodeFunction.answer)
  
    codeContext=await getNodeCodeTemplet(code);
  else
  {
    codeContext=await getNodeFunctionCodeTemplet(code,funcName,exerciseId);
    code=`exports.${funcName}=${funcName}
    `+code;
  }
  
  await createDirs(exerciseId,lang,funcName);
  //replace \n \r\n \r
  code=decodeCode(code);
  //create function source file
  fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/src/${funcName}.${suffix}`, code, err => {
    if(err) return console.log(err);
    console.log('succeed in writing source file');
})
  fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/src/handler.${suffix}`, codeContext, err => {
      if(err) return console.log(err);
      console.log('succeed in writing handler source file');
  })
  //create the yml config file
  fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`, ymlConf, err => {
      if(err) return console.log(err);
      console.log('succeed in writing yml config file');
  })
  //create the package.json file
  fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/src/package.json`, packageConf, err => {
    if(err) return console.log(err);
    console.log('succeed in writing package json config file');
  })
}
async function createPythonFunction(exerciseId,lang,funcName,code,suffix)
{
  var ymlConf=getYmlTemplet(exerciseId,lang,funcName);
  var codeContext;
  var isCodeFunction=await isFunction(code,lang);
  await createDirs(exerciseId,lang,funcName);
  //replace \n \r\n \r
  code=decodeCode(code);
  if(isCodeFunction)
    codeContext=await getPythonFunctionCodeTemplet(code,funcName);
  else
    codeContext=await getPythonCodeTemplet(code,funcName);
  //create function source file
  fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/src/handler.${suffix}`, codeContext, err => {
      if(err) return console.log(err);
      console.log('succeed in writing source file');
  })
  //create the yml config file
  fs.writeFile(`./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`, ymlConf, err => {
      if(err) return console.log(err);
      console.log('succeed in writing yml config file');
  })
  
}

  //fs.writeFileSync(dst, fs.readFileSync(src));


async function createDirs(exerciseId,lang,funcName)
{
  await createDir.dirExists(`./functions/${exerciseId}/${lang}/${funcName}/`);
  await createDir.dirExists(`./functions/${exerciseId}/${lang}/${funcName}/src/`); 
}


function decodeCode(code)
{
  if(process.platform=="darwin")
    code = code.replace("\r\n","\r").replace("\n","\r");
  if(process.platform=="win32")
    code = code.replace("\r\n","\n");
  
  return code;
      
}

//deploy the function created on the openfaas
async function deployFunction(exerciseId,lang,funcName)
{
  const yml = `./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`;
  //const yml="./functions/csharp/helloworld/helloworld.yml";
  var res=await deploy(yml);
  console.log(res.res);
  return res;

}



