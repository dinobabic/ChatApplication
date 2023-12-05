import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { TERipple } from 'tw-elements-react';
import axios from 'axios';

const SearchUsersComponent = (props) => {
    const {jwt, chatRooms, setChatRooms, setChange, setSelectedUser} = {...props};
    const [username, setUsername] = useState("");
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [displayUsersFlag, setDisplayUsersFlag] = useState(false);
    
    useEffect(() => {
        if (jwt !== "") {
            const jwtDecoded = jwtDecode(jwt);
            setUsername(jwtDecoded.username);

            axios.get("api/users", {
                headers: {
                  Authorization: `Bearer ${jwt}`
                }
            })
            .then(response => {
                setUsers(response.data.filter(user => user.username != jwtDecoded.username));
            })
        }
    }, []);

    function updateQuery(event) {
        event.preventDefault();
        setQuery(event.target.value);
    }

    function displayUsers(value) {
        setDisplayUsersFlag(value);
    }

    function addUserToChatRoom(event) {
        const key = event.target.dataset.key;
        axios.get(`api/users/createChatRoom/${key}`, {
            headers: {
              Authorization: `Bearer ${jwt}`
            }
        })
        .then((response) => {
            if (response.data !== "") {
                setChange(true);
            }
            setSelectedUser(key);
            setDisplayUsersFlag(false);
        });
    }

    return (
        <div className='mx-auto mt-10' onFocus={() => displayUsers(true)}>
            <div className="mb-3 md:w-96 mx-auto">
                <div className="relative mb-4 flex w-full flex-wrap items-stretch">
                    <input
                        type="search"
                        className="relative m-0 -mr-0.5 block w-[1px] min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="button-addon1"
                        value={query}
                        onChange={updateQuery}
                        
                         />

                    <button
                        className="relative z-[2] flex items-center rounded-r bg-green-500 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg"
                        type="button"
                        id="button-addon1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5">
                            <path
                                fillRule="evenodd"
                                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className='flex justify-center relative z-10 bg-white'>
                {displayUsersFlag && <div className='mb-3 md:w-60 mx-auto rounded-lg shadow-lg bg-white absolute z-10'>
                    <div className='flex justify-end mr-3'>
                        <p className='cursor-pointer font-bold' onClick={() => displayUsers(false)}>x</p>
                    </div>
                    <ul>
                        {users.filter((user) => user.username.includes(query)).slice(0, 4).map(user => {
                            return (
                                <div
                                    onClick={addUserToChatRoom}
                                    key={user.username}
                                    data-key={user.username} className='border-b-2 p-2 hover:bg-gray-100 cursor-pointer rounded-lg'>
                                    <li data-key={user.username} className='flex justify-center'>{user.username}</li>
                                </div>
                            );
                        })}
                    </ul>
                </div>}
            </div>
        </div>
    );
};

export default SearchUsersComponent;