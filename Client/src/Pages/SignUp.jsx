import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../Styles/Signup.css'
import ChattingAnime from '../Effects/Chatting.json'
import Lottie from 'lottie-react'
import axios from 'axios'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confPassword, setConfPassword] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [sex, setSex] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [showConfPass, setShowConfPass] = useState(false)
    const [signingUp, setSigningUp] = useState(false) 
    const navigate = useNavigate()


    const passwordStrength = (password) => {
        let strength = 0
        
        if(password.match(/[A-Z]/)) strength++
        if(password.match(/[a-z]/)) strength++
        if(password.match(/\d/)) strength++
        if(password.match(/\W/)) strength++
        if(password.length >= 8) strength++

        return strength
    }

    const getBarColor = (strength) => {
        if(strength === 0) {
            return ''
        } else if(strength === 1) {
            return 'red'
        } else if(strength === 2) {
            return 'orange'
        } else if(strength === 3) {
            return 'gold'
        } else if(strength === 4) {
            return 'lightblue'
        } else {
            return 'yellowgreen'
        }
    }

    const strength = passwordStrength(password)
    const backgroundColor = getBarColor(strength)

    const barStyles = {
        width: `${strength / 5 * 85}%`,
        backgroundColor: `${backgroundColor}`
    }
    
    const signupData = {
        email, password, confPassword, birthdate, sex
    }

    const  handleSignup = async (event) => {
        event.preventDefault()
        setSigningUp(true)
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup-send-code`, signupData, {withCredentials: true})
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
                localStorage.setItem('user_id', response.data.user._id)
                setSigningUp(false)
                navigate('/verify-otp')
            }
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
                setSigningUp(false)            
            }
        } catch (err) {
            toast.error(err.message, {
                style: {
                    backgroundColor: 'white',
                    color: 'black'
                }
            })
            setSigningUp(false)
        }
    }


    return (
        <div className="signup-wrapper">
            <motion.div 
                className="signup-main"
                initial={{y: '10%', opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: '10%', opacity: 0}}
                transition={{duration: 0.15}}
            >
                <div className="signup-header">
                    <p>Create an account on Yo</p>
                </div>
                <div className="passBar" style={barStyles}></div>
                <div className="form">
                    <form onSubmit={handleSignup}>
                        <div className="phone">
                            <input
                                type="email"
                                placeholder='Enter Email'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="password">
                            <input 
                                type={showPass ? 'text' : 'password'}
                                name="password" 
                                placeholder='Enter Password'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {showPass ? 
                                <VisibilityOff 
                                    className='showpass1' 
                                    onClick={() => setShowPass(false)}
                                    htmlColor='grey'
                                    style={{cursor: 'pointer'}}
                                /> 
                                : 
                                <Visibility 
                                    className='showpass1' 
                                    onClick={() => setShowPass(true)}
                                    htmlColor='#3C3C3C'
                                    style={{cursor: 'pointer'}}
                                />
                            }
                        </div>
                        <div className="confPassword">
                            <input 
                                type={showConfPass ? 'text' : 'password'}
                                name="confPassword" 
                                placeholder='Confirm Password'
                                onChange={(e) => setConfPassword(e.target.value)}
                            />
                            {showConfPass ? 
                                <VisibilityOff 
                                    className='showpass2' 
                                    htmlColor='grey'
                                    onClick={() => setShowConfPass(false)}
                                    style={{cursor: 'pointer'}}
                                /> 
                                : 
                                <Visibility 
                                    className='showpass2' 
                                    onClick={() => setShowConfPass(true)}
                                    htmlColor='#3C3C3C'
                                    style={{cursor: 'pointer'}}
                                />
                            }
                        </div>
                        <div className="birthdate">
                            <input 
                                type="date" 
                                name="birthdate"
                                onChange={(e) => setBirthdate(e.target.value)}
                            />
                        </div>
                        <div className="sex">
                            <label htmlFor="select">Sex: </label>
                            <select 
                                defaultValue={'none'} id='select' 
                                name="sex"
                                onChange={(e) => setSex(e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <button>
                            {signingUp ? 
                                <CircularProgress style={{width: 25, height: 25, color: 'white'}}/>
                                : 
                                <p>SignUp</p>
                            }
                        </button>
                    </form>
                </div>
                <div className="alreadyHaveAcc">
                    <p>Already have an account? <Link to='/auth/signin'>Sign In</Link></p>
                </div>
            </motion.div>
            <motion.div
                className='signup-anime'
                initial={{y: '10%', opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: '10%', opacity: 0}}
                transition={{delay: 0.2, duration: 0.15}}
            >
                <Lottie loop animationData={ChattingAnime} />
            </motion.div>
        </div>
    )
}