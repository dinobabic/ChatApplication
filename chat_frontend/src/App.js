import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import PrivateRoute from './components/PrivateRoute';
import RegistrationPage from './pages/RegistrationPage';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { wait } from '@testing-library/user-event/dist/utils';

function App() {
  const cookies = new Cookies();
  const [jwt, setJwt] = useState(cookies.get("jwt") !== undefined ? cookies.get("jwt") : "");
  const [jwtIsValid, setJwtIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const stompClientRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  const initializeWebSocketConnection = (body, setError, setInitializedWebSocket) => {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClientRef.current = Stomp.over(socket);
    stompClientRef.current.connect({}, () => onConnected(body, setError, setInitializedWebSocket));
  };

  const onConnected = (body, setError, setInitializedWebSocket) => {
    stompClientRef.current.subscribe(`/user/${body.username}/queue/messages`, (message) => console.log(message));
    stompClientRef.current.subscribe(`/user/public`, onMessageReceived);
    stompClientRef.current.subscribe(`/user/topic`, (message) => onMessageTokenReceived(message, setError));
    setStompClient(stompClientRef.current);
    setInitializedWebSocket(true);
  }

  const initializeWebSocket = (body) => {
    return new Promise((resolve, reject) => {
      const socket = new SockJS('http://localhost:8080/ws');
      stompClientRef.current = Stomp.over(socket);
      stompClientRef.current.connect({}, () => {
        stompClientRef.current.subscribe(`/user/${body.username}/queue/messages`, onMessageReceived);
        stompClientRef.current.subscribe(`/user/public`, onMessageReceived);
        stompClientRef.current.subscribe(`/user/topc`, onMessageReceived);
      });
      setStompClient(stompClientRef.current);
      resolve(stompClientRef.current);
    });
  }

  const logout = async (body) => {
    const tmpStompClient = await initializeWebSocket(body);
    await wait(1000);
    tmpStompClient.send(`/app/user.disconnectUser`, {}, JSON.stringify(body));
  }

  const sendMessage = async (body) => {
    const tmpStompClient = await initializeWebSocket(body);
    await wait(1000);
    tmpStompClient.send(`/app/chat`, {}, JSON.stringify(body));
  }

  const authenticate = (body) => {
    stompClient.send(`/app/authenticate/user.addUser`, 
        {}, 
        JSON.stringify(body));
  }

  const register = (body) => {
    stompClient.send(`/app/register/user.addUser`, 
      {}, 
      JSON.stringify(body));
  }

  const onMessageReceived = (message) => {
    console.log(message);
  }

  const onMessageTokenReceived = (message, setError) => {
    const jwt = JSON.parse(message.body).body.token;
    if (jwt === "") {
        setError(true);
    }
    else {
        setJwt(jwt);
    }
  }

  useEffect(() => {
    if (jwt !== "") {
      axios.get("api/auth/validate", {
        params: {
          token: jwt
        }
      })
      .then(response => {
        if (response.data) {
          setJwtIsValid(true);
          cookies.set("jwt", jwt);
        }
        setLoading(false);
        if (reload) {
          window.location.reload();
        }
      })
    }
    else {
      setLoading(false);
    }
  }, [jwt]);

  return (
    !loading && 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PrivateRoute jwtIsValid={jwtIsValid}>
            <HomePage jwtIsValid={jwtIsValid} logout={logout} jwt={jwt} sendMessage={sendMessage}/>
          </PrivateRoute>
        } />
        <Route path='/login' element={
          <LoginPage initializeWebSocketConnection={initializeWebSocketConnection} authenticate={authenticate} setReload={setReload} jwtIsValid={jwtIsValid}/>
        } />
        <Route path='/register' element={
          <RegistrationPage initializeWebSocketConnection={initializeWebSocketConnection} register={register} setReload={setReload} jwtIsValid={jwtIsValid}/>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
