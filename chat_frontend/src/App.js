import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import PrivateRoute from './components/PrivateRoute';
import RegistrationPage from './pages/RegistrationPage';

function App() {
  const cookies = new Cookies();
  const [jwt, setJwt] = useState(cookies.get("jwt") !== undefined ? cookies.get("jwt") : "");
  const [jwtIsValid, setJwtIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

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
  }, [jwt, setJwt]);

  return (
    !loading && 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PrivateRoute jwtIsValid={jwtIsValid}>
            <HomePage jwtIsValid={jwtIsValid} jwt={jwt} />
          </PrivateRoute>
        } />
        <Route path='/login' element={
          <LoginPage setJwt={setJwt} jwtIsValid={jwtIsValid} setReload={setReload}/>
        } />
        <Route path='/register' element={
          <RegistrationPage setJwt={setJwt} jwtIsValid={jwtIsValid} setReload={setReload}/>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
