import { Routes, Route } from 'react-router';
import { NextUIProvider } from "@nextui-org/react";
import { useNavigate } from 'react-router';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import { get } from './utils/fetch';
import { getCookie } from './utils/cookie';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import { defaultUser } from './consts/defaultUser';
import Profile from './components/Profile/Profile';
import ProtectedRoute from './utils/ProtectedRoute';
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {

  const [user, setUser] = useState({ ...defaultUser, loaded: false });
  const navigate = useNavigate();

  function sessionExpired(notifications, notificationEnabled = true) {
    setUser(defaultUser)
    navigate('/login')
    if(notificationEnabled) notifications.warning('Please log in to proceed.', 'Session expired')
  }

  useEffect(() => {
    const cookie = getCookie('token');
    if(cookie) {
      const jwt = jwtDecode(cookie);
      if(jwt && jwt?.exp > Date.now() / 1000) {
        get('/user').then(res => { res.ok ? setUser({ ...res.body, loaded: true }) : setUser(defaultUser) })
      } else setUser(defaultUser)
    } else setUser(defaultUser)
  }, []);

  return (
    <NextUIProvider>
      <NotificationProvider>
        <Routes>
          <Route path='/profile' element={
            <ProtectedRoute user={user}>
              <Profile user={user} setUser={setUser} sessionExpired={sessionExpired} />
            </ProtectedRoute>
          } />
          <Route path='/' element={<Login setUser={setUser} />} />
          <Route path='/register' element={<Signup />} />
        </Routes>
      </NotificationProvider>
    </NextUIProvider>
  );
}

export default App;
