// var p = 5557;
// var q = 8999;
// var n = p*q;
// var t = (p-1)(q-1);
// var e = 3001;
// var baseD = 22889113
//   = 49992888
console.log("LOADED")
var db=firebase.database();

function findPrime(a) {
    max = 104730;
    var sieve = [], i, j, primes = [];
    for (i = 2; primes.length!=a; ++i) {
        if (!sieve[i]) {
            // i has not been marked -- it is prime
            primes.push(i);
            if (primes.length == a){
              break;
            }
            for (j = i << 1; j<max; j += i) {
                sieve[j] = true;
            }
        }
    }
    return primes[a-1];
}
function findE(p,q){
  var t = (p-1)*(q-1);
  var r = Math.floor(Math.random() * t) + 1;
  for (var i = r; i < t; i++){
    if (gcd(t, i) == 1){
      break;
    }
  }
  var e = i;
  return e;
}
function findD(p,q,e){
  var t = (p-1)*(q-1);
  var a = xgcd(t,e);
  while (a[1]<0){
    a[1]+=t;
  }
  return a[1];
}
function xgcd(a,b)
{
  if (b == 0)
    {return [1, 0, a]}
  else
    {
     temp = xgcd(b, a % b)
     x = temp[0]
     y = temp[1]
     d = temp[2]
     return [y, x-y*Math.floor(a/b), d]
    }
}
function gcd(a, b){
  if (a==0){
    return b;
  }
  var i = gcd(b%a, a);
  return i;
}
function repeatSquare(num,mod,power){
  var arr = [];
  arr[0] = num;
  p = Math.floor(Math.log2(power))
  for (var i = 1; i<=p;i++){
    g = Math.pow(num, 2);
    num = g%mod;
    arr[i]=num;
  }
  var powerTot=1;
  while (power != 0){
    var a= Math.floor(Math.log2(power));
    var b=Math.pow(2,a);
    // console.log(b)
    powerTot*=arr[a];
    powerTot%=mod;
    power -= b;
    if (power == 0){
      break;
    }
  }
  // console.log(arr);
  // console.log(powerTot%mod);
  return powerTot%mod;
}
function encMess(arr, n, e){
  for (var i = 0; i < arr.length; i++){
    var eMess = repeatSquare(arr[i],n,e);
    arr[i]=eMess;
  }
  var string = "";
  for (var i = 0; i < arr.length; i++){
    string += arr[i]+" ";
  }
  return string;
}
function createArr(message){
  var arr = [];
  for (var i = 0; i < message.length; i++){
    arr[i] = message.charCodeAt(i);
  }
  return arr;
}
function messToEncMess(message, a, b){
  var p = findPrime(a);
  var q = findPrime(b);
  // console.log(p+ " "+q);
  var e = findE(p,q);
  var arr = createArr(message);
  var eMess = encMess(arr, p*q, e);
  // console.log(eMess);
  // console.log(e);
  var d = findD(p,q,e);
  var remember = [p*q,d];
  var returnVar = [eMess,remember];
  return returnVar;


}
function stringToArr(message){
  var j = 0;
  var arr = [];
  arr[0]="";
  for(var i = 0; i < message.length; i++){
    if (message.charAt(i) == " "){
      j++;
      arr[j]="";
    }
    else{
      arr[j]+=message.charAt(i);
    }
  }
  return arr;
}
function stringArrToInt(arr){
  for (var i = 0; i < arr.length; i++){
    arr[i] = parseInt(arr[i]);
  }
  return arr;
}
function messageToInt(mess){
  var arr = stringToArr(mess);
  // console.log(arr);
  arr = stringArrToInt(arr);
  return arr;
}
function unEncMess(arr, n, d){
  for (var i = 0; i < arr.length; i++){
    arr[i] = repeatSquare(arr[i],n, d);
  }
  var error = false;
  // for (var i = 0; i < arr.length; i++){
  //   if (arr[i]>255||arr[i]<0){
  //     error = true;
  //   }
  // }
  var string= "";
  if (!error){
      for (var i = 0; i < arr.length; i++){
        // console.log(arr.length)
      string += String.fromCharCode(arr[i]);
    }
  }
  return [string,error];
}
function encMessToUnEnc(message, n, d){
  var arr = [];
  arr = messageToInt(message);
  var mess = unEncMess(arr, n, d);
  return mess;
}
// function test(){
// 	console.log("BUTTON WORKED");
// }
function checkIfUserExists(name) {
  var exists = null;
  firebase.database().ref(name).once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
    addToDB(exists);
    console.log("DONE")
  });
}
function addToDB(bool){
  if (!bool){
    var name = document.getElementById("name").value;
    var message = document.getElementById("message").value
    var a = document.getElementById("a").value;
    var b = document.getElementById("b").value;
    var output = messToEncMess(message, a, b);
    var string = String(output[1][0])+","+ output[0];
    name = String(name);
    firebase.database().ref(name).set({
      message:string
    });
    document.getElementById("OUTPUT").innerHTML = "PASSCODE: "+output[1][1]+"<br>"+"MUST REMEMBER PASSCODE AND NAME TO SEE MESSAGE";
  }
  else{
    document.getElementById("OUTPUT").innerHTML = "Name Already Taken";
  }
}
var bool = false;
var bool2 = false;

function setTrue(){
  bool = true;
}
function setFalse(){
  bool = false;
}
function buttonClick(){
  var name = document.getElementById("name").value;
  checkIfUserExists(name);
}
function errorMessage(){
  document.getElementById("OUTPUT") = "Name not populated";
}
function receiveMessage(name){
  var exists = null;
  firebase.database().ref(name).once('value', function(snapshot) {
    var enc = snapshot.val();
    if (enc == null){
      errorMessage();
    }
    else{
      displayUnEncrypt(enc.message);
    }
  });
}
function splitS(string){
  return string.split(',');
}
function displayUnEncrypt(string){
  var strs = splitS(string);
  var pq = parseInt(strs[0]);
  var mess = strs[1];
  var message = encMessToUnEnc(mess, pq, parseInt(document.getElementById("passcode").value))
  document.getElementById("OUTPUT").innerHTML = message[0];
}
function buttonReceive(){
  var name = document.getElementById("nameRec").value;
  receiveMessage(name);
}
