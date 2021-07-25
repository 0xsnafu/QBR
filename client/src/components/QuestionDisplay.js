import { useState, useEffect } from 'react';
import Countdown from './Countdown';
import Choices from './Choices';
import { IsMatchOver } from '../utils/gameUtils';

const QuestionDisplay = ({ props, count, isCorrect, question, isHost, inParty, SetIsCorrect, ResetState }) => {
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [buttonText, setButtonText] = useState(inParty ? "Start!" : "Play Again")

    useEffect(() => {
        if (!inParty && IsMatchOver(props.rankings, props.myId)) { setIsButtonVisible(true); return; }
        if (!inParty && !IsMatchOver(props.rankings, props.myId)) { setIsButtonVisible(false); return; }

        if (inParty && !isHost) { setIsButtonVisible(false); return; } //Not party host, no need to see button ever
        if (inParty && isHost) {
            if (props.status === 5 && IsMatchOver(props.rankings, props.myId)) { //Match finished
                setButtonText("Play Again");
                setIsButtonVisible(true);
            } else if (props.status === 4 && !props.question.message) {
                setButtonText("Play");
                setIsButtonVisible(true);
            } else {
                setIsButtonVisible(false);
            }
        }


    }, [props.status, isHost, question, inParty, props.rankings, props.myId, props.question.message])

    const GenerateMessage = (statusToSend) => {
        let message = { status: statusToSend }

        props.socket.send(JSON.stringify(message));
        ResetState();
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
            {props.status === 0 && (<p>Match starts in <Countdown count={count} /></p>)}

            {(props.status === 4 && !inParty && (<h3>Searching for players...</h3>))}

            {props.status === 5 && (
                <>
                    <p className='text-2xl md:text-4xl my-2'>{question.choices !== undefined && question.message}</p>

                    <div className='grid grid-cols-2 md:grid-cols-6 '>
                        <Choices isCorrect={isCorrect} choices={question.choices} props={props} SetIsCorrect={x => SetIsCorrect(x)} />
                    </div>

                    <audio id='victory-audio' src='/audio/victory-sound.mp3' preload='auto' />
                    <audio id='fireworks-audio' src='/audio/fireworks-sound.mp3' preload='auto' />
                    <audio id='correct-audio' src='/audio/correct-sound.mp3' preload='auto' />
                    <audio id='incorrect-audio' src='/audio/incorrect-sound.mp3' preload='auto' />
                </>
            )}

            <button className={`bg-blue-400 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-md ${isButtonVisible ? 'inline' : 'hidden'}`}
                onClick={() => Play()}>{buttonText}</button>
        </>
    )
}

export default QuestionDisplay;