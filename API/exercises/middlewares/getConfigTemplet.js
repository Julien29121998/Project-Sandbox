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

module.exports={
    getYmlTemplet:getYmlTemplet,
    getPackageConf:getPackageConf

}