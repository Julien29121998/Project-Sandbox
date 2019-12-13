
"use strict"
const func=require('./boxedinsertionsort_solution.js')
module.exports = (context, callback) => {
  var result=func.boxedinsertionsort_solution();
  if(!(result==undefined))
    console.log(result);
   return result;
}