import React, {ReactElement, useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {useFilterSelector, useInteractionActions, useLayoutSelector,  
useThemeSelector, useSearchSelector, useSessionSelector, useSearchActions, 
useSessionActions, useActiveActions, useFlagActions, useNoteDialogSelector, 
useNoteDialogActions, useInteractionSelector, useFlagSelector} from "../../store"
import functions from "../../structures/Functions"
import {ShapeEditor, ImageLayer, DrawLayer, wrapShape} from "react-shape-editor"
import noteDelete from "../../assets/icons/note-delete.png"
import noteEdit from "../../assets/icons/note-edit.png"
import noteView from "../../assets/icons/note-view.png"
import noteHistory from "../../assets/icons/note-history.png"
import noteSave from "../../assets/icons/note-save.png"
import noteText from "../../assets/icons/note-text.png"
import noteToggleOn from "../../assets/icons/note-toggle-on.png"
import noteToggleOff from "../../assets/icons/note-toggle-off.png"
import translationEN from "../../assets/icons/translation-en.png"
import translationJA from "../../assets/icons/translation-ja.png"
import noteClear from "../../assets/icons/note-clear.png"
import noteCopy from "../../assets/icons/note-copy.png"
import noteOCR from "../../assets/icons/note-ocr.png"
import "./styles/noteeditor.less"
import {PostFull, PostHistory, UnverifiedPost, Note, BubbleData} from "../../types/Types"

interface Props {
    post?: PostFull | PostHistory | UnverifiedPost
    img: string
    order?: number
    unverified?: boolean
    noteID?: string | null
}

let isAnimatedWebP = false

const RectHandle = ({active, cursor, onMouseDown, scale, x, y}) => {
    const {noteDrawingEnabled} = useSearchSelector()
    const {siteHue, siteSaturation, siteLightness} = useThemeSelector()
    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }
    const getBGColor = () => {
        return "rgba(89, 43, 255, 0.9)"
    }
    const getBGColorInactive = () => {
        return "rgba(89, 43, 255, 0.3)"
    }
    const size = Math.ceil(7/scale)
    return (
        <rect fill={active ? getBGColor() : getBGColorInactive()}
        width={size} height={size} x={x - size / 2} y={y - size / 2}
        stroke={active ? "rgba(53, 33, 140, 1)" : "rgba(53, 33, 140, 0.3)"} strokeWidth={1 / scale}
        style={{cursor, opacity: active && noteDrawingEnabled ? "1" : "0", filter: getFilter()}} onMouseDown={onMouseDown}/>
    )
}

const splitTextIntoLines = (text: string, maxWidth: number, fontSize = 100, splitByWord = true) => {
    if (!text) return []
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")!
    context.font = `${fontSize}px sans-serif`

    let lines = [] as string[]
    let currentLine = ""
    const segments = splitByWord ? text.split(" ") : text.split("")

    for (let i = 0; i < segments.length; i++) {
        const testLine = currentLine ? (splitByWord ? `${currentLine} ${segments[i]}` : `${currentLine}${segments[i]}`) : segments[i]
        const testWidth = context.measureText(testLine).width
        if (testWidth <= maxWidth) {
            currentLine = testLine
        } else {
            if (currentLine) {
                lines.push(currentLine)
            }
            currentLine = segments[i]
        }
    }
    if (currentLine) {
        lines.push(currentLine)
    }
    return lines
}

const RectShape = wrapShape(({width, height, extraShapeProps, scale}) => {
    const {onMouseEnter, onMouseMove, onMouseLeave, onDoubleClick, onMouseDown, onContextMenu,
    text, showTranscript, breakWord, overlay, fontSize, backgroundColor, textColor, backgroundAlpha,
    fontFamily, bold, italic, strokeColor, strokeWidth} = extraShapeProps
    const {siteHue, siteSaturation, siteLightness} = useThemeSelector()
    const getFilter = () => {
        if (overlay) return ""
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }
    const getBGColor = () => {
        if (overlay) return backgroundColor || "#ffffff"
        return "rgba(89, 43, 255, 0.1)"
    }
    const getStrokeColor = () => {
        if (overlay) return backgroundColor || "#ffffff"
        return "rgba(89, 43, 255, 0.9)"
    }
    const getTextColor = () => {
        return textColor || "#000000"
    }
    const rectStrokeWidth = Math.ceil(1/scale)
    const rectStrokeArray = `${Math.ceil(4/scale)},${Math.ceil(4/scale)}` 

    const maxTextWidth = width - ((fontSize || 100) / 5)
    let lines = [] as string[]
    if (overlay) {
        lines = splitTextIntoLines(text, maxTextWidth, fontSize || 100, breakWord && !showTranscript)
    }
    const lineHeight = (fontSize || 100) + ((fontSize || 100) / 5)
    const totalTextHeight = lines.length * lineHeight
    const textStartY = height / 2 - totalTextHeight / 2 + lineHeight / 2

    return (
        <svg width={width} height={height} onMouseEnter={onMouseEnter} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} 
        onContextMenu={onContextMenu} onDoubleClick={onDoubleClick} onMouseDown={onMouseDown}>
            <rect width={width} height={height} fill={getBGColor()} opacity={(backgroundAlpha ?? 100) / 100} stroke={getStrokeColor()} strokeWidth={rectStrokeWidth} 
            strokeDasharray={rectStrokeArray} style={{filter: getFilter()}}/>
            {lines.map((line, index) => (
                <text key={index} x="50%" y={textStartY + index * lineHeight} textAnchor="middle" fill={getTextColor()} fontSize={fontSize || 100}
                fontFamily={fontFamily || "Tahoma"} fontWeight={bold ? "bold" : "normal"} fontStyle={italic ? "italic" : "normal"}
                stroke={strokeColor || "#ffffff"} strokeWidth={strokeWidth ?? 0} paintOrder="stroke">
                    {line}
                </text>
            ))}
        </svg>
    )
})

const NoteEditor: React.FunctionComponent<Props> = (props) => {
    const {theme, siteHue, siteSaturation, siteLightness} = useThemeSelector()
    const {enableDrag} = useInteractionSelector()
    const {setEnableDrag} = useInteractionActions()
    const {mobile} = useLayoutSelector()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {setSidebarText, setActionBanner} = useActiveActions()
    const {brightness, contrast, hue, saturation, lightness, blur, sharpen, pixelate} = useFilterSelector()
    const {noteMode, noteDrawingEnabled, imageExpand} = useSearchSelector()
    const {setNoteMode, setNoteDrawingEnabled} = useSearchActions()
    const {pasteNoteFlag} = useFlagSelector()
    const {setRedirect, setPasteNoteFlag} = useFlagActions()
    const {editNoteFlag, editNoteID, editNoteText, editNoteTranscript, showSaveNoteDialog, noteOCRDialog, noteOCRFlag,
    editNoteOverlay, editNoteFontSize, editNoteBackgroundColor, editNoteTextColor, editNoteBackgroundAlpha, editNoteFontFamily,
    editNoteBold, editNoteItalic, editNoteStrokeColor, editNoteStrokeWidth, editNoteBreakWord} = useNoteDialogSelector()
    const {setEditNoteFlag, setEditNoteID, setEditNoteText, setEditNoteTranscript, setShowSaveNoteDialog,
    setSaveNoteData, setSaveNoteOrder, setNoteOCRDialog, setNoteOCRFlag, setEditNoteOverlay, setEditNoteFontSize,
    setEditNoteBackgroundColor, setEditNoteTextColor, setEditNoteBackgroundAlpha, setEditNoteFontFamily, setEditNoteBold,
    setEditNoteItalic, setEditNoteStrokeColor, setEditNoteStrokeWidth, setEditNoteBreakWord} = useNoteDialogActions()
    const [targetWidth, setTargetWidth] = useState(0)
    const [targetHeight, setTargetHeight] = useState(0)
    const [targetHash, setTargetHash] = useState("")
    const [img, setImg] = useState("")
    const [id, setID] = useState(0)
    const [items, setItems] = useState([] as Note[])
    const [activeIndex, setActiveIndex] = useState(-1)
    const [buttonHover, setButtonHover] = useState(false)
    const filtersRef = useRef<HTMLDivElement>(null)
    const lightnessRef = useRef<HTMLImageElement>(null)
    const overlayRef = useRef<HTMLImageElement>(null)
    const pixelateRef = useRef<HTMLCanvasElement>(null)
    const [bubbleToggle, setBubbleToggle] = useState(false)
    const [bubbleData, setBubbleData] = useState({} as BubbleData)
    const [shiftKey, setShiftKey] = useState(false)
    const [showTranscript, setShowTranscript] = useState(false)
    const [bubbleWidth, setBubbleWidth] = useState(bubbleData.width)
    const bubbleRef = useRef<HTMLDivElement>(null)
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const updateNotes = async () => {
        if (!props.post) return
        let notes = [] as Note[]
        if (props.unverified) {
            notes = await functions.get("/api/notes/unverified", {postID: props.post.postID}, session, setSessionFlag)
        } else if (props.noteID) {
            const history = await functions.get("/api/note/history", {postID: props.post.postID, historyID: props.noteID}, session, setSessionFlag)
            notes = history.flatMap((h) => h.notes)
        } else {
            notes = await functions.get("/api/notes", {postID: props.post.postID}, session, setSessionFlag)
        }
        notes = notes?.filter((n) => n.order === undefined || n.order === (props.order || 1))
        if (notes?.length) {
            let largestID = notes.reduce((prev, current) => {return Math.max(prev, current.id || 1)}, -Infinity)
            setItems(notes)
            setID(largestID)
            setNoteMode(true)
        } else {
            setItems([])
            setID(0)
        }
    }

    useEffect(() => {
        updateNotes()
    }, [props.img, props.order, props.noteID, session])

    useEffect(() => {
        const keyDownListener = (event: KeyboardEvent) => {
            if (event.shiftKey) setShiftKey(true)
        }
        const keyUpListener = (event: KeyboardEvent) => {
            if (!event.shiftKey) setShiftKey(false)
        }
        const savedShowTranscript = localStorage.getItem("showTranscript")
        if (savedShowTranscript) setShowTranscript(savedShowTranscript === "true")
        const savedNoteDrawing = localStorage.getItem("noteDrawingEnabled")
        if (savedNoteDrawing) setNoteDrawingEnabled(savedNoteDrawing === "true")
        window.addEventListener("keydown", keyDownListener)
        window.addEventListener("keyup", keyUpListener)
        return () => {
            window.removeEventListener("keydown", keyDownListener)
            window.removeEventListener("keyup", keyUpListener)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("showTranscript", String(showTranscript))
        localStorage.setItem("noteDrawingEnabled", String(noteDrawingEnabled))
    }, [showTranscript, noteDrawingEnabled])

    useEffect(() => {
        const decryptImg = async () => {
            if (!props.post) return
            let url = await functions.decryptThumb(props.img, session, props.img, true)
            isAnimatedWebP = false
            if (functions.isWebP(props.img)) {
                const arraybuffer = await fetch(props.img).then((r) => r.arrayBuffer())
                isAnimatedWebP = functions.isAnimatedWebp(arraybuffer)
            }
            const base64 = await functions.linkToBase64(url)
            const img = await functions.createImage(base64)
            if (functions.isGIF(props.img) || isAnimatedWebP) {
                setImg(props.img)
                setTargetWidth(img.width)
                setTargetHeight(img.height)
            } else {
                setImg(base64)
                setTargetWidth(img.width)
                setTargetHeight(img.height)
            }
            const currentImg = props.post.images[(props.order || 1) - 1]
            if (typeof currentImg === "string") {
                const imgLink = functions.getRawThumbnailLink(currentImg, "massive")
                const decrypted = await functions.decryptThumb(imgLink, session)
                const arrayBuffer = await fetch(decrypted).then((r) => r.arrayBuffer())
                const hash = await functions.post("/api/misc/imghash", Object.values(new Uint8Array(arrayBuffer)), session, setSessionFlag)
                setTargetHash(hash)
            } else {
                setTargetHash(currentImg.hash)
            }
        }
        decryptImg()
    }, [props.img, session])

    useEffect(() => {
        if (!filtersRef.current) return
        const element = filtersRef.current
        let newContrast = contrast
        const image = img
        const sharpenOverlay = overlayRef.current
        const lightnessOverlay = lightnessRef.current
        if (!image || !sharpenOverlay || !lightnessOverlay) return
        if (sharpen !== 0) {
            const sharpenOpacity = sharpen / 5
            newContrast += 25 * sharpenOpacity
            sharpenOverlay.style.backgroundImage = `url(${image})`
            sharpenOverlay.style.filter = `blur(4px) invert(1) contrast(75%)`
            sharpenOverlay.style.mixBlendMode = "overlay"
            sharpenOverlay.style.opacity = `${sharpenOpacity}`
        } else {
            sharpenOverlay.style.backgroundImage = "none"
            sharpenOverlay.style.filter = "none"
            sharpenOverlay.style.mixBlendMode = "normal"
            sharpenOverlay.style.opacity = "0"
        }
        if (lightness !== 100) {
            const filter = lightness < 100 ? "brightness(0)" : "brightness(0) invert(1)"
            lightnessOverlay.style.filter = filter
            lightnessOverlay.style.opacity = `${Math.abs((lightness - 100) / 100)}`
        } else {
            lightnessOverlay.style.filter = "none"
            lightnessOverlay.style.opacity = "0"
        }
        element.style.filter = `brightness(${brightness}%) contrast(${newContrast}%) hue-rotate(${hue - 180}deg) saturate(${saturation}%) blur(${blur}px)`
    }, [brightness, contrast, hue, saturation, lightness, blur, sharpen])

    let maxWidth = 1000
    let maxHeight = 1000

    if (typeof window !== "undefined") {
        maxWidth = mobile ? window.innerWidth - 20 : window.innerWidth - functions.sidebarWidth() - 70
    }

    if (imageExpand) {
        maxHeight = 4572 //1797
    }

    let scale = targetWidth > targetHeight ? maxWidth / targetWidth : maxHeight / targetHeight
    if (mobile && targetWidth > maxWidth) scale =  maxWidth / targetWidth
    if (targetWidth*scale > maxWidth) scale = maxWidth / targetWidth

    const imagePixelate = () => {
        if (!pixelateRef.current || !overlayRef.current) return
        const pixelateCanvas = pixelateRef.current
        const ctx = pixelateCanvas.getContext("2d")!
        const width = Math.floor(targetWidth*scale)
        const height = Math.floor(targetHeight*scale)
        const landscape = width >= height
        ctx.clearRect(0, 0, pixelateCanvas.width, pixelateCanvas.height)
        pixelateCanvas.width = width
        pixelateCanvas.height = height
        const pixelWidth = width / pixelate 
        const pixelHeight = height / pixelate
        if (pixelate !== 1) {
            ctx.drawImage(overlayRef.current, 0, 0, pixelWidth, pixelHeight)
            if (landscape) {
                pixelateCanvas.style.width = `${width * pixelate}px`
                pixelateCanvas.style.height = "auto"
            } else {
                pixelateCanvas.style.width = "auto"
                pixelateCanvas.style.height = `${height * pixelate}px`
            }
            pixelateCanvas.style.opacity = "1"
        } else {
            pixelateCanvas.style.width = "none"
            pixelateCanvas.style.height = "none"
            pixelateCanvas.style.opacity = "0"
        }
    }

    useEffect(() => {
        setTimeout(() => {
            imagePixelate()
        }, 50)
    }, [img, pixelate])

    const clearNotes = () => {
        if (!noteDrawingEnabled) return
        setItems([])
    }

    const copyNotes = () => {
        navigator.clipboard.writeText(JSON.stringify(items))
        setActionBanner("copy-notes")
    }

    useEffect(() => {
        if (pasteNoteFlag?.length) {
            setItems(pasteNoteFlag)
            setPasteNoteFlag(null)
        }
    }, [pasteNoteFlag])

    const deleteFocused = () => {
        if (!noteDrawingEnabled) return
        setItems((prev) => functions.insertAtIndex(prev, activeIndex, null).filter(Boolean))
    }

    const editTextDialog = () => {
        if (!noteDrawingEnabled) return
        if (editNoteID === null) {
            const item = items[activeIndex]
            setEditNoteTranscript(item.transcript)
            setEditNoteText(item.translation)
            setEditNoteOverlay(item.overlay ?? editNoteOverlay)
            setEditNoteFontSize(item.fontSize ?? editNoteFontSize)
            setEditNoteBackgroundColor(item.backgroundColor ?? editNoteBackgroundColor)
            setEditNoteTextColor(item.textColor ?? editNoteTextColor)
            setEditNoteBackgroundAlpha(item.backgroundAlpha ?? editNoteBackgroundAlpha)
            setEditNoteFontFamily(item.fontFamily ?? editNoteFontFamily)
            setEditNoteBold(item.bold ?? editNoteBold)
            setEditNoteItalic(item.italic ?? editNoteItalic)
            setEditNoteStrokeColor(item.strokeColor ?? editNoteStrokeColor)
            setEditNoteStrokeWidth(item.strokeWidth ?? editNoteStrokeWidth)
            setEditNoteBreakWord(item.breakWord ?? editNoteBreakWord)
            setEditNoteID(activeIndex)
        } else {
            setEditNoteID(null)
        }
    }

    const editText = (index: number, transcript: string, translation: string, overlay=false, fontSize=100,
        backgroundColor="#ffffff", textColor="#000000", backgroundAlpha=100, fontFamily="Tahoma", bold=false,
        italic=false, strokeColor="#ffffff", strokeWidth=0, breakWord=true) => {
        setItems((prev) => {
            const item = prev[index]
            item.transcript = transcript
            item.translation = translation
            item.imageWidth = targetWidth
            item.imageHeight = targetHeight
            item.imageHash = targetHash
            item.overlay = overlay
            item.fontSize = fontSize
            item.backgroundColor = backgroundColor
            item.textColor = textColor
            item.backgroundAlpha = backgroundAlpha
            item.fontFamily = fontFamily
            item.bold = bold
            item.italic = italic
            item.strokeColor = strokeColor
            item.strokeWidth = strokeWidth
            item.breakWord = breakWord
            return prev
        })
    }

    useEffect(() => {
        if (editNoteID === null) return
        if (editNoteFlag) {
            editText(editNoteID, editNoteTranscript, editNoteText, editNoteOverlay, editNoteFontSize,
            editNoteBackgroundColor, editNoteTextColor, editNoteBackgroundAlpha, editNoteFontFamily,
            editNoteBold, editNoteItalic, editNoteStrokeColor, editNoteStrokeWidth, editNoteBreakWord)
            setEditNoteFlag(false)
            setEditNoteID(null)
        }
    }, [editNoteFlag])

    const saveTextDialog = () => {
        if (!props.post) return
        if (!session.username) {
            setRedirect(`/post/${props.post.postID}/${props.post.slug}`)
            history.push("/login")
            return setSidebarText("Login required.")
        }
        setSaveNoteOrder(props.order || 1)
        setSaveNoteData(items)
        setShowSaveNoteDialog(!showSaveNoteDialog)
    }

    const ocrPage = async () => {
        const jpgURL = await functions.convertToFormat(img, "jpg")
        const arrayBuffer = await fetch(jpgURL).then((r) => r.arrayBuffer())
        const bytes = new Uint8Array(arrayBuffer)
        let result = await functions.post(`/api/misc/ocr`, Object.values(bytes), session, setSessionFlag).catch(() => null)
        if (result?.length) setItems(result.map((item) => ({...item, imageHash: targetHash} as Note)))
    }

    useEffect(() => {
        if (noteOCRFlag) {
            ocrPage().then(() => {
                setNoteOCRFlag(false)
                setNoteOCRDialog(false)
            })
        }
    }, [noteOCRFlag])

    const ocrDialog = () => {
        setNoteOCRDialog(!noteOCRDialog)
    }

    const getBubbleText = () => {
        if (shiftKey) return showTranscript ? bubbleData.translation : bubbleData.transcript
        return showTranscript ? bubbleData.transcript : bubbleData.translation
    }

    const showHistory = () => {
        if (!props.post) return
        history.push(`/note/history/${props.post.postID}/${props.order || 1}`)
    }

    useEffect(() => {
        if (!bubbleToggle || !bubbleRef.current) return

        const bubble = bubbleRef.current

        const updateWidth = () => {
            const currentWidth = bubble.offsetWidth
            const requiredWidth = bubble.scrollWidth

            if (requiredWidth > currentWidth && requiredWidth !== bubbleWidth) {
                setBubbleWidth(requiredWidth)
            } else if (requiredWidth <= bubbleData.width && bubbleWidth !== bubbleData.width) {
                setBubbleWidth(bubbleData.width)
            }
        }

        const observer = new ResizeObserver(updateWidth)
        observer.observe(bubble)
        updateWidth()
        return () => observer.disconnect()
    }, [bubbleToggle, bubbleData.width, bubbleWidth])

    return (
        <div className="note-editor" style={{display: noteMode ? "flex" : "none"}}>
            <div className="note-editor-filters" ref={filtersRef} onMouseOver={() => {if (enableDrag) setEnableDrag(false)}}>
                <div className={`note-editor-buttons ${buttonHover ? "show-note-buttons" : ""}`} onMouseEnter={() => setButtonHover(true)} onMouseLeave={() => setButtonHover(false)}>
                    {!props.unverified ? <img draggable={false} className="note-editor-button" src={noteHistory} style={{filter: getFilter()}} onClick={() => showHistory()}/> : null}
                    {session.username ? <img draggable={false} className="note-editor-button" src={noteOCR} style={{filter: getFilter()}} onClick={() => ocrDialog()}/> : null}
                    <img draggable={false} className="note-editor-button" src={noteClear} style={{filter: getFilter()}} onClick={() => clearNotes()}/>
                    <img draggable={false} className="note-editor-button" src={noteCopy} style={{filter: getFilter()}} onClick={() => copyNotes()}/>
                    <img draggable={false} className="note-editor-button" src={noteSave} style={{filter: getFilter()}} onClick={() => saveTextDialog()}/>
                    <img draggable={false} className="note-editor-button" src={showTranscript ? translationJA : translationEN} style={{filter: getFilter()}} onClick={() => setShowTranscript((prev: boolean) => !prev)}/>
                    <img draggable={false} className="note-editor-button" src={noteText} style={{filter: getFilter()}} onClick={() => editTextDialog()}/>
                    <img draggable={false} className="note-editor-button" src={noteDelete} style={{filter: getFilter()}} onClick={() => deleteFocused()}/>
                    <img draggable={false} className="note-editor-button" src={noteDrawingEnabled ? noteEdit : noteView} style={{filter: getFilter()}} onClick={() => setNoteDrawingEnabled(!noteDrawingEnabled)}/>
                    <img draggable={false} className="note-editor-button" src={noteToggleOff} style={{filter: getFilter()}} onClick={() => setNoteMode(false)}/>
                </div>
                {bubbleToggle ? 
                <div className="note-bubble" ref={bubbleRef} style={{width: `${bubbleWidth}px`, minHeight: "25px", left: `${bubbleData.x}px`, 
                    top: `${bubbleData.y}px`, fontFamily: bubbleData.fontFamily || "Tahoma", fontSize: `${(bubbleData.fontSize || 100) / 5}px`,
                    fontWeight: bubbleData.bold ? "bold" : "normal", fontStyle: bubbleData.italic ? "italic" : "normal"}}>
                    {getBubbleText()}
                </div> : null}
                <img draggable={false} className="post-lightness-overlay" ref={lightnessRef} src={img} style={{pointerEvents: "none", width: `${Math.floor(targetWidth*scale)}px`, height: `${Math.floor(targetHeight*scale)}px`}}/>
                <img draggable={false} className="post-sharpen-overlay" ref={overlayRef} src={img} style={{pointerEvents: "none", width: `${Math.floor(targetWidth*scale)}px`, height: `${Math.floor(targetHeight*scale)}px`}}/>
                <canvas draggable={false} className="post-pixelate-canvas" ref={pixelateRef} style={{pointerEvents: "none", width: `${Math.floor(targetWidth*scale)}px`, height: `${Math.floor(targetHeight*scale)}px`}}></canvas>
                <ShapeEditor vectorWidth={targetWidth} vectorHeight={targetHeight} scale={scale}>
                    <ImageLayer src={img}/>
                    <DrawLayer onAddShape={({x, y, width, height}) => {
                        if (!noteDrawingEnabled) return
                        setItems((prev) => {
                            setID(id + 1)
                            return [...prev, {id: id + 1, x, y, width, height, imageWidth: targetWidth, 
                            imageHeight: targetHeight, imageHash: targetHash, transcript: "", translation: ""} as Note]
                        })
                    }} DrawPreviewComponent={RectShape}/>
                    {items.map((item: Note, index: number) => {
                        let {id, height, width, x, y, imageWidth, imageHeight, fontSize, strokeWidth} = item
                        if (!imageWidth) imageWidth = targetWidth
                        if (!imageHeight) imageHeight = targetHeight

                        const newWidth = (width / imageWidth) * targetWidth
                        const newHeight = (height / imageHeight ) * targetHeight
                        const newX = (x / imageWidth) * targetWidth
                        const newY = (y / imageHeight ) * targetHeight
                        const newFontSize = (fontSize / imageHeight) * targetHeight
                        const newStrokeWidth = (strokeWidth / imageHeight) * targetHeight

                        const insertItem = (newRect: BubbleData) => {
                            if (!noteDrawingEnabled) return
                            setItems((prev) => functions.insertAtIndex(prev, index, {...item, ...newRect}))
                        }

                        const deleteItem = () => {
                            if (!noteDrawingEnabled) return
                            setItems((prev) => functions.insertAtIndex(prev, index, null).filter(Boolean))
                        }

                        const onContextMenu = (event: React.MouseEvent) => {
                            event.preventDefault()
                            if (!noteDrawingEnabled) {
                                navigator.clipboard.writeText(item.transcript)
                            } else {
                                deleteItem()
                            }
                        }

                        const onDoubleClick = () => {
                            if (!noteDrawingEnabled) return
                            setEditNoteTranscript(item.transcript)
                            setEditNoteText(item.translation)
                            setEditNoteOverlay(item.overlay ?? editNoteOverlay)
                            setEditNoteFontSize(item.fontSize ?? editNoteFontSize)
                            setEditNoteBackgroundColor(item.backgroundColor ?? editNoteBackgroundColor)
                            setEditNoteTextColor(item.textColor ?? editNoteTextColor)
                            setEditNoteBackgroundAlpha(item.backgroundAlpha ?? editNoteBackgroundAlpha)
                            setEditNoteFontFamily(item.fontFamily ?? editNoteFontFamily)
                            setEditNoteBold(item.bold ?? editNoteBold)
                            setEditNoteItalic(item.italic ?? editNoteItalic)
                            setEditNoteStrokeColor(item.strokeColor ?? editNoteStrokeColor)
                            setEditNoteStrokeWidth(item.strokeWidth ?? editNoteStrokeWidth)
                            setEditNoteBreakWord(item.breakWord ?? editNoteBreakWord)
                            setEditNoteID(index)
                        }

                        const onMouseEnter = (event: React.MouseEvent<SVGRectElement>) => {
                            if (item.overlay) return
                            if (!item.transcript && !item.translation) return setBubbleToggle(false)
                            const bounds = (event.target as SVGRectElement).getBoundingClientRect()
                            let width = Math.floor(bounds.width * 2)
                            if (width > bounds.width) width = bounds.width
                            if (width < 125) width = 125
                            let height = Math.floor(bounds.height / 2)
                            if (height < 25) height = 25
                            setBubbleData({x: bounds.left, y: bounds.bottom+5, width, height, transcript: item.transcript, translation: item.translation,
                            fontFamily: item.fontFamily, fontSize: item.fontSize, bold: item.bold, italic: item.italic})
                            setBubbleWidth(width)
                            setBubbleToggle(true)
                        }

                        const onMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
                            if (item.overlay) return
                            if (!item.transcript && !item.translation) return setBubbleToggle(false)
                            const bounds = (event.target as SVGRectElement).getBoundingClientRect()
                            let width = Math.floor(bounds.width * 2)
                            if (width > bounds.width) width = bounds.width
                            if (width < 125) width = 125
                            let height = Math.floor(bounds.height / 2)
                            if (height < 25) height = 25
                            setBubbleData({x: bounds.left, y: bounds.bottom+5, width, height, transcript: item.transcript, translation: item.translation,
                            fontFamily: item.fontFamily, fontSize: item.fontSize, bold: item.bold, italic: item.italic})
                            setBubbleWidth(width)
                        }

                        const onMouseLeave = () => {
                            setBubbleToggle(false)
                        }

                        const onMouseDown = (event: React.MouseEvent) => {
                            if (!noteDrawingEnabled) {
                                event.stopPropagation()
                                if (event.shiftKey) {
                                    navigator.clipboard.writeText(item.transcript)
                                } else {
                                    navigator.clipboard.writeText(item.translation)
                                }
                            }
                        }

                        const text = showTranscript ? item.transcript : item.translation

                        return (
                            <RectShape key={id} shapeId={String(id)} x={newX} y={newY} width={newWidth} height={newHeight} onFocus={() => setActiveIndex(index)}
                            keyboardTransformMultiplier={30} onChange={insertItem as any} onDelete={deleteItem} ResizeHandleComponent={RectHandle}
                            extraShapeProps={{onContextMenu, onDoubleClick, onMouseEnter, onMouseMove, onMouseLeave, onMouseDown, text, showTranscript, 
                            overlay: item.overlay, fontSize: newFontSize, backgroundColor: item.backgroundColor, textColor: item.textColor,
                            backgroundAlpha: item.backgroundAlpha, fontFamily: item.fontFamily, bold: item.bold, italic: item.italic, 
                            strokeColor: item.strokeColor, strokeWidth: newStrokeWidth, breakWord: item.breakWord}}/>
                        )
                    })}
                </ShapeEditor>
            </div>
        </div>
    )
}

export default NoteEditor