import React from "react";
import Virus from "./virus.svg";

class Room extends React.Component {
    state = {
        hideVirus: false,
        xy: [],
        room: null,
        round: 0,
        players: [],
        theWinner: null,
        playAgin: false,
        showTime: 0,
    };

    componentDidMount() {
        this.setState({
            players: this.props.roomData.players,
            showTime: Date.now(),
        });

        const x =
            document.querySelector("#game-sec").offsetHeight -
            document.querySelector("#virus").clientHeight;
        const y =
            document.querySelector("#game-sec").offsetWidth -
            document.querySelector("#virus").clientWidth;
        var randomX = Math.floor(Math.random() * x);
        var randomY = Math.floor(Math.random() * y);

        this.props.socket.on("firstPosition", (data) => {
            this.setState({
                xy: data.randomPosition,
            });
        });
    }

    componentWillMount() {
        this.props.socket.on("updateMatch", (data) => {
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

        this.props.socket.on("changePosition", () => {
            this.setState({
                hideVirus: true,
            });

            setTimeout(() => {
                this.setState({
                    hideVirus: false,
                    showTime: Date.now(),
                });
            }, 3000);
        });
    }

    handleClickTheVirus = () => {
        const x =
            document.querySelector("#game-sec").offsetHeight -
            document.querySelector("#virus").clientHeight;
        const y =
            document.querySelector("#game-sec").offsetWidth -
            document.querySelector("#virus").clientWidth;

        this.props.socket.emit("click-virus", {
            x,
            y,
            room: this.props.roomData.roomName,
            reactTime: Date.now(),
            showTime: this.state.showTime,
        });
    };

    handleLeaveGame = () => {
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
                                    className={
                                        this.state.hideVirus ? "hide" : ""
                                    }
                                    style={{
                                        top: `${this.state.xy[0]}px`,
                                        left: `${this.state.xy[1]}px`,
                                    }}
                                    onClick={(e) => this.handleClickTheVirus(e)}
                                >
                                    <img src={Virus} alt="virus" />
                                </div>
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
                                                      <h1>
                                                          {player.username.toUpperCase()}
                                                      </h1>
                                                      <p>
                                                          {player.matchPoints}
                                                      </p>
                                                      <p>
                                                          {player.reactTime /
                                                              1000}
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
