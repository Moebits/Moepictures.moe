import React, {useEffect} from "react"
import TitleBar from "../../components/site/TitleBar"
import NavBar from "../../components/site/NavBar"
import SideBar from "../../components/site/SideBar"
import Footer from "../../components/site/Footer"
import $401 from "../../assets/images/401.png"
import {useInteractionActions, useSessionSelector, useSessionActions,
useLayoutActions, useActiveActions, useFlagActions, useLayoutSelector} from "../../store"
import {useThemeSelector} from "../../store"
import "./styles/404page.less"

const $401Page: React.FunctionComponent = (props) => {
    const {theme, i18n} = useThemeSelector()
    const {setHideNavbar, setHideTitlebar, setHideSidebar, setRelative} = useLayoutActions()
    const {setEnableDrag} = useInteractionActions()
    const {setHeaderText, setSidebarText} = useActiveActions()
    const {setRedirect} = useFlagActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {mobile} = useLayoutSelector()

    useEffect(() => {
        setHideNavbar(false)
        setHideTitlebar(false)
        setHideSidebar(false)
        setRelative(false)
        setHeaderText("")
        setSidebarText(i18n.sidebar.$401)
        document.title = i18n.errors.$401
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    return (
        <>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content">
                <div className="f404-container">
                    <span className={`f404-text ${!theme.includes("light") ? "f404-darker" : ""}`}>{i18n.errors.$401}</span>
                    <img className="f404" src={$401}/>
                </div>
                <Footer noPadding={true}/>
            </div>
        </div>
        </>
    )
}

export default $401Page