import React, { useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './styles/tailwindcomponents.css';
import './styles/index.css';
import './styles/App.css';

import Landing from "./components/Landing";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Game from "./components/Game";

import { useDispatch, useSelector } from 'react-redux';
import { setUser, logoutUser } from './redux/user';
import MyProfile from "./components/my-profile/MyProfile";

const App = () => {
  const { flashMsgs } = useSelector(state => state.flash);
  const dispatch = useDispatch();

  useEffect(() => {
    //If in .herokuapp url OR in http url, redirect to live url. Doesn't redirect in localhost
    if ((window.location.hostname.includes('herokuapp') || window.location.protocol.includes('http:')) && !window.location.hostname.includes('localhost')) {
      window.location.replace("https://quickbrainracers.com");
    }

    //Check for token
    if (localStorage.jwt) {
      const decoded = jwt_decode(localStorage.jwt);
      dispatch(setUser(decoded));

      //Check for expired token
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        dispatch(logoutUser());
      }
    }
  }, [dispatch, flashMsgs])

  return (
    <Router>
      <div className="App">

        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />

        <ToastContainer position="top-center" autoClose={2000} />

        <Navbar />

        <Route exact path='/' component={Landing} />
        <Route exact path='/about' component={About} />
        <Route exact path='/play' component={Game} />
        <Route exact path='/my-profile' component={MyProfile} />

      </div>
    </Router>
  );
};


export default App