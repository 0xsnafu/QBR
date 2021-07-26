import { useState, useEffect } from 'react';
import { IsMatchOver } from '../utils/gameUtils';
import { ResetState } from '../redux/game';
import { useDispatch, useSelector } from 'react-redux';

import Countdown from './Countdown';
import Choices from './Choices';

const QuestionDisplay = ({ socket }) => {
    const { myID, question, rankings, count, status, inParty, isHost } = useSelector(state => state.game);
    const dispatch = useDispatch();

    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [buttonText, setButtonText] = useState(inParty ? "Start!" : "Play Again")

    useEffect(() => {
        if (!inParty && IsMatchOver(rankings, myID)) { setIsButtonVisible(true); return; }
        if (!inParty && !IsMatchOver(rankings, myID)) { setIsButtonVisible(false); return; }

        if (inParty && !isHost) { setIsButtonVisible(false); return; } //Not party host, no need to see button ever
        if (inParty && isHost) {
            if (status === 5 && IsMatchOver(rankings, myID)) { //Match finished
                setButtonText("Play Again");
                setIsButtonVisible(true);
            } else if (status === 4 && !question.message) {
                setButtonText("Play");
                setIsButtonVisible(true);
            } else {
                setIsButtonVisible(false);
            }
        }

        console.log('question:', question)
    }, [status, isHost, question, inParty, rankings, myID])

    const GenerateMessage = (statusToSend) => {
        let message = { status: statusToSend }

        socket.send(JSON.stringify(message));
        dispatch(ResetState());
    }

    const Play = () => {
        setIsButtonVisible(false);

        if (!inParty) {
            GenerateMessage(7);
        } else if (inParty) {
            GenerateMessage(11);
        }
    }

    return (
        <>
            {status === 0 && (<p>Match starts in <Countdown count={count} /></p>)}

            {(status === 4 && !inParty && (<h3>Searching for players...</h3>))}

            {status === 5 && (
                <>
                    <p className='text-2xl md:text-4xl my-2'>{question.choices !== undefined && question.message}</p>

                    <div className='grid grid-cols-2 md:grid-cols-6 '>
                        <Choices socket={socket} />
                    </div>

                    <audio id='victory-audio' src='/audio/victory-sound.mp3' preload='auto' />
                    <audio id='fireworks-audio' src='/audio/fireworks-sound.mp3' preload='auto' />
                    <audio id='correct-audio' src='/audio/correct-sound.mp3' preload='auto' />
                    <audio id='incorrect-audio' src='/audio/incorrect-sound.mp3' preload='auto' />
                </>
            )}
            {isButtonVisible}
            <button className={`bg-blue-400 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-md ${isButtonVisible ? 'inline' : 'hidden'}`}
                onClick={() => Play()}>{buttonText}</button>
        </>
    )
}

export default QuestionDisplay;