import React, { useState } from 'react';
import axios from 'axios';
import querystring from 'query-string';

import { useDispatch } from 'react-redux';
import { addFlashMsg } from '../../redux/flash';

import Spinner from './../Spinner';
import ErrorMsg from './../ErrorMsg';

const UpdatePassword = () => {
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const dispatch = useDispatch();

    const Submit = (e) => {
        e.preventDefault();

        if (oldPass.length === 0) {
            setErrorMsg("You must input your old password!")
            return
        }

        if (newPass !== confirmPass) {
            setErrorMsg("Password confirmation doesn't match the new password")
            return
        }
        setIsProcessing(true);

        axios.post('/updatepassword', querystring.stringify({ oldPass, newPass }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true })
            .then(res => {
                dispatch(addFlashMsg({ msg: res.data, type: 'success' }))
                setOldPass("");
                setNewPass("");
                setConfirmPass("");
                setErrorMsg("");
                setIsProcessing(false);
            })
            .catch(err => {
                setErrorMsg(err.response.data);
                setIsProcessing(false);
            })
    }

    return (
        <div className='qbr-card'>
            <form onSubmit={Submit}>
                <p className='font-bold'>Password</p>
                <hr className='mb-2' />

                <label htmlFor="oldPass" className='font-bold'>Old Password</label>
                <div className='flex justify-around mb-2'>
                    <input id="oldPass" type="password" className='w-full' value={oldPass} onChange={e => setOldPass(e.target.value)} />
                </div>

                <label htmlFor="newPass" className='font-bold'>New Password</label>
                <div className='flex justify-around mb-2'>
                    <input id="newPass" type="password" className='w-full' value={newPass} onChange={e => setNewPass(e.target.value)} />
                </div>

                <label htmlFor="confirmPass" className='font-bold'>Confirm Password</label>
                <div className='flex justify-around mb-2'>
                    <input id="confirmPass" type="password" className='w-full' value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                </div>

                <button className='bg-green-500 hover:bg-green-700 mx-auto block' disabled={isProcessing ? true : false}>
                    {isProcessing ? <Spinner /> : "Update Password"}
                </button>

                <ErrorMsg errorMsg={errorMsg} />
            </form>
        </div>
    )
}

export default UpdatePassword;