import React, { useState } from 'react';
import { Link } from "react-router-dom";

import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/user';

import SignInModal from './modals/SignInModal'
import SignUpModal from './modals/SignUpModal';

const NavBar = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [navbarOpen, setNavbarOpen] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    const authLinks = (
        <>
            <p>{user && user.username ? user.username : "Newbie"}</p>
            <Link to={'/my-profile'} data-tip='My Profile' className='px-3 py-2 flex items-center font-bold text-green-500 hover:opacity-75' >
                My Profile
            </Link>
            <li className="nav-item">
                <button className="px-3 py-2 flex items-center font-bold text-green-500 hover:opacity-75" onClick={() => dispatch(logoutUser({}))}>Sign Out</button>
            </li>
        </>
    )

    const guestLinks = (
        <>
            <li>
                <button className="px-3 py-2 flex items-center font-bold text-green-500 hover:opacity-75" onClick={() => setIsSignInModalOpen(!isSignInModalOpen)}>Sign In</button>
            </li>
            <li>
                <button className="px-3 py-2 flex items-center bg-green-500 rounded font-bold text-white hover:opacity-75" onClick={() => setIsSignUpModalOpen(!isSignUpModalOpen)}>Sign Up</button>
            </li>
        </>
    )

    return (
        <>
            <div className='md:grid md:grid-cols-12'>
                <nav className="relative flex flex-wrap items-center justify-between py-3 navbar-expand-lg mb-3 md:col-start-3 md:col-span-8">
                    <div className="container px-4 md:p-0 mx-auto flex flex-wrap items-center justify-between">
                        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
                            <Link to={'/'} data-tip='Home' className='text-2xl font-bold inline-block text-green-500' onClick={() => setNavbarOpen(false)}>
                                <img className='w-2/5' src='/qbr-logo.png' alt='QBR Logo' />
                            </Link>
                            <button className="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
                                type="button" onClick={() => setNavbarOpen(!navbarOpen)} aria-label='Open the dropdown'>

                                <svg className='h-7 w-7 text-green-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden='true'>
                                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className={"lg:flex flex-grow items-center " + (navbarOpen ? "flex" : "hidden")} >
                            <ul className="flex flex-col content-center lg:flex-row list-none lg:ml-auto w-full items-center">
                                <li className='ml-0 md:ml-auto'>
                                    <Link to={'/about'} data-tip='About' className='px-3 py-2 flex items-center font-bold text-green-500 hover:opacity-75' onClick={() => setNavbarOpen(false)}>
                                        About
                                    </Link>
                                </li>
                                {user && user.email ? authLinks : guestLinks}
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>

            <SignInModal isSignInModalOpen={isSignInModalOpen} CloseModal={() => setIsSignInModalOpen(false)} />
            <SignUpModal isSignUpModalOpen={isSignUpModalOpen} CloseModal={() => setIsSignUpModalOpen(false)} />
        </>
    )
}

export default NavBar