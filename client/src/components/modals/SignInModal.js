import React, { useState, useEffect } from 'react';
import AuthForm from '../AuthForm';

import { useSelector } from 'react-redux';

const SignInModal = ({ isSignInModalOpen, CloseModal }) => {
    const { user } = useSelector(state => state.user)

    const [isHidden, setIsHidden] = useState(true);
    const [isOpen, setIsOpen] = useState(isSignInModalOpen);

    useEffect(() => {
        if (user && user.email) { CloseModal() } //If there is an email in redux(logged in), close modal
        if (isOpen !== isSignInModalOpen) {
            setIsOpen(isSignInModalOpen)
            setIsHidden(!isSignInModalOpen)
        }
    }, [isSignInModalOpen, user, CloseModal, isOpen])


    return (
        <div className={`top-0 absolute w-screen h-screen ${isHidden ? 'hidden' : 'block'}`}>
            <div className='bg-gray-600 bg-opacity-50 w-screen h-screen p-4 z-10' onClick={() => CloseModal()}></div>
            <div className='absolute top-1/4 bg-white border-2 border-green-500 p-5 rounded w-11/12 md:w-1/4 modal-center z-10'>
                <h2 className='font-bold text-green-500 text-center text-xl'>SIGN IN</h2>
                <p className='text-gray-400 text-center'>Sign up to keep track of your wins, create a username, and more in the future!</p>

                <hr className='my-4' />

                <AuthForm buttonText={'Sign In'} />
            </div>

        </div>
    )
}

export default SignInModal