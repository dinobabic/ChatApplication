import React, { useEffect, useRef, useState } from 'react';
import WebSocketComponent from './WebSocketComponent';
import axios from 'axios';

const RegistrationComponent = (props) => {
    const {setJwt, setReload} = {...props};
    const [user, setUser] = useState({
        "username": "",
        "password": "",
        "email": "",
        "firstName": "",
        "lastName": ""
    });
    const [profileImage, setProfileImage] = useState("");
    const profileImageRef = useRef();
    const userRef = useRef();
    const [error, setError] = useState(false);
    const webSocketComponenRef = useRef(null);
    const registeredRef = useRef(false);

    function updateUser(field, value) {
        setUser(user => (
            {
                ...user,
                [field]: value.trim()
            }
        ));
    }

    function updateProfileImage(event) {
        const profileImageLabel = document.querySelector(".profile-image-label");
        profileImageLabel.textContent = "Profile Image is Selected";

        const reader = new FileReader();
        if (event.target.files[0])  {
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = (event) => {
                setProfileImage(event.target.result);
                profileImageRef.current = event.target.result;
            }
        }

        event.target.value = "";
    }

    useEffect(( )=> {
        if (error) {
            const errorElement = document.querySelector(".error");
            errorElement.classList.remove("hidden");
            errorElement.classList.add("flex");
            setError(false);
        }
    }, [error, setError]);

    async function register(event) {
        event.preventDefault();
        let newUser = user;
        newUser["userId"] = user.username;
        if (!validateInput()) {
            return;   
        }
        userRef.current = newUser;
        webSocketComponenRef.current.register(newUser);
    }

    function timeout(delay) {
        return new Promise( res => setTimeout(res, delay) );
    }

    function onMessageReceivedTopic(message, profileImage, user, registered) {
        const jwt = JSON.parse(message.body).body.token;
        if (jwt === "") {
            setError(true);
        }
        else if (!registered.current){
            registered.current = true;
            axios.post(`api/auth/register/uploadProfileImage/${user.current.username}`, {
                "username": user.current.username,
                "profileImage": profileImage.current
            });
            setJwt(jwt);
            setReload(true);
        }
    } 

    function validateInput() {
        let returnValue = true;
        if (user.username === "") {
            returnValue = false;
        }
        if (user.password === "") {
            returnValue = false;
        }
        if (!validateEmail(user.email)) {
            returnValue = false;
        }
        if (user.firstName === "") {
            returnValue = false;
        }
        if (user.lastName === "") {
            returnValue = false;
        }
        if (profileImage === "") {
            returnValue = false;
        }
        if (!returnValue) {
            const validationError = document.querySelector(".validation-error");
            validationError.classList.remove("hidden");
            validationError.classList.add("flex");
        }

        return returnValue;
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

    return (
        <div className='flex-row mx-auto justify-center w-2/5 my-20 rounded-lg shadow-lg py-5 px-8'>
            <div className='flex justify-center mb-6'>
                <p className='text-3xl font-semibold'>Please Register</p>
            </div>
            <div className='hidden justify-center error mb-4'>
                <p className='text-xl text-red-500'>User with given username or email already exists!</p>
            </div>
            <div className='hidden justify-center validation-error mb-4'>
                <p className='text-xl text-red-500'>Neither of values can be blank. Email must be in correct format!</p>
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
                <div className='flex flex-col gap-2 mb-5'>
                    <label htmlFor='profileImage' className="profile-image-label shadow-md rounded-md py-3 px-4 w-3/5 font-semibold text-center cursor-pointer text-xl mb-8">
                        Choose Profile Image
                        <input type='file'
                            id='profileImage'
                            accept='image/*'
                            onInput={(event) => updateProfileImage(event)}
                            onClick={(event) => event.currentTarget.value = null}
                            className='hidden'/>
                    </label>
                </div>
                <div className='flex justify-center'>
                    <WebSocketComponent subscribeTopic={"/user/topic"} onMessageReceivedTopic={onMessageReceivedTopic} webSocketComponenRef={webSocketComponenRef}
                            profileImage={profileImageRef} user={userRef} registered={registeredRef}>
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