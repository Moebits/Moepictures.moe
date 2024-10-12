import React, {useEffect, useContext, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import {HashLink as Link} from "react-router-hash-link"
import {HideNavbarContext, HideSidebarContext, ThemeContext, EnableDragContext, PromoteNameContext, HideTitlebarContext, UpdateUserFlagContext,
SiteHueContext, SiteLightnessContext, SiteSaturationContext, SessionContext, SessionFlagContext} from "../Context"
import functions from "../structures/Functions"
import "./styles/dialog.less"
import Draggable from "react-draggable"
import checkbox from "../assets/icons/checkbox.png"
import checkboxChecked from "../assets/icons/checkbox-checked.png"
import adminCrown from "../assets/icons/admin-crown.png"
import modCrown from "../assets/icons/mod-crown.png"
import premiumStar from "../assets/icons/premiumStar.png"

const PromoteDialog: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {promoteName, setPromoteName} = useContext(PromoteNameContext)
    const {updateUserFlag, setUpdateUserFlag} = useContext(UpdateUserFlagContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const [reason, setReason] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [role, setRole] = useState("user")
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    useEffect(() => {
        document.title = "Promote User"
    }, [])

    useEffect(() => {
        if (promoteName) {
            document.body.style.pointerEvents = "none"
        } else {
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
        }
    }, [promoteName])

    const promote = async () => {
        await functions.post("/api/user/promote", {username: promoteName, role}, session, setSessionFlag)
        setPromoteName(null)
        setUpdateUserFlag(true)
    }

    const click = (button: "accept" | "reject") => {
        if (button === "accept") {
            promote()
        } else {
            setPromoteName(null)
        }
    }

    if (promoteName) {
        return (
            <div className="dialog">
                <Draggable handle=".dialog-title-container">
                <div className="dialog-box" style={{width: "220px", height: "260px"}} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                    <div className="dialog-container">
                        <div className="dialog-title-container">
                            <span className="dialog-title">Promote User</span>
                        </div>
                        <div className="dialog-row">
                            <img className="dialog-icon" src={adminCrown}/>
                            <span className="dialog-text admin-color">Admin:</span>
                            <img className="dialog-checkbox" src={role === "admin" ? checkboxChecked : checkbox} onClick={() => setRole("admin")} style={{filter: "hue-rotate(60deg) saturate(100%) brightness(120%)"}}/>
                        </div>
                        <div className="dialog-row">
                            <img className="dialog-icon" src={modCrown}/>
                            <span className="dialog-text mod-color">Mod:</span>
                            <img className="dialog-checkbox" src={role === "mod" ? checkboxChecked : checkbox} onClick={() => setRole("mod")} style={{filter: "hue-rotate(-60deg) saturate(100%) brightness(120%)"}}/>
                        </div>
                        <div className="dialog-row">
                            <img className="dialog-icon" src={premiumStar}/>
                            <span className="dialog-text premium-color">Premium:</span>
                            <img className="dialog-checkbox" src={role === "premium" ? checkboxChecked : checkbox} onClick={() => setRole("premium")} style={{filter: "hue-rotate(40deg) saturate(100%) brightness(120%)"}}/>
                        </div>
                        <div className="dialog-row">
                            <span className="dialog-text user-color">User:</span>
                            <img className="dialog-checkbox" src={role === "user" ? checkboxChecked : checkbox} onClick={() => setRole("user")}/>
                        </div>
                        {error ? <div className="dialog-validation-container"><span className="dialog-validation" ref={errorRef}></span></div> : null}
                        <div className="dialog-row">
                            <button onClick={() => click("reject")} className="dialog-button">{"Cancel"}</button>
                            <button onClick={() => click("accept")} className="dialog-button">{"Promote"}</button>
                        </div>
                    </div>
                </div>
                </Draggable>
            </div>
        )
    }
    return null
}

export default PromoteDialog