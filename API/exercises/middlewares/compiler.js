const fs = require('fs');
const {deploy,remove} = require('../../utils/fn');
const createDir=require('./mkdir');
const {box}=require('./box');
const {getNodeFunctionCodeTemplate: getNodeFunctionCodeTemplet,getPythonFunctionCodeTemplate: getPythonFunctionCodeTemplet,
  ifNodeImprtedModule,getNodeImportedModule,
  ifPythonImprtedModule,getPythonImportedModule}=require('./getCodeTemplet');
const {getYmlTemplet,getPackageConf}=require('./getConfigTemplet');

/**
 * -------------------------------------------------------------------------------------------
 * This module is used to deploy the user function and correct function on OpenFaas, call them,
 * , return the execution result, execution time of user code, and the score after comparing the 
 * result of user function and correct function. Two languages supported currently: Python and NodeJs
 * ------------------------------------------------------------------------------------------
 */

exports.compile =  compile


/**
 * Function used to create function directories, deploy functions, get execution results and return
 * execution result, execution time and score of user code for both of the two languages
 * 
 * @param {string} exerciseId 
 * @param {string} code user code
 * @param {string} lang language of user code, "python" or "node"
 * @param {Array} testData testData of this exercise
 * @param {string} trueCode exampleCode of this exercise
 * @param {string} trueCodeLang the language of exampleCode
 * @param {string} name exercise name
 * 
 * @return {Object} With attributes score, time, result
 */
async function compile (exerciseId,code,lang,testData,trueCode,trueCodeLang,name) {
  //the name of function created using user code
  var funcName=name+"_solution";
  //the name of correct function created using example code
  var trueFuncName=funcName+"c";
  //get suffix for each function according to their language
  var suffix="", suffixTrueCode="";
  suffix=await getSuffix(lang);
  suffixTrueCode=await getSuffix(trueCodeLang); 
  //replace the special characters according to the os
  code=await decodeCode(code);
  trueCode=await decodeCode(trueCode);
  //For each user code and example code, check whether it has imported modules, 
  //get them and the code without import statements if it's the case.
  var modulesCode ;
  var modulesTrueCode ;
  if(lang=="node" && await ifNodeImprtedModule(code)==true){    
    //check whether user's code imported modules
    var res = await getNodeImportedModule(code);
    code=res.code;
    modulesCode=res.modules;
  }
  if(trueCodeLang=="node" && await ifNodeImprtedModule(trueCode)==true){
    //check whether truecode imported modules
    var res = await getNodeImportedModule(trueCode);
    trueCode=res.code;
    modulesTrueCode=res.modules;
  }
  if(lang=="python"&&await ifPythonImprtedModule(code)==true){
    //check whether user's code imported modules
    var res = await getPythonImportedModule(code);
    code=res.code;
    modulesCode=res.modules;
  }
  if(trueCodeLang=="python"&&await ifPythonImprtedModule(trueCode)==true){
    //check whether truecode imported modules
    var res = await getPythonImportedModule(trueCode);
    trueCode=res.code;
    modulesTrueCode=res.modules;
  }
  //get the boxed user function
  code= await box(testData,code,lang,funcName);
  //get the boxed example function
  trueCode=await box(testData,trueCode,trueCodeLang,trueFuncName);
  funcName="boxed"+funcName;
  trueFuncName="boxed"+trueFuncName;
  //create the function directories, source file, configuration file
  await createFunction(exerciseId,lang,funcName,code,suffix,modulesCode);
  await createFunction(exerciseId+"c",trueCodeLang,trueFuncName,trueCode,suffixTrueCode,modulesTrueCode);
  //deploy the two functions on OpenFaas in parallel and get the execution results 
  var func_res_promise= deployFunction(exerciseId,lang,funcName);
  var corr_res_promise= deployFunction(exerciseId+"c",trueCodeLang,trueFuncName)
  var function_res = await func_res_promise;
  var correction_res = await corr_res_promise;
  var score = 0;
  //compare two execution results
  if(function_res.res==correction_res.res){
    score =3;
  }
  var rm_func_promise = removeFunction (exerciseId, lang, funcName);
  var rm_corr_func_promise = removeFunction (exerciseId+"c", trueCodeLang, trueFuncName);
  var rm_function_res = await rm_func_promise;
  var rm_corr_func_res = await rm_corr_func_promise;
  console.log("result:"+function_res.res);
  console.log("true answer:"+correction_res.res);
  console.log("point: "+score);
  console.log(rm_function_res);
  console.log(rm_corr_func_res);    
  return({score: score, time: function_res.duration, result: function_res.res}); 
};


/**
 * Function used to get the source file fuffix according to the language
 * 
 * @param {string} lang 
 * 
 * @return {string} suffix  "js" for NodsJs, "py" for Python
 */
async function getSuffix(lang){
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

/**
 * Function used to create the user or example function directories, source file,
 *  configuration files, for both python functions and nodejs functions
 * 
 * @param {string} exerciseId 
 * @param {string} lang language of the function
 * @param {string} funcName 
 * @param {string} code the code without import statements
 * @param {string} suffix "py" or "js"
 * @param {string} modules the import statements 
 */
async function createFunction(exerciseId,lang,funcName,code,suffix,modules){
  switch(lang){
    case "node":
      createNodeFunction(exerciseId,lang,funcName,code,suffix,modules);
      break;
    case "python":
      createPythonFunction(exerciseId,lang,funcName,code,suffix,modules);
      break;
    default:
      throw new Error("Sorry, language not supported")
  }  
}

/**
 * Function used to create the user or example function directories, source file,
 * configuration files, for nodejs functions.
 * 
 * @param {string} exerciseId 
 * @param {string} lang 
 * @param {string} funcName 
 * @param {string} code 
 * @param {string} suffix 
 * @param {string} modules 
 */
async function createNodeFunction(exerciseId,lang,funcName,code,suffix,modules){
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

/**
 * Function used to create the user or example function directories, source file,
 * configuration files, for Python functions.
 * 
 * @param {string} exerciseId 
 * @param {string} lang 
 * @param {string} funcName 
 * @param {string} code 
 * @param {string} suffix 
 * @param {string} modules 
 */
async function createPythonFunction(exerciseId,lang,funcName,code,suffix,modules){
  var ymlConf=getYmlTemplet(exerciseId,lang,funcName);
  var codeContext;
  await createDirs(exerciseId,lang,funcName);
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


/**
 * Function used to create directories and source directory for a function
 * 
 * @param {string} exerciseId 
 * @param {string} lang 
 * @param {string} funcName 
 */
async function createDirs(exerciseId,lang,funcName){
  await createDir.createDir(`./functions/${exerciseId}/${lang}/${funcName}/`);
  await createDir.createDir(`./functions/${exerciseId}/${lang}/${funcName}/src/`); 
}

/**
 * Function used to replace the line break in the code according to the OS
 * 
 * @param {string} code 
 */
async function decodeCode(code){
  if(process.platform=="darwin")
    code = code.replace(/\r\n/g,"\r").replace(/\n/g,"\r");
  if(process.platform=="win32")
    code = code.replace(/\r\n/g,"\r\n");
  if(process.platform=="linux")
    code=code.replace(/\r\n/g,'\n');
  return code;     
}

/**
 * Function used to get the line break under a certain OS
 */
function getNewLineSymb(){
  switch(process.platform){
    case("darwin"):
      return "\r";
    case("linux"):  
      return "\n";
    case("win32"):
      return "\r\n";
  }
}

/**
 * Function used to deploy the function on the openfaas using YML config file,
 * return the execution result and time.
 * 
 * @param {string} exerciseId 
 * @param {string} lang 
 * @param {string} funcName 
 * 
 * @return {Object} {duration, res, functionPath}
 */
async function deployFunction(exerciseId,lang,funcName){
  const yml = `./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`;
  var res=await deploy(yml);
  console.log(res.res);
  return res;
}

async function removeFunction(exerciseId,lang,funcName){
  const yml = `./functions/${exerciseId}/${lang}/${funcName}/${funcName}.yml`;
  var res=await remove(yml);
  console.log(res.res);
  return res;
}




