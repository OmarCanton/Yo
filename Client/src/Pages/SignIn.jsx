import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDetailsContext } from '../Contexts/userDetailsContext'
import { toast } from 'react-hot-toast'
import '../Styles/Signin.css'
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { motion } from 'framer-motion'
import { Visibility, VisibilityOff } from '@mui/icons-material'

export default function SignIn() {
    const [email, setEmail] = useState('')
    const [resetEmail, setResetEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [reVerify, setReVerify] = useState(false)
    const {setIsLoggedIn, setUserId} = useContext(UserDetailsContext)
    const navigate = useNavigate()
    const [signingIn, setSigningIn] = useState(false)
    const [open, setOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [sendingCode, setSendingCode] = useState(false)
    const [sendingResetLink, setSendingResetLink] = useState(false)
    const id = localStorage.getItem('user_id')

    const data = {
        email,
        password,
        rememberMe
    }
    const handleSignin = async (event) => {
        event.preventDefault()
        setSigningIn(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signin`, data, {withCredentials: true})
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
                setIsLoggedIn(response.data.user.isAuthenticated)
                setUserId(response.data.user._id)
                localStorage.setItem('isLoggedIn', response.data.user.isAuthenticated)
                navigate('/')
                setSigningIn(false)
            } 
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
                setSigningIn(false)
            } 
            if(response.data.isAuth === false) {
                toast.error(response.data.message, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
                setReVerify(true)
                setSigningIn(false)
            }
        } catch (err) {
            console.log(err)
            toast.error(err.message, {
                style: {
                    backgroundColor: 'white',
                    color: 'black'
                }
            })
            setSigningIn(false)
        }
    }

    const handleReVerify = async (e) => {
        e.preventDefault()
        setSendingCode(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/resend-code`, {id}, {withCredentials: true})
            console.log('response:: ', response.data)
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
                setSendingCode(false)
                navigate('/verify-otp')          
            }
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
                setSendingCode(false)
            }
        } catch (err) {
            toast.error(err.message, {
                style: {
                    backgroundColor: 'white',
                    color: 'black'
                }
            })
            setSendingCode(false)
        }
    }

    const resetPassword = async () => {
        setSendingResetLink(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/forgot-password`, {resetEmail}, {withCredentials: true})
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
                setOpen(false)
            }
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            }
            setResetEmail('')
            setSendingResetLink(false)
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
            setResetEmail('')
            setSendingResetLink(false)
            setOpen(false)
        }
    }
    

    return (
        <div className="signin-wrapper">
            <motion.div 
                className="signin-main"
                initial={{y: '10%', opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: '10%', opacity: 0}}
                transition={{duration: 0.15}}
            >
                <div className="signin-header">
                    <p>Sign in to your account</p>
                </div>
                <div className="form">
                    <form onSubmit={handleSignin}>
                        <div className="email">
                            <input 
                                type="email" 
                                name="email" 
                                placeholder='Enter your email'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="password">
                            <input 
                                className='passwordInput'
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                placeholder='Enter password'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {showPassword ? 
                                <VisibilityOff 
                                    onClick={() => setShowPassword(prevState => !prevState)} 
                                    className='showPass' 
                                    htmlColor='grey'
                                    style={{cursor: 'pointer'}} 
                                />
                                :
                                <Visibility 
                                    onClick={() => setShowPassword(prevState => !prevState)} 
                                    className='showPass' 
                                    htmlColor='#3C3C3C' 
                                    style={{cursor: 'pointer'}}
                                />
                            }
                        </div>
                        <div className="rememberMe">
                            <input 
                                className='checkbox'
                                type="checkbox" 
                                name="rememberMe" 
                                id="rememberMe" 
                                onChange={() => setRememberMe(prevState => !prevState)}
                            />
                            <label htmlFor="rememberMe">Keep me logged in</label>
                        </div>
                        { reVerify ?
                            <button className='reVerify' type='button' onClick={handleReVerify}>
                                {sendingCode ? 
                                    <CircularProgress style={{width: 25, height: 25, color: 'white'}}/> 
                                    :
                                    'Verify'
                                }
                            </button>
                            :
                            <button>
                                {signingIn ? 
                                    <CircularProgress style={{width: 25, height: 25, color: 'white'}}/> 
                                    : 
                                    'Sign in'
                                }
                            </button>
                        }
                    </form>
                </div>
                <div className="forgotPassword">
                    <Link onClick={() => setOpen(true)}>Forgot Password?</Link>
                </div>
                <div className="signup">
                    <p>Don&apos;t have an account yet? <Link to='/auth/signup-send-otp'>Sign up</Link></p>
                </div>
            </motion.div>
            <Dialog 
                open={open}
                onClose={(event, reason) => {
                    if(reason === 'backdropClick' || reason === 'escapeKeyDown') {
                        setOpen(false)
                    }
                }}
                PaperProps={{style: {
                    display: 'flex',
                    flexDirection: 'column',
                }}}
            >
                <DialogTitle><h3>Forgot Password?</h3></DialogTitle>
                <DialogContent style={{
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                    <i>Enter your email to reset password</i>
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        value={resetEmail}
                        style={{
                            width: '98%',
                            padding: 10, 
                            cursor: 'auto', 
                            marginTop: 5, 
                            fontSize: 'medium',
                            border: '1px solid grey',
                            borderRadius: 3
                        }}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder='example@gmail.com' 
                    />
                </DialogContent>
                <DialogActions>
                    <button style={{padding: 5, cursor: 'pointer'}} onClick={resetPassword}>
                        { sendingResetLink ? 
                            <CircularProgress style={{width: 25, height: 25, color: 'grey'}}/>
                            :
                            'Submit'
                        }
                    </button>
                    <button style={{padding: 5, cursor: 'pointer'}} onClick={() => setOpen(false)}>Cancel</button>
                </DialogActions>

            </Dialog>
        </div>
    )
}