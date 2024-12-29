import { useRef, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Styles/AddCredsStartup.css'
import { AccountCircle, PhotoCamera } from '@mui/icons-material'
import axios from 'axios'
import { UserDetailsContext } from '../Contexts/userDetailsContext'
import { toast } from 'react-hot-toast'
import { CircularProgress } from '@mui/material'

export default function AddUserCredsSignup() {
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const photoRef = useRef()
    const id = localStorage.getItem('user_id')
    const {profilePhoto, loadingProfilePhoto, setPhotoChanged} = useContext(UserDetailsContext)
    const navigate = useNavigate()


    const addFile = () => {
        photoRef.current.click()
    }

    const addPhoto = async (e) => {
        const file = e.target.files[0]
        if(file) {
            const formData = new FormData()
            formData.append('photo', file)
            try {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/addCreds-profile-photo-startup/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }, 
                    withCredentials: true 
                })
                if(response.data.success === false) {
                    toast.error(response.data.error, {
                        style: {
                            backgroundColor: 'white',
                            color: 'black'
                        },
                    })
                }
                setPhotoChanged((prevState) => !prevState)
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
            }
        }
    }

    const addUsername = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/addCreds-username-startup/${id}`, {username, id}, {withCredentials: true})
            if(response.data.success) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
                localStorage.removeItem('user_id')
                setLoading(false)
                navigate('/auth/signin')
            }
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
                setLoading(false)
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
            setLoading(false)
        } 
    }
    


    return (
        <div className="updateUserCreds-wrapper">
            <div className="main">
                <div className="add-photo">
                    <p>Add a photo</p>
                    {loadingProfilePhoto ? 
                        <CircularProgress style={{width: 300, height: 300}} />
                        : 
                        <>
                            { profilePhoto ? 
                                <img className='profilePhoto' src={profilePhoto} alt={username} />
                                :
                                <AccountCircle style={{width: 300, height: 300}} htmlColor='grey'  className='photo'/>
                            }
                            <PhotoCamera onClick={addFile} style={{width: 65, height: 65}} htmlColor="rgb(7, 141, 252)" className="addPhoto" fontSize="large" />
                        </>
                    }
                </div>
                <input 
                    ref={photoRef} 
                    accept='image/png, image/jpeg, image/jpg' 
                    type="file" 
                    name="photo" 
                    style={{display: 'none'}} 
                    onChange={addPhoto}
                />
                <div className="add-username">
                    <label htmlFor="username">Add username</label>
                    <input 
                        type="text" 
                        name='username'
                        placeholder='Enter Username'
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="next">
                    <button onClick={addUsername}>{loading ? <CircularProgress style={{width: 25, height: 25, color: 'white'}} /> : 'Next'}</button>
                </div>
            </div>
        </div>
    )
}