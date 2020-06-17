import React from "react";

class Room extends React.Component {
    state = {
        hideVirus: false,
        xy: [],
        clicked: false,
        room: null,
        round: 0,
        players: [],
        theWinner: null,
        playAgin: false,
    };

    componentDidMount() {
        this.setState({
            players: this.props.roomData.players,
        });
        this.props.socket.on("roundNumber", (data) => {
            this.setState({
                round: data,
            });
        });
        const x =
            document.querySelector("#game-sec").offsetHeight -
            document.querySelector("#virus").clientHeight;
        const y =
            document.querySelector("#game-sec").offsetWidth -
            document.querySelector("#virus").clientWidth;
        var randomX = Math.floor(Math.random() * x);
        var randomY = Math.floor(Math.random() * y);
        this.setState({
            xy: [randomX, randomY],
        });

        this.props.socket.on("change-position", (data) => {
            console.log("some one clicked the virus");
            this.setState({
                theVirus: true,
                xy: data,
            });
            setTimeout(() => {
                this.setState({
                    hideVirus: false,
                    clicked: false,
                });
            }, 3000);
        });
    }

    componentWillMount() {
        this.props.socket.on("updateMatch", (data) => {
            console.log(data);
            this.setState({
                xy: data.randomPosition,
                players: data.users,
                round: data.users[0].matchPoints + data.users[1].matchPoints,
            });
        });
        this.props.socket.on("theWinner", (data) => {
            this.setState({
                theWinner:
                    this.state.players[0].matchPoints >
                    this.state.players[1].matchPoints
                        ? this.state.players[0].username
                        : this.state.players[1].username,
                playAgin: true,
            });
        });
        this.props.socket.on("draw", () => {
            this.setState({ theWinner: "Draw", playAgin: true });
        });
    }

    handleClickTheVirus = (e) => {
        const x =
            document.querySelector("#game-sec").offsetHeight -
            document.querySelector("#virus").clientHeight;
        const y =
            document.querySelector("#game-sec").offsetWidth -
            document.querySelector("#virus").clientWidth;
        this.setState({
            hideVirus: true,
        });
        // this.props.socket.emit("click-virus", {
        //     x,
        //     y,
        //     room: this.props.roomData.roomName,
        // });

        // this.props.socket.on("change-position", (data) => {
        //     console.log("some one clicked the virus");
        //     this.setState({
        //         theVirus: true,
        //         xy: data,
        //     });
        //     setTimeout(() => {
        //         this.setState({
        //             theVirus: false,
        //             clicked: false,
        //         });
        //     }, 3000);
        // });
        // this.props.socket.on("roundNumber", (data) => {
        //     this.setState({
        //         round: data,
        //     });
        // });
        this.props.socket.emit("click-virus", {
            x,
            y,
            room: this.props.roomData.roomName,
        });
    };

    handleLeaveGame = (e) => {
        console.log("leave");
        this.props.socket.emit("userLeaveRoom", this.props.roomData.roomName);
        this.props.changeRoomStatus();
    };

    render() {
        const { theWinner, playAgin } = this.state;
        return (
            <div>
                {!playAgin ? (
                    <div>
                        <h1 className="text-white">Welcome to the game</h1>
                        <div id="main-sections">
                            <div id="game-sec">
                                <div
                                    id="virus"
                                    className={this.state.virus ? "hide" : ""}
                                    style={{
                                        top: `${this.state.xy[0]}px`,
                                        left: `${this.state.xy[1]}px`,
                                    }}
                                    onClick={(e) => this.handleClickTheVirus(e)}
                                ></div>
                            </div>

                            <div id="info-sec">
                                <h1>Scoreboard</h1>
                                <div id="rounds">
                                    <h2>ROUND</h2>
                                    <p>{this.state.round}</p>
                                </div>

                                <div id="points">
                                    {this.state.players.length > 0
                                        ? this.state.players.map((player) => {
                                              return (
                                                  <div
                                                      className="user"
                                                      key={player.id}
                                                  >
                                                      <h1>{player.username}</h1>
                                                      <p>
                                                          {player.matchPoints}
                                                      </p>
                                                  </div>
                                              );
                                          })
                                        : ""}
                                </div>

                                <div id="timer">
                                    <div id="userTime"></div>
                                    <div id="rivalTime"></div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={this.handleLeaveGame}
                                >
                                    leave game
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="startAgain">
                        <h1>
                            {theWinner === "Draw"
                                ? "you both are winners 🥳"
                                : `The winner is ${theWinner.toUpperCase()} 🥳`}
                        </h1>
                        <div className="startAgainBtns">
                            <button
                                onClick={() =>
                                    this.setState({ playAgin: false })
                                }
                                className="btn btn-outline-success"
                            >
                                play agin
                            </button>
                            <button
                                onClick={this.handleLeaveGame}
                                className="btn btn-outline-danger"
                            >
                                leave the game
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
export default Room;
