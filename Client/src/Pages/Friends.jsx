import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    fetchFriends,
    acptdFriends,
    stat,
    searchFriend,
    search
} from '../Redux/Slice/fetchFriends'
import { useDispatch, useSelector } from 'react-redux'
import { UserDetailsContext } from '../Contexts/userDetailsContext'
import { CircularProgress } from '@mui/material'
import '../Styles/Friends.css'
import { ArrowBackIosNewRounded, QuestionAnswer } from '@mui/icons-material'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Friends() {
    const dispatch = useDispatch()
    const friends = useSelector(acptdFriends)
    const status = useSelector(stat)
    const isSearch = useSelector(search)
    const { userId } = useContext(UserDetailsContext)
    const navigate = useNavigate()
    const [unfriending, setUnfriending] = useState(null)
    const [unfriended, setUnfriended] = useState(false)
    const [keyword, setKeyword] = useState('')
    const [startingChat, setStartingChat] = useState(null)

    useEffect(() => {
        if(userId){
            dispatch(fetchFriends(userId))
        }
    }, [dispatch, userId, unfriended])

    useEffect(() => {
        const theKeyword = keyword.trim()
        if(theKeyword === '') {
            dispatch(fetchFriends(userId))
        } else {
            dispatch(searchFriend({ userId, theKeyword }))
        } 
    }, [dispatch, keyword, userId])

    const handleUnfriend = async (friend) => {
        const friendId = friend.userId
        setUnfriending(friendId)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/unfriend`, { userId, friendId })
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
            }
            setUnfriending(null)
            setUnfriended(prevState => !prevState)
        } catch(err) {
            console.log(err)
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
            setUnfriending(null)
            setUnfriended(prevState => !prevState)
        }
    }

    const startChat = async (friend) => {
        const recipientId = friend.userId
        setStartingChat(friend.userId)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/startChat`, {userId, recipientId})
            if(response.data.success === true) {
                navigate('/')
            }
            setStartingChat(null)    
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
            setStartingChat(null)
        }
    }
    
    return (
        <div className="friends-wrapper">
            <div className="friends-header">
                <span>
                    <ArrowBackIosNewRounded style={{fontSize: '1.9rem', cursor: 'pointer'}} onClick={() => navigate(-1)}/>
                    <p>Friends</p>
                </span>
                <input 
                    type="search" 
                    placeholder="Search Friends..."
                    onChange={(e) => setKeyword(e.target.value)} 
                />
            </div>
            <div className="friends">
                {status === 'loading' && 
                    <div className="loading">
                        <CircularProgress />
                    </div>
                }
                {(status === 'succeeded' && friends.length > 0) && friends.map((friend, index) => {
                    return (
                        <motion.div
                            key={index} 
                            className="chat"
                            initial={{y: '10%', opacity: 0}}
                            animate={{y: 0, opacity: 1}}
                            exit={{y: '10%', opacity: 0}}
                            transition={{delay: 0.2, duration: 0.15}}
                        >
                            <div className="profileName">
                                <div className="profile">
                                    <img src={friend.profileImage} alt={friend.username} />
                                </div>
                                <p>{friend.username}</p>
                            </div>
                            <div className="right">
                                {startingChat === friend.userId ? 
                                    <CircularProgress /> 
                                    :
                                    <QuestionAnswer onClick={() => startChat(friend)} className='messageIcon' />
                                }
                                <button onClick={() => handleUnfriend(friend)}>
                                    {unfriending === friend.userId ? 
                                        <CircularProgress style={{width: 25, height: 25}} />
                                        :
                                        <p>Unfriend</p>
                                    }
                                </button>
                            </div>
                        </motion.div>
                    )
                })}
                {isSearch && friends.length <= 0 && (
                    <div className='noFriend'>Oops! User not found</div>
                )}
                {(status === 'succeeded' && friends.length <= 0 && !isSearch) && 
                    <div className='noFriend'>You have no friend, go to &nbsp;<Link to={'/people'}>people</Link>&nbsp; to add friends</div>
                }
                {status === 'failed' && <div className='noFriend'>An error occured, try again in a minute.</div>}
            </div>
        </div>
    )
}