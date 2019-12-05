

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



async function getNodeFunctionCodeTemplet(code,funcName)
{
  var codeTemplet=`
\"use strict\"
const func=require('./${funcName}.js')
module.exports = (context, callback) => {
  var result=func.${funcName}();
  if(!(result==undefined))
    console.log(result);
   return result;
}`
  return codeTemplet;
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

async function ifNodeImprtedModule(unboxedCode)
{
  return unboxedCode.indexOf("require")!=-1;
}

async function ifPythonImprtedModule(unboxedCode)
{
  return unboxedCode.indexOf("import")!=-1;
}

async function getNodeImportedModule(unboxedCode)
{
  var flag="require";
  var modules='';
  if(unboxedCode.indexOf(flag)!=-1)
  {
    var symNewLine;
    switch(process.platform)
    {
      case ('linux'):
        symNewLine='\n';
        break;
      case('darwin'):
        symNewLine='\r';
        break;
      case ('win32'):
        symNewLine='\r\n';

    }
    var lines=unboxedCode.split(symNewLine);
    var rawCode="";
    lines.forEach(line => {
      if(line.indexOf(flag)!=-1)
      {
        modules+=line+symNewLine;
      }
      else
        rawCode+=line+symNewLine+'\t';
      
    });
    //unboxedCode.replace(modules,symNewLine);
    return {modules:modules, code:rawCode}

  }
  else
    return unboxedCode;
  
}

async function getPythonImportedModule(unboxedCode)
{
  var flag="import";
  var modules='';
  if(unboxedCode.indexOf(flag)!=-1)
  {
    var symNewLine;
    switch(process.platform)
    {
      case ('linux'):
        symNewLine='\n';
        break;
      case('darwin'):
        symNewLine='\r';
        break;
      case ('win32'):
        symNewLine='\r\n';

    }
    var lines=unboxedCode.split(symNewLine);
    var rawCode="";
    lines.forEach(line => {
      if(line.indexOf(flag)!=-1)
      {
        modules+=line+symNewLine;
      }
      else
        rawCode+=line+symNewLine;
      
    });
    //unboxedCode.replace(modules,symNewLine);
    return {modules:modules, code:rawCode}

  }
  else
    return unboxedCode;
  
}



module.exports = {
    getNodeCodeTemplet: getNodeCodeTemplet,
    getNodeFunctionCodeTemplet: getNodeFunctionCodeTemplet,
    getPythonCodeTemplet:getPythonCodeTemplet,
    getPythonFunctionCodeTemplet:getPythonFunctionCodeTemplet,
    getNodeImportedModule:getNodeImportedModule,
    ifNodeImprtedModule:ifNodeImprtedModule,
    getPythonImportedModule:getPythonImportedModule,
    ifPythonImprtedModule:ifPythonImprtedModule
}