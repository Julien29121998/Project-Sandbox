
"use strict"
const func=require('./boxedfibonaci_solutionc.js')
module.exports = (context, callback) => {
  var result=func.boxedfibonaci_solutionc();
  if(!(result==undefined))
    console.log(result);
   return result;
}