import React, {useEffect, useState} from "react"
import {useThemeSelector, useInteractionActions, useSessionSelector, useSessionActions,
useLayoutActions, useActiveActions, useFlagActions, useLayoutSelector, useSearchSelector, 
useFlagSelector, useCacheActions, useGroupDialogActions, useSearchActions} from "../store"
import {useHistory, useLocation} from "react-router-dom"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import EditFavgroupDialog from "../dialogs/EditFavgroupDialog"
import DeleteFavgroupDialog from "../dialogs/DeleteFavgroupDialog"
import functions from "../structures/Functions"
import cryptoFunctions from "../structures/CryptoFunctions"
import permissions from "../structures/Permissions"
import groupReorder from "../assets/icons/group-reorder.png"
import groupReorderActive from "../assets/icons/group-reorder-active.png"
import groupHistory from "../assets/icons/tag-history.png"
import groupEdit from "../assets/icons/tag-edit.png"
import groupDelete from "../assets/icons/tag-delete.png"
import groupCancel from "../assets/icons/group-cancel.png"
import groupAccept from "../assets/icons/group-accept.png"
import lockIcon from "../assets/icons/private-lock.png"
import Reorder from "react-reorder"
import "./styles/grouppage.less"

interface Props {
    match?: any
}

let limit = 25

const FavgroupPage: React.FunctionComponent<Props> = (props) => {
    const {theme, siteHue, siteLightness, siteSaturation} = useThemeSelector()
    const {setHideNavbar, setHideTitlebar, setHideSidebar, setRelative} = useLayoutActions()
    const {setEnableDrag} = useInteractionActions()
    const {setHeaderText, setSidebarText, setActiveFavgroup, setActiveDropdown} = useActiveActions()
    const {groupFlag} = useFlagSelector()
    const {setGroupFlag} = useFlagActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {mobile} = useLayoutSelector()
    const {setEditFavGroupObj, setDeleteFavGroupObj} = useGroupDialogActions()
    const {restrictType} = useSearchSelector()
    const {setSearch, setSearchFlag} = useSearchActions()
    const [reorderState, setReorderState] = useState(false)
    const {setPosts} = useCacheActions()
    const [favgroup, setFavgroup] = useState(null) as any
    const [items, setItems] = useState([]) as any
    const history = useHistory()
    const location = useLocation()
    const username = props?.match.params.username
    const favgroupName = props?.match.params.favgroup

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    useEffect(() => {
        setHideNavbar(true)
        setHideTitlebar(true)
        setHideSidebar(false)
        setRelative(false)
        setActiveDropdown("none")
        setSidebarText("")
    }, [location])

    useEffect(() => {
        if (!session.cookie) return
        if (!session.username) {
            functions.replaceLocation("/401")
        }
    }, [session])

    useEffect(() => {
        limit = mobile ? 5 : 25
    }, [mobile])

    const favgroupInfo = async () => {
        let favgroup = await functions.get("/api/favgroup", {name: favgroupName, username}, session, setSessionFlag).catch(() => null)
        if (!favgroup) return functions.replaceLocation("/404")
        if (favgroup.restrict === "explicit") {
            if (!session.cookie) return
            if (!session.showR18) return functions.replaceLocation("/404")
        }
        setFavgroup(favgroup)
    }

    useEffect(() => {
        if (session.username) {
            favgroupInfo()
        }
    }, [favgroupName, session])

    useEffect(() => {
        if (groupFlag) {
            favgroupInfo()
            setGroupFlag(false)
        }
    }, [favgroupName, session, groupFlag])

    const updateItems = async () => {
        let items = [] as any[]
        for (let i = 0; i < favgroup.posts.length; i++) {
            const post = favgroup.posts[i]
            if (post.restrict === "explicit") if (restrictType !== "explicit") continue
            const imageLink = functions.getThumbnailLink(post.images[0]?.type, post.postID, post.images[0]?.order, post.images[0]?.filename, "medium", mobile)
            let img = await functions.decryptThumb(imageLink, session)
            items.push({id: post.order, image: img, post})
        }
        setItems(items)
    }

    useEffect(() => {
        if (favgroup) {
            document.title = favgroup.name
            setHeaderText(favgroup.name)
            if (favgroup.private) {
                if (session.username !== username) return functions.replaceLocation("/403")
            }
            updateItems()
        }
    }, [favgroup, restrictType, session])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    const reorder = (event: React.MouseEvent, from: number, to: number) => {
        setItems((prev: any) => {
            const newState = [...prev]
            newState.splice(to, 0, newState.splice(from, 1)[0])
            return newState
        })
    }

    const favgroupImagesJSX = () => {
        let jsx = [] as any
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const openPost = (event: React.MouseEvent) => {
                if (reorderState) return
                if (event.ctrlKey || event.metaKey || event.button === 1) {
                    window.open(`/post/${item.post.postID}/${item.post.slug}`, "_blank")
                } else {
                    history.push(`/post/${item.post.postID}/${item.post.slug}`)
                }
                setPosts(favgroup.posts)
                setTimeout(() => {
                    setActiveFavgroup(favgroup)
                }, 200)
            }
            jsx.push(
                <li key={item.id} style={{marginRight: "20px", marginTop: "10px"}}>
                    <img draggable={false} className="group-image" src={item.image} onClick={openPost} style={{cursor: reorderState ? "move" : "pointer"}}/>
                </li>
            )
        }
        return (
            <Reorder onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}
            reorderId="group-reorder-container" className="group-image-container" disabled={!reorderState}
            component="ul" holdTime={50} onReorder={reorder}>{jsx}</Reorder>
        )
    }

    const commitReorder = async () => {
        let posts = [] as any[]
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            posts.push({postID: item.post.postID, order: i + 1})
        }
        await functions.put("/api/favgroup/reorder", {name: favgroup.name, posts}, session, setSessionFlag)
        setReorderState(false)
    }

    const cancelReorder = () => {
        setReorderState(false)
        updateItems()
    }

    const changeReorderState = () => {
        if (reorderState) {
            cancelReorder()
        } else {
            setReorderState(true)
        }
    }

    const showFavgroupDeleteDialog = async () => {
        setDeleteFavGroupObj(favgroup)
    }

    const showFavgroupEditDialog = async () => {
        setEditFavGroupObj(favgroup)
    }

    const favgroupOptionsJSX = () => {
        let jsx = [] as any
        if (session.username === username) {
            jsx.push(<img className="group-opt" src={reorderState ? groupReorderActive : groupReorder} onClick={() => changeReorderState()} style={{filter: reorderState ? "" : getFilter()}}/>)
            if (reorderState) {
                jsx.push(<img className="group-opt" src={groupCancel} onClick={() => cancelReorder()} style={{filter: getFilter()}}/>)
                jsx.push(<img className="group-opt" src={groupAccept} onClick={() => commitReorder()} style={{filter: getFilter()}}/>)
            }
            jsx.push(<img className="group-opt" src={groupEdit} onClick={() => showFavgroupEditDialog()} style={{filter: getFilter()}}/>)
            jsx.push(<img className="group-opt" src={groupDelete} onClick={() => showFavgroupDeleteDialog()} style={{filter: getFilter()}}/>)
        }
        return jsx
    }

    const searchGroup = (event: React.MouseEvent, alias?: string) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open("/posts", "_blank")
        } else {
            history.push("/posts")
        }
        setSearch(`favgroup:${username}:${favgroup.name}`)
        setSearchFlag(true)
    }

    return (
        <>
        <EditFavgroupDialog/>
        <DeleteFavgroupDialog/>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content" onMouseEnter={() => setEnableDrag(true)}>
                {favgroup ? 
                <div className="group-page">
                    <div className="group-row" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                        {favgroup.private ? <img className="group-icon" src={lockIcon} style={{filter: getFilter()}}/> : null}
                        <span className="group-heading">{favgroup.name}</span>
                        {favgroupOptionsJSX()}
                    </div>
                    <div className="group-row" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                        <span><span className="group-label" onClick={searchGroup}>Posts</span> <span className="group-label-alt">{favgroup.postCount}</span></span>
                    </div>
                    {favgroupImagesJSX()}
                </div> : null}
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default FavgroupPage