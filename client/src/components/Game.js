import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import { setMyID, setRoomID, setQuestion, setRankings, setCount, setStatus, ResetState } from '../redux/game';

import UserList from "./UserList";
import Fireworks from "./Fireworks";
import QuestionDisplay from "./QuestionDisplay";

import { OrderUserList } from "../utils/userUtils";
import { IsMatchOver } from "../utils/gameUtils";

// import ReactGA from 'react-ga';
// ReactGA.initialize('UA-103417969-4');
// ReactGA.pageview('/play');


//MAIN ISSUE RIGHT NOW IS THAT USER LIST COMPONENT DOESNT SEEM TO UPDATE UNTIL ROOM IS FULL
//SHOULD BE UPDATING EVEN FOR FIRST PLAYER
//MAYBE MAKE USERLIST STATE IN USERLIST COMPONENT? OR USE REDUX FOR USERLIST?


let socket;

const Game = () => {
    const { myID, roomID, question, rankings, count, status, inParty } = useSelector(state => state.game);
    const dispatch = useDispatch();

    const [isWinner, setIsWinner] = useState(false);
    const [isHost, setIsHost] = useState(!inParty ? false : true);
    const [userList, setUserList] = useState([]);

    const Connect = (queryRoomId) => {
        //queryRoomId will be undefined if creating a room. If joining, queryRoomId should be the room id
        if (inParty && queryRoomId === undefined) { //Will create party Room
            socket = new WebSocket("ws://localhost:5000/ws?inParty=true&roomID=");
        } else if (inParty && queryRoomId !== undefined) { //Will join party Room
            socket = new WebSocket(`ws://localhost:5000/ws?inParty=true&roomID=${queryRoomId}`);
        } else { //Will search for open room
            socket = new WebSocket("ws://localhost:5000/ws?inParty=false&roomID=");
        }

        socket.onmessage = (data) => {
            let msg = JSON.parse(data.data);
            // console.log(msg)

            switch (msg.status) {
                case 0: //Receiving countdown
                    if (inParty && IsMatchOver(rankings, myID)) { ResetState(); }
                    dispatch(setStatus(0));
                    dispatch(setCount(msg.body));
                    break;
                case 1: //Server says start match
                    //Get Question
                    let message = { status: 5 }
                    socket.send(JSON.stringify(message));
                    break;
                case 2: //Getting user list        
                    let clientList = msg.body;
                    // console.log(userList.length)
                    // console.log(clientList.length)
                    // console.log(question.message)
                    setUserList(OrderUserList(userList, clientList, question.message ? true : false))
                    break;
                case 3: //Getting my ID
                    dispatch(setMyID(msg.body[0]));
                    break;
                case 4: //Server is searching for players...
                    dispatch(setStatus(4));
                    break;
                case 5: //Receiving Question
                    dispatch(setStatus(5));
                    dispatch(setQuestion(JSON.parse(msg.body)));
                    break;
                case 8: //Receiving Rankings
                    dispatch(setRankings(msg.body));
                    break;
                case 10: //Receive Room ID
                    dispatch(setRoomID(msg.body[0]));
                    break;
                default: console.log("DEFAULT: msg.status: ", msg.status); break;
            }
        };

        socket.onerror = error => {
            console.log("Socket Error: ", error);
        };
    }

    //Runs only when component first mounts
    useEffect(() => {
        if (!socket && !inParty) { Connect(undefined) }

        if (inParty) {
            let query = queryString.parse(window.location.search);

            //Makes this player the host if creating a Party Room
            if (query.roomID === undefined) {
                setIsHost(true);
            } else {
                setIsHost(false);
            }

            if (!socket) { Connect(query.roomID) };
        }
    }, [inParty])

    //Runs only when component is dismounting
    useEffect(() => {
        return () => {
            const Disconnect = () => {
                if (socket === undefined) return;

                socket.close(1000); //1000 is normal closing status for WS
                socket = undefined;
                ResetState();
                setUserList(inParty ? userList : []);
            }
            Disconnect()
        }
    }, [userList, inParty]) //Cleanup runs on component dismount

    useEffect(() => {
        //If in .herokuapp url OR in http url, redirect to live url. Doesn't redirect in localhost
        if ((window.location.hostname.includes('herokuapp') || window.location.protocol.includes('http:')) && !window.location.hostname.includes('localhost')) {
            window.location.replace("https://quickbrainracers.com");
        }

        if (socket !== undefined && rankings[0] === myID && !isWinner) { //Will set winner if index 0 in rankings is this user and not already set as winner
            setIsWinner(true);

            if (document.getElementById('victory-audio') === null) return //document.getElementById('victory-audio') is occasionally null. No idea why.
            document.getElementById('victory-audio').play()
            document.getElementById('fireworks-audio').play()
        } else if (rankings.length === 0 && isWinner) { //If rankings get cleared(Play Again) and user was winner, clears winner
            setIsWinner(false);
        }

        if (inParty) {
            //If this current user was not the host before but now is the host(old host disconnected), set this user as new host
            for (let i = 0; i < userList.length; i++) {
                if (userList[i].id === myID && userList[i].isHost && !isHost) {
                    setIsHost(true);
                }
            }
        }

    }, [inParty, question, rankings, myID, isWinner, userList, isHost])



    return (
        <>
            <div className='grid grid-cols-12 gap-4'>

                {inParty &&
                    (<div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8'>
                        <p className='inline'><span className='font-bold'>Code:</span> {roomID}</p>
                    </div>)}

                <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded'>
                    <UserList userList={userList} myID={myID} rankings={rankings} />
                </div>

                <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded p-2 min-h-300 text-center'>
                    <QuestionDisplay count={count} socket={socket}
                        status={status} rankings={rankings} myID={myID}
                        question={question} isHost={isHost} inParty={inParty}
                    />
                </div>

            </div>

            <Fireworks isWinner={isWinner} />
        </>
    );
}

export default Game