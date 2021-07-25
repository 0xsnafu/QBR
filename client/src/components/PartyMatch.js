import React, { Component } from 'react'
import queryString from 'query-string'

import Countdown from './Countdown';
import UserList from "./UserList";

// import ReactGA from 'react-ga';
// ReactGA.initialize('UA-103417969-4');
// ReactGA.pageview('/party-match');

class PartyMatch extends Component {
    constructor() {
        super();
        this.state = {
            isCorrect: false,
            isIncorrect: false,
            isWinner: false,
            isHost: false,
            hasMatchStarted: false
        };
    }

    componentDidMount() {
        let query = queryString.parse(window.location.search);

        if (query.roomID === undefined) { this.setState({ isHost: true }) }; // ***
        if (!this.props.socket) { this.props.Connect(true, query.roomID) };
    }

    componentDidUpdate(nextProps) {
        if (nextProps.question !== this.props.question) { this.setState({ isCorrect: false }) } //Got new question
        if (this.props.question.message && !this.state.hasMatchStarted) this.setState({ hasMatchStarted: true }) //For host switching; prevents start button from showing

        //Will set winner if index 0 in rankings is this user and not already set as winner
        if (this.props.socket !== undefined && this.props.rankings[0] === this.props.myId && !this.state.isWinner) {
            this.setState({ isWinner: true })

            if (document.getElementById('victory-audio') === null) return //document.getElementById('victory-audio') is occasionally null. No idea why.
            document.getElementById('victory-audio').play();
            document.getElementById('fireworks-audio').play();
        } else if (this.props.rankings.length === 0 && this.state.isWinner) { //If rankings get cleared(Play Again) and user was winner, clears winner
            this.setState({ isWinner: false })
        }

        //If this current user was not the host before but now is the host(old host disconnected), set this user as new host
        for (let i = 0; i < this.props.userList.length; i++) {
            if (this.props.userList[i].id === this.props.myId && this.props.userList[i].isHost && !this.state.isHost) {
                this.setState({ isHost: true })
            }
        }
    }

    componentWillUnmount() { this.props.Disconnect() }

    CheckAnswer = (choice) => {
        if (this.props.isMatchOver) return;

        if (choice === this.props.question.answer) { //Correct
            this.setState({ isCorrect: true })
            document.getElementById('correct-audio').play()
        } else { //Incorrect
            this.setState({ isIncorrect: true })
            document.getElementById('incorrect-audio').play()

            setTimeout(() => { this.setState({ isIncorrect: false }) }, 2000);
        }

        let message = {
            status: 6,
            body: [choice.toString()]
        }

        this.props.socket.send(JSON.stringify(message))
    }

    Play = () => { //play again ***
        let message = {
            status: 11
        }

        this.props.socket.send(JSON.stringify(message))
        this.props.ResetState(true)
        this.setState({ hasMatchStarted: true })
    }

    StartMatch = () => {
        let message = {
            status: 11
        }

        this.props.socket.send(JSON.stringify(message))

        this.props.ResetState(true)
        this.setState({ hasMatchStarted: true })
    }

    render() {
        let { userList, question, status, count, isMatchOver, myId, roomID } = this.props
        let { isCorrect, isIncorrect, isWinner, isHost, hasMatchStarted } = this.state

        return (
            <>
                <div className='grid grid-cols-12 gap-2'>
                    <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8'>
                        <p className='inline'><span className='font-bold'>Code:</span> {roomID}</p>
                    </div>

                    <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded'>
                        <UserList userList={userList} myId={myId} rankings={this.props.rankings} />
                    </div>

                    <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded p-2 min-h-300 text-center'>
                        {status === 0 && (<p>Match starts in <Countdown count={count} /></p>)}

                        {status === 5 && (
                            <>
                                <p className='text-2xl md:text-4xl my-2'>{question.choices !== undefined && question.message}</p>

                                <div className='grid grid-cols-2 md:grid-cols-6 '>
                                    {question.choices !== undefined && question.choices.map((choice, index) => {
                                        return <button key={index} className={`${index === 0 && ('md:col-start-2')} mx-auto font-bold rounded-full h-24 w-24 m-3 text-2xl
                                            ${isIncorrect ? 'border-white bg-red-600 text-white' : isCorrect ? 'border-white bg-green-600 text-white' : 'border-2 border-black'}`}
                                            disabled={isIncorrect} onClick={() => this.CheckAnswer(choice)}>{choice}</button>
                                    })}
                                </div>

                                <audio id='victory-audio' src='/audio/victory-sound.mp3' preload='auto' />
                                <audio id='fireworks-audio' src='/audio/fireworks-sound.mp3' preload='auto' />
                                <audio id='correct-audio' src='/audio/correct-sound.mp3' preload='auto' />
                                <audio id='incorrect-audio' src='/audio/incorrect-sound.mp3' preload='auto' />
                            </>
                        )}

                        {(status === 4 && (<h3>Searching for players...</h3>))}

                        {isMatchOver && isHost
                            && (<button className='bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-xl md:mt-4 float-right md:float-none'
                                onClick={() => this.Play()}>Play Again</button>)}

                        <button className={`bg-blue-400 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-md ${isHost ? 'inline' : 'hidden'} ${hasMatchStarted ? 'hidden' : 'inline'}`}
                            onClick={() => this.StartMatch()}>Start!</button>
                    </div>
                </div>

                <div className={`${isWinner ? 'pyro' : 'hidden'}`}>
                    <div className="before"></div>
                    <div className="after"></div>
                </div>
            </>
        );
    }
}

export default PartyMatch