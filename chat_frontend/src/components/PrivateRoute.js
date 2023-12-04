import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = (props) => {
    const {children, jwtIsValid} = {...props};
    
    if (jwtIsValid) {
        return children;
    }
    else {
        return <Navigate to={"/login"}></Navigate>
    }
};

export default PrivateRoute;