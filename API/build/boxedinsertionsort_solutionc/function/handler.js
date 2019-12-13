
"use strict"
const func=require('./boxedinsertionsort_solutionc.js')
module.exports = (context, callback) => {
  var result=func.boxedinsertionsort_solutionc();
  if(!(result==undefined))
    console.log(result);
   return result;
}