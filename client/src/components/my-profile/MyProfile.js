import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga';

import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/user'
import { Redirect } from 'react-router-dom';
import SetUsername from './SetUsername';
import Spinner from '../Spinner';

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
    }, [dispatch])

    return (
        <>
            {isLoading
                ? <Spinner />
                :
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-start-2 col-span-10 md:col-start-5 md:col-span-4 p-2 md:p-8'>
                        <h1 className='font-bold text-lg'>Profile</h1>
                        <hr />
                        <h1>{user.email ? user.email + " 's profile" : <Redirect to='/' />}</h1>
                        <p className='text-blue-500'><span className='text-black font-bold'>Games Played: </span>{user.gamesPlayed}</p>
                        <p className='text-blue-500'><span className='text-black font-bold'>Games Won: </span>{user.gamesWon}</p>
                        <SetUsername />
                    </div>
                </div>
            }
        </>
    )
}

export default MyProfile;