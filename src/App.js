import React from "react";
import socketIOClient from "socket.io-client";
import "./App.css";
let socket = null;

class App extends React.Component {
    state = {
        PlayerName: "",
        Players: [],
    };

    componentWillMount() {
        socket = socketIOClient("http://localhost:3000/");
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
        return (
            <div className="App">
                <form className="form" onSubmit={(e) => this.handleOnSubmit(e)}>
                    <input
                        className="input"
                        placeholder="insert your name"
                        id="PlayerName"
                        onChange={(e) => this.handleOnChange(e)}
                    />
                </form>
                <p>{this.state.PlayerName}</p>
            </div>
        );
    }
}

export default App;
