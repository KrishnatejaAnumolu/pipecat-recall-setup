This repository contains three ways of connecting to a simple Pipecat voice agent which uses SmallWebRTCTransport.

1. Connecting from server/index.html - This uses a simple HTML page with a WebRTC connection to the server.
2. Connecting from client/src/direct/App.tsx - This uses a simple React app with a WebRTC connection to the server.
3. Connecting from client/src/pipecat-library/App.tsx - This uses the Pipecat library to connect to the server.

#1 & #2 approaches work both in a normal browser and in Recall.ai (https://www.recall.ai/)

#3 works only in normal browser. It fails to establish ICE connection in Recall.ai. Also, seeing an error `Uncaught (in promise) DOMException: Requested device not found` in console.
