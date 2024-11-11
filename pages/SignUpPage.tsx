import React, {useEffect, useContext, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import {HashLink as Link} from "react-router-hash-link"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import show from "../assets/icons/show.png"
import hide from "../assets/icons/hide.png"
import functions from "../structures/Functions"
import {HideNavbarContext, HideSidebarContext, EnableDragContext, RelativeContext, HideTitlebarContext, MobileContext,
HeaderTextContext, SidebarTextContext, SessionContext, SessionFlagContext} from "../Context"
import {useThemeSelector} from "../store"
import "./styles/sitepage.less"

const SignUpPage: React.FunctionComponent = (props) => {
    const {theme, siteHue, siteSaturation, siteLightness} = useThemeSelector()
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {relative, setRelative} = useContext(RelativeContext)
    const {headerText, setHeaderText} = useContext(HeaderTextContext)
    const {sidebarText, setSidebarText} = useContext(SidebarTextContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const [showPassword, setShowPassword] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [captchaResponse, setCaptchaResponse] = useState("")
    const [captcha, setCaptcha] = useState("")
    const [error, setError] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const getCaptchaColor = () => {
        if (theme.includes("light")) return "#ffffff"
        return "#09071c"
    }

    const updateCaptcha = async () => {
        const captcha = await functions.get("/api/misc/captcha/create", {color: getCaptchaColor()}, session, setSessionFlag)
        setCaptcha(captcha)
        setCaptchaResponse("")
    }

    useEffect(() => {
        updateCaptcha()
    }, [session, theme])

    useEffect(() => {
        setHideNavbar(false)
        setHideTitlebar(false)
        setHideSidebar(false)
        setRelative(false)
        setHeaderText("")
        setSidebarText("")
        setEnableDrag(false)
        document.title = "Sign Up"
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    useEffect(() => {
        if (!session.cookie) return
        if (session.username) {
            history.push("/profile")
        }
    }, [session])

    const getEye = () => {
        return showPassword ? hide : show
    }

    const getEye2 = () => {
        return showPassword2 ? hide : show
    }

    const submit = async () => {
        if (password.trim() !== confirmPassword.trim()) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = "Passwords don't match."
            await functions.timeout(2000)
            setError(false)
            return
        }
        const badPassword = functions.validatePassword(username.trim(), password.trim())
        if (badPassword) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = badPassword
            await functions.timeout(2000)
            setError(false)
            return
        }
        const badEmail = functions.validateEmail(email.trim())
        if (badEmail) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = badEmail
            await functions.timeout(2000)
            setError(false)
            return
        }
        const badUsername = functions.validateUsername(username.trim())
        if (badUsername) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = badUsername
            await functions.timeout(2000)
            setError(false)
            return
        }
        if (!captchaResponse) {
            setError(true)
            await functions.timeout(20)
            errorRef.current.innerText = "Solve the captcha."
            await functions.timeout(2000)
            return setError(false)
        }
        setError(true)
        if (!errorRef.current) await functions.timeout(20)
        errorRef.current!.innerText = "Submitting..."
        try {
            await functions.post("/api/user/signup", {username, email, password, captchaResponse}, session, setSessionFlag)
            setSubmitted(true)
            setError(false)
        } catch (err: any) {
            let errMsg = "Bad username, password, email, or captcha."
            if (err.response?.data.includes("Too many accounts created")) errMsg = "Too many accounts created, try again later."
            if (err.response?.data.includes("IP banned")) errMsg = "This IP is associated with a banned account."
            errorRef.current!.innerText = errMsg
            await functions.timeout(2000)
            setError(false)
            updateCaptcha()
        }
    }

    const goToLogin = () => {
        history.push("/login")
    }

    return (
        <>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content">
                <div className="sitepage">
                    <span className="sitepage-title">Sign Up</span>
                    {submitted ? <>
                    <span className="sitepage-validation">Your account has been created. You should have received a confirmation link in your email. Please verify your email and login again.</span>
                    <div className="sitepage-button-container" style={{justifyContent: "flex-start"}}>
                        <button className="sitepage-button" onClick={() => goToLogin()}>Login</button>
                    </div>
                    </> :
                    <>
                    <Link style={{width: "max-content"}} to="/login">
                        <span className="sitepage-link-clickable">Already have an account? Login.</span>
                    </Link>
                    <div className="sitepage-row">
                        <span className="sitepage-text-wide2">Email Address:</span>
                        <input className="sitepage-input" type="text" spellCheck={false} value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? submit() : null}/>
                    </div>
                    <div className="sitepage-row">
                        <span className="sitepage-text-wide2">Username:</span>
                        <input className="sitepage-input" type="text" spellCheck={false} value={username} onChange={(event) => setUsername(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? submit() : null}/>
                    </div>
                    <div className="sitepage-row">
                        <span className="sitepage-text-wide2">Password:</span>
                        <div className="sitepage-pass">
                            <img className="sitepage-pass-show" src={getEye()} style={{filter: getFilter()}} onClick={() => setShowPassword((prev) => !prev)}/>
                            <input className="sitepage-pass-input" type={showPassword ? "text" : "password"} spellCheck={false} value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? submit() : null}/>
                        </div>
                    </div>
                    <div className="sitepage-row">
                        <span className="sitepage-text-wide2">Confirm Password:</span>
                        <div className="sitepage-pass">
                            <img className="sitepage-pass-show" src={getEye2()} style={{filter: getFilter()}} onClick={() => setShowPassword2((prev) => !prev)}/>
                            <input className="sitepage-pass-input" type={showPassword2 ? "text" : "password"} spellCheck={false} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? submit() : null}/>
                        </div>
                    </div>
                    <div className="sitepage-row" style={{justifyContent: "center"}}>
                        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(captcha)}`} style={{filter: getFilter()}}/>
                        <input className="sitepage-input" type="text" spellCheck={false} value={captchaResponse} onChange={(event) => setCaptchaResponse(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? submit() : null}/>
                    </div>
                    <span className="sitepage-validation">
                        -Passwords must contain at least 10 characters<br/>
                        -At least three of the following: lowercase letters, uppercase
                        letters, numbers, and special symbols
                    </span>
                    {error ? <div className="sitepage-validation-container"><span className="sitepage-validation" ref={errorRef}></span></div> : null}
                    <div className="sitepage-button-container">
                        <button className="sitepage-button" onClick={() => submit()}>Sign Up</button>
                    </div></>}
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default SignUpPage