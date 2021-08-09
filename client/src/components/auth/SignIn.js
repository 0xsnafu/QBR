import React from 'react';
import AuthForm from '../AuthForm';

const SignIn = () => {
    return (
        <>
            <h2 className='font-bold text-green-500 text-center text-xl'>SIGN IN</h2>
            <hr className='my-4' />

            <AuthForm buttonText={'Sign In'} />
        </>
    )
}

export default SignIn