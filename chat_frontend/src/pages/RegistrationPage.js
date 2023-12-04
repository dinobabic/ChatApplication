import React, { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import LoginComponent from '../components/LoginComponent';
import NavigationComponent from '../components/NavigationComponent';
import RegistrationComponent from '../components/RegistrationComponent';

const RegistrationPage = (props) => {
    const {initializeWebSocketConnection, register, setReload, jwtIsValid} = {...props};
    const navigate = useNavigate();

    useEffect(() => {
        if (jwtIsValid) {
            navigate("/");
        }
    }, []);

    return (
        <>
            <NavigationComponent />
            <RegistrationComponent initializeWebSocketConnection={initializeWebSocketConnection} register={register} setReload={setReload}/>
        </>
    );
};

export default RegistrationPage;