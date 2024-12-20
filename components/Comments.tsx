import React, {useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {useInteractionActions, useThemeSelector, useSessionSelector, useSessionActions, useActiveSelector, 
useActiveActions, useLayoutSelector, useFlagSelector, useFlagActions, useCacheSelector} from "../store"
import functions from "../structures/Functions"
import emojiSelect from "../assets/icons/emoji-select.png"
import highlight from "../assets/icons/highlight.png"
import bold from "../assets/icons/bold.png"
import italic from "../assets/icons/italic.png"
import underline from "../assets/icons/underline.png"
import strikethrough from "../assets/icons/strikethrough.png"
import spoiler from "../assets/icons/spoiler.png"
import Comment from "./Comment"
import jsxFunctions from "../structures/JSXFunctions"
import "./styles/comments.less"

interface Props {
    post: any
}

const Comments: React.FunctionComponent<Props> = (props) => {
    const {siteHue, siteSaturation, siteLightness, i18n} = useThemeSelector()
    const {setEnableDrag} = useInteractionActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {quoteText} = useActiveSelector()
    const {setQuoteText} = useActiveActions()
    const {mobile} = useLayoutSelector()
    const {commentID, commentJumpFlag} = useFlagSelector()
    const {setCommentID, setCommentJumpFlag} = useFlagActions()
    const {emojis} = useCacheSelector()
    const [text, setText] = useState("")
    const [error, setError] = useState(false)
    const [comments, setComments] = useState([]) as any
    const [commentFlag, setCommentFlag] = useState(false)
    const [showEmojiDropdown, setShowEmojiDropdown] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const errorRef = useRef(null) as any
    const emojiRef = useRef(null) as any
    const textRef = useRef(null) as any
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    useEffect(() => {
        const commentParam = new URLSearchParams(window.location.search).get("comment")
        const onDOMLoaded = async () => {
            if (commentParam) {
                await functions.timeout(500)
                setCommentID(Number(commentParam))
                setCommentJumpFlag(true)
            }
        }
        window.addEventListener("load", onDOMLoaded)
        return () => {
            window.removeEventListener("load", onDOMLoaded)
        }
    }, [])

    useEffect(() => {
        if (comments && commentID && commentJumpFlag) {
            onCommentJump(commentID)
            setCommentJumpFlag(false)
        }
    }, [comments, commentJumpFlag, commentID])

    const onCommentJump = async (commentID: number) => {
        let element = document.querySelector(`[comment-id="${commentID}"]`)
        if (!element) {
            await functions.timeout(1000)
            element = document.querySelector(`[comment-id="${commentID}"]`)
        }
        if (!element) return
        const position = element.getBoundingClientRect()
        const elementTop = position.top + window.scrollY
        window.scrollTo(0, elementTop - (window.innerHeight / 3))
        setCommentID(commentID)
    }

    useEffect(() => {
        if (commentID) history.replace(`${location.pathname}?comment=${commentID}`)
    }, [commentID])

    const updateComments = async () => {
        const comments = await functions.get("/api/post/comments", {postID: props.post.postID}, session, setSessionFlag)
        setComments(comments || [])
    }

    useEffect(() => {
        updateComments()
    }, [session, props.post])

    useEffect(() => {
        if (commentFlag) {
            setCommentFlag(false)
            updateComments()
        }
    }, [commentFlag, session])

    useEffect(() => {
        if (quoteText) {
            const prevText = text.trim() ? `${text.trim()}\n` : ""
            setText(`${prevText}${quoteText.trim()}`)
            setQuoteText(null)
            window.scrollTo(0, document.body.scrollHeight)
        }
    }, [quoteText])

    const post = async () => {
        const badComment = functions.validateComment(text, i18n)
        if (badComment) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = badComment
            await functions.timeout(2000)
            setError(false)
            return
        }
        setError(true)
        if (!errorRef.current) await functions.timeout(20)
        errorRef.current!.innerText = i18n.buttons.submitting
        try {
            await functions.post("/api/comment/create", {postID: props.post.postID, comment: text}, session, setSessionFlag)
            errorRef.current!.innerText = i18n.errors.comment.added
            setCommentFlag(true)
            setText("")
            await functions.timeout(2000)
            setError(false)
        } catch {
            errorRef.current!.innerText = i18n.errors.comment.bad
            await functions.timeout(2000)
            setError(false)
        }
    }

    const generateCommentsJSX = () => {
        let jsx = [] as any
        for (let i = 0; i < comments.length; i++) {
            jsx.push(<Comment key={comments[i].commentID} comment={comments[i]} onDelete={updateComments} onEdit={updateComments} onCommentJump={onCommentJump}/>)
        }
        return jsx
    }

    const keyDown = (event: any) => {
        event.stopPropagation()
    }

    const getEmojiMarginRight = () => {
        if (typeof document === "undefined") return "0px"
        const rect = emojiRef.current?.getBoundingClientRect()
        if (!rect) return "0px"
        const raw = window.innerWidth - rect.right
        let offset = -145
        if (mobile) offset -= 20
        return `${raw + offset}px`
    }

    const getEmojiMarginBottom = () => {
        if (typeof document === "undefined") return "0px"
        let elementName = ".comments-textarea"
        const bodyRect = document.querySelector(elementName)?.getBoundingClientRect()
        const rect = emojiRef.current?.getBoundingClientRect()
        if (!rect || !bodyRect) return "0px"
        const raw = bodyRect.bottom - rect.bottom
        let offset = 100
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
                    setText((prev: string) => prev + ` emoji:${key}`)
                    setShowEmojiDropdown(false)
                }
                items.push(
                    <img draggable={false} src={emojis[key]} className="emoji-big" onClick={appendText}/>
                )
            }
            if (items.length) rows.push(<div className="emoji-row">{items}</div>)
        }
        return (
            <div className={`emoji-grid ${showEmojiDropdown ? "" : "hide-emoji-grid"}`}
            style={{marginRight: getEmojiMarginRight(), marginBottom: getEmojiMarginBottom()}}>
                {rows}
            </div>
        )
    }

    const parseText = () => {
        const textarea = textRef.current
        if (!textarea) return
        const pieces = functions.parseComment(textarea.value)
        let jsx = [] as any
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i]
            if (piece.includes(">")) {
                const matchPart = piece.match(/(>>>(\[\d+\])?)(.*?)(?=$|>)/gm)?.[0] ?? ""
                const userPart = matchPart.replace(/(>>>(\[\d+\])?\s*)/, "")
                const id = matchPart.match(/(?<=\[)\d+(?=\])/)?.[0] ?? ""
                let username = ""
                let said = ""
                if (userPart) {
                    username = functions.toProperCase(userPart.split(/ +/g)[0])
                    said = userPart.split(/ +/g).slice(1).join(" ")
                }
                const text = piece.replace(matchPart.replace(">>>", ""), "").replaceAll(">", "")
                jsx.push(
                    <div className="comment-quote-container">
                        {userPart ? <span className="comment-quote-user">{`${username.trim()} ${said.trim()}`}</span> : null}
                        <span className="comment-quote-text">{jsxFunctions.renderCommentText(text.trim(), emojis)}</span>
                    </div>
                )
            } else {
                jsx.push(<span className="comment-text">{jsxFunctions.renderCommentText(piece.trim(), emojis)}</span>)
            }
        }
        return jsx
    }

    const getCommentBox = () => {
        if (session.banned) return (
            <div className="comments-input-container">
                <span className="upload-ban-text" style={{fontSize: "20px", marginLeft: mobile ? "2px" : "10px"}}>You are banned. Cannot comment.</span>
            </div>
        )
        if (session.username) {
            return (
                <div className="comments-input-container">
                    <div className="comments-textarea-buttons">
                        <button className="comments-textarea-button"><img src={highlight} onClick={() => functions.triggerTextboxButton(textRef.current, setText, "highlight")} style={{filter: getFilter()}}/></button>
                        <button className="comments-textarea-button"><img src={bold} onClick={() => functions.triggerTextboxButton(textRef.current, setText, "bold")} style={{filter: getFilter()}}/></button>
                        <button className="comments-textarea-button"><img src={italic} onClick={() => functions.triggerTextboxButton(textRef.current, setText, "italic")} style={{filter: getFilter()}}/></button>
                        <button className="comments-textarea-button"><img src={underline} onClick={() => functions.triggerTextboxButton(textRef.current, setText, "underline")} style={{filter: getFilter()}}/></button>
                        <button className="comments-textarea-button"><img src={strikethrough} onClick={() => functions.triggerTextboxButton(textRef.current, setText, "strikethrough")} style={{filter: getFilter()}}/></button>
                        <button className="comments-textarea-button"><img src={spoiler} onClick={() => functions.triggerTextboxButton(textRef.current, setText, "spoiler")} style={{filter: getFilter()}}/></button>
                    </div>
                    {previewMode ? <div className="comments-preview">{parseText()}</div> : 
                    <div style={{marginTop: "0px"}} className="comments-row-start" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                        <textarea ref={textRef} className="comments-textarea" spellCheck={false} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={keyDown}></textarea>
                    </div>}
                    {error ? <div className="comments-validation-container"><span className="comments-validation" ref={errorRef}></span></div> : null}
                    <div className="comments-button-container-left">
                    <button className="comments-button" onClick={post}>{i18n.buttons.post}</button>
                    <button className="comments-emoji-button" ref={emojiRef} onClick={() => setShowEmojiDropdown((prev: boolean) => !prev)}>
                        <img src={emojiSelect}/>
                    </button>
                    <button className={previewMode ? "comments-edit-button" : "comments-preview-button"} onClick={() => setPreviewMode((prev: boolean) => !prev)}>{previewMode ? i18n.buttons.edit : i18n.buttons.preview}</button>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="comments">
            <div className="comments-title">{i18n.navbar.comments}</div>
            {comments.length ? generateCommentsJSX() :
            <div className="comments-text">{i18n.post.noComments}</div>}
            {getCommentBox()}
            {emojiGrid()}
        </div>
    )
}

export default Comments