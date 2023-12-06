import React, { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import LoginComponent from '../components/LoginComponent';
import NavigationComponent from '../components/NavigationComponent';
import RegistrationComponent from '../components/RegistrationComponent';

const RegistrationPage = (props) => {
    const {setJwt, jwtIsValid, setReload} = {...props};
    const navigate = useNavigate();

    useEffect(() => {
        if (jwtIsValid) {
            navigate("/");
        }
    }, []);

    return (
        <>
            <NavigationComponent displayLogin={true} />
            <RegistrationComponent setJwt={setJwt} setReload={setReload}/>
        </>
    );
};

export default RegistrationPage;