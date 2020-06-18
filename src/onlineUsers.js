import React from "react";
import Room from "./Room";
class onlineUsers extends React.Component {
    state = {
        room: null,
    };

    componentWillUpdate() {
        this.props.socket.on("weAreIn", (data) =>
            this.setState({ room: data })
        );
        this.props.socket.on("allPlayersLeaveRoom", () =>
            this.setState({
                room: null,
            })
        );
    }

    handleJoinRoom = (room) => {
        this.props.socket.emit("joinRoom", room);
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

        return (
            <div>
                <h1 className="mb-2 text-white">Online Players</h1>
                <h2 className="mb-4 text-white">
                    Hello {this.props.playerName}
                </h2>
                {this.props.players.length > 0 ? (
                    <ul className="m-0 px-2">
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
                ) : (
                    <p className="text-light">
                        Waiting for other players joining the game....
                    </p>
                )}
            </div>
        );
    }
}

export default onlineUsers;
