/**
 * ----------------------------------------------------------------------------
 * This box module is used to create the content of the box function which packs 
 * up the user function. Using the same language of the user function, the box f
 * unction is created considering whether the user function has parameters and 
 * return values or not.
 * ----------------------------------------------------------------------------
 */

module.exports = {
  box: box
}


/**
 * Function used to create box function. THe box function is named in the format of
 * "boxed"+funcName where funcName is the name of user function.
 * 
 * @param {Array} testData testData of this exercise saved in db. Empty array if exampleFunc has no paramrers.
 * @param {string} code code of userFunc
 * @param {string} lang language of user code. "python" or "node"
 * @param {string} funcName name of user code. By default it's the name of exercise. It's used to create the name of box function
 * 
 * @return {string} result The boxedfunction completed
 */
async function box(testData,code,lang,funcName){
  //check whether user code is a function, if it's a function, isFunc.answer=true
  isFunc=await isFunction(code,lang);
  //if testData is not empty.
  //testData is an array of array, each element is a group of input parameters of user func
  if(testData.length>0 && testData[0].length>0 && isFunc.answer)
    result=await funcHasInput(testData,funcName,lang,code)
  //if testData is empty, create the box function for the usercode without parameters
  else
    result=await ifNoInput(funcName,lang,code,isFunc);
  return(result);
} 

/**
 * Function used to create box function for a userfunc without parameters 
 * and an exercise without input data.
 * @param {string} funcName name of user code. By default it's the name of exercise. It's used to create the name of box function
 * @param {string} lang language of user code. "python" or "node"
 * @param {string} code the user code
 * @param {Object} isFunc isFunc.answer=true if user code is a function
 * 
 * @return {string} result The boxedfunction completed
 */
async function ifNoInput( funcName,lang, code, isFunc){
  //the part in the boxfunc before user code
  head=``;
  //the part in the boxfunc after user code
  end=``;
  //for the user code in python
  if(lang=="python"){
    //the name of box function is "boxed"+name of the exercise
    head=`def boxed${funcName}():\n\t\t`;
    end=`\n`;
    //if user code is in a function, call this function and return its result in the 'end' 
    if(isFunc.answer)
        end=end+`\t\treturn(${isFunc.name}())`;
    code=await indent(code);
    result=await indent(head+code+end);
  }
  //for the user code in nodejs
  if (lang == "node"){
    head=`function boxed${funcName}(){\n`;
    //if user code is in a function, call this function and return its result in the 'end' 
    if(isFunc.answer) 
      end=`return(${isFunc.name}())\n}`;
    else 
      end=`\n}`;
    result=head+code+end; 
  }
  return result;
}


/**
 * Function used to create box function for the user code which is a function with paramter(s)
 * 
 * @param {Array} testData testData of this exercise saved in db. Empty array if exampleFunc has no paramrers.
 * @param {string} code code of userFunc
 * @param {string} lang language of user code. "python" or "node"
 * @param {string} funcName name of user code. By default it's the name of exercise. It's used to create the name of box function
 * 
 * @return {string} result The boxedfunction completed
 */
async function funcHasInput(testData, funcName,lang, code){
  var result;
  switch (lang){
    case "python":
      result = pyFuncWithInput(testData, funcName, code);
      break;
    case "node":
      result = nodeFuncWithInput(testData, funcName, code);
      break;
    default:
      throw new Error("Sorry, this language is not supported")
  }
  return result;
}


/**
 * Function used to check whether user function has a return value
 * 
 * @param {string} code user function
 * 
 * @returns true if user function has a return value
 */
async function ifFuncHasOutput(code){
  //var isFunc=await isFunction(code)
  if(isFunc.answer){
    var i=code.indexOf("return");
    return code.indexOf("return")!=-1;
  }
  else throw new Error("Trying to get return value from a non-functionnal user code") 
}


/**
 * Function used to create box function for the nodejs user function with parameters
 * 
 * @param {Array} testData testData of this exercise saved in db. Empty array if exampleFunc has no paramrers.
 * @param {string} funcName name of user code. By default it's the name of exercise. It's used to create the name of box function
 * @param {string} code code of userFunc
 * 
 * @return {string} result The nodejs boxedfunction completed
 */
async function nodeFuncWithInput(testData, funcName, code){
  head = `function boxed${funcName}() {\n\tvar input = [];\n\t`;
  hasOutPut= await ifFuncHasOutput(code)
  //if userfunc has return statement
  if(hasOutPut)
    //create a list to save its return value
    head +=`var output = [];\n\t`
  for (var i=0; i<testData.length;i++){
    head = head + `input.push(`
    for(var j=0;j<testData[i].length;j++){
      //if testdata[i] is an array of string
      if((typeof(testData[i][j])==="string")){
        var strTestData=[];
        for(var j=0;j<testData[i].length;j++)
            strTestData[j]="\'"+testData[i][j]+"\'";
        head=head+`[${strTestData}])\n\t`;
      }
      //if testdata[i] is an array of array
      if(testData[i][j] instanceof Array){
        var isLast,isFirst=false;
        if (j == 0) isFirst=true;
        if (j==testData[i].length-1)
          isLast=true;
        else
          isLast=false;
        //complete the head part, add all of the elements in testData[i][j] as an array into the input list
        head=await arrayFuncParam(testData[i][j],head,isLast,isFirst)
      }
      //if testdata[i] is an array of number
      if(typeof(testData[i][j])==="number"){
        head=head+`[${testData[i]}])\n\t`;
        break;
      }
    }
  }
  end=`\n\t`;
  //if user code is a function, call the function with parameters and save return values if necessary
  if(isFunc.answer){
    //if userfunc has return statement
    if(hasOutPut){
      //for every group of test data, push the execution result into the output list
      for (var i=0; i<testData.length;i++) {
        end=end+`output.push(${isFunc.name.trim()}(`
        //add the parameters of input list into the function call statement
        for(var j=0;j<testData[i].length;j++){
          if(j!=testData[i].length-1)
            end=end+`input[${i}][${j}],`;
          else
            end=end+`input[${i}][${j}]))\n\t`;
        }
      }
      //return the execution results of all testdata groups
      end=end+`return output\n`;
    }
    //if userfunc has no return statement, call the userfunc with parameters of input list 
    else 
      for(var i=0;i<testData.length;i++){
        end=end+`${isFunc.name}(` 
        for(var j=0;j<testData[i].length;j++){
          if(j!=testData[i].length-1)
            end=end+`input[${i}][${j}],`;
          else
            end=end+`input[${i}][${j}])\n\t`;
        }
      }
      end=end+`}\n`
  }
  //if user code is not a function, then just return
  else{
    end=end+`
    return }`;
  }
  result=head+code+end;
  return result;
}

/**
 * Function used to create box function for the python user function with parameters
 * 
 * @param {Array} testData 
 * @param {string} funcName 
 * @param {string} code 
 * 
 * @return {string} result The python boxedfunction completed
 */
async function pyFuncWithInput(testData, funcName, code){
  //input list is used to save the testData, each element is a group of testdata
  head=`def boxed${funcName}():\n\t\tinput=[]\n\t\t`;
  hasOutPut=await ifFuncHasOutput(code)
  //if userfunc has return statement
  if(hasOutPut)
    //create a list to save its return value
    head+=`output=[]\n\t\t`
  //for every group of test data, push the execution result into the output list
  for(var i=0;i<testData.length;i++){
    head=head+`input.append(`;
    for(var j=0;j<testData[i].length;j++){
      //if testdata[i] is an array of string
      if(typeof(testData[i][j])==="string"){
          var strTestData=[];
          for(var j=0;j<testData[i].length;j++)
              strTestData[j]="\'"+testData[i][j]+"\'";
          head=head+`[${strTestData}])\n\t\t`;
        }
      //if testdata[i] is an array of array
      if(testData[i][j] instanceof Array){
        var isLast,isFirst=false;
        if (j == 0) isFirst=true;
        if (j==testData[i].length-1)
          isLast=true;
        else
          isLast=false;
        //complete the head part, add all of the elements in testData[i][j] as an array into the input list
        head=await arrayFuncParam(testData[i][j],head,isLast,isFirst)
      }
      //if testdata[i] is an array of number
      if(typeof(testData[i][j])==="number"){
        head=head+`[${testData[i]}])\n\t\t`;
        break;
      }
    }
  }
  end=`\n\t\t`;
  //if user code is a function, call the function with parameters and save return values if necessary
  if(isFunc.answer ){ 
    //if userfunc has return statement 
    if(hasOutPut){
      //for every group of test data, push the execution result into the output list
      for(var i=0;i<testData.length;i++){
        end=end+`output.append(${isFunc.name.trim()}(` 
        //add the parameters of input list into the function call statement
        for(var j=0;j<testData[i].length;j++){
          if(j!=testData[i].length-1)
            end=end+`input[${i}][${j}],`;
          else
            end=end+`input[${i}][${j}]))\n\t\t`;
        }
      }
      //return the execution results of all testdata groups
      end=end+`return(output)`;
    }
    //if userfunc has no return statement, call the userfunc with parameters of input list 
    else{
      for(var i=0;i<testData.length;i++){
        end=end+`${isFunc.name.trim()}(` 
        for(var j=0;j<testData[i].length;j++){
          if(j!=testData[i].length-1)
            end=end+`input[${i}][${j}],`;
          else
            end=end+`input[${i}][${j}])\n\t\t`;
        }
      }
    }
  }
  //if user code is not a function, then just return
  else{
    end=end+`return`;
  }
  code=await indent(code);
  result = head + code + end;
  result=await indent(result);
  return result;
}


/**
 * Function used to complete the head string if the testData is a three-dimensional array,
 * which means the userFunc takes array parameter(s) of string or number
 * 
 * @param {Array} testData an array parameter of user function
 * @param {string} head 
 * @param {boolean} isLast true if testData is the first parameter of user function, false otherwise
 * @param {boolean} isFirst true if testData is the last parameter of user function, false otherwise
 * 
 * @return {string} head The head string completed with an array of elements in testData
 */
async function arrayFuncParam(testData, head, isLast, isFirst){
  var strTestData=[];
  for(var i=0;i<testData.length;i++){
    if(!(typeof(testData[i])==="number")){
      if(typeof(testData[i])==="string")
        strTestData[i]="\'"+testData[i]+"\'"  
    }
    else
      strTestData=testData;
  }
  if(isFirst)
    head=head+'['
  if(isLast)
    head=head+`[${strTestData}]])\n\t\t`;
  else
    head=head+`[${strTestData}],`;
  return head;
}

/**
 * Function used to add one indentation each time there's a new line in the python userfunc.
 * This is because the userfunc is goint to be integrated in the box function
 * 
 * @param {string} code 
 * 
 * @return {string} code The code with more indentations
 */
async function indent(code){
  if(process.platform=="linux"||process.platform=="win32"){
    while(code.includes("\n")){
      code = code.replace(/\n/g,"@@newline+indentation@@");}
    while(code.includes("@@newline+indentation@@")){
      code = code.replace("@@newline+indentation@@",/\n\t/g);
    }
    return code;
  }
  if(process.platform=="darwin"){
    // while(code.includes("\n")||code.includes("\r")||code.includes("\n\t")||code.includes("\r\t")){
    //   //code = code.replace("\r","@@newline+indentation@@");}
      code = code.replace(/\r/g,"\r\t");
    while(code.includes("@@newline+indentation@@")){
      code = code.replace("@@newline+indentation@@",/\r\t/g);
    } 
    return code;
  }
}


/**
 * Function used to check whether user code is a function or not, for python and nodejs
 * 
 * @param {string} code 
 * @param {string} lang 
 * 
 * @return {Object} With attribute answer which is true if user code is a function and false otherwise,
 *                  attribute name which is the function name if the user code is a function and "__" otherwise.
 */
async function isFunction(code,lang){
  //if(code.trim().split(" ")[0]=="function"&&lang=="node"){
    if(code.indexOf("function") != -1&&lang=="node"){
    return{answer: true,name: code.trim().split("function")[1].split("(")[0]};
  }
  //if(code.trim().split(" ")[0]=="def"&&lang=="python") {
    if(code.indexOf("def") != -1&&lang=="python") {
    return{answer: true,name: code.trim().split("def")[1].split("(")[0]};
  }
  return{answer: false,name: "__"};
}

