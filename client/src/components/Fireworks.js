const Fireworks = ({ isWinner }) => {

    return (
        <div className={`${isWinner ? 'pyro' : 'hidden'}`}>
            <div className="before"></div>
            <div className="after"></div>
        </div>)
}

export default Fireworks