import React, { useState, useEffect } from 'react';
import AuthForm from '../AuthForm';

import { useSelector } from 'react-redux';

const SignUpModal = ({ isSignUpModalOpen, CloseModal }) => {
    const { user } = useSelector(state => state.user)

    const [isHidden, setIsHidden] = useState(true);
    const [isOpen, setIsOpen] = useState(isSignUpModalOpen);

    useEffect(() => {
        if (user && user.email) { CloseModal() } //If there is an email in redux(logged in), close modal
        if (isOpen !== isSignUpModalOpen) {
            setIsOpen(isSignUpModalOpen)
            setIsHidden(!isSignUpModalOpen)
        }
    }, [isSignUpModalOpen, user, CloseModal, isOpen])

    return (
        <div className={`top-0 absolute w-screen h-screen ${isHidden ? 'hidden' : 'block'}`}>
            <div className='qbr-modal-bg' onClick={() => CloseModal()}></div>
            <div className='absolute top-1/4 qbr-card bg-white p-5 w-11/12 md:w-1/4 modal-center z-10'>
                <h2 className='font-bold text-green-500 text-center text-xl'>SIGN UP</h2>
                <p className='text-gray-400 text-center'>Sign up to keep track of your wins, create a username, and more in the future!</p>

                <hr className='my-4' />

                <AuthForm buttonText={'Sign Up'} />
            </div>

        </div>
    )
}

export default SignUpModal