// ClassWatch NEON: Arduino Uno + KY-038 analog output
const int SOUND=A0, GREEN=2, YELLOW=3, RED=4, BUZZER=6;
const int YELLOW_LIMIT=400, RED_LIMIT=700;
void setup(){pinMode(GREEN,OUTPUT);pinMode(YELLOW,OUTPUT);pinMode(RED,OUTPUT);pinMode(BUZZER,OUTPUT);Serial.begin(9600);}
void loop(){
 int v=analogRead(SOUND);
 digitalWrite(GREEN,v<YELLOW_LIMIT);
 digitalWrite(YELLOW,v>=YELLOW_LIMIT && v<RED_LIMIT);
 digitalWrite(RED,v>=RED_LIMIT);
 if(v>=RED_LIMIT) tone(BUZZER,1800,120); else noTone(BUZZER);
 Serial.println(v);
 delay(100);
}
