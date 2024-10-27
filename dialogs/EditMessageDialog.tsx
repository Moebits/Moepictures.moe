import React, {useEffect, useContext, useState, useRef, useReducer} from "react"
import {useHistory} from "react-router-dom"
import {HideNavbarContext, HideSidebarContext, ThemeContext, EnableDragContext, EditMessageIDContext, EditMessageFlagContext,
EditMessageTitleContext, EditMessageContentContext, HideTitlebarContext, SessionContext, EmojisContext, MobileContext} from "../Context"
import functions from "../structures/Functions"
import "./styles/dialog.less"
import Draggable from "react-draggable"
import emojiSelect from "../assets/icons/emoji-select.png"
import permissions from "../structures/Permissions"

const EditMessageDialog: React.FunctionComponent = (props) => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const {theme, setTheme} = useContext(ThemeContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {editMessageID, setEditMessageID} = useContext(EditMessageIDContext)
    const {editMessageFlag, setEditMessageFlag} = useContext(EditMessageFlagContext)
    const {editMessageTitle, setEditMessageTitle} = useContext(EditMessageTitleContext)
    const {editMessageContent, setEditMessageContent} = useContext(EditMessageContentContext)
    const {session, setSession} = useContext(SessionContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {emojis, setEmojis} = useContext(EmojisContext)
    const [showEmojiDropdown, setShowEmojiDropdown] = useState(false)
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const emojiRef = useRef(null) as any
    const dialogRef = useRef(null) as any
    const textAreaRef = useRef(null) as any
    const history = useHistory()

    useEffect(() => {
        document.title = "Edit Message"
    }, [])

    useEffect(() => {
        if (editMessageID) {
            document.body.style.pointerEvents = "none"
        } else {
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
        }
    }, [editMessageID])

    const editMessage = async () => {
        setEditMessageFlag(true)
    }

    const click = (button: "accept" | "reject") => {
        if (button === "accept") {
            editMessage()
        } else {
            setEditMessageID(null)
        }
    }

    useEffect(() => {
        if (typeof window === "undefined") return
        const observer = new ResizeObserver(() => forceUpdate())
        const dialogElement = dialogRef.current
        const textareaElement = textAreaRef.current
        if (dialogElement) observer.observe(dialogElement)
        if (textareaElement) observer.observe(textareaElement)
        return () => {
            observer.disconnect()
        }
    })

    const getEmojiMarginRight = () => {
        if (typeof document === "undefined") return "0px"
        const rect = emojiRef.current?.getBoundingClientRect()
        if (!rect) return "0px"
        const raw = window.innerWidth - rect.right
        let offset = -100
        if (mobile) offset += 0
        return `${raw + offset}px`
    }

    const getEmojiMarginBottom = () => {
        if (typeof document === "undefined") return "0px"
        const bodyRect = dialogRef.current?.getBoundingClientRect()
        const rect = emojiRef.current?.getBoundingClientRect()
        if (!rect || !bodyRect) return "0px"
        const raw = window.innerHeight - rect.bottom
        let offset = 40
        if (mobile) offset += 0
        return `${raw + offset}px`
    }

    const emojiGrid = () => {
        let rows = [] as any
        let rowAmount = 7
        for (let i = 0; i < Object.keys(emojis).length; i++) {
            let items = [] as any
            for (let j = 0; j < rowAmount; j++) {
                const k = (i*rowAmount)+j
                const key = Object.keys(emojis)[k]
                if (!key) break
                const appendText = () => {
                    setEditMessageContent((prev: string) => prev + ` emoji:${key}`)
                    setShowEmojiDropdown(false)
                }
                items.push(
                    <img draggable={false} src={emojis[key]} className="dialog-emoji-big" onClick={appendText}/>
                )
            }
            if (items.length) rows.push(<div className="dialog-emoji-row">{items}</div>)
        }
        return (
            <div className={`dialog-emoji-grid ${showEmojiDropdown ? "" : "hide-dialog-emoji-grid"}`}
            onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}
            style={{marginRight: getEmojiMarginRight(), marginBottom: getEmojiMarginBottom()}}>
                {rows}
            </div>
        )
    }

    if (editMessageID) {
        return (
            <div className="dialog">
                <Draggable handle=".dialog-title-container">
                <div className="dialog-box" ref={dialogRef} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                    <div className="dialog-container">
                        <div className="dialog-title-container">
                            <span className="dialog-title">Edit Message</span>
                        </div>
                        <div className="dialog-row">
                            <span className="dialog-text">Title: </span>
                            <input className="dialog-input-taller" type="text" spellCheck={false} value={editMessageTitle} onChange={(event) => setEditMessageTitle(event.target.value)}/>
                        </div>
                        <div className="dialog-row">
                            <span className="dialog-text">Content: </span>
                        </div>
                        <div className="dialog-row">
                            <textarea className="dialog-textarea" ref={textAreaRef} style={{resize: "vertical", height: "330px"}} spellCheck={false} value={editMessageContent} onChange={(event) => setEditMessageContent(event.target.value)}></textarea>
                        </div>
                        {error ? <div className="dialog-validation-container"><span className="dialog-validation" ref={errorRef}></span></div> : null}
                        <div className="dialog-row">
                            <button onClick={() => click("reject")} className="dialog-button">{"Cancel"}</button>
                            <button className="dialog-emoji-button" ref={emojiRef} onClick={() => setShowEmojiDropdown((prev: boolean) => !prev)}>
                                <img src={emojiSelect}/>
                            </button>
                            <button onClick={() => click("accept")} className="dialog-button">{"Edit"}</button>
                        </div>
                    </div>
                </div>
                </Draggable>
                {emojiGrid()}
            </div>
        )
    }
    return null
}

export default EditMessageDialog