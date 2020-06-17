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
        console.log("socket connected");
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
            });

            socket.join(room);
            socket.join("general");
            console.log(players);
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
        });

        socket.on("click-virus", (data) => {
            console.log("someone clicked the virus", socket.id);
            let round = 1;
            let users = [];

            let inRoom = data.room;

            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player.id === socket.id) {
                    if (player.matchPoints + 1 === 6) {
                        round = 10;
                    } else {
                        round = round + player.matchPoints;
                    }
                    player.matchPoints++;
                    users.push(player);
                }

                if (player.id !== socket.id && player.playingIn === inRoom) {
                    round = round + player.matchPoints;
                    users.push(player);
                }
            }

            if (round === 10) {
                let draw = false;
                for (let index = 0; index < players.length; index++) {
                    const player = players[index];
                    if (player.playingIn === inRoom) {
                        if (player.matchPoints === 5) {
                            draw = true;
                        }
                        player.matchPoints = 0;
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
                }
                if (player.playingIn === room && player.room === room) {
                    player.inGame = false;
                    player.matchPoints = 0;
                    creatorId = player.id;
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
