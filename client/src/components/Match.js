import React, { Component } from 'react'
import Countdown from './Countdown';

import UserList from "./UserList";
import Choices from "./Choices";

// import ReactGA from 'react-ga';
// ReactGA.initialize('UA-103417969-4');
// ReactGA.pageview('/quick-match');

class Match extends Component {
    constructor() {
        super();
        this.state = {
            isCorrect: false,
            isWinner: false
        };
    }

    componentDidMount() {
        if (!this.props.socket) { this.props.Connect(false, undefined) }
    }

    componentDidUpdate(nextProps) {
        if (nextProps.question !== this.props.question) { this.SetIsCorrect(false); }//this.setState({ isCorrect: false }) } //Got new question

        if (this.props.socket !== undefined && this.props.rankings[0] === this.props.myId && !this.state.isWinner) { //Will set winner if index 0 in rankings is this user and not already set as winner
            this.setState({ isWinner: true })

            if (document.getElementById('victory-audio') === null) return //document.getElementById('victory-audio') is occasionally null. No idea why.
            document.getElementById('victory-audio').play()
            document.getElementById('fireworks-audio').play()
        } else if (this.props.rankings.length === 0 && this.state.isWinner) { //If rankings get cleared(Play Again) and user was winner, clears winner
            this.setState({ isWinner: false })
        }

    }

    componentWillUnmount() { this.props.Disconnect() }

    // CheckAnswer = (choice) => {
    //     if (this.props.isMatchOver) return;

    //     if (choice === this.props.question.answer) { //Correct
    //         this.setState({ isCorrect: true })
    //         document.getElementById('correct-audio').play()
    //     } else { //Incorrect
    //         this.setState({ isIncorrect: true })
    //         document.getElementById('incorrect-audio').play()

    //         setTimeout(() => { this.setState({ isIncorrect: false }) }, 2000);
    //     }

    //     let message = {
    //         status: 6,
    //         body: [choice.toString()]
    //     }

    //     this.props.socket.send(JSON.stringify(message))
    // }

    PlayAgain = () => {

        let message = {
            status: 7
        }
        this.props.socket.send(JSON.stringify(message))
        this.props.ResetState(false)
    }

    SetIsCorrect = (isCorrect) => { this.setState({ isCorrect }) }

    render() {
        let { userList, question, status, count, isMatchOver, myId } = this.props;
        let { isCorrect, isWinner } = this.state;

        return (
            <>
                <div className='grid grid-cols-12 gap-4'>
                    <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded'>
                        <UserList userList={userList} myId={myId} rankings={this.props.rankings} />
                    </div>


                    <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded p-2 min-h-300 text-center'>
                        {status === 0 && (<p>Match starts in <Countdown count={count} /></p>)}

                        {status === 5 && (
                            <>
                                <p className='text-2xl md:text-4xl my-2'>{question.choices !== undefined && question.message}</p>

                                <div className='grid grid-cols-2 md:grid-cols-6 '>
                                    <Choices isCorrect={isCorrect} choices={question.choices} props={this.props} SetIsCorrect={x => this.SetIsCorrect(x)} />
                                </div>

                                <audio id='victory-audio' src='/audio/victory-sound.mp3' preload='auto' />
                                <audio id='fireworks-audio' src='/audio/fireworks-sound.mp3' preload='auto' />
                                <audio id='correct-audio' src='/audio/correct-sound.mp3' preload='auto' />
                                <audio id='incorrect-audio' src='/audio/incorrect-sound.mp3' preload='auto' />
                            </>
                        )}

                        {(status === 4 && (<h3>Searching for players...</h3>))}

                        {isMatchOver
                            && (<button className='bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-xl md:mt-4 float-right md:float-none'
                                onClick={() => this.PlayAgain()}>Play Again</button>)}
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

export default Match