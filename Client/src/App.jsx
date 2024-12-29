import { useEffect, useState } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import Home from './Pages/Home'
import SignUp from "./Pages/SignUp"
import SignIn from "./Pages/SignIn"
import VerifyOTP from "./Pages/VerifyOTP"
import AddUserCredsSignup from './Pages/AddUserCredsSignup'
import ResetPassword from "./Pages/ResetPassword"
import People from "./Pages/People"
import Friends from "./Pages/Friends"
import PageNotFound from "./Pages/PageNotFound"
import { UserDetailsContext } from "./Contexts/userDetailsContext"
import { Toaster, toast } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
    fetchPicture,
    loading,
    profilePicture
} from './Redux/Slice/getProfilePicture'
import { useDispatch, useSelector } from 'react-redux'


export default function App() {
    const [userId, setUserId] = useState('')
    const [username, setUsername] = useState('')
    const [photoChanged, setPhotoChanged] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') || false
    })
    const location = useLocation()
    const profilePhoto = useSelector(profilePicture)
    const loadingProfilePhoto = useSelector(loading)
    const dispatch = useDispatch()
    const id = localStorage.getItem('user_id')

    useEffect(() => {
        dispatch(fetchPicture(id))
    }, [dispatch, id, photoChanged])

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/checkAuth`, {withCredentials: true})
                if(response.data.authenticated) {
                    setIsLoggedIn(response.data.user.isAuthenticated)
                    setUserId(response.data.user._id)
                    setUsername(response.data.user.username)
                }
            } catch (err) {
                toast.error(err.message, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            }
        }
        checkAuth()
    }, [])
    

    return (
        <>
            <Toaster   
                position='bottom-right'
                toastOptions={{ duration: 3000 }} 
            />
            <UserDetailsContext.Provider value={{
                userId, setUserId,
                profilePhoto, loadingProfilePhoto,
                photoChanged, setPhotoChanged,
                isLoggedIn, setIsLoggedIn,
                username, setUsername,
            }}>
                <AnimatePresence mode='wait'>
                    <Routes location={location} key={location.pathname}>
                        <Route 
                            path="/" 
                            element={isLoggedIn ? <Home /> : <SignIn />}
                        />
                        <Route path="auth/signup-send-otp" element={<SignUp />} />
                        <Route path="auth/signin" element={<SignIn />} />
                        <Route path="verify-otp" element={<VerifyOTP />} />
                        <Route path="addCreds" element={<AddUserCredsSignup />} />
                        <Route path="reset-password/:token" element={<ResetPassword />} />
                        <Route path="friends" element={<Friends />} />
                        <Route path="people" element={<People />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </AnimatePresence>
            </UserDetailsContext.Provider>
        </>
    )
}