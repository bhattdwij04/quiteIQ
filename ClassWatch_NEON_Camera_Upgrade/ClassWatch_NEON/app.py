from flask import Flask, render_template, request, jsonify
import threading, time
try:
 import serial
 from serial.tools import list_ports
except ImportError:
 serial=None; list_ports=None
app=Flask(__name__)
lock=threading.Lock()
state={"connected":False,"port":None,"noise":0,"level":"GREEN","alerts":0,"mode":"DEMO","message":"Awaiting connection"}
ser=None
def level(v): return "RED" if v>=700 else "YELLOW" if v>=400 else "GREEN"
def reader():
 global ser
 while True:
  try:
   if ser and ser.is_open:
    line=ser.readline().decode(errors="ignore").strip()
    if line:
     v=int(line.split(",")[0])
     with lock:
      old=state["level"]; state.update(noise=max(0,min(1023,v)),level=level(v),mode="ARDUINO",message="Arduino sensor stream active")
      if state["level"]=="RED" and old!="RED": state["alerts"]+=1
   else: time.sleep(.2)
  except Exception as e:
   with lock: state.update(connected=False,message=f"Serial error: {e}")
   time.sleep(1)
threading.Thread(target=reader,daemon=True).start()
@app.route("/")
def home(): return render_template("index.html")
@app.route("/api/ports")
def ports():
 if not list_ports:return jsonify({"ports":[],"error":"Install pyserial."})
 return jsonify({"ports":[p.device for p in list_ports.comports()]})
@app.route("/api/connect",methods=["POST"])
def connect():
 global ser
 d=request.get_json(force=True)
 if not serial:return jsonify(ok=False,error="Install dependencies with pip install -r requirements.txt"),400
 try:
  if ser and ser.is_open:ser.close()
  ser=serial.Serial(d["port"],int(d.get("baud",9600)),timeout=1);time.sleep(2)
  with lock:state.update(connected=True,port=d["port"],mode="ARDUINO",message="Connected to "+d["port"])
  return jsonify(ok=True,message="Connected to "+d["port"])
 except Exception as e:return jsonify(ok=False,error=str(e)),400
@app.route("/api/disconnect",methods=["POST"])
def disconnect():
 global ser
 try:
  if ser and ser.is_open:ser.close()
 except:pass
 ser=None
 with lock:state.update(connected=False,port=None,mode="DEMO",message="USB disconnected")
 return jsonify(ok=True)
@app.route("/api/status")
def status():
 with lock:return jsonify(dict(state))
@app.route("/api/demo",methods=["POST"])
def demo():
 v=max(0,min(1023,int(request.get_json(force=True).get("noise",0))))
 with lock:
  old=state["level"];state.update(noise=v,level=level(v),mode="DEMO",message="Demo simulation active")
  if state["level"]=="RED" and old!="RED":state["alerts"]+=1
 return jsonify(ok=True)
@app.route("/api/reset",methods=["POST"])
def reset():
 with lock:state["alerts"]=0
 return jsonify(ok=True)
if __name__=="__main__":app.run(host="127.0.0.1",port=5000,debug=False,threaded=True)
