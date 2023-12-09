import React, { useEffect, useRef, useState } from 'react';
import WebSocketComponent from './WebSocketComponent';
import axios from 'axios';
import { wait } from '@testing-library/user-event/dist/utils';

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
    const [loadginRegistration, setLoadingRegistration] = useState(false);

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

    async function onMessageReceivedTopic(message, profileImage, user, registered) {
        const jwt = JSON.parse(message.body).body.token;
        if (jwt === "") {
            setError(true);
        }
        else if (!registered.current){
            registered.current = true;
            axios.post(
            `api/auth/register/uploadProfileImage/${user.current.username}`,
                  {
                    "username": user.current.username,
                    "profileImage": profileImage.current
                  },
                  {
                  headers: {
                   'Content-Type': 'application/json'
                 }
                }
               ).then((response) => {
                    console.log(response.data);
                    setLoadingRegistration(true);
                    waitForRegistration(jwt);
                });
        }
    }

    async function waitForRegistration(jwt) {
        await wait(5000);
        setJwt(jwt);
        setReload(true);
        setLoadingRegistration(false);
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
            {loadginRegistration ? 
                <div className="self-center justify-center">
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div> :
            <>
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
            </form> </>}
        </div>
    );
};

export default RegistrationComponent;
