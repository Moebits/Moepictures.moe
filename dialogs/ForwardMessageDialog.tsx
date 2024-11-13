import React, {useEffect, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import {useInteractionActions, useMessageDialogSelector, useMessageDialogActions, useSessionSelector, 
useSessionActions, useFlagActions} from "../store"
import functions from "../structures/Functions"
import permissions from "../structures/Permissions"
import "./styles/dialog.less"
import Draggable from "react-draggable"

const ForwardMessageDialog: React.FunctionComponent = (props) => {
    const {setEnableDrag} = useInteractionActions()
    const {forwardMessageObj} = useMessageDialogSelector()
    const {setForwardMessageObj} = useMessageDialogActions()
    const {setMessageFlag} = useFlagActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const [recipients, setRecipients] = useState("")
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    useEffect(() => {
        document.title = "Forward Message"
    }, [])

    useEffect(() => {
        if (forwardMessageObj) {
            // document.body.style.overflowY = "hidden"
            document.body.style.pointerEvents = "none"
            setRecipients(forwardMessageObj.recipients.join(" "))
        } else {
            // document.body.style.overflowY = "visible"
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
            setRecipients("")
        }
    }, [forwardMessageObj])

    const forwardMessage = async () => {
        let cleanedRecipients = recipients.split(/\s+/g).map((r: any) => r.trim())
        if (cleanedRecipients.length < 1) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = "At least 1 recipient is required."
            await functions.timeout(2000)
            return setError(false)
        }
        if (cleanedRecipients.length > 5 && !permissions.isMod(session)) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = "You can't send to more than 5 recipients."
            await functions.timeout(2000)
            return setError(false)
        }
        try {
            await functions.post("/api/message/forward", {messageID: forwardMessageObj.messageID, recipients: cleanedRecipients}, session, setSessionFlag)
            setForwardMessageObj(null)
            setMessageFlag(true)
        } catch (err) {
            setError(true)
            if (!errorRef.current) await functions.timeout(20)
            errorRef.current!.innerText = "Cannot forward this message."
            await functions.timeout(2000)
            setError(false)
        }
    }

    const click = (button: "accept" | "reject") => {
        if (button === "accept") {
            forwardMessage()
        } else {
            setForwardMessageObj(null)
        }
    }

    if (forwardMessageObj) {
        return (
            <div className="dialog">
                <Draggable handle=".dialog-title-container">
                <div className="dialog-box" style={{width: "500px"}} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                    <div className="dialog-container">
                        <div className="dialog-title-container">
                            <span className="dialog-title">Forward Message</span>
                        </div>
                        <div className="dialog-row">
                            <span className="dialog-text">You may add or remove recipients.</span>
                        </div>
                        <div className="dialog-row">
                            <span className="dialog-text">Recipients: </span>
                        </div>
                        <div className="dialog-row">
                            <textarea className="dialog-textarea" style={{resize: "vertical", height: "100px"}} spellCheck={false} value={recipients} onChange={(event) => setRecipients(event.target.value)}></textarea>
                        </div>
                        {error ? <div className="dialog-validation-container"><span className="dialog-validation" ref={errorRef}></span></div> : null}
                        <div className="dialog-row">
                            <button onClick={() => click("reject")} className="dialog-button">{"Cancel"}</button>
                            <button onClick={() => click("accept")} className="dialog-button">{"Forward"}</button>
                        </div>
                    </div>
                </div>
                </Draggable>
            </div>
        )
    }
    return null
}

export default ForwardMessageDialog