
"use strict"
const func=require('./boxedhello_python_solutionc.js')
module.exports = (context, callback) => {
  var result=func.boxedhello_python_solutionc();
  if(!(result==undefined))
    console.log(result);
   return result;
}