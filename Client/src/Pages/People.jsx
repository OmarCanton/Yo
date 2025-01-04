import { useEffect, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Styles/People.css'
import axios from 'axios'
import { UserDetailsContext } from '../Contexts/userDetailsContext'
import {
    PersonAddAlt1Rounded, 
    ArrowBackIosNewRounded
} from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
    fetchPeople, 
    fetchedPeople, 
    fetchedStatus ,
    searchPeople
} from '../Redux/Slice/fetchPeople'
import { 
    fetchRequests, 
    fetchedFReqs, 
    fetchedReqStatus
} from '../Redux/Slice/fetchFriendRequests'
import { useDispatch, useSelector } from 'react-redux'


export default function People() {
    const dispatch = useDispatch()
    const [sendingReq, setSendingReq] = useState(null)
    const [removingReq, setRemovingReq] = useState(null)
    const [acceptingReq, setAcceptingReq] = useState(null)
    const [decliningReq, setDecliningReq] = useState(null)
    const [reqSent, setReqSent] = useState(false)    
    const [reqRemoved, setReqRemoved] = useState(false)  
    const [reqAccepted, setReqAccepted] = useState(false)  
    const [reqDeclined, setReqDeclined] = useState(false)  
    const { userId } = useContext(UserDetailsContext)
    const navigate = useNavigate()
    const people = useSelector(fetchedPeople)
    const status = useSelector(fetchedStatus)
    const friendRequests = useSelector(fetchedFReqs)
    const friendReqStat = useSelector(fetchedReqStatus)
    const [keyword, setKeyword] = useState('')

    useEffect(() => {
        if(userId) {
            dispatch(fetchPeople(userId))
            dispatch(fetchRequests(userId))
        }
    }, [dispatch, userId, reqSent, reqRemoved, reqAccepted, reqDeclined])

    useEffect(() => {
        const theKeyword = keyword.trim()
        if(theKeyword === '') {
            dispatch(fetchPeople(userId))
        } else {
            dispatch(searchPeople({userId, theKeyword}))
        }
    }, [dispatch, userId, keyword])

    const sendFriendRequest = async (user) => {
        setSendingReq(user._id)
        const receiverId = user._id
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/send-friend-request`, 
                { userId, receiverId}
            )
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
            }
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            }
            setSendingReq(null)
            setReqSent(prevState => !prevState)
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
            setSendingReq(null)
            setReqSent(prevState => !prevState)
        }
    }

    const deleteRequest = async (user) => {
        const receiverId = user._id
        setRemovingReq(user._id)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/deleteRequest`, {userId, receiverId})
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
            }
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            }
            setRemovingReq(null)
            setReqRemoved(prevState => !prevState)
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
            setRemovingReq(null)
            setReqRemoved(prevState => !prevState)
        }
    }

    const buttons = (user) => {
        
        const hasSentReq  = user.friendRequests.some((req) => req.senderId === userId)
        if(hasSentReq) {
            return (
                removingReq === user._id ?
                <CircularProgress style={{width: 25, height: 25}} />
                :
                <button onClick={() => deleteRequest(user)}>Remove Request</button> 
            ) 
        } else {
            return (
                sendingReq === user._id ?
                <CircularProgress style={{width: 25, height: 25}} />
                :
                <PersonAddAlt1Rounded 
                    className='addfriend' 
                    style={{fontSize: '1.7rem'}}
                    onClick={() => { 
                        sendFriendRequest(user)
                    }}
                />
            )
        }
    }

    const acceptRequest = async (user) => {
        setAcceptingReq(user._id)        
        const friendsId = user.senderId
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/accept-friend-request`, {userId, friendsId})
            if(response.data.success === true) {
                toast.success(`Say hi to ${user.username} in the chat panel`, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
            }
            setAcceptingReq(null)
            setReqAccepted(prevState => !prevState)
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
            setAcceptingReq(null)
            setReqAccepted(prevState => !prevState)
        }
    }
    const declineRequest = async (req) => {
        const reqId = req.senderId
        setDecliningReq(req._id)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/decline-friend-request`, {userId, reqId})
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
                setReqDeclined(prevState => !prevState)
            }
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            }
            setDecliningReq(null)
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
            setDecliningReq(null)
        }
    }


  return (
        <div className="friendspage-wrapper">
            <div className="header">
                <span>
                    <ArrowBackIosNewRounded style={{fontSize: '1.9rem', cursor: 'pointer'}} onClick={() => navigate(-1)}/>
                    <p>People</p>
                </span>
                <input 
                    type="search" 
                    placeholder="Find People..." 
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>
            <div className="main">
                {friendReqStat === 'loading' && (
                    <div className="loading">
                        <CircularProgress />
                    </div>
                )}
                {friendReqStat === 'succeeded' && friendRequests.length > 0 && 
                    <div className="requests">
                        <motion.h3
                            initial={{y: '-10%', opacity: 0}}
                            animate={{y: 0, opacity: 1}}
                            exit={{y: '-10%', opacity: 0}}
                            transition={{duration: 0.15}}
                        >
                            Friend Requests
                        </motion.h3>
                        {friendRequests.map((req, index) => {
                            return (
                                <motion.div 
                                    className="req" 
                                    key={index}
                                    initial={{y: '10%', opacity: 0}}
                                    animate={{y: 0, opacity: 1}}
                                    exit={{y: '10%', opacity: 0}}
                                    transition={{delay: 0.2, duration: 0.15}}
                                >
                                    <div className="reqImageName">
                                        <div className="image">
                                            <img src={req.senderPhoto} alt={req.username} />
                                        </div>
                                        <div className="username">{req.username}</div>
                                    </div>
                                    <div className="buttons">
                                        { acceptingReq === req._id ?
                                            <CircularProgress style={{width: 25, height: 25}} />
                                            :
                                            <button className="accept" onClick={() => acceptRequest(req)}>Accept</button>
                                        }
                                        { decliningReq === req._id ?
                                            <CircularProgress style={{width: 25, height: 25}} />
                                            :
                                            <button className="decline" onClick={() => declineRequest(req)}>Decline</button>
                                        }
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                }
                {status === 'loading' && (
                    <div className="loading">
                        <CircularProgress />
                    </div>
                )}
                {status === 'succeeded' && people.length > 0 &&
                    <div className="friends">
                        <motion.h3 
                            initial={{y: '-10%', opacity: 0}}
                            animate={{y: 0, opacity: 1}}
                            exit={{y: '-10%', opacity: 0}}
                            transition={{duration: 0.15}}
                        >
                            Add People
                        </motion.h3>
                        {people.map((user, index) => {
                            return (
                                <motion.div
                                    key={index} 
                                    className="user"
                                    initial={{y: '10%', opacity: 0}}
                                    animate={{y: 0, opacity: 1}}
                                    exit={{y: '10%', opacity: 0}}
                                    transition={{delay: 0.2, duration: 0.15}}
                                >
                                    <div className="photoName">
                                        <div className="image">
                                            <img src={user.profileImage} alt={user.username} />
                                        </div>
                                        <div className="username">{user.username}</div>
                                    </div>
                                    { buttons(user) }
                                </motion.div>
                            )
                        })}
                    </div>
                }
                {status === 'succeeded' && people.length <= 0 &&  (
                    <div className='noPeople'>
                        <p>No people found, come back another time</p>
                    </div>
                )}
                {status === 'failed' && <div className='noPeople'>An error occured, try again in a minute.</div>}
            </div>
        </div>
    )
}
