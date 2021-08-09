import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import ForgotPassword from './auth/ForgotPassword';

const Modal = ({ isOpen, CloseModal, modalViewing, clickedForgotPassword }) => {
    const { user } = useSelector(state => state.user)

    const [isHidden, setIsHidden] = useState(true);
    const [modal, setModal] = useState(); //Actual component gets set in here

    useEffect(() => {
        if (user && user.email) { CloseModal() } //If there is an email in redux(logged in), close modal

        setIsHidden(!isOpen);

        switch (modalViewing) {
            case "Sign In":
                setModal(<SignIn />);
                break;
            case "Sign Up":
                setModal(<SignUp />);
                break;
            case "Forgot Password":
                setModal(<ForgotPassword CloseModal={() => CloseModal()} />);
                break;
            default: setModal();
        }

    }, [isOpen, CloseModal, user, modalViewing])


    return (
        <div className={`top-0 absolute w-screen h-screen ${isHidden ? 'hidden' : 'block'}`}>
            <div className='qbr-modal-bg' onClick={() => CloseModal()}></div>
            <div className='absolute top-1/4 qbr-card bg-white p-5 w-11/12 md:w-1/4 modal-center z-10'>
                {modal}

                {modalViewing === 'Sign In' && (<p className='text-blue-500 underline cursor-pointer float-left mt-2' onClick={() => clickedForgotPassword()}>Forgot Password?</p>)}
            </div>

        </div>
    )
}

export default Modal;