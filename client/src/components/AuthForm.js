import React, { useState } from 'react';
import axios from 'axios';
import querystring from 'query-string';
import jwt_decode from "jwt-decode";

import { useDispatch } from 'react-redux';
import { addFlashMsg } from './../redux/flash';
import { setUser } from '../redux/user';

import Spinner from './Spinner';
import ErrorMsg from './ErrorMsg';

const AuthForm = ({ buttonText }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("")

    const dispatch = useDispatch();

    const Submit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        if (buttonText === 'Sign In') {
            SignIn();
        } else if (buttonText === 'Sign Up') {
            SignUp();
        }
    }

    const SignIn = async () => {
        axios.post('/login', querystring.stringify({ email, password }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true })
            .then(res => {
                if (res.status === 200) {
                    localStorage.setItem('jwt', document.cookie.match("(^|;)\\s*jwt\\s*=\\s*([^;]+)")?.pop() || "");
                    const decoded = jwt_decode(localStorage.jwt);
                    dispatch(setUser(decoded));
                    dispatch(addFlashMsg({ msg: "Welcome back!😎", type: 'success' }))

                    ResetState();
                }
            })
            .catch(err => {
                setErrorMsg(err.response.data);
                setIsProcessing(false);
            })
    }

    const SignUp = () => {
        axios.post('/register', querystring.stringify({ email, password }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
            .then(res => {
                SignIn();
                dispatch(addFlashMsg({ msg: "Successfully signed up!", type: 'success' }))
                ResetState();
            })
            .catch(err => {
                setErrorMsg(err.response.data);
                setIsProcessing(false);
            })
    }

    const ResetState = () => {
        setEmail('');
        setPassword('');
        setIsProcessing(false);
        setErrorMsg('');
    }

    return (
        <form onSubmit={Submit}>
            <div className='py-2'>

                <label className='mb-3'>
                    <span className='text-gray-700 font-bold'>Email</span>
                    <input type='email' name='email' className='block w-full'
                        value={email} onChange={e => setEmail(e.target.value)} required />
                </label>

                <label className='relative'>
                    <span className='text-gray-700 font-bold'>Password</span>
                    {buttonText === 'Sign In' && (<p className='text-blue-500 underline cursor-pointer absolute top-0 right-0' >Forgot Password?</p>)}
                    <input type='password' name='password' className='w-full'
                        value={password} onChange={e => setPassword(e.target.value)} required />
                </label>
                <ErrorMsg errorMsg={errorMsg} />
            </div>

            <button className='bg-green-500 hover:bg-green-700 block mx-auto w-1/4' disabled={isProcessing ? true : false}>
                {isProcessing ? <Spinner /> : buttonText}
            </button>
        </form>
    )
}

export default AuthForm;