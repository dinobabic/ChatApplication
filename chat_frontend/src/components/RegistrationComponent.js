import React, { useEffect, useRef, useState } from 'react';
import WebSocketComponent from './WebSocketComponent';

const RegistrationComponent = (props) => {
    const {setJwt, setReload} = {...props};
    const [user, setUser] = useState({
        "username": "",
        "password": "",
        "email": "",
        "firstName": "",
        "lastName": "",
    });
    const [error, setError] = useState(false);
    const webSocketComponenRef = useRef(null);

    function updateUser(field, value) {
        setUser(user => (
            {
                ...user,
                [field]: value
            }
        ));
    }

    useEffect(( )=> {
        if (error) {
            const errorElement = document.querySelector(".error");
            errorElement.classList.remove("hidden");
            errorElement.classList.add("flex");
            setError(false);
        }
    }, [error, setError]);

    function register(event) {
        event.preventDefault();
        let newUser = user;
        newUser["userId"] = user.username;
        webSocketComponenRef.current.register(newUser);
    }

    function onMessageReceivedTopic(message) {
        const jwt = JSON.parse(message.body).body.token;
        if (jwt === "") {
            setError(true);
        }
        else {
            setJwt(jwt);
            setReload(true);
        }
    } 

    return (
        <div className='flex-row mx-auto justify-center w-2/5 my-20 rounded-lg shadow-lg py-5 px-8'>
            <div className='flex justify-center mb-6'>
                <p className='text-3xl font-semibold'>Please Register</p>
            </div>
            <div className='hidden justify-center error'>
                <p className='text-xl text-red-500'>User with given username already exists!</p>
            </div>
            <form>
                <div className='flex flex-col gap-2 mb-5'>
                    <label htmlFor='username' className="font-semibold">Username</label>
                    <input type='text'
                        id='username'
                        value={user.username}
                        onChange={(event) => updateUser("username", event.target.value)}
                        className='focus:outline-none shadow-md rounded-md py-1 px-4 text-xl w-4/5'/>
                </div>

                <div className='flex flex-col gap-2 mb-5'>
                    <label htmlFor='password' className="font-semibold">Password</label>
                    <input type='password'
                        id='password'
                        value={user.password}
                        onChange={(event) => updateUser("password", event.target.value)}
                        className='focus:outline-none shadow-md rounded-md py-1 px-4 text-xl w-4/5'/>
                </div>

                <div className='flex flex-col gap-2 mb-5'>
                    <label htmlFor='email' className="font-semibold">Email</label>
                    <input type='email'
                        id='email'
                        value={user.email}
                        onChange={(event) => updateUser("email", event.target.value)}
                        className='focus:outline-none shadow-md rounded-md py-1 px-4 text-xl w-4/5'/>
                </div>

                <div className='flex flex-col gap-2 mb-5'>
                    <label htmlFor='firstName' className="font-semibold">First Name</label>
                    <input type='text'
                        id='firstName'
                        value={user.firstName}
                        onChange={(event) => updateUser("firstName", event.target.value)}
                        className='focus:outline-none shadow-md rounded-md py-1 px-4 text-xl w-4/5'/>
                </div>

                <div className='flex flex-col gap-2 mb-5'>
                    <label htmlFor='lastName' className="font-semibold">Last Name</label>
                    <input type='text'
                        id='lastName'
                        value={user.lastName}
                        onChange={(event) => updateUser("lastName", event.target.value)}
                        className='focus:outline-none shadow-md rounded-md py-1 px-4 text-xl w-4/5'/>
                </div>
                <div className='flex justify-center'>
                    <WebSocketComponent subscribeTopic={"/user/topic"} onMessageReceivedTopic={onMessageReceivedTopic} webSocketComponenRef={webSocketComponenRef}>
                        <button type='submit'
                            className='focus:outline-none shadow-md rounded-md py-1 px-4 text-xl w-32 bg-green-400 text-white cursor-pointer'
                            onClick={register}>Register</button>
                    </WebSocketComponent>
                </div>
            </form>
        </div>
    );
};

export default RegistrationComponent;