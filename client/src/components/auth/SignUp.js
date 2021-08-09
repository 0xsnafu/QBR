import React from 'react';
import AuthForm from '../AuthForm';

const SignUp = () => {
    return (
        <>
            <h2 className='font-bold text-green-500 text-center text-xl'>SIGN UP</h2>
            <p className='text-gray-400 text-center'>Sign up to keep track of your wins, create a username, and more in the future!</p>

            <hr className='my-4' />

            <AuthForm buttonText={'Sign Up'} />
        </>
    )
}

export default SignUp