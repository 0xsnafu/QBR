import React, { useState } from 'react';
import axios from 'axios';
import querystring from 'query-string';
import jwt_decode from "jwt-decode";

import { useDispatch } from 'react-redux';
import { setUser } from '../redux/user';
import Spinner from './Spinner';

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
                if (res.status === 200) {
                    SignIn();
                    ResetState();
                }
            })
            .catch(err => {
                if (err.response.status === 409) {
                    setErrorMsg(err.response.data);
                } else if (err.response.data.Errors) {
                    setErrorMsg(err.response.data.Errors.password[0]);
                }

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

                <label className='block mb-3'>
                    <span className='text-gray-700 font-bold'>Email</span>
                    <input type='email' name='email' className='mt-1 block w-full rounded-md bg-gray-200 border-transparent p-2'
                        value={email} onChange={e => setEmail(e.target.value)} required />
                </label>

                <label className='block relative'>
                    <span className='text-gray-700 font-bold'>Password</span>
                    {buttonText === 'Sign In' && (<p className='text-blue-500 underline cursor-pointer absolute top-0 right-0' >Forgot Password?</p>)}
                    <input type='password' name='password' className='mt-1 block w-full rounded-md bg-gray-200 border-transparent p-2'
                        value={password} onChange={e => setPassword(e.target.value)} required />
                </label>

                <p className='text-red-500 font-bold'>{errorMsg}</p>
            </div>

            <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-md block mx-auto w-1/4' disabled={isProcessing ? true : false}>
                {isProcessing ? <Spinner /> : buttonText}
            </button>
        </form>
    )
}

export default AuthForm;