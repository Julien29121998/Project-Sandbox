async function box(testData,code,lang,funcName){
    head=``;
    end=``;
   isfunc=await isFunction(code,lang);
   if(testData.length>0&&testData[0].length>0){
     if(lang=="python"){
       head=`def boxed${funcName}():\n\t\tinput=[]\n\t\toutput=[]\n\t\t`;
        for(var i=0;i<testData.length;i++)
        {
          head=head+`input.append(`;
          for(var j=0;j<testData[i].length;j++)
          {
            
            if(!(typeof(testData[i][j])==="number"))
            {
                var strTestData=[];
                for(var j=0;j<testData[i].length;j++)
                    strTestData[j]="\'"+testData[i][j]+"\'";
                head=head+`[${strTestData}])\n\t\t`;
            }
            else
                head=head+`[${testData[i]}])\n\t\t`;
            break;
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
     }
     if (lang == "node") {
       head = `function boxed${funcName}() {
         var input = [];
         var output = [];\n\t`;
       for (var i=0; i<testData.length;i++) {
           //if testdata can be cast to a number
           if(!isNaN(testData))
                head = head + `input.push(${testData[i]})\n\t`;
            //otherwise, add the quotation marks
            else
                head = head + `input.push('${testData[i]}')\n\t`;
       }
       end=`\n\t`;
       if(isfunc.answer){
        end=end+`output.push(${isfunc.name}(`
        for(var i=0;i<testData.length;i++){
            if(i!=testData.length-1)
               end=end+`input[${i}],`;
            else
               end=end+`input[${i}]))\n\t`;
        }
        //  for(var i=0;i<testData.length;i++){
        //    end=end+`output.push(${isfunc.name}(input[${i}]))`;
        //  }
         end=end+`
         return(output)}`;
       }
       else{
         end=end+`
         return(output)}`;
       }
       result=head+code+end;
     }    
   }
   else{
     if(lang=="python"){
       head=`def boxed${funcName}():\n\t\t`;
       end=`\n`;
         if(isfunc.answer){
           end=end+`\t\treturn(${isfunc.name}())`;
         }
        //  else{
        //    end=end+`\treturn(output)`;
        //  }
         code=await indent(code);
         result=await indent(head+code+end);
     }
     if (lang == "node"){
       head=`function boxed${funcName}(){`;
         if(isfunc.answer){
           end=`return(${isfunc.name}())}`;
         }
          else{
            end=`}`;
          }
         result=head+code+end;
         
     }
  
   }
   return(result);
  } 


  async function indent(code){
    var os=process.platform;
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