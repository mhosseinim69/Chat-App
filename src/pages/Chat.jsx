import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { allUsersRoute, host, statusRoute } from '../utils/APIRoutes';
import Contacts from '../components/Contacts';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import { io } from "socket.io-client";

function Chat() {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setisLoaded] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeunload', changeUserStatus);
    return () => {
      window.removeEventListener('beforeunload', changeUserStatus);
    };
  }, [currentUser]);


  useEffect(() => {
    async function fetchData () {
    if(!localStorage.getItem('chat-app-user')){
      navigate('/login')
    } else {
      setCurrentUser(await JSON.parse(localStorage.getItem('chat-app-user')))
      setisLoaded(true);
    }
  }
  fetchData ()
  },[]);

  useEffect(()=> {
    if(currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  },[currentUser])

  useEffect (()=> { 
    async function fetchData () {
      if (currentUser) {
        await socket.current.emit("send-status", {
          id: currentUser._id,
          online: true,
        });
        axios.post(statusRoute, {
          id: currentUser._id,
          online: true,
        });
      }
  }
  fetchData ()
  },[currentUser])

  
  useEffect(() => {
    if(socket.current) {
        socket.current.on("status-recieve",(data)=> {
          const updateContact = contacts.map(contact => {
            if (data.online === true && contacts.find(contact => contact._id === data.id)) {
              contacts.find(contact => contact._id === data.id).userOnline=true;
            }
            return contact
          })
          setContacts(updateContact)
        });          
    }
  },);


  const changeUserStatus = useCallback (() => {
    async function fetchData () {
    await socket.current.emit("send-status", {
      id: currentUser._id,
      online: false,
  });
    axios.post(statusRoute, {
      id: currentUser._id,
      online: false,
  });
}
  fetchData ()
  })


  useEffect(() => {
    if(socket.current) {
        socket.current.on("status-recieve",(data)=> {
          const updateContact = contacts.map(contact => {
            if (data.online === false && contacts.find(contact => contact._id === data.id)) {
              contacts.find(contact => contact._id === data.id).userOnline=false;
            }
            return contact
          })
          setContacts(updateContact)
        });          
    }
  },);

  useEffect(()=> {
    async function fetchData () {
      if(currentUser) {
        if(currentUser.isAvatarImageSet) {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`)
          setContacts(data.data);
        } else {
          navigate("/setAvatar")
        }
      }
    }
    fetchData ()
  },[currentUser])
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  }
  
  return (
    <Container>
      <div className='container'>
        <Contacts 
        contacts={contacts} 
        currentUser={currentUser} 
        changeChat={handleChatChange}
        />
        {isLoaded && currentChat === undefined ? (
          <Welcome currentUser={currentUser} />
        ) : ( 
          <ChatContainer 
            currentChat={currentChat} 
            currentUser={currentUser} 
            socket={socket}
            changeUserStatus={changeUserStatus}
            />
        )}
      </div>
    </Container>
  );  
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #6F47A4;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #421A78;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width:720px) and (max-width:1080px){
        grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;