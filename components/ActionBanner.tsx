import React, {useContext, useEffect, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, MobileContext, ActionBannerContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import functions from "../structures/Functions"
import "./styles/actionbanner.less"

let timeout = null as any

const ActionBanner: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {actionBanner, setActionBanner} = useContext(ActionBannerContext)
    const [stickyText, setStickyText] = useState("")

    useEffect(() => {
        if (actionBanner === "copy-tags") {
            setStickyText("Copied Tags!")
            document.documentElement.style.setProperty("--actionBannerColor", "#ce1a4dCC")
        }
        if (actionBanner === "copy-hash") {
            setStickyText("Copied Hash!")
            document.documentElement.style.setProperty("--actionBannerColor", "#501aceCC")
        }
    }, [actionBanner])

    if (actionBanner) {
        if (timeout && stickyText === actionBanner) {
            // ignore block
        } else {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setActionBanner(null)
                timeout = null
            }, 2000)
        }
    }

    return (
        <div className={`action-banner ${actionBanner ? "action-banner-visible" : ""}`}>
            <span className="action-banner-text">{stickyText}</span>
            <span className="action-banner-x" onClick={() => setActionBanner(null)}>x</span>
        </div>
    )
}

export default ActionBanner