import React from "react";
class onlineUsers extends React.Component {
    state = {
        room: null,
    };

    handleJoinRoom = (room) => {
        this.props.socket.emit("joinRoom", room);
        console.log("clicked", this.props.socket);
    };

    handleLeaveRoom = () => {
        this.props.socket.emit("leaveRoom", this.state.room);
        this.setState({
            room: null,
        });
    };

    render() {
        if (this.props.socket) {
            this.props.socket.on("weAreIn", (room) => this.setState({ room }));
        }
        console.log(this.props.players);
        if (this.state.room) {
            return (
                <div>
                    <h2>we are in room + {this.state.room}</h2>
                    <button onClick={this.handleLeaveRoom}>logout</button>
                </div>
            );
        }
        return this.props.players.map((player, index) => (
            <div className="player" key={index}>
                {player.username}
                <button
                    className="playerBtn"
                    onClick={() => this.handleJoinRoom(player.room)}
                >
                    Join
                </button>
            </div>
        ));
    }
}

export default onlineUsers;
