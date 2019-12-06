const fs = require('fs');
const {deploy} = require('../../utils/fn');
const createDir=require('./mkdir');
const {box}=require('./box');
const {getNodeFunctionCodeTemplet,getPythonFunctionCodeTemplet,
  ifNodeImprtedModule,getNodeImportedModule,
  ifPythonImprtedModule,getPythonImportedModule}=require('./getCodeTemplet');
const {getYmlTemplet,getPackageConf}=require('./getConfigTemplet');

//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
exports.compile =  async (exerciseId,code,chosenLanguage,testData,trueCode,trueCodeLang,name) => {
  const lang=chosenLanguage;
  var funcName=name+"_solution";
  var trueFuncName=funcName+"c";
  var suffix="", suffixTrueCode="";
  suffix=await getSuffix(lang);
  suffixTrueCode=await getSuffix(trueCodeLang); 
  var modulesCode,modulesTrueCode;
  
  code=await decodeCode(code);
  trueCode=await decodeCode(trueCode);
  if(lang=="node" && await ifNodeImprtedModule(code)==true)
  {    
    //check whether user's code imported modules
    var res = await getNodeImportedModule(code);
    code=res.code;
    modulesCode=res.modules;
  }
  if(trueCodeLang=="node" && await ifNodeImprtedModule(trueCode)==true)
  {
    //check whether truecode imported modules
    var res = await getNodeImportedModule(trueCode);
    trueCode=res.code;
    modulesTrueCode=res.modules;
  }
  if(lang=="python"&&await ifPythonImprtedModule(code)==true)
  {
    //check whether user's code imported modules
    var res = await getPythonImportedModule(code);
    code=res.code;
    modulesCode=res.modules;
  }
  if(trueCodeLang=="python"&&await ifPythonImprtedModule(trueCode)==true)
  {
    //check whether truecode imported modules
    var res = await getPythonImportedModule(trueCode);
    trueCode=res.code;
    modulesTrueCode=res.modules;
  }
  code= await box(testData,code,lang,funcName);
  trueCode=await box(testData,trueCode,trueCodeLang,trueFuncName);
  funcName="boxed"+funcName;
  trueFuncName="boxed"+trueFuncName;
  await createFunction(exerciseId,lang,funcName,code,suffix,modulesCode);
  await createFunction(exerciseId+"c",trueCodeLang,trueFuncName,trueCode,suffixTrueCode,modulesTrueCode);
  var func_res_promise= deployFunction(exerciseId,lang,funcName);
  var corr_res_promise= deployFunction(exerciseId+"c",trueCodeLang,trueFuncName)
  var function_res = await func_res_promise;
  var correction_res = await corr_res_promise;
  var score = 0;
  if(function_res.res==correction_res.res){
    score =3;
  }
  console.log("result:"+function_res.res);
  console.log("true answer:"+correction_res.res);
  console.log("point: "+score);
  return({score: score, time: function_res.duration, result: function_res.res}); 
  //return function_res;
};
async function getSuffix(lang)
{
  switch(lang){
    case "node":
      suffix="js";
      break;
    case "python":
      suffix="py";
      break;
    default:
      var errmsg="Sorry, language unsupported";
      console.log(errmsg)
      return {err: errmsg}
  }
  return suffix;
}

//create a new node function
async function createFunction(exerciseId,lang,funcName,code,suffix,modules)
{
  
  if(lang=="node")
    createNodeFunction(exerciseId,lang,funcName,code,suffix,modules);
  if(lang=="python")
    createPythonFunction(exerciseId,lang,funcName,code,suffix,modules);
  
  
}

async function createNodeFunction(exerciseId,lang,funcName,code,suffix,modules)
{
  var ymlConf=getYmlTemplet(exerciseId,lang,funcName);
  var packageConf=getPackageConf(funcName);
  var codeContext;
  codeContext=await getNodeFunctionCodeTemplet(code,funcName);
  code=`exports.${funcName}=${funcName}\n`+code;
  await createDirs(exerciseId,lang,funcName);
  if(!(modules==undefined))
    code=modules+getNewLineSymb()+code;
  code=await decodeCode(code);
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
async function createPythonFunction(exerciseId,lang,funcName,code,suffix,modules)
{
  var ymlConf=getYmlTemplet(exerciseId,lang,funcName);
  var codeContext;
  await createDirs(exerciseId,lang,funcName);
  //replace \n \r\n \r
  //code=await decodeCode(code);
  codeContext=await getPythonFunctionCodeTemplet(code,funcName);
  if(!(modules==undefined))
    codeContext=modules+getNewLineSymb()+codeContext;
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



async function createDirs(exerciseId,lang,funcName)
{
  await createDir.dirExists(`./functions/${exerciseId}/${lang}/${funcName}/`);
  await createDir.dirExists(`./functions/${exerciseId}/${lang}/${funcName}/src/`); 
}


async function decodeCode(code)
{
  if(process.platform=="darwin")
    code = code.replace(/\r\n/g,"\r").replace(/\n/g,"\r");
  if(process.platform=="win32")
    code = code.replace(/\r\n/g,"\r\n");
  if(process.platform=="linux")
    code=code.replace(/\r\n/g,'\n');
  
  return code;
      
}

function getNewLineSymb()
{
  switch(process.platform)
  {
    case("darwin"):
      return "\r";
    case("linux"):  
      return "\n";
    case("win32"):
      return "\r\n";
  }
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



