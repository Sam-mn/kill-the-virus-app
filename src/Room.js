import React from "react";

class Room extends React.Component {
    state = {
        hideVirus: false,
        xy: [],
        clicked: false,
        room: null,
    };

    componentDidMount() {
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
    }

    handleClickTheVirus = (e) => {
        const x =
            document.querySelector("#game-sec").offsetHeight -
            document.querySelector("#virus").clientHeight;
        const y =
            document.querySelector("#game-sec").offsetWidth -
            document.querySelector("#virus").clientWidth;

        this.props.socket.emit("click-virus", {
            x,
            y,
            room: this.props.roomName,
        });

        this.props.socket.on("change-position", (data) => {
            console.log("some one clicked the virus");
            this.setState({
                theVirus: true,
                xy: data,
            });
            setTimeout(() => {
                this.setState({
                    theVirus: false,
                    clicked: false,
                });
            }, 3000);
        });
    };

    handleLeaveGame = (e) => {
        console.log("leave");
        this.props.socket.emit("userLeaveRoom", this.props.roomName);
        this.props.changeRoomStatus();
    };

    render() {
        return (
            <div>
                <h1>Welcome to {this.props.roomName}</h1>

                <div id="main-sections">
                    <div id="game-sec">
                        <div
                            id="virus"
                            className={this.state.theVirus ? "hide" : ""}
                            style={{
                                top: `${this.state.xy[0]}px`,
                                left: `${this.state.xy[1]}px`,
                            }}
                            onClick={(e) => this.handleClickTheVirus(e)}
                        ></div>
                    </div>
                    <div id="info-sec">
                        <h1>Scoreboard</h1>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={(e) => this.handleLeaveGame(e)}
                        >
                            leave game
                        </button>
                        <div id="rounds"></div>

                        <div id="points"></div>

                        <div id="timer">
                            <div id="userTime"></div>
                            <div id="rivalTime"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Room;
