# ClassWatch NEON
Futuristic classroom noise dashboard with Arduino Uno USB serial integration.

## Run locally
1. Install Python 3.10+.
2. In this folder run: `python -m pip install -r requirements.txt`
3. Upload `arduino/classwatch_arduino.ino` to Arduino Uno.
4. Connect Arduino by USB.
5. Run `python app.py`.
6. Open Chrome at `http://127.0.0.1:5000`.
7. In Device Link, refresh ports, select the Arduino COM port, and connect.

## Wiring (KY-038 analog output)
- VCC -> 5V; GND -> GND; AO -> A0
- Green LED -> D2 through 220–330 ohm resistor to GND
- Yellow LED -> D3 through 220–330 ohm resistor to GND
- Red LED -> D4 through 220–330 ohm resistor to GND
- Active buzzer (+) -> D6; (-) -> GND
Use a resistor for each LED. Check the buzzer rating; do not connect a bare speaker directly to an Arduino pin.

## Notes
KY-038 readings are relative sensor values, not calibrated decibels. The app does not identify speakers or understand speech. USB Arduino access works when Flask runs locally on the same laptop. A Render-hosted remote site cannot directly access a USB Arduino connected to a teacher's laptop. Obtain school permission before classroom monitoring.


## Webcam panel
The dashboard includes an optional webcam preview. Click **START CAMERA** and allow Chrome's camera permission. Click **CAPTURE** to save a PNG to the browser's downloads, or **STOP** to turn the camera off. The camera is not started automatically; no video or photos are uploaded to the Flask server. Browser camera access works on `http://127.0.0.1:5000` (localhost) or HTTPS.
