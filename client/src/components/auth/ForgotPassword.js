import React, { useState } from 'react';
import axios from 'axios';
import querystring from 'query-string';
import Spinner from '../Spinner';

import { useDispatch } from 'react-redux';
import { addFlashMsg } from '../../redux/flash';

const ForgotPassword = ({ CloseModal }) => {
    const [email, setEmail] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const dispatch = useDispatch();

    const Submit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        axios.post('/send-password-reset', querystring.stringify({ email }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true })
            .then(res => {
                dispatch(addFlashMsg({ type: 'info', msg: res.data }))
                setIsProcessing(false);
                CloseModal();
            })
            .catch(err => console.log(err))
    }

    return (
        <>
            <h2 className='font-bold text-green-500 text-center text-xl'>FORGOT PASSWORD</h2>
            <hr className='my-4' />

            <form onSubmit={Submit}>
                <label className='mb-3'>
                    <span className='text-gray-700 font-bold'>Email</span>
                    <input type='email' name='email' className='block w-full'
                        value={email} onChange={e => setEmail(e.target.value)} required />
                </label>

                <button className='bg-green-500 hover:bg-green-700 block mx-auto w-1/4' disabled={isProcessing ? true : false}>
                    {isProcessing ? <Spinner /> : "Reset"}
                </button>
            </form>
        </>
    )
}

export default ForgotPassword