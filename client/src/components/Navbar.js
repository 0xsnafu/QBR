import React, { useState } from 'react';
import { Link } from "react-router-dom";

// import SignInModal from './modals/SignInModal'

const NavBar = () => {
    const [navbarOpen, setNavbarOpen] = useState(false);
    // const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

    // const SignOut = () => {
    //     localStorage.removeItem('token')
    //     window.location.reload()
    // }

    // const authLinks = (
    //     <>
    //         <li className="nav-item">
    //             <a className="px-3 py-2 flex items-center font-bold text-green-500 hover:opacity-75" href='/my-profile'>My Profile</a>
    //         </li>
    //         <li className="nav-item">
    //             <button className="px-3 py-2 flex items-center font-bold text-green-500 hover:opacity-75" onClick={() => SignOut()}>Sign Out</button>
    //         </li>
    //     </>
    // )

    // const guestLinks = (
    //     <li className="nav-item text-right">
    //         <a className="py-2 flex items-center font-bold text-green-500 hover:opacity-75" href="#" onClick={() => setIsSignInModalOpen(!isSignInModalOpen)}>Sign In/Up</a>
    //     </li>
    // )

    // const CloseModal = () => { setIsSignInModalOpen(false) }

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
                        <div className={"lg:flex flex-grow items-center" + (navbarOpen ? " flex" : " hidden")} id="example-navbar-danger" >
                            <ul className="flex flex-col content-center lg:flex-row list-none lg:ml-auto w-full items-center">
                                <Link to={'/about'} data-tip='About' className='nav-item text-right md:ml-auto' onClick={() => setNavbarOpen(false)}>
                                    <span className='px-3 py-2 flex items-center font-bold text-green-500 hover:opacity-75 mr-3'>About</span>
                                </Link>
                                {/* {localStorage.token ? authLinks : guestLinks} */}
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>

            {/* <SignInModal isSignInModalOpen={isSignInModalOpen} CloseModal={() => CloseModal()} /> */}
        </>
    )
}

export default NavBar