async function box(testData,code,lang,funcName){
  head=``;
  end=``;
  isfunc=await isFunction(code,lang);
  if(testData.length>0&&testData[0].length>0)
    result=await ifHasInput(testData,funcName,lang,head,code,end,)
  else
    result=await ifNoInput(funcName,lang,head,code,end);
  return(result);
} 

async function ifNoInput( funcName,lang, head, code, end)
{
  if(lang=="python"){
    head=`def boxed${funcName}():\n\t\t`;
    end=`\n`;
    if(isfunc.answer)
        end=end+`\t\treturn(${isfunc.name}())`;
    code=await indent(code);
    result=await indent(head+code+end);
  }
  if (lang == "node"){
    head=`function boxed${funcName}(){\n`;
    if(isfunc.answer) 
      end=`return(${isfunc.name}())\n}`;
    else 
      end=`\n}`;
    result=head+code+end; 
  }
  return result;
}

async function ifHasInput(testData, funcName,lang, head, code, end)
{
  if(lang=="python")
    result = pyFuncWithInput(testData, funcName,lang, head, code, end)
  if (lang == "node") 
    result = nodeFuncWithInput(testData, funcName,lang, head, code, end)
  return result;
}

async function nodeFuncWithInput(testData, funcName,lang, head, code, end)
{
  head = `function boxed${funcName}() {\n\tvar input = [];\n\tvar output = [];\n\t`;
  for (var i=0; i<testData.length;i++) {
  head = head + `input.push(`
  for(var j=0;j<testData[i].length;j++)
  {
    //if testdata cannot be cast to a number
    if(!(typeof(testData[i][j])==="number")){
      if(typeof(testData[i][j])==="string"){
        var strTestData=[];
        for(var j=0;j<testData[i].length;j++)
            strTestData[j]="\'"+testData[i][j]+"\'";
        head=head+`[${strTestData}])\n\t`;
      }
    }
      if(testData[i][j] instanceof Array){
        var isLast,isFirst=false;
        if (j == 0) isFirst=true;
        if (j==testData[i].length-1)
          isLast=true;
        else
          isLast=false;
        head=await arrayFuncParam(testData[i][j],head,isLast,isFirst)
      }
      //otherwise, add the quotation marks
      if(typeof(testData[i][j])==="number"){
        head=head+`[${testData[i]}])\n\t`;
        break;
      }
   }
  }
  end=`\n\t`;
  if(isfunc.answer)
  {
    for (var i=0; i<testData.length;i++) 
    {
      end=end+`output.push(${isfunc.name}(`
      for(var j=0;j<testData[i].length;j++)
      {
        if(j!=testData[i].length-1)
          end=end+`input[${i}][${j}],`;
        else
          end=end+`input[${i}][${j}]))\n\t`;
      }
    }
    end=end+`return(output)}`;
  }
  else
  {
    end=end+`
    return(output)}`;
  }
  result=head+code+end;
  return result;
}


async function pyFuncWithInput(testData, funcName,lang, head, code, end)
{
  head=`def boxed${funcName}():\n\t\tinput=[]\n\t\toutput=[]\n\t\t`;
  for(var i=0;i<testData.length;i++)
  {
    head=head+`input.append(`;
    for(var j=0;j<testData[i].length;j++)
    {
      
      if(!(typeof(testData[i][j])==="number"))
      {
        if(typeof(testData[i][j])==="string")
        {
          var strTestData=[];
          for(var j=0;j<testData[i].length;j++)
              strTestData[j]="\'"+testData[i][j]+"\'";
          head=head+`[${strTestData}])\n\t\t`;
        }
        if(testData[i][j] instanceof Array)
        {
          var isLast,isFirst=false;
          if (j == 0) isFirst=true;
          if (j==testData[i].length-1)
            isLast=true;
          else
            isLast=false;
          head=await arrayFuncParam(testData[i][j],head,isLast,isFirst)
        }
      }
      else
      {
          head=head+`[${testData[i]}])\n\t\t`;
          break;
      }
    }
  }
 end=`\n\t\t`;
 if(isfunc.answer){
  for(var i=0;i<testData.length;i++)
  {
    end=end+`output.append(${isfunc.name}(` 
    for(var j=0;j<testData[i].length;j++)
    {
      if(j!=testData[i].length-1)
        end=end+`input[${i}][${j}],`;
      else
        end=end+`input[${i}][${j}]))\n\t\t`;
    }
  }
    end=end+`return(output)`;
  }
  else{
   end=end+`return(output)`;
  }
 code=await indent(code);
 result=await indent(head+code+end);
 return result;
}



async function arrayFuncParam(testData,head,isLast, isFirst)
{
  var strTestData=[];
  for(var i=0;i<testData.length;i++)
  {
    if(!(typeof(testData[i])==="number"))
    {
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


async function indent(code){
  if(process.platform=="linux"||process.platform=="win32")
  {
    while(code.includes("\n")){
      code = code.replace(/\n/g,"@@newline+indentation@@");}
    while(code.includes("@@newline+indentation@@")){
      code = code.replace("@@newline+indentation@@",/\n\t/g);
    }
    return code;
  }
  if(process.platform=="darwin")
  {
    // while(code.includes("\n")||code.includes("\r")||code.includes("\n\t")||code.includes("\r\t")){
    //   //code = code.replace("\r","@@newline+indentation@@");}
      code = code.replace(/\r/g,"\r\t");
    while(code.includes("@@newline+indentation@@")){
      code = code.replace("@@newline+indentation@@",/\r\t/g);
    } 
    return code;
  }
}

async function isFunction(code,lang)
{
  if(code.trim().split(" ")[0]=="function"&&lang=="node"){
    return{answer: true,name: code.split(" ")[1].split("(")[0]};
  }
  if(code.trim().split(" ")[0]=="def"&&lang=="python") {
    return{answer: true,name: code.split(" ")[1].split("(")[0]};
  }
  return{answer: false,name: "__"};
}

module.exports = {
    box: box,
    indent: indent,
    isFunction:isFunction
}