const $=id=>document.getElementById(id);let started=Date.now(),points=Array(50).fill(0),last="";
function log(t){$("events").textContent=new Date().toLocaleTimeString()+" — "+t+"\n"+$("events").textContent}
function render(s){let col=s.level==="RED"?"#ff5477":s.level==="YELLOW"?"#ffd166":"#39f5b0",name=s.level==="RED"?"HIGH NOISE ALERT":s.level==="YELLOW"?"MODERATE NOISE":"QUIET ZONE";$("label").textContent=name;$("label").style.color=col;$("symbol").style.color=col;$("symbol").textContent=s.level==="GREEN"?"✓":"!";$("noise").textContent=s.noise;$("orb").textContent=String(s.noise).padStart(3,"0");$("alerts").textContent=s.alerts;$("fill").style.width=(s.noise/1023*100)+"%";$("fill").style.background=col;$("desc").textContent=s.level==="RED"?"Noise crossed the alert threshold.":s.level==="YELLOW"?"Noise is rising. A reminder may help.":"Classroom sound is within the calm range.";$("mode").textContent=s.mode+" MODE";$("link").textContent=s.connected?"CONNECTED":"OFFLINE";$("message").textContent=s.message;$("session").textContent=fmt((Date.now()-started)/1000);if(last!==s.level){log(s.level+" status · sensor "+s.noise);last=s.level}points.push(s.noise);points.shift();draw()}
function fmt(n){return String(Math.floor(n/60)).padStart(2,"0")+":"+String(Math.floor(n%60)).padStart(2,"0")}
async function status(){try{render(await(await fetch("/api/status")).json())}catch(e){}}
async function ports(){let d=await(await fetch("/api/ports")).json();$("port").innerHTML='<option value="">Select COM port</option>';d.ports.forEach(p=>$("port").add(new Option(p,p)));if(d.error)log(d.error);else log(d.ports.length+" serial ports found")}
$("refresh").onclick=ports;$("connect").onclick=async()=>{let r=await fetch("/api/connect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({port:$("port").value,baud:$("baud").value})}),d=await r.json();log(d.message||d.error);status()};$("disconnect").onclick=async()=>{await fetch("/api/disconnect",{method:"POST"});log("USB disconnected");status()};
let demo=true;$("demoToggle").onclick=()=>{demo=!demo;$("demoToggle").textContent=demo?"ON":"OFF";log("Demo mode "+(demo?"enabled":"disabled"))};
$("slider").oninput=async e=>{if(demo){await fetch("/api/demo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({noise:e.target.value})});status()}};
$("reset").onclick=async()=>{await fetch("/api/reset",{method:"POST"});log("Alert count reset");status()};
function draw(){let c=$("chart"),ctx=c.getContext("2d"),w=c.clientWidth,h=150,d=window.devicePixelRatio||1;c.width=w*d;c.height=h*d;ctx.scale(d,d);ctx.strokeStyle="#1b3550";[.25,.5,.75].forEach(y=>{ctx.beginPath();ctx.moveTo(0,h*y);ctx.lineTo(w,h*y);ctx.stroke()});ctx.beginPath();points.forEach((v,i)=>{let x=i/(points.length-1)*w,y=h-v/1023*(h-8)-4;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle="#42e8ff";ctx.lineWidth=2;ctx.shadowColor="#42e8ff";ctx.shadowBlur=8;ctx.stroke()}
function clock(){$("clock").textContent=new Date().toLocaleTimeString()}setInterval(status,700);setInterval(clock,1000);clock();ports();draw();
// Camera controls: browser permission is requested only after START CAMERA is clicked.
let cameraStream=null;
const video=$("cameraVideo"), placeholder=$("cameraPlaceholder");
$("startCamera").onclick=async()=>{
  if(!navigator.mediaDevices?.getUserMedia){log("Camera unavailable: use localhost or HTTPS in a supported browser.");return;}
  try{
    cameraStream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    video.srcObject=cameraStream; placeholder.hidden=true; video.style.display="block";
    $("cameraStatus").textContent="LIVE"; $("cameraStatus").style.color="#39f5b0";
    $("startCamera").disabled=true; $("stopCamera").disabled=false; $("capturePhoto").disabled=false;
    log("Camera started by user.");
  }catch(err){log("Camera permission/device error: "+err.message);}
};
function stopCamera(){
  if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
  video.srcObject=null; video.style.display="none"; placeholder.hidden=false;
  $("cameraStatus").textContent="OFF"; $("cameraStatus").style.color="";
  $("startCamera").disabled=false; $("stopCamera").disabled=true; $("capturePhoto").disabled=true;
}
$("stopCamera").onclick=()=>{stopCamera();log("Camera stopped.");};
$("capturePhoto").onclick=()=>{
  if(!cameraStream||!video.videoWidth){log("Camera is not ready yet.");return;}
  const c=document.createElement("canvas");c.width=video.videoWidth;c.height=video.videoHeight;c.getContext("2d").drawImage(video,0,0);
  const a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="ClassWatch-capture-"+new Date().toISOString().replace(/[:.]/g,"-")+".png";a.click();log("Photo saved to this device.");
};
window.addEventListener("beforeunload",()=>{if(cameraStream)cameraStream.getTracks().forEach(t=>t.stop());});

