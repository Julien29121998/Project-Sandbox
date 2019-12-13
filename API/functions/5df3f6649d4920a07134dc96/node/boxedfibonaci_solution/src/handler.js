
"use strict"
const func=require('./boxedfibonaci_solution.js')
module.exports = (context, callback) => {
  var result=func.boxedfibonaci_solution();
  if(!(result==undefined))
    console.log(result);
   return result;
}