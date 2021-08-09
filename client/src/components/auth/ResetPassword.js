import React, { useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import querystring from 'query-string';

import { useDispatch } from 'react-redux';
import { addFlashMsg } from '../../redux/flash';

import Spinner from './../Spinner';
import ErrorMsg from './../ErrorMsg';

const ResetPassword = () => {
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const dispatch = useDispatch();

    let { token } = useParams();

    const Submit = async (e) => {
        e.preventDefault();

        if (newPass.length < 3) {
            setErrorMsg("Password must be atleast 6 characters long")
            return
        }

        if (newPass !== confirmPass) {
            setErrorMsg("Password confirmation doesn't match the new password")
            return
        }
        setIsProcessing(true);

        axios.post('/reset-password', querystring.stringify({ password: newPass, token }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true })
            .then(res => {
                dispatch(addFlashMsg({ type: 'success', msg: res.data }));
                setIsProcessing(false);
                window.location.replace(window.location.origin);
            })
            .catch(err => {
                setErrorMsg(err.response.data);
                setIsProcessing(false);
            })
    }

    return (

        <div className="grid grid-cols-12 gap-4">
            <div className='col-start-2 col-span-10 md:col-start-4 md:col-span-6 border-2 qbr-card p-8'>
                <h2 className='font-bold text-green-500 text-center text-xl'>FORGOT PASSWORD</h2>
                <hr className='my-4' />

                <form onSubmit={Submit}>
                    <label htmlFor="newPass" className='font-bold'>New Password</label>
                    <div className='flex justify-around mb-2'>
                        <input id="newPass" type="password" className='w-full' value={newPass} onChange={e => setNewPass(e.target.value)} />
                    </div>

                    <label htmlFor="confirmPass" className='font-bold'>Confirm Password</label>
                    <div className='flex justify-around mb-2'>
                        <input id="confirmPass" type="password" className='w-full' value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                    </div>

                    <button className='bg-green-500 hover:bg-green-700 mx-auto block' disabled={isProcessing ? true : false}>
                        {isProcessing ? <Spinner /> : "Reset Password"}
                    </button>

                    <ErrorMsg errorMsg={errorMsg} />
                </form>
            </div>
        </div>
    )
}

export default ResetPassword