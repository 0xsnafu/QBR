import React, { Component } from 'react';
import queryString from 'query-string';

import UserList from "./UserList";
import Fireworks from "./Fireworks";
import QuestionDisplay from "./QuestionDisplay";

// import ReactGA from 'react-ga';
// ReactGA.initialize('UA-103417969-4');
// ReactGA.pageview('/play');

class Game extends Component {
    constructor() {
        super();
        this.state = {
            isCorrect: false,
            isWinner: false,
            isHost: !JSON.parse(sessionStorage.getItem('inParty')) ? false : true,
            inParty: JSON.parse(sessionStorage.getItem('inParty'))
        };
    }

    componentDidMount() {
        if (!this.props.socket && !this.state.inParty) { this.props.Connect(undefined) }

        if (this.state.inParty) {
            let query = queryString.parse(window.location.search);

            //Makes this player the host if creating a Party Room
            if (query.roomID === undefined) {
                this.setState({ isHost: true });
            } else {
                this.setState({ isHost: false });
            }

            if (!this.props.socket) { this.props.Connect(query.roomID) };
        }
    }

    componentDidUpdate(nextProps) {
        if (nextProps.question !== this.props.question) { this.SetIsCorrect(false); } //Got new question

        if (this.props.socket !== undefined && this.props.rankings[0] === this.props.myId && !this.state.isWinner) { //Will set winner if index 0 in rankings is this user and not already set as winner
            this.setState({ isWinner: true })

            if (document.getElementById('victory-audio') === null) return //document.getElementById('victory-audio') is occasionally null. No idea why.
            document.getElementById('victory-audio').play()
            document.getElementById('fireworks-audio').play()
        } else if (this.props.rankings.length === 0 && this.state.isWinner) { //If rankings get cleared(Play Again) and user was winner, clears winner
            this.setState({ isWinner: false })
        }

        if (this.state.inParty) {
            //If this current user was not the host before but now is the host(old host disconnected), set this user as new host
            for (let i = 0; i < this.props.userList.length; i++) {
                if (this.props.userList[i].id === this.props.myId && this.props.userList[i].isHost && !this.state.isHost) {
                    this.setState({ isHost: true });
                }
            }
        }
    }

    componentWillUnmount() { this.props.Disconnect() }

    SetIsCorrect = (isCorrect) => { this.setState({ isCorrect }) }

    render() {
        let { userList, question, count, myId, roomID } = this.props;
        let { isCorrect, isWinner, isHost, inParty } = this.state;

        return (
            <>
                <div className='grid grid-cols-12 gap-4'>

                    {inParty &&
                        (<div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8'>
                            <p className='inline'><span className='font-bold'>Code:</span> {roomID}</p>
                        </div>)}

                    <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded'>
                        <UserList userList={userList} myId={myId} rankings={this.props.rankings} />
                    </div>

                    <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded p-2 min-h-300 text-center'>
                        <QuestionDisplay props={this.props} count={count} isCorrect={isCorrect}
                            question={question} isHost={isHost} inParty={inParty}
                            SetIsCorrect={x => this.SetIsCorrect(x)} ResetState={() => this.props.ResetState()} />
                    </div>

                </div>

                <Fireworks isWinner={isWinner} />
            </>
        );
    }
}

export default Game