import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });
console.log("Server WS created");

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
