const fs = require('fs');
const path = require('path');
const {deploy,invoke,call} = require('../../utils/fn');
const createDir=require('./mkdir')


//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
exports.compile =  async (exerciseId,code,chosenLanguage,testData,trueCode,name) => {
  const lang=chosenLanguage;
  var funcName=name+"_solution";
  var trueFuncName=funcName+"c";
  //const code=req.body.code;
  //const exerciseId=req.params.exerciseId;
  var suffix="";
  //var truefuncName=funcName+'CORRECTION'
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
    codeContext=await getPythonFunctionCodeTemplet(code,funcName);
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

function getYmlTemplet(exerciseId,lang,funcName)
{
  const ymlConf=`version: 1.0
provider:
  name: openfaas
  gateway: http://127.0.0.1:8080
functions:
  ${funcName}:
    lang: ${lang}
    handler: ./functions/${exerciseId}/${lang}/${funcName}/src/
    image: ${lang}_${funcName}:latest
`
 
  return ymlConf;
}

async function getNodeCodeTemplet(code)
{
  const codeTemplet=`
\"use strict\"
module.exports = (context, callback) => {
   ${code};
}`
  return codeTemplet;
}

async function getPythonFunctionCodeTemplet(code,funcName)
{
  const codeTemplet=`def handle(req):
\t${code}
\treturn ${funcName}()`
  return codeTemplet;
}

async function getPythonCodeTemplet(code,funcName)
{
  const codeTemplet=`def handle(req):
\t${code}
`
  return codeTemplet;
}



async function getNodeFunctionCodeTemplet(code,funcName,exerciseId)
{
  var codeTemplet=`
\"use strict\"
const func=require('./${funcName}.js')
module.exports = (context, callback) => {
   console.log( func.${funcName}());
}`
  return codeTemplet;
}

function getPackageConf(funcName)
{
  const packageConf=`{
    \"name\": \"${funcName}\",
    \"version\": \"0.0.1\",
    \"main\": \"handler.js\"
  }
  `
  return packageConf;
}

async function isFunction(code,lang)
{
  if(code.split(" ")[0]=="function"&&lang=="node"){
    return{answer: true,name: code.split(" ")[1].split("(")[0]};
  }
  if(code.split(" ")[0]=="def"&&lang=="python") {
    return{answer: true,name: code.split(" ")[1].split("(")[0]};
  }
  return{answer: false,name: "__"};
}


async function box(testData,code,lang,funcName){
  head=``;
  end=``;
 isfunc=await isFunction(code,lang);
 if(testData.length>0){
   if(lang=="python"){
     head=`def boxed${funcName}():\n\tinput=[]\n\toutput=[]\n\t`;
     for(var i=0;i<testData.length;i++){
       head=head+`input.append(${testData[i]})\n\t`;
     }
     end=`\n\t`;
     if(isfunc.answer){
       for(var i=0;i<testData.length;i++){
         end=end+`output.append(${isfunc.name}(input[${i}]))\n\t`;
       }
       end=end+`return(output)`;
     }
     else{
       end=end+`return(output)`;
     }
     code=await indent(code);
     result=await indent(head+code+end);
   }
   if (lang == "node") {
     head = `function boxed${funcName}() {
       var input = [];
       var output = [];`;
     for (var i=0; i<testData.length;i++) {
       head = head + `input.push(${testData[i]})`;
     }
     if(isfunc.answer){
       for(var i=0;i<testData.length;i++){
         end=end+`output.push(${isfunc.name}(input[${i}]))`;
       }
       end=end+`
       return(output)}`;
     }
     else{
       end=end+`
       return(output)}`;
     }
     result=head+code+end;
   }    
 }
 else{
   if(lang=="python"){
     head=`def boxed${funcName}():\n\t`;
     end=`\n`;
       if(isfunc.answer){
         end=end+`\treturn(${isfunc.name}())`;
       }
       else{
         end=end+`\treturn(output)`;
       }
       code=await indent(code);
       result=await indent(head+code+end);
   }
   if (lang == "node"){
     head=`function boxed${funcName}(){`;
       if(isfunc.answer){
         end=`return(${isfunc.name}())}`;
       }
       else{
         end=`return(output)}`;
       }
       result=head+code+end;
       
   }

 }
 return(result);
} 
async function indent(code){
  var os=process.platform;
  if(process.platform=="linux"||process.platform=="win32")
  {
    while(code.includes("\n")){
      code = code.replace("\n","@@newline+indentation@@");}
    while(code.includes("@@newline+indentation@@")){
      code = code.replace("@@newline+indentation@@","\n\t");
    }
    
    return code;
  }
  if(process.platform=="darwin")
  {
    while(code.includes("\n")){
      code = code.replace("\n","@@newline+indentation@@");}
    while(code.includes("@@newline+indentation@@")){
      code = code.replace("@@newline+indentation@@","\n\t");
    }
    
    return code;
  }

}