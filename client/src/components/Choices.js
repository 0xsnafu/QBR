import { useState } from "react";
import { IsMatchOver } from "../utils/gameUtils";
import { useSelector } from 'react-redux';

const Choices = ({ socket }) => {
    const { myID, question, rankings } = useSelector(state => state.game);
    const [isIncorrect, setIsIncorrect] = useState(false);

    const CheckAnswer = (choice) => {
        if (IsMatchOver(rankings, myID)) return;

        if (choice === question.answer) { //Correct
            document.getElementById('correct-audio').play()
        } else { //Incorrect
            setIsIncorrect(true);
            document.getElementById('incorrect-audio').play()

            setTimeout(() => { setIsIncorrect(false) }, 750);
        }

        let message = {
            status: 6,
            body: [choice.toString()]
        }

        socket.send(JSON.stringify(message))
    }

    return (
        question.choices !== undefined && question.choices.map((choice, index) => {
            return <button key={index} className={`${index === 0 && ('md:col-start-2')} mx-auto text-black rounded-full h-24 w-24 m-3 text-2xl
                ${isIncorrect ? 'border-white bg-red-600 text-white' : 'border-2 border-black'}`}
                disabled={isIncorrect} onClick={() => CheckAnswer(choice)}>{choice}</button>
        })
    )
}

export default Choices;