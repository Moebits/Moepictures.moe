import React, {useEffect, useContext, useState, useReducer, useRef} from "react"
import {useHistory} from "react-router-dom"
import {HashLink as Link} from "react-router-hash-link"
import uploadPfpIcon from "../assets/purple/uploadpfp.png"
import uploadPfpMagenta from "../assets/magenta/uploadpfp.png"
import uploadPfpPurpleLight from "../assets/purple-light/uploadpfp.png"
import uploadPfpMagentaLight from "../assets/magenta-light/uploadpfp.png"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import DragAndDrop from "../components/DragAndDrop"
import {HideNavbarContext, HideSidebarContext, ThemeContext, EnableDragContext, RelativeContext, HideTitlebarContext, MobileContext,
HeaderTextContext, SidebarTextContext, SessionContext, RedirectContext, SessionFlagContext, UserImgContext} from "../Context"
import fileType from "magic-bytes.js"
import functions from "../structures/Functions"
import Carousel from "../components/Carousel"
import "./styles/userprofilepage.less"
import axios from "axios"

const UserProfilePage: React.FunctionComponent = (props) => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const {theme, setTheme} = useContext(ThemeContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {relative, setRelative} = useContext(RelativeContext)
    const {headerText, setHeaderText} = useContext(HeaderTextContext)
    const {sidebarText, setSidebarText} = useContext(SidebarTextContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const {redirect, setRedirect} = useContext(RedirectContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {userImg, setUserImg} = useContext(UserImgContext)
    const bioRef = useRef<any>(null)
    const [showBioInput, setShowBioInput] = useState(false)
    const [uploadIndex, setUploadIndex] = useState(0)
    const [favoriteIndex, setFavoriteIndex] = useState(0) as any
    const [uploads, setUploads] = useState([]) as any
    const [favorites, setFavorites] = useState([]) as any
    const [uploadImages, setUploadImages] = useState([]) as any
    const [favoriteImages, setFavoriteImages] = useState([]) as any
    const [bio, setBio] = useState("")
    const history = useHistory()

    const updateUploads = async () => {
        const uploads = await axios.get("/api/uploads", {withCredentials: true}).then((r) => r.data)
        const images = uploads.map((p: any) => functions.getImageLink(p.images[0].type, p.postID, p.images[0].filename))
        setUploads(uploads)
        setUploadImages(images)
    }

    const updateFavorites = async () => {
        const favorites = await axios.get("/api/favorites", {withCredentials: true}).then((r) => r.data)
        const images = favorites.map((f: any) => functions.getImageLink(f.post.images[0].type, f.postID, f.post.images[0].filename))
        setFavorites(favorites)
        setFavoriteImages(images)
    }

    useEffect(() => {
        setHideNavbar(false)
        setHideTitlebar(false)
        setHideSidebar(false)
        setRelative(false)
        setHeaderText("")
        setSidebarText("")
        document.title = "Moebooru: User Profile"
        updateUploads()
        updateFavorites()
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    useEffect(() => {
        if (!session.cookie) return
        if (!session.username) {
            setRedirect("/profile")
            history.push("/login")
            setSidebarText("Login required.")
        } else {
            setBio(session.bio)
        }
    }, [session])

    const getUploadPfp = () => {
        if (theme === "purple") return uploadPfpIcon
        if (theme === "purple-light") return uploadPfpPurpleLight
        if (theme === "magenta") return uploadPfpMagenta
        if (theme === "magenta-light") return uploadPfpMagentaLight
        return uploadPfpIcon
    }

    const uploadPfp = async (event: any) => {
        const file = event.target.files?.[0]
        if (!file) return
        const fileReader = new FileReader()
        await new Promise<void>((resolve) => {
            fileReader.onloadend = async (f: any) => {
                const bytes = new Uint8Array(f.target.result)
                const result = fileType(bytes)?.[0]
                const jpg = result?.mime === "image/jpeg"
                const png = result?.mime === "image/png"
                const gif = result?.mime === "image/gif"
                const webp = result?.mime === "image/webp"
                if (jpg || png || gif || webp) {
                    const MB = file.size / (1024*1024)
                    const maxSize = jpg ? 5 :
                                    png ? 10 :
                                    webp ? 10 :
                                    gif ? 25 : 25
                    if (MB <= maxSize) {
                        const url = URL.createObjectURL(file)
                        let croppedURL = ""
                        if (gif) {
                            const gifData = await functions.extractGIFFrames(url)
                            let frameArray = [] as any 
                            let delayArray = [] as any
                            for (let i = 0; i < gifData.length; i++) {
                                const canvas = gifData[i].frame as HTMLCanvasElement
                                const cropped = await functions.crop(canvas.toDataURL(), 1, true)
                                frameArray.push(cropped)
                                delayArray.push(gifData[i].delay)
                            }
                            const firstURL = await functions.crop(gifData[0].frame.toDataURL(), 1)
                            const {width, height} = await functions.imageDimensions(firstURL)
                            const buffer = await functions.encodeGIF(frameArray, delayArray, width, height)
                            const blob = new Blob([buffer])
                            croppedURL = URL.createObjectURL(blob)
                        } else {
                            croppedURL = await functions.crop(url, 1)
                        }
                        const arrayBuffer = await fetch(croppedURL).then((r) => r.arrayBuffer())
                        const bytes = Object.values(new Uint8Array(arrayBuffer))
                        await axios.post("/api/updatepfp", bytes, {withCredentials: true})
                        setUserImg("")
                        setSessionFlag(true)
                    }
                }
            }
            fileReader.readAsArrayBuffer(file)
        })
        event.target.value = ""
    }

    const favoritesPrivacy = async () => {
        await axios.post("/api/favoritesprivacy", null, {withCredentials: true})
        setSessionFlag(true)
    }

    const changeBio = async () => {
        await axios.post("/api/changebio", {bio}, {withCredentials: true})
        setSessionFlag(true)
        setShowBioInput(false)
    }

    const setUp = (img: string, index: number) => {
        setUploadIndex(index)
        const postID = uploads[index].postID
        history.push(`/post/${postID}`)
    }

    const setFav = (img: string, index: number) => {
        setFavoriteIndex(index)
        const postID = favorites[index].postID
        history.push(`/post/${postID}`)
    }

    return (
        <>
        <DragAndDrop/>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content">
                <div className="userprofile">
                    <div className="userprofile-top-container">
                        <img className="userprofile-img" src={userImg}/>
                        <span className="userprofile-name">{functions.toProperCase(session.username || "")}</span>
                        <label htmlFor="upload-pfp" className="uploadpfp-label">
                            <img className="userprofile-uploadimg" src={getUploadPfp()}/>
                        </label>
                        <input id="upload-pfp" type="file" onChange={(event) => uploadPfp(event)}/>
                    </div>
                    <div className="userprofile-row">
                        <span className="userprofile-text">Email: {session.email}</span>
                    </div>
                    <div className="userprofile-row">
                        <span className="userprofile-text">Join Date: {functions.formatDate(new Date(session.joinDate))}</span>
                    </div>
                    <div className="userprofile-row">
                        <span className="userprofile-text">Bio: {session.bio || "This user has not written anything."}</span>
                    </div>
                    <div className="userprofile-row">
                        <span className="userprofile-link" onClick={() => setShowBioInput((prev) => !prev)}>Update Bio</span>
                    </div>
                    {showBioInput ?
                    <div className="userprofile-column">
                        <textarea ref={bioRef} className="userprofile-textarea" spellCheck={false} value={bio} onChange={(event) => setBio(event.target.value)}
                        onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}></textarea>
                        <button className="userprofile-button" onClick={changeBio}>Ok</button>
                    </div> : null}
                    <div className="userprofile-row">
                        <span className="userprofile-text">Favorites Privacy: <span className="userprofile-text-action" onClick={favoritesPrivacy}>{session.publicFavorites ? "Public" : "Private"}</span></span>
                    </div>
                    <Link to="/change-username" className="userprofile-row">
                        <span className="userprofile-link">Change Username</span>
                    </Link>
                    <Link to="/change-email" className="userprofile-row">
                        <span className="userprofile-link">Change Email</span>
                    </Link>
                    <Link to="/change-password" className="userprofile-row">
                        <span className="userprofile-link">Change Password</span>
                    </Link>
                    <Link to="/enable-2fa" className="userprofile-row">
                        <span className="userprofile-link">{session.$2fa ? "Disable" : "Enable"} 2-Factor Authentication</span>
                    </Link>
                    {uploads.length ?
                    <div className="userprofile-column">
                        <span className="userprofile-text">Uploads <span className="userprofile-text-alt">{uploads.length}</span></span>
                        <Carousel images={uploadImages} noKey={true} set={setUp} index={uploadIndex}/>
                    </div> : null}
                    {favorites.length ?
                    <div className="userprofile-column">
                        <span className="userprofile-text">Favorites <span className="userprofile-text-alt">{favorites.length}</span></span>
                        <Carousel images={favoriteImages} noKey={true} set={setFav} index={favoriteIndex}/>
                    </div> : null}
                    <div className="userprofile-row">
                        <span className="userprofile-link">Delete Account</span>
                    </div>
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default UserProfilePage