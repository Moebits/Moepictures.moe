import React, {useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, EnableDragContext, SessionContext, MobileContext, SessionFlagContext, SearchContext, SearchFlagContext} from "../Context"
import "./styles/taghover.less"
import functions from "../structures/Functions"

interface Props {
    active: boolean
    tag: string
    x: number
    y: number
}

let timer = null as any

const TagHover: React.FunctionComponent<Props> = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const [active, setActive] = useState(props.active)
    const [img, setImg] = useState("")
    const [description, setDescription] = useState("No description.")
    const history = useHistory()

    useEffect(() => {
        if (props.active) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                if (props.active) setActive(true)
            }, 500)
        } else {
            setActive(false)
        }
    }, [props.active])

    const updateMetadata = async () => {
        const tag = await functions.get("/api/tag", {tag: props.tag}, session, setSessionFlag)
        setDescription(tag.description)
        if (tag.image) setImg(functions.getTagLink(tag.type, tag.image))
    }

    useEffect(() => {
        updateMetadata()
    }, [])

    useEffect(() => {
        updateMetadata()
    }, [props.tag, session])

    if (active && description) return (
        <div className="taghover" style={{left: `100px`}}>
            <div className="taghover-container">
                {img ? <img className="taghover-img" src={img}/> : null}
                <span className="taghover-desc">{description}</span>
            </div>
        </div>
    )
    return null
}

export default TagHover