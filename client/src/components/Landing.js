import React, { useState } from 'react'
import ReactGA from 'react-ga';
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setInParty } from '../redux/game';
import ErrorMsg from './ErrorMsg';

if (process.env.NODE_ENV !== 'development') {
    ReactGA.initialize('UA-103417969-4');
    ReactGA.pageview('/');
}

const Landing = () => {
    const dispatch = useDispatch();

    const [roomID, setRoomID] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const SearchForRoom = () => {
        if (roomID.length === 0) return;

        fetch(`/search?roomID=${roomID}`)
            .then(res => {
                if (res.status === 200) { //Room found
                    //Show SUCCESS flash message
                    dispatch(setInParty(true));
                    window.location.replace(window.location.origin + '/play/?roomID=' + roomID);
                } else if (res.status === 404) { //Room NOT found
                    setErrorMsg('Room not found :(');
                    //Show ERROR flash message
                } else if (res.status === 406) { //Room is full
                    setErrorMsg('Room is full :(');
                    //Show ERROR flash message
                }
            })
            .catch(err => console.log(err))
    }

    const EnterPressed = e => { if (e.key === 'Enter') { SearchForRoom() } }

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 qbr-card p-8'>
                <div className="grid grid-cols-12 gap-4">

                    <div className='col-span-12 md:col-span-8'>
                        <h1 className='text-3xl md:text-6xl'>Quick Brain Racers</h1>
                        <p>Play quick, simple brain games with others</p>
                    </div>

                    <div className='col-span-12 md:col-span-4 md:col-start-9'>
                        <Link to={`/play`} onClick={() => dispatch(setInParty(false))}>
                            <button className='bg-green-500 hover:bg-green-700 px-4 rounded w-full h-full text-xl md:text-3xl'>Play
                                <span className='inline-block ml-2 text-white absolute'>
                                    <svg className='h-7 w-7 relative top-1 md:top-1.5 animate-bounce z-0' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </button>
                        </Link>
                    </div>

                </div>

                <hr className='my-2' />

                <div>
                    <ErrorMsg errorMsg={errorMsg} />

                    <input className='border border-purple-400 rounded py-1 px-2 w-3/4 md:w-max block md:inline mx-auto md:m-0' placeholder='Search room code...' value={roomID}
                        onKeyPress={e => EnterPressed(e)} onChange={e => setRoomID(e.target.value.toUpperCase())} />
                    <button className='bg-purple-500 hover:bg-purple-700 w-3/4 md:w-max mx-auto block md:inline mt-1 md:mt-0 md:ml-2'
                        onClick={() => SearchForRoom()}>Search</button>

                    <p className='block md:inline mx-4 text-center'>or</p>

                    <Link to={`/play`} onClick={() => dispatch(setInParty(true))}>
                        <button className='bg-yellow-500 hover:bg-yellow-700 w-3/4 md:w-max mx-auto block md:inline'>Party Play</button>
                    </Link>

                </div>
            </div>
        </div>
    )
}

export default Landing;