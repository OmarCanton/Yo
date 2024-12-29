import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    fetchFriends,
    acptdFriends,
    stat
} from '../Redux/Slice/fetchFriends'
import { useDispatch, useSelector } from 'react-redux'
import { UserDetailsContext } from '../Contexts/userDetailsContext'
import { CircularProgress } from '@mui/material'
import '../Styles/Friends.css'
import { ArrowBackIosNewRounded } from '@mui/icons-material'

export default function Friends() {
    const dispatch = useDispatch()
    const friends = useSelector(acptdFriends)
    const status = useSelector(stat)
    const { userId } = useContext(UserDetailsContext)
    const navigate = useNavigate()

    useEffect(() => {
        if(userId){
            dispatch(fetchFriends(userId))
        }
    }, [dispatch, userId])

    return (
        <div className="friends-wrapper">
            <div className="friends-header">
                <span>
                    <ArrowBackIosNewRounded style={{fontSize: '1.9rem', cursor: 'pointer'}} onClick={() => navigate(-1)}/>
                    <p>Friends</p>
                </span>
                <input type="text" placeholder="Search Friends..." />
            </div>

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
                    <div className='noFriend'>You have no friend on Yo<br/>Go to People and add friends</div>
                }
                {status === 'failed' && <div>An error occured</div>}
            </div>
        </div>
    )
}