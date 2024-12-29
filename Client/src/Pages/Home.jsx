import { useContext, useEffect, useState } from 'react'
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
import {
    fetchFriends,
    acptdFriends,
    stat
} from '../Redux/Slice/fetchFriends'
import { useDispatch, useSelector } from 'react-redux'
import Lottie from 'lottie-react'
import StartChat from '../Effects/StartChat.json'

export default function Home() {
    const navigate = useNavigate()
    const { setIsLoggedIn, userId } = useContext(UserDetailsContext)
    const [loggingOut, setLoggingOut] = useState(false)
    const dispatch = useDispatch()
    const friends = useSelector(acptdFriends)
    const status = useSelector(stat)

    useEffect(() => {
        if(userId){
            dispatch(fetchFriends(userId))
        }
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
                            <div className="loading">
                                <CircularProgress />
                            </div>
                        }
                        {(status === 'succeeded' && friends.length > 0) && friends.map((friend, index) => {
                            return (
                                <div className="chat" key={index}>
                                    <img src={friend.profileImage} alt={friend.username} />
                                    <p>{friend.username}</p>
                                </div>
                            )
                        })}
                        {((status === 'failed' || status === 'succeeded') && friends.length <= 0) && 
                            <div className='noFriend'>No Chat yet<br/></div>
                        }
                    </div>
                    <pre className="collapseExpand"><ArrowBackIosNew style={{fontSize: 'large', cursor: 'pointer'}}/></pre>
                </div>
                <div className="chatArea">
                    <div className="chatHead"></div>
                    <div className="messageArea">
                        <div className="animationCont">
                            <Lottie className='animation' animationData={StartChat}/>
                            <h3>Select a chat to start a conversation</h3>
                        </div>
                    </div>
                    <div className="inputs">
                        <div className="textInput">
                            <div className="left">
                                <div className="media"><PhotoLibraryRounded className='sendPicVid' htmlColor='#3C3C3C' /></div>
                                <div className="documentsfiles"><DescriptionRounded className='sendDoc' htmlColor='#3C3C3C' /></div>
                            </div>
                            <input type="text" name="" id="" placeholder='Type messages here...'/>
                            <div className="senderIcon"><ArrowUpwardRounded htmlColor='white' /></div>
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
