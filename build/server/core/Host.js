const express = require("express");
const WsServer = require("ws");
const {createServer} = require("http");
const {Game} = require("./Game");
const config = require("../host.config.json");
const app = express();
const server = createServer(app);
class Host {
  constructor() {
    const wss = this.initWebSocketServer();
    const Session = new Game();
    wss.on("connection", async (ws, req) => {
      Session.connect(ws, req);
    });
  }
  initWs() {
    const options = {
      noServer: true
    };
    return new WsServer.Server(options);
  }
  async initHttpServer(port) {
    app.use(express.static(__dirname + "/../../public"));
    server.listen(process.env.PORT || port, () => {
      console.log("Server is working on: ");
      console.log(process.env.PORT !== void 0 ? `https://infinite-mesa-09265.herokuapp.com:${process.env.PORT}` : `http://localhost:${port}`);
    });
    return app;
  }
  initWebSocketServer(port = config.port) {
    this.initHttpServer(port);
    const wss = this.initWs();
    server.on("upgrade", async (req, socket, head) => {
      try {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit("connection", ws, req);
        });
      } catch (err) {
        console.log("Socket upgrade failed", err);
        socket.destroy();
      }
    });
    return wss;
  }
}
module.exports = {Host};
