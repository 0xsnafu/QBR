import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga';
import axios from 'axios';
import querystring from 'query-string';

import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/user'
import { addFlashMsg } from '../../redux/flash';
import SetUsername from './SetUsername';
import Spinner from '../Spinner';
import UpdatePassword from './UpdatePassword';

if (process.env.NODE_ENV !== 'development') {
    ReactGA.initialize('UA-103417969-4');
    ReactGA.pageview('/my-profile');
}

const MyProfile = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!localStorage.jwt) {
            window.location.replace(window.location.origin);
            return
        }

        dispatch(updateUser());
        setIsLoading(false);
    }, [dispatch, user])

    const SendVerifyEmail = () => {
        axios.post('/sendverifyemail', querystring.stringify({ email: user.email }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true })
            .then(res => {
                dispatch(addFlashMsg({ type: 'info', msg: res.data }))
            })
            .catch(err => console.log(err))

    }
    return (
        <>
            {isLoading
                ? <Spinner />
                :
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-start-2 col-span-10 md:col-start-5 md:col-span-4 p-2 md:p-8 '>
                        <h1 className='font-bold text-lg'>Profile</h1>
                        <hr />
                        <div className='inline'>
                            <p className='text-blue-500 inline mr-2'><span className='text-black font-bold'>Played: </span>{user.gamesPlayed}</p>
                            <p className='text-blue-500 inline mr-2'><span className='text-black font-bold'>Won: </span>{user.gamesWon}</p>
                            <p className={`inline font-bold ${user.isVerified ? 'text-green-500' : 'text-red-500'}`}>{user.isVerified ? "Verified" : "Unverified"}</p>
                        </div>

                        {!user.isVerified && (
                            <button className='bg-blue-500 hover:bg-blue-700 float-right py-0' onClick={() => SendVerifyEmail()}>Resend Email</button>
                        )}

                        <div className='mt-4'>
                            <SetUsername />
                        </div>

                        <div className='mt-4'>
                            <UpdatePassword />
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default MyProfile;