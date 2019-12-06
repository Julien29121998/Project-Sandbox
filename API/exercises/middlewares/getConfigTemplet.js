/**
 * This module is used to create the content of YML configuration file for nodejs and python functions,
 * create the content of package.json for nodejs functions
 * 
 */
module.exports={
  getYmlTemplet:getYmlTemplet,
  getPackageConf:getPackageConf
}

/**
 * Function used to create the content of YML configuration file
 * 
 * @param {string} exerciseId 
 * @param {string} lang 
 * @param {string} funcName 
 * 
 * @return {string} ymlConf The content of YML configuration  file
 */
function getYmlTemplet(exerciseId,lang,funcName){
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


/**
 * Function used to create the content of package.json file for nodejs functions
 * 
 * @param {string} funcName 
 * 
 * @return {string} packageConf The content of package.json file
 */
function getPackageConf(funcName){
  const packageConf=`{
    \"name\": \"${funcName}\",
    \"version\": \"0.0.1\",
    \"main\": \"handler.js\"
  }
  `
  return packageConf;
}

