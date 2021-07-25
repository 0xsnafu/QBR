import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import './index.css';
import './App.css';

import Landing from "./components/Landing";
import Navbar from "./components/Navbar";

import About from "./components/About";
import Game from "./components/Game";
import { OrderUserList } from "./utils/userUtils";
import { IsMatchOver } from "./utils/gameUtils";

let socket;

class App extends Component {
  constructor() {
    super();
    this.state = {
      myId: '',
      roomID: '',
      question: {},
      userList: [],
      rankings: [],
      count: 10,
      status: 4, //Default status is searching for players...
      // inParty: false
    };
  }

  componentDidMount() {
    if (!sessionStorage.getItem('inParty')) {
      sessionStorage.setItem('inParty', false);
    }

    //If in .herokuapp url OR in http url, redirect to live url. Doesn't redirect in localhost
    if ((window.location.hostname.includes('herokuapp') || window.location.protocol.includes('http:')) && !window.location.hostname.includes('localhost')) {
      window.location.replace("https://quickbrainracers.com");
    }
  }


  Disconnect() {
    if (socket === undefined) return;

    sessionStorage.setItem('inParty', false);
    socket.close(1000); //1000 is normal closing status for WS
    socket = undefined;
    this.ResetState();
  }

  ResetState() {
    this.setState({
      question: {},
      userList: JSON.parse(sessionStorage.getItem('inParty')) ? this.state.userList : [],
      roomID: JSON.parse(sessionStorage.getItem('inParty')) ? this.state.roomID : "",
      roomMsg: '',
      status: 4,
      rankings: []
    })
  }

  Connect(queryRoomId) {
    //queryRoomId will be undefined if creating a room. If joining, queryRoomId should be the room id
    if (JSON.parse(sessionStorage.getItem('inParty')) && queryRoomId === undefined) { //Will create party Room
      socket = new WebSocket("ws://localhost:5000/ws?inParty=true&roomID=");
    } else if (JSON.parse(sessionStorage.getItem('inParty')) && queryRoomId !== undefined) { //Will join party Room
      socket = new WebSocket(`ws://localhost:5000/ws?inParty=true&roomID=${queryRoomId}`);
    } else { //Will search for open room
      socket = new WebSocket("ws://localhost:5000/ws?inParty=false&roomID=");
    }

    socket.onmessage = (data) => {
      let msg = JSON.parse(data.data);
      // console.log(msg)

      switch (msg.status) {
        case 0: //Receiving countdown
          if (JSON.parse(sessionStorage.getItem('inParty')) && IsMatchOver(this.state.rankings, this.state.myId)) { this.ResetState(); }
          this.setState({ status: 0, count: msg.body });
          break;
        case 1: //Server says start match
          //Get Question
          let message = { status: 5 }
          socket.send(JSON.stringify(message));
          break;
        case 2: //Getting user list        
          let clientList = msg.body;
          this.setState({ userList: OrderUserList(this.state.userList, clientList, this.state.question.message ? true : false) });
          break;
        case 3: //Getting my ID
          this.setState({ myId: msg.body[0] });
          break;
        case 4: //Server is searching for players...
          this.setState({ status: 4 });
          break;
        case 5: //Receiving Question
          this.setState({ status: 5, question: JSON.parse(msg.body) });
          break;
        case 8: //Receiving Rankings
          this.setState({ rankings: msg.body });
          break;
        case 10: //Receive Room ID
          this.setState({ roomID: msg.body[0] });
          break;
        case 69: //Receive Room ID
          console.log(msg.body[0])
          break;
        default: console.log("DEFAULT: msg.status: ", msg.status); break;
      }
    };

    // socket.onclose = event => {
    //   console.log("Socket Closed Connection: ", event);
    // };

    socket.onerror = error => {
      console.log("Socket Error: ", error);
    };
  }

  render() {
    let { question, userList, status, count, rankings, myId, roomID } = this.state;

    return (
      <Router>
        <div className="App">

          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />

          <Navbar />

          <Route exact path='/' render={(props) => <Landing {...props} />} />
          <Route exact path='/about' component={About} />

          <Route exact path="/play" render={(props) => <Game socket={socket} question={question} userList={userList} status={status} myId={myId} roomID={roomID}
            count={count} rankings={rankings} ResetState={() => this.ResetState()}
            Disconnect={() => this.Disconnect()} Connect={(x, y) => this.Connect(x, y)} {...props} />} />

        </div>
      </Router>
    );
  };
}

export default App;