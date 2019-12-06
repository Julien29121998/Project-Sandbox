
/**
 * ----------------------------------------------------------------------------------------------------
 * This module is used to put the boxed funtion into the nodejs and python function templat of openfaas.
 * It can also check whether the unboxed code(user code) has imported modules or not, get these modules 
 * and separate them from user code because these modules are not going to be integrated inside the 
 * boxedfunction, but outside the boxedfunction.
 * ----------------------------------------------------------------------------------------------------
 */

module.exports = {
  getNodeFunctionCodeTemplate: getNodeFunctionCodeTemplate,
  getPythonFunctionCodeTemplate:getPythonFunctionCodeTemplate,
  getNodeImportedModule:getNodeImportedModule,
  ifNodeImprtedModule:ifNodeImprtedModule,
  getPythonImportedModule:getPythonImportedModule,
  ifPythonImprtedModule:ifPythonImprtedModule
}

/**
 * Function used to integrate the code of our boxed python function into the openfaas python handler template
 * 
 * @param {string} code The body of boxed python function
 * @param {string} funcName The name of boxed python function
 * 
 * @return {string} codeTemplate  The content of handler.py
 */

async function getPythonFunctionCodeTemplate(code,funcName){
  const codeTemplet=`def handle(req):
\t${code}
\treturn ${funcName}()`
  return codeTemplet;
}

/**
 * Function used to integrate the code of our boxed nodejs function into the openfaas nodejs handler template
 * 
 * @param {string} code The body of boxed nodejs function
 * @param {string} funcName The name of boxed nodejs function
 * 
 * @return {string} codeTemplate  The content of handler.js
 */
async function getNodeFunctionCodeTemplate(code,funcName){
  var codeTemplate=`
\"use strict\"
const func=require('./${funcName}.js')
module.exports = (context, callback) => {
  var result=func.${funcName}();
  if(!(result==undefined))
    console.log(result);
   return result;
}`
  return codeTemplate;
}


/**
 * Function used to check whether the nodejs unboxedCode (usercode) has imported modules
 * 
 * @param {string} unboxedCode 
 * @return true If nodejs unboxedCode has imported modules
 */
async function ifNodeImprtedModule(unboxedCode){
  return unboxedCode.indexOf("require")!=-1;
}

/**
 * Function used to check whether the python unboxedCode (usercode) has imported modules
 * 
 * @param {string} unboxedCode 
 * @return true If python unboxedCode has imported modules
 */
async function ifPythonImprtedModule(unboxedCode){
  return unboxedCode.indexOf("import")!=-1;
}

/**
 * Function used to get the imported modules of nodejs unboxedCode (usercode) and the unboxedCode
 * without the import statements.
 * 
 * @param {string} unboxedCode The body of nodejs unboxedCode
 * 
 * @return {Object} {modules:modules, code:rawCode}  
 */
async function getNodeImportedModule(unboxedCode){
  var flag="require";
  var modules='';
  if(unboxedCode.indexOf(flag)!=-1){
    var symNewLine;
    switch(process.platform){
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
        modules+=line+symNewLine;
      else
        rawCode+=line+symNewLine+'\t';
      
    });
    return {modules:modules, code:rawCode}
  }
  else
    return unboxedCode;
}

/**
 * Function used to get the imported modules of python unboxedCode (usercode) and the unboxedCode
 * without the import statements.
 * 
 * @param {string} unboxedCode The body of python unboxedCode
 * 
 * @return {Object} {modules:modules, code:rawCode}  
 */
async function getPythonImportedModule(unboxedCode){
  var flag="import";
  var modules='';
  if(unboxedCode.indexOf(flag)!=-1){
    var symNewLine;
    switch(process.platform){
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
        modules+=line+symNewLine;
      else
        rawCode+=line+symNewLine;
    });
    return {modules:modules, code:rawCode}
  }
  else
    return unboxedCode;
}



