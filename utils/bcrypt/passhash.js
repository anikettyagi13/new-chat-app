// const pass=[];

const randomize= (password,pass)=>{
    var length= password.length/2; 
    let t = pass.join('')
    let y=t
    for(let i=0;i<10;i++){
        let shuffPass = t.slice(6,y.length-7)
        shuffPass=shuffPass+t.slice(0,6);
        t = shuffPass+t.slice(y.length-7,y.length+1)
        } 
    return t;
}
const hash = (password)=>{
     yo= password
     const pass = [];
     for(let i=0;i<yo.length;i++){
         
         let code=yo.charCodeAt(i)
         code = code+191;
         let code2 = code+123;
         if(code>127){
             let c= code-127;
             code = 31+c;
             code2= 33+c
         }

         let last = String.fromCharCode(code);
         let oneChar = code2+"&%$"+last;
         pass.unshift(oneChar)
        //  console.log(pass);

     }
     
     return randomize(password,pass)
}

const compare =(password,comparable)=>{
   const pswd = hash(password)
   let isok = false;
   if(pswd == comparable){
       isok = true
   }
   return isok
}

module.exports = {
    hash,
    compare
}
// %$147&%$151&%$150&%$149&%$148&146&%$
// %$147&%$151&%$150&%$149&%$148&146&%$