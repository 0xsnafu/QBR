import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga';

import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import SetUsername from './SetUsername';
import Spinner from './Spinner';

if (process.env.NODE_ENV !== 'development') {
    ReactGA.initialize('UA-103417969-4');
    ReactGA.pageview('/my-profile');
}

const MyProfile = () => {
    const { user } = useSelector(state => state.user);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.jwt) {
            window.location.replace(window.location.origin);
            return
        }

        setIsLoading(false);
    }, [])

    return (
        <>
            {isLoading
                ? <Spinner />
                :
                <div className="grid grid-cols-12 gap-4">
                    <div className='col-start-2 col-span-10 md:col-start-3 md:col-span-8 border-2 border-green-500 rounded p-8'>
                        <h1 className='font-bold text-lg'>Profile</h1>
                        <hr />
                        <h1>{user.email ? user.email + " 's profile" : <Redirect to='/' />}</h1>
                        <SetUsername />
                    </div>
                </div>
            }
        </>
    )
}

export default MyProfile;