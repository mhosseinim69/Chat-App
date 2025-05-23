import React,{ useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import { getAllMessagesRoute, sendMessageRoute } from "../utils/APIRoutes";
import {v4 as uuidv4} from "uuid";
import { AiFillCheckCircle } from "react-icons/ai";


export default function ChatContainer ({ currentChat, currentUser, socket, changeUserStatus }) {
    const [messages, setMessages] = useState([]);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const scrollRef = useRef();

    useEffect(()=> {
        async function fetchData () {
            if(currentChat){
                const response = await axios.post(getAllMessagesRoute, {
                    from: currentUser._id,
                    to: currentChat._id,
                });
                setMessages(response.data);
            }   
        }
        fetchData ()
      },[currentChat])

    const handleSendMsg = async (msg) => {
        await axios.post(sendMessageRoute, {
            from: currentUser._id,
            to: currentChat._id,
            message: msg,
        });
        socket.current.emit("send-msg", {
            to: currentChat._id,
            from: currentUser._id,
            message: msg,
        });
    
        const msgs = [...messages];
        msgs.push({ fromSelf: true, message:msg });  
        setMessages(msgs);
    };

    useEffect(() => {
        if(socket.current) {
            socket.current.on("msg-recieve",(data)=> {
                setArrivalMessage({ fromSelf: false, message:data.message, from: data.from });
            });
        }
    },[currentChat]);

    useEffect(() => {
        if (arrivalMessage && currentChat._id === arrivalMessage.from) {
             setMessages((prev)=> [...prev, arrivalMessage]);
        }
    },[arrivalMessage]);

    useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })}
    }, [messages]);

    return (
        <>
        {currentChat && (
                <Container>
                        <div className="chat-header">
                            <div className="user-details">
                                <div className="avatar">
                                <img 
                                    src={currentChat.avatarImage} 
                                    alt="avatar" 
                                    />
                                </div>
                                <div className="username">
                                    <h3>{currentChat.username}</h3>
                                </div>
                                <div className={`${currentChat.userOnline ? "online-icon":""}`}>
                                        <AiFillCheckCircle />
                                </div>
                            </div>
                            <Logout changeUserStatus={changeUserStatus}/>
                        </div>
                        <div className="chat-messages">
                            {messages.map((message) => {
                                    return (
                                        <div ref={scrollRef} key={uuidv4()}>
                                            <div className={`message ${message.fromSelf ? "sended":"recieved"}`}>
                                                <div className="content">
                                                    <p>
                                                        {message.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <ChatInput handleSendMsg={handleSendMsg}/>
                        </Container>
                    )}
            </>            
        );     
}

const Container = styled.div`
    padding-top: 1rem;
    display: grid;
    grid-template-rows: 10% 78% 12%;
    gap: 0.1rem;
    overflow: hidden;
    @media screen and (min-width:720px) and (max-width:1080px){
        grid-template-rows: 15% 70% 15%;
    }
    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.2rem;
        .user-details {
            display: flex;
            align-items: center;
            gap: 1rem;
            .avatar {
                img{
                    height: 3rem;
                }
            }
            .username {
                h3 {
                    color: white;
                }
            }
            .online-icon {
                svg {
                    font-size: 1.3rem;
                    color: #22E922;
                }
            }
        }
    }
    .chat-messages {
        padding: 1rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        overflow: auto;
        &::-webkit-scrollbar {
            width: 0.2rem;
            &-thumb {
                background-color: #ffffff39;
                width: 0.1rem;
                border-radius: 1rem;
            }
        }
        .message {
            display: flex;
            align-items: center;
            .content {
                max-width: 40%;
                overflow-wrap: break-word;
                padding: 1rem;
                font-size: 1.1rem;
                border-radius: 1rem;
                color: #d1d1d1;
            }
        }
        .sended {
            justify-content: flex-end;
            .content {
                background-color: #25194B;
            }
        }
        .recieved {
            justify-content: flex-start;
            .content {
                background-color: #260D76;
            }
        } 
    }
`;
