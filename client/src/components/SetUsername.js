import React, { useState } from 'react';
import axios from 'axios';
import querystring from 'query-string';
import ReactGA from 'react-ga';

import { updateUser } from '../redux/user';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from './Spinner';
import ErrorMsg from './ErrorMsg';

if (process.env.NODE_ENV !== 'development') {
    ReactGA.initialize('UA-103417969-4');
    ReactGA.pageview('/my-profile');
}

const SetUsername = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [username, setUsername] = useState(user.username ? user.username : '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const Submit = (e) => {
        if (user.username) { return; }

        e.preventDefault();
        setIsProcessing(true);

        axios.post('/setusername', querystring.stringify({ username }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true })
            .then(res => {
                dispatch(updateUser())
                setIsProcessing(false);
            })
            .catch(err => {
                setErrorMsg(err.response.data);
                setIsProcessing(false);
            })
    }

    return (
        <div>
            <form onSubmit={Submit}>

                <p className='font-bold'>Set Username</p>
                <input className='mt-1 block w-full rounded-md bg-gray-200 border-transparent p-2' value={username} onChange={e => setUsername(e.target.value)} />
                <ErrorMsg errorMsg={errorMsg} />

                {!user.username && (<button className='bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-md block mx-auto w-1/4' disabled={isProcessing ? true : false}>
                    {isProcessing ? <Spinner /> : "Set"}
                </button>)}

            </form>
        </div>
    )
}

export default SetUsername;