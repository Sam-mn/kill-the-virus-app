import React from "react";
import Room from "./Room";
class onlineUsers extends React.Component {
    state = {
        room: null,
    };

    handleJoinRoom = (room) => {
        this.props.socket.emit("joinRoom", room);
        this.props.socket.emit("updateReadyToPlayUsers");
        console.log("clicked", this.props.socket);
    };

    handleLeaveRoom = () => {
        this.props.socket.emit("leaveRoom", this.state.room);
        this.setState({
            room: null,
        });
    };

    changeRoomStatus = (data) => {
        this.setState({
            room: null,
        });
    };

    render() {
        if (this.props.socket) {
            this.props.socket.on("weAreIn", (data) =>
                this.setState({ room: data })
            );
            this.props.socket.on("allPlayersLeaveRoom", () =>
                this.setState({
                    room: null,
                })
            );
        }
        console.log(this.props.players);
        if (this.state.room) {
            return (
                <div>
                    <Room
                        roomData={this.state.room}
                        handleLeaveRoom={this.handleLeaveRoom}
                        socket={this.props.socket}
                        changeRoomStatus={this.changeRoomStatus}
                    />
                </div>
            );
        }
        console.log(this.props);

        return (
            <div>
                <h1 className="mb-2 text-white">Online users</h1>
                <h2 className="mb-4 text-white">
                    Hello {this.props.playerName}
                </h2>
                <ul className="m-0">
                    {this.props.players.map((player, index) => (
                        <li className="player" key={index}>
                            {player.username}
                            <span>
                                <button
                                    className="playerBtn ml-3 btn btn-outline-success"
                                    onClick={() =>
                                        this.handleJoinRoom(player.room)
                                    }
                                >
                                    Join
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default onlineUsers;
