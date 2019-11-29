

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
   return func.${funcName}();
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

module.exports = {
    getNodeCodeTemplet: getNodeCodeTemplet,
    getNodeFunctionCodeTemplet: getNodeFunctionCodeTemplet,
    getPythonCodeTemplet:getPythonCodeTemplet,
    getPythonFunctionCodeTemplet:getPythonFunctionCodeTemplet
}