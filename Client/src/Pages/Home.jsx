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
    PersonRounded
} from '@mui/icons-material'
import { UserDetailsContext } from '../Contexts/userDetailsContext'
import axios from 'axios'
import { CircularProgress } from '@mui/material'
import { toast } from 'react-hot-toast'
import Lottie from 'lottie-react'
import StartChat from '../Effects/StartChat.json'
import {
    fetchChats,
    userChats,
    chatFetchStatus
} from '../Redux/Slice/fetchChats'
import { useDispatch, useSelector } from 'react-redux'


export default function Home() {
    const navigate = useNavigate()
    const { setIsLoggedIn, userId } = useContext(UserDetailsContext)
    const [loggingOut, setLoggingOut] = useState(false)
    const chats = useSelector(userChats)
    const status = useSelector(chatFetchStatus)
    const dispatch = useDispatch()
    const [content, setContent] = useState('')
    const [selectedChat, setSelectedChat] = useState('')
    const inputRef = useRef()
    const [messages, setMessages] = useState([])
    const [fetchingMessages, setFetchingMessages] = useState(false)
    const [isClicked, setIsClicked] = useState(false)

    
    useEffect(() => {
        dispatch(fetchChats(userId))
    }, [dispatch, userId])

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/logout`, {withCredentials: true})
            if(response.data.success) {
                console.log(response)
                localStorage.removeItem('isLoggedIn')
                setIsLoggedIn(response.data.success)
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
    const fetchMessages = async (chatId) => {
        setSelectedChat(chatId)
        setFetchingMessages(true)
        setIsClicked(false)
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetchMessages/${chatId}`)
            if(response.data.success === true) {
                setMessages(response.data.messages)
            }
            setFetchingMessages(false)
            setIsClicked(true)
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
            setFetchingMessages(false)
            setIsClicked(false)
        }
    }

    const sendMessage = async (chatId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/sendMessage/${chatId}`, { senderId: userId, content })
            if(response.data.success === true) {
                alert('hey sent, bingo!')
                console.log(response.data)
                inputRef.current.value = ''
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
            console.log(err)
        }
    } 

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
                            <CircularProgress style={{width: 25, height: 25}} />
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
                        <input type="text" placeholder='Search Chat' />
                        <SearchRounded className='searchIcon2' />
                    </span>
                    <div className="friends">
                        {status === 'loading' && 
                            <div className='loading'><CircularProgress /></div>
                        }
                        {status === 'succeeded' && chats.length <= 0 && <div className='noChat'>No conversations yet</div>}
                        {(status === 'succeeded' && chats.length > 0) && chats.map((chat, index) => {
                            return (
                                <div 
                                    className="chat" 
                                    key={index}
                                    onClick={() => fetchMessages(chat._id)}
                                >
                                    <div className="image">
                                        <img 
                                            src={ userId === chat.userDetails.id ? 
                                                chat.otherUsersDetails.profileImage 
                                                : 
                                                chat.userDetails.profileImage
                                            } 
                                            alt=''
                                        />
                                    </div>
                                    <div className='usernameLMsg'>
                                        <p className='username'>
                                            {userId === chat.userDetails.id ? 
                                                chat.otherUsersDetails.username 
                                                : 
                                                chat.userDetails.username
                                            }
                                        </p>
                                        <small className='lastMessage'>
                                            {chat.lastMessage}
                                        </small>
                                    </div>
                                </div>
                            )
                        })}
                        {status === 'failed' && <div className='noChat'>Check your Internet Connection</div>}
                    </div>
                    <pre className="collapseExpand"><ArrowBackIosNew style={{fontSize: 'large', cursor: 'pointer'}}/></pre>
                </div>
                <div className="chatArea">
                    <div className="chatHead"></div>
                    <div className="messageArea">
                        {fetchingMessages && <CircularProgress />}
                        {!fetchingMessages && messages.length > 0 && messages.map((message, index) => {
                            return (
                                <div key={index} className="leftMessages">
                                    {message.senderId !== userId && 
                                        <div>{message.content}</div>
                                    }
                                </div>
                            )
                        })}
                        {!fetchingMessages && messages.length > 0 && messages.map((message, index) => {
                            return (
                                <div key={index} className="rightMessages">
                                    {message.senderId === userId && 
                                        <div>{message.content}</div>
                                    }
                                </div>
                            )
                        })} 
                        {!isClicked &&
                            <div className="animationCont">
                                <Lottie className='animation' animationData={StartChat}/>
                                <h3>Select a chat to start a conversation</h3>
                            </div>
                        }
                    </div>
                    <div className="inputs">
                        <div className="textInput">
                            <div className="left">
                                <div className="media"><PhotoLibraryRounded className='sendPicVid' htmlColor='#3C3C3C' /></div>
                                <div className="documentsfiles"><DescriptionRounded className='sendDoc' htmlColor='#3C3C3C' /></div>
                            </div>
                            <input 
                                ref={inputRef}
                                type="text" 
                                placeholder='Type messages here...'
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <div onClick={() => sendMessage(selectedChat)} className="senderIcon"><ArrowUpwardRounded htmlColor='white' /></div>
                        </div>
                        <div className="right">
                            <div className="emojis"><EmojiEmotionsOutlined htmlColor='#3C3C3C' fontSize='large' /></div>
                            <div className="audioRecorder"><Mic htmlColor='white' /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
