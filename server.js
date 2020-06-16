const express = require("express");
const app = express();
const http = require("http");
const SocketIO = require("socket.io");

var server = http.createServer(app);
const io = SocketIO.listen(server);
let Players = [];

server.listen(3000, () => {
    io.on("connection", (socket) => {
        console.log("socket connected");
        socket.on("playerName", (data) => {
            console.log(data);
        });
    });
});
