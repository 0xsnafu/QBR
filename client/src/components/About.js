import { useState } from 'react';
import ReactGA from 'react-ga';
import PrivacyPolicy from './PrivacyPolicy';
import TermsAndConditions from './TermsAndConditions';

if (process.env.NODE_ENV !== 'development') {
    ReactGA.initialize('UA-103417969-4');
    ReactGA.pageview('/about');
}

const About = () => {
    const [isTAndCOpen, setIsTAndCOpen] = useState(false);
    const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
    return (
        <div className="grid grid-cols-12 gap-4">
            <div className='col-start-2 col-span-10 md:col-start-4 md:col-span-6 border-2 border-green-500 rounded p-2'>

                <h1 className='font-bold mb-2'>About <span className='text-green-500'>Quick Brain Racers</span>...</h1>

                <p className='mb-2'>Quick Brain Racers is a passion project created by a single developer. The point of QBR is to create a space to practice some brain games,
                    and compete with others in doing so! QBR is still VERY early in development.</p>

                <p className='mb-2'>In the future, we will be adding user accounts so that you can keep track of your progress and personalize your experience. There will also be different types of games and modes
                    to play!</p>

                <p>If you have any questions or just want to reach out, feel free to email us at <a className="font-bold text-blue-500" href="mailto:quickbrainracers@gmail.com">quickbrainracers@gmail.com</a> </p>

            </div>

            <div className='col-start-2 col-span-10 md:col-start-4 md:col-span-6'>
                <h2 className='font-bold text-lg cursor-pointer underline' onClick={() => setIsTAndCOpen(!isTAndCOpen)}>Terms and Conditions</h2>
                <TermsAndConditions isOpen={isTAndCOpen} />
                <br />

                <h2 className='font-bold text-lg cursor-pointer underline' onClick={() => setIsPrivacyPolicyOpen(!isPrivacyPolicyOpen)}>Privacy Policy</h2>
                <PrivacyPolicy isOpen={isPrivacyPolicyOpen} />
            </div>
        </div >
    )
}

export default About;