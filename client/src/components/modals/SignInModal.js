// import React, { useState, useEffect } from 'react';
// import axios from 'axios'

// import FacebookLogin from 'react-facebook-login';
// import GoogleLogin from 'react-google-login';

// const SignInModal = ({ isSignInModalOpen, CloseModal }) => {
//     const [isHidden, setIsHidden] = useState(true);
//     const [isOpen, setIsOpen] = useState(isSignInModalOpen);

//     useEffect(() => {
//         if (isOpen !== isSignInModalOpen) {
//             setIsOpen(isSignInModalOpen)
//             setIsHidden(!isSignInModalOpen)
//         }
//     }, [isSignInModalOpen])

//     //FACEBOOK
//     const responseFacebook = (response) => {
//         let email = response.email
//         console.log(response)

//         axios.post('/auth/checkuser', { email })
//             .then(res => {
//                 if (res.data.success) {
//                     localStorage.setItem('token', res.data.token)
//                     CloseModal()
//                 }
//             })
//             .catch(err => console.log(err));
//     }

//     const responseGoogle = (response) => {
//         let email = response.profileObj.email
//         console.log(response)

//         axios.post('/auth/checkuser', { email })
//             .then(res => {
//                 if (res.data.success) {
//                     localStorage.setItem('token', res.data.token)
//                     CloseModal()
//                 }
//             })
//             .catch(err => console.log(err));
//     }

//     return (
//         <div className={`top-0 absolute w-screen h-screen ${isHidden ? 'hidden' : 'block'}`}>
//             <div className='bg-gray-600 bg-opacity-50 w-screen h-screen p-4 z-10' onClick={() => CloseModal()}></div>
//             <div className='absolute top-1/4 bg-white border-2 border-green-500 p-5 rounded w-11/12 md:w-1/4 modal-center z-10'>
//                 <h2 className='font-bold text-green-500 text-center text-xl'>SIGN IN/UP!</h2>
//                 <p className='text-gray-400 text-center'>Sign up to keep track of your wins, create a username, and more in the future! We only use 1 click social logins, so no more passwords!</p>

//                 <hr className='my-4' />

//                 <div className='text-center'>
//                     <FacebookLogin
//                         appId="285644586547233"
//                         autoLoad={false}
//                         fields="email"
//                         callback={(e) => responseFacebook(e)}
//                         icon="fa-facebook"
//                         textButton="Sign In"
//                         cssClass='fb-button text-white font-bold py-2 px-4 block mx-auto mb-4'
//                     />
//                     <GoogleLogin
//                         clientId="695008266068-08qaeh4rl7lvn0fvvllqa9s88bod7kgp.apps.googleusercontent.com"
//                         buttonText="Sign In"
//                         onSuccess={(e) => responseGoogle(e)}
//                         onFailure={(e) => responseGoogle(e)}
//                         cookiePolicy={'single_host_origin'}
//                         className='block'
//                     />
//                 </div>
//             </div>

//         </div>
//     )
// }

// export default SignInModal