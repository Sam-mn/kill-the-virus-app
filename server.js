const express = require("express");
const app = express();
const http = require("http");
const SocketIO = require("socket.io");

var server = http.createServer(app);
const io = SocketIO.listen(server);
let players = [];

const getRandomPosition = (element) => {
    var randomX = Math.floor(Math.random() * element.x);
    var randomY = Math.floor(Math.random() * element.y);
    return [randomX, randomY];
};

server.listen(3003, () => {
    io.on("connection", (socket) => {
        socket.on("playerName", (data) => {
            let room = `${socket.id}-${data.player}`;
            players.push({
                id: socket.id,
                username: data.player,
                inGame: false,
                room,
                playingIn: room,
                matchPoints: 0,
                allTimePoints: 0,
                reactTime: 0,
                won: false,
            });

            socket.join(room);
            socket.join("general");
            io.in("general").emit(
                "loggedIn",
                players.filter(({ inGame }) => inGame === false)
            );
        });

        socket.on("joinRoom", (playingRoom) => {
            socket.join(playingRoom);

            let currentRoomUsers = [];
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player.id === socket.id) {
                    player.playingIn = playingRoom;
                    player.inGame = true;
                    currentRoomUsers.push(player);
                }
                if (player.room === playingRoom) {
                    player.inGame = true;
                    currentRoomUsers.push(player);
                }
            }

            io.in(playingRoom).emit("weAreIn", {
                roomName: playingRoom,
                players: currentRoomUsers,
            });

            io.in("general").emit(
                "updateUsers",
                players.filter(({ inGame }) => inGame === false)
            );

            io.in(playingRoom).emit("firstPosition", {
                randomPosition: getRandomPosition({ x: 100, y: 150 }),
            });
        });

        socket.on("click-virus", (data) => {
            let round = 1;
            let users = [];
            users.forEach((user) => (user.reactTime = 0));

            let inRoom = data.room;
            io.in(inRoom).emit("changePosition");

            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player.id === socket.id) {
                    player.reactTime = data.reactTime - data.showTime;
                    player.won = true;
                    if (player.matchPoints + 1 === 6) {
                        round = 10;
                    } else {
                        round = round + player.matchPoints;
                    }
                    player.matchPoints++;
                    users.push(player);
                }

                if (player.id !== socket.id) {
                    player.won = false;
                }

                if (player.id !== socket.id && player.playingIn === inRoom) {
                    round = round + player.matchPoints;
                    users.push(player);
                }
            }

            if (round === 10) {
                let draw = false;
                for (let i = 0; i < players.length; i++) {
                    const player = players[i];
                    if (player.playingIn === inRoom) {
                        if (player.matchPoints === 5) {
                            draw = true;
                        }
                        player.matchPoints = 0;
                        player.reactTime = 0;
                        player.won = false;
                    }
                }
                if (!draw) {
                    io.in(inRoom).emit("theWinner");
                } else {
                    io.in(inRoom).emit("draw");
                }
            }
            io.in(inRoom).emit("updateMatch", {
                users,
                randomPosition: getRandomPosition(data),
                round,
            });
        });

        socket.on("userLeaveRoom", (room) => {
            let creatorId = "";
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player.playingIn === room && player.room !== room) {
                    player.playingIn = player.room;
                    player.inGame = false;
                    player.matchPoints = 0;
                    player.reactTime = 0;
                    player.won = false;
                }
                if (player.playingIn === room && player.room === room) {
                    player.inGame = false;
                    player.matchPoints = 0;
                    creatorId = player.id;
                    player.reactTime = 0;
                    player.won = false;
                }
            }

            io.in(room).emit("allPlayersLeaveRoom");
            if (creatorId !== socket.id) {
                socket.leave(room);
            }
            socket.join("general");
            io.in("general").emit(
                "updateUsers",
                players.filter(({ inGame }) => inGame === false)
            );
        });
    });
});
