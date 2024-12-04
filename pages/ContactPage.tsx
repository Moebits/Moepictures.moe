import React, {useEffect, useState, useRef, useReducer} from "react"
import {useHistory, Link} from "react-router-dom"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import XButton from "../assets/icons/x-button.png"
import functions from "../structures/Functions"
import {useThemeSelector, useInteractionActions, useSessionSelector, useSessionActions,
useLayoutActions, useActiveActions, useFlagActions, useLayoutSelector} from "../store"
import "./styles/contactpage.less"

const ContactPage: React.FunctionComponent = (props) => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const {theme, siteHue, siteLightness, siteSaturation, i18n} = useThemeSelector()
    const {setHideNavbar, setHideTitlebar, setHideSidebar, setRelative} = useLayoutActions()
    const {setEnableDrag} = useInteractionActions()
    const {setHeaderText, setSidebarText} = useActiveActions()
    const {setRedirect} = useFlagActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {mobile} = useLayoutSelector()
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState(false)
    const [files, setFiles] = useState([]) as any
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const errorRef = useRef(null) as any
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    useEffect(() => {
        setHideNavbar(false)
        setHideTitlebar(false)
        setHideSidebar(false)
        setRelative(false)
        setHeaderText("")
        setSidebarText("")
        setEnableDrag(false)
        document.title = "Contact"
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    const fileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.[0]) return
        const fileArray = Array.from(event.target.files)
        const acceptedFiles = [] as any
        for (let i = 0; i < fileArray.length; i++) {
            const MB = fileArray[i].size / (1024*1024)
            if (MB > 25) continue
            let obj = {} as any
            obj.bytes = Object.values(new Uint8Array(await fileArray[i].arrayBuffer()))
            obj.name = fileArray[i].name
            acceptedFiles.push(obj)
        }
        setFiles([...files, ...acceptedFiles])
    }
    
    const submit = async () => {
        const badEmail = functions.validateEmail(email, i18n)
        if (badEmail) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = badEmail
            await functions.timeout(2000)
            setError(false)
            return
        }
        const badMessage = functions.validateMessage(message, i18n)
        if (badMessage) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = badMessage
            await functions.timeout(2000)
            setError(false)
            return
        }
        setError(true)
        if (!errorRef.current) await functions.timeout(20)
        errorRef.current!.innerText = "Submitting..."
        try {
            await functions.post("/api/misc/contact", {email, subject, message, files}, session, setSessionFlag)
            setSubmitted(true)
            setError(false)
        } catch {
            errorRef.current!.innerText = "Bad email or message."
            await functions.timeout(2000)
            setError(false)
        }
    }

    const generateFilesJSX = () => {
        let jsx = [] as any
        for (let i = 0; i < files.length; i++) {
            const deleteFile = () => {
                files.splice(i, 1)
                setFiles(files)
                forceUpdate()
            }
            jsx.push(<>
                    <span className="contact-text-small">{files[i].name}</span>
                    <img className="x-button" src={XButton} style={{filter: getFilter()}} onClick={() => deleteFile()}/>
                </>
            )
        }
        return jsx
    }

    return (
        <>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content">
                <div className="contact">
                    <span className="contact-title">Contact</span>
                    {submitted ? <>
                    <span className="contact-link">Your message was delivered.</span>
                    <div className="contact-button-container-left">
                        <button className="contact-button" onClick={() => history.push("/posts")}>←Back</button>
                    </div>
                    </> : <>
                    <span className="contact-link">
                        This is a contact form for general inquiries. If you would like to remove your work, 
                        please fill out our <Link className="contact-text-alt-link" to="/copyright-removal">Copyright Removal Form</Link>.
                    </span>
                    <div className="contact-row">
                        <span className="contact-text">Email:</span>
                        <input className="contact-input" type="text" spellCheck={false} value={email} onChange={(event) => setEmail(event.target.value)}/>
                    </div>
                    <div className="contact-row">
                        <span className="contact-text">Subject:</span>
                        <input className="contact-input" type="text" spellCheck={false} value={subject} onChange={(event) => setSubject(event.target.value)}/>
                    </div>
                    <div className="contact-row">
                        <span className="contact-text">Attach Files:</span>
                        <label htmlFor="contact-file-upload" className="contact-file-input">Select Files</label>
                        <input id="contact-file-upload" type="file" multiple onChange={(event) => fileUpload(event)}/>
                        {generateFilesJSX()}
                    </div>
                    <div className="contact-row-start">
                        <span className="contact-text">Message:</span>
                        <textarea className="contact-textarea" spellCheck={false} value={message} onChange={(event) => setMessage(event.target.value)}></textarea>
                    </div>
                    {error ? <div className="contact-validation-container"><span className="contact-validation" ref={errorRef}></span></div> : null}
                    <div className="contact-button-container">
                        <button className="contact-button" onClick={submit}>Send Message</button>
                    </div>
                    </> }
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default ContactPage