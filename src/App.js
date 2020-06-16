import React from "react";
import socketIOClient from "socket.io-client";
import OnlineUsers from "./onlineUsers";
import "./App.scss";
let socket = null;

class App extends React.Component {
    state = {
        PlayerName: "",
        Players: [],
        player: false,
    };

    componentWillMount() {
        socket = socketIOClient("http://localhost:3003/");
    }

    handleOnChange = (e) => {
        this.setState({
            PlayerName: e.target.value,
        });
    };

    handleOnSubmit = (e) => {
        e.preventDefault();
        if (socket) {
            socket.emit("playerName", { player: this.state.PlayerName });
        }
    };

    render() {
        if (socket) {
            socket.on("loggedIn", (players) => {
                console.log(players, "logged in");
                let otherPlayers = players.filter(
                    (player) => player.id !== socket.id
                );
                this.setState({
                    players: otherPlayers,
                    player: true,
                });
            });
        }

        return (
            <div className="App">
                {this.state.player ? (
                    <OnlineUsers players={this.state.players} socket={socket} />
                ) : (
                    <div id="start" className="container">
                        <form
                            id="register"
                            onSubmit={(e) => this.handleOnSubmit(e)}
                        >
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="PlayerName"
                                    className="form-control form-control-lg"
                                    required
                                    placeholder="Write your name here..."
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-outline-primary"
                            >
                                Connect!
                            </button>
                        </form>
                    </div>
                )}
            </div>
        );
    }
}

export default App;
