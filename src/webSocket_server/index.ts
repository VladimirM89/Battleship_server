import { WebSocketServer } from "ws";
import { WEBSOCKET_HOST, WEBSOCKET_PORT } from "./constants/webSocketConstants";
import { WEBSOCKET_START_TEXT } from "./constants/stringConstants";

const wss = new WebSocketServer({ port: WEBSOCKET_PORT, host: WEBSOCKET_HOST });
console.log(`${WEBSOCKET_START_TEXT} ${WEBSOCKET_HOST}: ${WEBSOCKET_PORT}`);

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: ", JSON.parse(data.toString()));

    const response = {
      type: "reg",
      data: JSON.stringify({
        name: "Vladimir",
        index: 55,
        error: false,
        errorText: "",
      }),
      id: 0,
    };

    ws.send(JSON.stringify(response));
  });

  ws.on("close", () => {
    console.log("Client closed");
  });
});
