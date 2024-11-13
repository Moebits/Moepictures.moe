import React, {useEffect, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import TitleBar from "../components/TitleBar"
import Footer from "../components/Footer"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import functions from "../structures/Functions"
import {useThemeSelector, useInteractionActions, useSessionSelector, useSessionActions,
useLayoutActions, useActiveActions, useFlagActions, useLayoutSelector} from "../store"
import "./styles/sitepage.less"

const LoginHistoryPage: React.FunctionComponent = (props) => {
    const {theme, siteHue, siteLightness, siteSaturation} = useThemeSelector()
    const {setHideNavbar, setHideTitlebar, setHideSidebar, setRelative} = useLayoutActions()
    const {setEnableDrag} = useInteractionActions()
    const {setHeaderText, setSidebarText} = useActiveActions()
    const {setRedirect} = useFlagActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {mobile, tablet} = useLayoutSelector()
    const {setActionBanner} = useActiveActions()
    const [loginHistory, setLoginHistory] = useState([] as any)
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const updateLoginHistory = async () => {
        const result = await functions.get("/api/user/login/history", null, session, setSessionFlag)
        setLoginHistory(result)
    }

    useEffect(() => {
        setHideNavbar(false)
        setHideTitlebar(false)
        setHideSidebar(false)
        setRelative(true)
        setHeaderText("")
        setSidebarText("")
        setEnableDrag(false)
        document.title = "Login History"
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
        if (!session.username) {
            setRedirect("/login-history")
            history.push("/login")
            setSidebarText("Login required.")
        }
        updateLoginHistory()
    }, [session])

    const logoutOtherSessions = async () => {
        await functions.post("/api/user/logout-sessions", null, session, setSessionFlag)
        setActionBanner("logout-sessions")
    }

    const failedLogin = (log: any) => {
        if (log.type === "login failed") return true
        if (log.type === "login 2fa failed") return true
        if (log.type === "2fa disabled") return true
        if (log.type === "password reset") return true
        if (log.type === "password changed") return true
        if (log.type === "email changed") return true
        if (log.type === "username changed") return true
        return false
    }

    const loginHistoryJSX = () => {
        let jsx = [] as any
        for (let i = 0; i < loginHistory.length; i++) {
            const log = loginHistory[i]
            jsx.push(
                <div className="sitepage-table-row">
                    <div className="sitepage-table-column">
                        <span className="sitepage-table-name">{log.username}</span>
                    </div>
                    <div className="sitepage-table-column" style={{width: "130px"}}>
                        <span className={`sitepage-table-name ${failedLogin(log) ? "artist-tag-color" : ""}`}>{log.type}</span>
                    </div>
                    <div className="sitepage-table-column">
                        <span className="sitepage-table-name-strong">{log.ip}</span>
                    </div>
                    <div className="sitepage-table-column">
                        <span className="sitepage-table-name">{log.device}</span>
                    </div>
                    <div className="sitepage-table-column">
                        <span className="sitepage-table-name">{log.region}</span>
                    </div>
                    <div className="sitepage-table-column">
                        <span className="sitepage-table-name-strong">{functions.prettyDate(new Date(log.timestamp))}</span>
                    </div>
                </div>
            )
        }
        return (
            <div className="sitepage-table">
                {jsx}
            </div>
        )
    }

    return (
        <>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content">
                <div className="sitepage" style={{width: mobile || tablet ? "100%" : "70%", height: "max-content"}}>
                    <div className="sitepage-title-container">
                        <span className="sitepage-title">Login History</span>
                    </div>
                    <span className="sitepage-link">If you don't recognize the activity, logout of all other sessions and change your password!</span>
                    <div className="sitepage-button-container" style={{justifyContent: "flex-start"}}>
                        <button style={{marginRight: "20px"}} className="sitepage-button" onClick={() => history.push("/profile")}>←Back</button>
                        <button className="sitepage-button" onClick={logoutOtherSessions}>Logout Other Sessions</button>
                    </div>
                    {loginHistoryJSX()}
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default LoginHistoryPage