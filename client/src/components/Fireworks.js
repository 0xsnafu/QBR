import { useSelector } from "react-redux"

const Fireworks = () => {
    const { isWinner } = useSelector(state => state.game);

    return (
        <div className={`${isWinner ? 'pyro' : 'hidden'}`}>
            <div className="before"></div>
            <div className="after"></div>
        </div>)
}

export default Fireworks