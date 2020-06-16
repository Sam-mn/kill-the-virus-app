const express = require("express");
const app = express();
const http = require("http");
const SocketIO = require("socket.io");

var server = http.createServer(app);
const io = SocketIO.listen(server);
let players = [];

server.listen(3003, () => {
    io.on("connection", (socket) => {
        console.log("socket connected");
        socket.on("playerName", (data) => {
            let room = `${socket.id}-${data.player}`;
            players.push({
                id: socket.id,
                username: data.player,
                inGame: false,
                room,
                points: 0,
            });
            socket.join(room);
            socket.join("general");
            console.log(players);
            io.in("general").emit("loggedIn", players);
        });

        socket.on("joinRoom", (room) => {
            //socket.leave('general')
            console.log("joind");
            socket.join(room);
            io.in(room).emit("weAreIn", room);
        });
        socket.on("leaveRoom", (room) => {
            socket.join("general");
            socket.leave(room);
        });
    });
});
