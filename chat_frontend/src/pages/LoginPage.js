import React, { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import LoginComponent from '../components/LoginComponent';
import NavigationComponent from '../components/NavigationComponent';

const LoginPage = (props) => {
    const {setJwt, jwtIsValid, setReload} = {...props};
    const navigate = useNavigate();

    useEffect(() => {
        if (jwtIsValid) {
            navigate("/");
        }
    }, []);

    return (
        <>
            <NavigationComponent />
            <LoginComponent setJwt={setJwt} setReload={setReload}/>
        </>
    );
};

export default LoginPage;