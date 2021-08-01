import React, { useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import jwt_decode from "jwt-decode";

import './index.css';
import './App.css';

import Landing from "./components/Landing";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Game from "./components/Game";

import { useDispatch } from 'react-redux';
import { setUser, logoutUser } from './redux/user';

const App = () => {
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

  }, [dispatch])

  return (
    <Router>
      <div className="App">

        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />

        <Navbar />

        <Route exact path='/' component={Landing} />
        <Route exact path='/about' component={About} />
        <Route exact path='/play' component={Game} />

      </div>
    </Router>
  );
};


export default App