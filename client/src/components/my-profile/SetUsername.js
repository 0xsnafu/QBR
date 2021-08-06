import React, { useState } from 'react';
import axios from 'axios';
import querystring from 'query-string';

import { updateUser } from '../../redux/user';
import { useSelector, useDispatch } from 'react-redux';
import { addFlashMsg } from '../../redux/flash';

import Spinner from './../Spinner';
import ErrorMsg from './../ErrorMsg';

const SetUsername = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [username, setUsername] = useState(user.username ? user.username : '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const Submit = (e) => {

        e.preventDefault();
        setIsProcessing(true);

        axios.post('/setusername', querystring.stringify({ username }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true })
            .then(res => {
                dispatch(updateUser())
                dispatch(addFlashMsg({ msg: res.data, type: 'success' }))
                setIsProcessing(false);
                setErrorMsg("");
            })
            .catch(err => {
                setErrorMsg(err.response.data);
                setIsProcessing(false);
            })
    }

    return (
        <div className='qbr-card'>
            <form onSubmit={Submit}>
                <p className='font-bold'>Username</p>

                <div className='flex justify-around'>
                    <input className={`${user.username ? 'w-full' : 'w-8/12'} inline-block disabled:opacity-50 `} disabled={user.username}
                        value={username} onChange={e => setUsername(e.target.value)} />
                    {!user.username && (
                        <button className='bg-green-500 hover:bg-green-700 inline-block w-3/12' disabled={isProcessing ? true : false}>
                            {isProcessing ? <Spinner /> : "Set"}
                        </button>
                    )}
                </div>

                <ErrorMsg errorMsg={errorMsg} />
            </form>
        </div>
    )
}

export default SetUsername;