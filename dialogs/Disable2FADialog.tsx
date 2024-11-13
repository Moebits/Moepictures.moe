import React, {useEffect, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import {useInteractionActions, useMiscDialogSelector, useMiscDialogActions} from "../store"
import functions from "../structures/Functions"
import Draggable from "react-draggable"
import "./styles/dialog.less"

const Disable2FADialog: React.FunctionComponent = (props) => {
    const {setEnableDrag} = useInteractionActions()
    const {disable2FADialog} = useMiscDialogSelector()
    const {setDisable2FADialog, setDisable2FAFlag} = useMiscDialogActions()
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    useEffect(() => {
        document.title = "Disable 2FA"
    }, [])

    useEffect(() => {
        if (disable2FADialog) {
            document.body.style.pointerEvents = "none"
        } else {
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
        }
    }, [disable2FADialog])

    const click = (button: "accept" | "reject") => {
        if (button === "accept") {
            setDisable2FAFlag(true)
            setDisable2FADialog(false)
        }
        setDisable2FADialog(false)
    }

    if (disable2FADialog) {
        return (
            <div className="dialog">
                <Draggable handle=".dialog-title-container">
                <div className="dialog-box" style={{width: "285px", height: "190px"}} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                    <div className="dialog-container">
                        <div className="dialog-title-container">
                            <span className="dialog-title">Disable 2FA</span>
                        </div>
                        <div className="dialog-row">
                            <span className="dialog-text">Are you sure you want to disable 2FA?</span>
                        </div>
                        <div className="dialog-row">
                            <button onClick={() => click("reject")} className="dialog-button">{"No"}</button>
                            <button onClick={() => click("accept")} className="dialog-button">{"Yes"}</button>
                        </div>
                    </div>
                </div>
                </Draggable>
            </div>
        )
    }
    return null
}

export default Disable2FADialog