import { useContext, useEffect, useState, useRef } from 'react'
import '../Styles/Home.css'
import { useNavigate } from 'react-router-dom'
import { 
    MoreHoriz,
    ArrowBackIosNew, 
    DescriptionRounded, 
    PhotoLibraryRounded,
    Mic,
    ArrowUpwardRounded,
    SearchRounded,
    EmojiEmotionsOutlined,
    LogoutRounded,
    PeopleAltRounded,
    PersonRounded,
    AccountCircle,
    DoneRounded
} from '@mui/icons-material'
import { UserDetailsContext } from '../Contexts/userDetailsContext'
import axios from 'axios'
import { CircularProgress } from '@mui/material'
import { toast } from 'react-hot-toast'
import Lottie from 'lottie-react'
import StartChat from '../Effects/StartChat.json'
import { 
    fetchChats, 
    chatStatus, 
    userChats,
    fetchSearchChats
} from '../Redux/Slice/fetchUserChats'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { io } from 'socket.io-client'
import { setSocketConnection, socketConct } from '../Redux/Slice/SocketSlice'

export default function Home() {
    const navigate = useNavigate()
    const { 
        setIsLoggedIn, 
        userId, 
        content, 
        setContent,
        lastSelectedChat, 
        setLastSelectedChat, 
        lastChatedPartner, 
        setLastChatedPartner 
    } = useContext(UserDetailsContext)
    const [loggingOut, setLoggingOut] = useState(false)
    const chats = useSelector(userChats)
    const status = useSelector(chatStatus)
    const dispatch = useDispatch()
    const inputRef = useRef()
    const messageAreaRef = useRef()
    const searchIconRef = useRef()
    const [partnerProfile, setPartnerProfile] = useState([])
    const [keyword, setKeyword] = useState('')
    const socket = useSelector(socketConct)
    const [activeUsers, setActiveUsers] = useState([])
    const [fetchingMsgs, setFetchingMsgs] = useState(false)
    const [messages, setMessages] = useState({})
    const [lastMsg, setLastMsg] = useState('')

    //Utility function to formate the messages
    const groupMessagesByDate = (messages) => {
        const grouped = {}
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)
        
        messages.forEach(msg => {
            const date = new Date(msg.createdAt)
            let dateKey
            if(date.toDateString() === today.toDateString()) {
                dateKey = 'Today'
            } else if(date.toDateString() === yesterday.toDateString()) {
                dateKey = 'Yesterday'
            } else {
                dateKey = date.toDateString()
            }
            if(!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push(msg)
        })
        return grouped
    }

    useEffect(() => {
        if(userId) {
            const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
                withCredentials: true,
                query: { userId }
            })
            dispatch(setSocketConnection(socketConnection))
            socketConnection.emit('fetchChats', userId)
            socketConnection.on('getChats', (chats) => {
                dispatch(fetchChats(chats))
            })
        }
    }, [dispatch, userId])
    
    useEffect(() => {
        const fetchMessages = async (lastSelectedChat) => {
            if(lastSelectedChat) {
                setFetchingMsgs(true)
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetchMessages/${lastSelectedChat}`)
                    if(response.data.success === true) {
                        setMessages(groupMessagesByDate(response.data.messages))
                    }
                    localStorage.setItem('lastSelectedChat', lastSelectedChat)
                    setFetchingMsgs(false)
                } catch (err) {
                    if(err.response) {
                        toast.error(err.response.data.message, {
                            style: {
                                backgroundColor: 'white',
                                color: 'black'
                            }
                        })
                    } else {
                        toast.error('An Unknown error occured', {
                            style: {
                                backgroundColor: 'white',
                                color: 'black'
                            }
                        })
                    }
                    setFetchingMsgs(false)
                }
            }
        }
        const fetchChatPartnerProfile = async (lastChatedPartner) => {
            localStorage.setItem("lastChatedPartner", lastChatedPartner)
            try {
                if(lastChatedPartner) {
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getProfile/${lastChatedPartner}`)
                    if(response.data.success === true) {
                        setPartnerProfile(response.data.user)
                    }
                }
            } catch(err) {
                if(err.response) {
                    toast.error(err.response.data.message, {
                        style: {
                            backgroundColor: 'white',
                            color: 'black'
                        }
                    })
                } else {
                    toast.error('An Unknown error occured', {
                        style: {
                            backgroundColor: 'white',
                            color: 'black'
                        }
                    })
                }
            }
        }

        //I'm here, user shouldnt emit the get message count if its already selected
        if(socket) {
            socket.emit('openChat', ({
                chatId: lastSelectedChat,
                userId,
                selectedUser: lastChatedPartner
            }))
        }
        fetchChatPartnerProfile(lastChatedPartner)
        fetchMessages(lastSelectedChat)
    }, [
        lastChatedPartner, 
        lastSelectedChat, 
        setLastChatedPartner, 
        setLastSelectedChat,
        userId, 
        socket
    ])

    useEffect(() => {
        if(socket) {
            socket.on('getActiveUsers', (users) => {
                setActiveUsers(users)
            })
        }
    }, [socket, userId])

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/logout`, {withCredentials: true})
            if(response.data.success) {
                localStorage.removeItem('isLoggedIn')
                localStorage.removeItem('lastSelectedChat')
                localStorage.removeItem('lastChatedPartner')
                setIsLoggedIn(response.data.success)
                socket.disconnect()
                navigate('/auth/signin')
            }
            setLoggingOut(false)
        } catch (err) {
            if(err.response) {
                toast.error(err.response.data.message, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            } else {
                toast.error('An Unknown error occured', {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            }
            setLoggingOut(false)
        }
    }

    useEffect(() => {
        if(socket) {
            socket.on('getMessages', (message) => {
                const messages = Object.values(message.message)
                const lastMessage = messages[messages.length - 1]
                const openedChatPartner = localStorage.getItem('lastChatedPartner')
                if(lastMessage.senderId === openedChatPartner) {
                    const newMessage = groupMessagesByDate(message.message)
                    setMessages(prevState => ({
                        ...prevState,
                        ...newMessage
                    }))
                }
            })
            socket.on('getLastMessage', (lastMessage) =>  {
                setLastMsg(lastMessage)               
            })
        }
    }, [socket, lastChatedPartner, lastMsg])
    useEffect(() => {
        if(socket) {
            socket.on('getSenderMessages', (message) => {
                const newMessage = groupMessagesByDate(message)
                setMessages(prevState => ({
                    ...prevState,
                    ...newMessage
                }))
            })    
        }
    }, [socket])

    const handleSendMessage = async (chatId, receiverId) => {
        if(socket && userId) {
            socket.emit('sendMessage', ({
                chatId, 
                senderId: userId, 
                receiverId, 
                content
            }))
        }
        inputRef.current.value = ''
        setContent('')
    }

    useEffect(() => {
        const scrollToBottom = () => {
            if (messageAreaRef.current) {
                messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight
            }
        }
        scrollToBottom()
    }, [messages])

    
    const timeStamps = (createdAt) => {
        const createdDate = new Date(createdAt)
        const formattedTime = format(createdDate, 'HH:mm')

        return formattedTime
    }

    useEffect(() => {
        const theKeyword = keyword.trim()
        if(theKeyword === '' && socket) {
            socket.emit('fetchChats', userId)
            console.log(chats)
            socket.on('getChats', (chats) => {
                dispatch(fetchChats(chats))
            })
            searchIconRef.current.style.display = 'flex'
        } else {
            dispatch(fetchSearchChats({userId, theKeyword}))
        }
    }, [dispatch, userId, keyword, socket, chats])

    return (
        <div className="home-wrapper">
            <div className="header">
                <div className="appName">Yo</div>
                <div className="searchMsgBar">
                    <input type="text" name="" id="" placeholder='Search' />
                    <SearchRounded className='searchIcon' />
                </div>
                <div className="right">
                    <div className="friends" onClick={() => navigate('/friends')}>
                        <PersonRounded style={{fontSize: '1.9rem', cursor: 'pointer'}} htmlColor='#3C3C3C' />
                        <p>Friends</p>
                    </div>
                    <div className="friends" onClick={() => navigate('/people')}>
                        <PeopleAltRounded style={{fontSize: '1.9rem', cursor: 'pointer'}} htmlColor='#3C3C3C' />
                        <p>People</p>
                    </div>
                    <div className="threeDots">
                        <MoreHoriz fontSize='large' htmlColor='#3C3C3C' style={{cursor: 'pointer'}} />
                        <p>Menu</p>
                    </div>
                    <div className="logout" title='logout' onClick={handleLogout}>
                        {loggingOut ? 
                            <CircularProgress style={{width: 25, height: 25, color: 'red'}} />
                            :
                            <LogoutRounded className='logoutIcon' htmlColor='red'/>
                        }
                    </div>
                </div>
            </div>
            <div className="main">
                <div className="chats">
                    <span className="chats-header">
                        <p>Chats</p>
                        <input 
                            type="search" 
                            placeholder='Search Chat' 
                            onChange={(e) => { 
                                setKeyword(e.target.value)
                                searchIconRef.current.style.display = 'none'
                            }}
                        />
                        <SearchRounded ref={searchIconRef} className='searchIcon2' />
                    </span>
                    <div className="friends">
                        {status === 'loading' && 
                            <div className='loading'><CircularProgress /></div>
                        }
                        {status === 'succeeded' && chats.length <= 0 && <div className='noChat'>No conversations yet</div>}
                        {(status === 'succeeded' && chats.length > 0) && chats.map((chat, index) => {
                            return (
                                <motion.div 
                                    className="chat" 
                                    key={index}    
                                    initial={{y: '10%', opacity: 0}}
                                    animate={{y: 0, opacity: 1}}
                                    exit={{y: '10%', opacity: 0}}
                                    onClick={() => { 
                                        setLastSelectedChat(chat.chatId)
                                        setLastChatedPartner(chat.theChat.id)
                                    }}
                                >
                                    {lastChatedPartner === chat.theChat.id &&
                                        <motion.div 
                                            className="selectedChatIndicator"
                                            initial={{x: -3, opacity: 0}}
                                            animate={{x: 0, opacity: 1}}
                                        ></motion.div>
                                    }
                                    {activeUsers.some(user => user.userId == chat.theChat.id) &&
                                        <p className="status"></p>
                                    }
                                    <div className="image">
                                        <img
                                            src={chat.theChat.profileImage}
                                            alt={chat.theChat.username}
                                        />
                                    </div>
                                    <div className='usernameLMsg'>
                                        <p className='username'>
                                            {chat.theChat.username}
                                        </p>
                                        <small className='lastMessage'>
                                            {(lastMsg && lastMsg.chatId === chat.chatId) ? lastMsg.lastMessage : chat.chatLastMessage}
                                        </small>
                                        {lastSelectedChat !== chat.chatId && chat.unreadCounts && chat.unreadCounts.map(unread => (unread.receiverId === userId && unread.senderId === chat.theChat.id && unread.count !== 0) 
                                            && 
                                            <div className='unreadCounts' key={unread.id}>{unread.count}</div>)
                                        }
                                    </div>
                                </motion.div>
                            )
                        })}
                        {status === 'failed' && <div className='loading'><CircularProgress /></div>}
                    </div>
                    <pre className="collapseExpand"><ArrowBackIosNew style={{fontSize: 'large', cursor: 'pointer'}}/></pre>
                </div>
                <div className="chatArea">
                    {lastSelectedChat ?
                        <>
                            {!fetchingMsgs ?
                                <>
                                    <div className="chatHead">
                                        <div className="chatPartner">
                                            <div className='profileName'>
                                                <div className="image">
                                                    {partnerProfile.profileImage ?
                                                        <img src={partnerProfile.profileImage} alt={partnerProfile.username} />
                                                        : 
                                                        <AccountCircle htmlColor='grey' style={{width: '100%', height: '100%'}} />
                                                    }
                                                </div>
                                                <div className="partner-username">
                                                    <p>{partnerProfile.username}</p>
                                                    <small>{activeUsers.some(user => user.userId == partnerProfile._id) ? 'Online' : 'Offline'}</small>
                                                </div>
                                            </div>
                                            <div className="otherOps"><MoreHoriz /></div>
                                        </div>
                                    </div>
                                    <div ref={messageAreaRef} className="messageArea">
                                        {Object.keys(messages).length <= 0 && 
                                            <p className='noChat'>No chat history available</p>
                                        }
                                        {(Object.keys(messages).length > 0) && Object.keys(messages).map(date => (
                                            <div className='groupedMessagesByDate' key={date}>
                                                <div className='date'>
                                                    <small>{date}</small>
                                                </div>
                                                {messages[date].map(message => {
                                                    return(
                                                        <motion.div 
                                                            initial={{y: '10%', opacity: 0}}
                                                            animate={{y: 0, opacity: 1}}
                                                            exit={{y: '10%', opacity: 0}}
                                                            key={message._id}
                                                            style={{
                                                                alignSelf: message.senderId === userId ? 'flex-end' : 'flex-start', 
                                                                backgroundColor: message.senderId === userId ? 'rgb(7, 141, 252)' : 'rgb(141, 141, 141)',
                                                            }}
                                                            className="msg"
                                                        >
                                                            {message.content}
                                                            <small style={{
                                                                alignSelf: message.senderId === userId ? 'flex-end' : 'flex-start',
                                                            }}>
                                                                {timeStamps(message.createdAt)}
                                                                {message.status === 'sent' && message.senderId === userId && <DoneRounded fontSize='small'/>}
                                                            </small>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        ))} 
                                    </div>
                                </>
                                :
                                <div className='loadingMessages'><CircularProgress /></div>
                            }
                            <div className="inputs">
                                <div className="textInput">
                                    <div className="left">
                                        <div className="media"><PhotoLibraryRounded className='sendPicVid' htmlColor='#3C3C3C' /></div>
                                        <div className="documentsfiles"><DescriptionRounded className='sendDoc' htmlColor='#3C3C3C' /></div>
                                    </div>
                                    <textarea 
                                        ref={inputRef}
                                        type="text"
                                        placeholder='Type messages here...'
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={1}
                                    ></textarea>
                                    <div 
                                        onClick={() => handleSendMessage(lastSelectedChat, lastChatedPartner)} 
                                        className="senderIcon"
                                        style={{
                                            pointerEvents: content === '' ? 'none' : 'all',
                                            backgroundColor: content === '' && 'grey',
                                            cursor: content === '' && 'not-allowed',
                                        }}
                                        title={content === '' ? 'Mesage empty' : 'Send Message'}
                                    >
                                        <ArrowUpwardRounded htmlColor='white' />
                                    </div>
                                </div>
                                <div className="right">
                                    <div className="emojis"><EmojiEmotionsOutlined htmlColor='#3C3C3C' fontSize='large' /></div>
                                    <div className="audioRecorder"><Mic htmlColor='white' /></div>
                                </div>
                            </div>
                        </>
                        :
                        <div 
                            className="animationCont"
                        >
                            <motion.span     
                                initial={{y: '10%', opacity: 0}}
                                animate={{y: 0, opacity: 1, transition: {
                                    delay: 2.5
                                }}}
                                exit={{y: '10%', opacity: 0}}
                            >
                                <Lottie className='animation' animationData={StartChat}/>
                                <h3>Select a chat to start conversation</h3>
                            </motion.span>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}
