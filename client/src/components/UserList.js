const UserList = ({ userList, myID, rankings }) => {

    const CalculateRankings = (userId) => {
        for (let i = 0; i < rankings.length; i++) {
            if (rankings[i] === userId) {
                switch (i) {
                    case 0: return <img className='mx-auto' src={window.location.origin + '/medals/first-medal.png'} alt='First place medal' />
                    case 1: return <img className='mx-auto' src={window.location.origin + '/medals/second-medal.png'} alt='Second place medal' />
                    case 2: return <img className='mx-auto' src={window.location.origin + '/medals/third-medal.png'} alt='Third place medal' />
                    case 3: return '4th'
                    default: return ''
                }
            }
        }
    }

    return (
        <ul className="grid grid-cols-12">
            {userList !== undefined && userList.map((user, index) => (
                <li key={index} className={`list-none py-2 col-span-12 md:col-span-3 text-center ${index !== userList.length - 1 && 'border-b-2 md:border-r-2'} md:border-b-0 border-green-500`}>

                    <div className='grid grid-cols-12'>
                        <div className='col-span-9 md:col-span-12'>
                            <span className='font-bold mx-1 float-left'>{user.elapsedTime.length > 0 && (user.elapsedTime)}</span>
                            {user.username}
                            {user.id === myID && (<span className='text-green-600 font-bold'>(You)</span>)}
                            {user.isHost && (<span className='text-red-600 font-bold'>(host)</span>)}
                        </div>

                        <div className='col-span-3 md:col-span-12'>
                            <div className='grid grid-cols-12'>
                                <div className='col-span-6 border-r-2 border-green-500'>
                                    <p className='bg-blackd px-1 text-black md:block md:ml-0 font-bold'>{user.score}</p>
                                </div>
                                <div className='col-span-6'>
                                    <p className='bg-blackd px-1 text-black md:block md:ml-0 font-bold'>{CalculateRankings(user.id)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </li>
            ))}
        </ ul>
    )
}

export default UserList;