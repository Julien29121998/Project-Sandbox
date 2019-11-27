const fs = require('fs');
const path = require('path');
const {deploy,invoke,call} = require('../../utils/fn');
const createDir=require('./mkdir')


//there should be a compile function that take some code, and a language, and compile it with some test data and compile the example code with the same test data and give back some feedback and a score which is the amount of succeded tests
exports.compile =  async (exerciseId,code,chosenLanguage,testData,trueCode,name) => {
  const lang=chosenLanguage;
  name="exerc";
  const funcName=name+"_solution";
  const trueFuncName=funcName+"c";
  //const code=req.body.code;
  //const exerciseId=req.params.exerciseId;
  var suffix="";
  //var truefuncName=funcName+'CORRECTION'
  //here we need to decide the suffix of src file depending on the language
  if(lang=="node") suffix="js";
  if(lang=="csharp") suffix="csproj";
  if(lang=="python")  suffix="py"
  code=await box(testData,code,lang,funcName);
  trueCode=await box(testData,trueCode,lang,funcName);
  await createFunction(exerciseId,lang,funcName,code,suffix);
  await createFunction(exerciseId+"C",lang,trueFuncName,trueCode,suffix);
  
  var function_res=await deployFunction(exerciseId,lang,funcName);
  var correction_res=await deployFunction(exerciseId+"C",lang,trueFuncName)
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
  var isCodeFunction=await isFunction(code);
  var codeContext;
  if(!isCodeFunction)
    codeContext=await getNodeCodeTemplet(code);
  else
    codeContext=await getNodeFunctionCodeTemplet(code,funcName);
  
  await createDirs(exerciseId,lang,funcName);
  //replace \n \r\n \r
  code=decodeCode(code);
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
  await createDirs(exerciseId,lang,funcName);
  //replace \n \r\n \r
  code=decodeCode(code);
codeContext=await getPythonCodeTemplet(code);
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

async function getPythonCodeTemplet(code)
{
  const codeTemplet=`def handle(req):
\t${code}`
  return codeTemplet;
}



async function getNodeFunctionCodeTemplet(code,funcName)
{
  var codeTemplet=`
\"use strict\"
${code}
module.exports = (context, callback) => {
   ${funcName}();
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
      head=`def boxed${funcName}():
      \tinput=[]
      \toutput=[]
      \t`;
      for(var i=0;i<testData.length;i++){
        head=head+`input.append(${testData[i]})
        \t`;
      }
      end=`
      \t`;
      if(isfunc.answer){
        for(var i=0;i<testData.length;i++){
          end=end+`output.append(${isfunc.name}(input[${i}]))
          \t`;
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
    }   
    result=head+code+end;
  }
  else{
    if(lang=="python"){
      head=`def boxed${funcName}():
      \t`;
        if(isfunc.answer){
          end=`
          \treturn(${isfunc.name}())`;
        }
        else{
          end=`
          \treturn(output)`;
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
  if(process.platform=="darwin")
  while(code.includes("\r\n")||code.includes("\n")){
    code = code.replace("\r\n","@@newline+indentaion@@").replace("\n","@@newline+indentaion@@");}
  if(process.platform=="win32")
  while(code.includes("\r\n")||code.includes("\n")){
    code = code.replace("\r\n","@@newline+indentaion@@");}
  while(code.includes("@@newline+indentaion@@")){
    code = code.replace("@@newline+indentaion@@","\r\n\t");
  }
  
  return code;
}