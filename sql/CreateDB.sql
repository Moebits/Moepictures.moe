CREATE TABLE IF NOT EXISTS "users" (
    "userID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text UNIQUE NOT NULL,
    "email" text UNIQUE NOT NULL,
    "joinDate" date,
    "lastLogin" timestamptz,
    "role" text,
    "bio" text,
    "emailVerified" boolean,
    "cookieConsent" boolean,
    "$2fa" boolean,
    "publicFavorites" boolean,
    "publicTagFavorites" boolean,
    "showRelated" boolean,
    "showTooltips" boolean,
    "showTagTooltips" boolean,
    "showTagBanner" boolean,
    "downloadPixivID" boolean,
    "autosearchInterval" int,
    "upscaledImages" boolean,
    "forceNoteBubbles" boolean,
    "liveAnimationPreview" boolean,
    "liveModelPreview" boolean,
    "savedSearches" jsonb,
    "blacklist" text,
    "showR18" boolean,
    "premiumExpiration" timestamptz,
    "image" text,
    "imageHash" text,
    "imagePost" bigint,
    "postCount" int,
    "deletedPosts" bigint[],
    "ips" inet[],
    "banned" boolean,
    "banExpiration" timestamptz,
    "lastNameChange" timestamptz,
    "password" text
);

CREATE TABLE IF NOT EXISTS "posts" (
    "postID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "rating" text,
    "style" text,
    "parentID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL,
    "posted" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "approver" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "approveDate" timestamptz,
    "title" text,
    "englishTitle" text,
    "artist" text,
    "source" text,
    "commentary" text,
    "englishCommentary" text,
    "bookmarks" int,
    "mirrors" jsonb,
    "buyLink" text,
    "slug" text,
    "hidden" boolean,
    "locked" boolean,
    "private" boolean,
    "deleted" boolean,
    "deletionDate" timestamptz,
    "hasOriginal" boolean,
    "hasUpscaled" boolean
);

DO $$
BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_imagePost_fkey') 
THEN ALTER TABLE "users" ADD CONSTRAINT "users_imagePost_fkey" FOREIGN KEY ("imagePost") 
REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL; END IF;
END $$;

CREATE TABLE IF NOT EXISTS "unverified posts" (
    "postID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "originalID" bigint REFERENCES posts ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text,
    "duplicates" boolean,
    "newTags" int,
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "rating" text,
    "style" text,
    "parentID" bigint REFERENCES "unverified posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL,
    "posted" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "approveDate" timestamptz,
    "title" text,
    "englishTitle" text,
    "artist" text,
    "source" text,
    "commentary" text,
    "englishCommentary" text,
    "bookmarks" int,
    "buyLink" text,
    "slug" text,
    "hidden" boolean,
    "hasOriginal" boolean,
    "hasUpscaled" boolean,
    "mirrors" jsonb,
    "isNote" boolean,
    "deleted" boolean,
    "deletionDate" timestamptz,
    "appealed" boolean,
    "appealer" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "appealReason" text,
    "addedTags" text[],
    "removedTags" text[],
    "addedTagGroups" text[],
    "removedTagGroups" text[],
    "imageChanged" boolean,
    "changes" jsonb
);

CREATE TABLE IF NOT EXISTS "images" (
    "imageID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES posts ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "type" text,
    "order" int,
    "filename" text,
    "upscaledFilename" text,
    "width" int,
    "height" int,
    "upscaledWidth" int,
    "upscaledHeight" int,
    "size" int,
    "upscaledSize" int,
    "duration" double precision,
    "thumbnail" text,
    "hash" text,
    "pixelHash" text
);

CREATE TABLE IF NOT EXISTS "unverified images" (
    "imageID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "type" text,
    "order" int,
    "filename" text,
    "upscaledFilename" text,
    "width" int,
    "height" int,
    "upscaledWidth" int,
    "upscaledHeight" int,
    "size" int,
    "upscaledSize" int,
    "duration" double precision,
    "thumbnail" text,
    "hash" text,
    "pixelHash" text
);

CREATE TABLE IF NOT EXISTS "tags" (
    "tagID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text UNIQUE NOT NULL,
    "type" text,
    "image" text,
    "imageHash" text,
    "description" text,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "website" text,
    "social" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[],
    "featuredPost" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL,
    "banned" boolean,
    "hidden" boolean,
    "r18" boolean
);

CREATE TABLE IF NOT EXISTS "unverified tags" (
    "tagID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text UNIQUE NOT NULL,
    "type" text,
    "image" text,
    "imageHash" text,
    "description" text,
    "website" text,
    "social" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[],
    "featuredPost" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "tag map" (
    "mapID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("postID", "tag")
);

CREATE TABLE IF NOT EXISTS "unverified tag map" (
    "mapID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "unverified tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("postID", "tag")
);

CREATE TABLE IF NOT EXISTS "tag groups" (
    "groupID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "name" text,
    UNIQUE ("postID", "name")
);

CREATE TABLE IF NOT EXISTS "tag group map" (
    "mapID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "groupID" bigint REFERENCES "tag groups" ("groupID") ON UPDATE CASCADE ON DELETE CASCADE,
    "tagMapID" bigint REFERENCES "tag map" ("mapID") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("groupID", "tagMapID")
);

CREATE TABLE IF NOT EXISTS "unverified tag groups" (
    "groupID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "name" text,
    UNIQUE ("postID", "name")
);

CREATE TABLE IF NOT EXISTS "unverified tag group map" (
    "mapID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "groupID" bigint REFERENCES "unverified tag groups" ("groupID") ON UPDATE CASCADE ON DELETE CASCADE,
    "tagMapID" bigint REFERENCES "unverified tag map" ("mapID") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("groupID", "tagMapID")
);

CREATE TABLE IF NOT EXISTS "threads" (
    "threadID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "sticky" boolean,
    "locked" boolean,
    "title" text,
    "content" text,
    "r18" boolean
);

CREATE TABLE IF NOT EXISTS "thread reads" (
    "readID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "threadID" bigint REFERENCES "threads" ("threadID") ON UPDATE CASCADE ON DELETE CASCADE,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "read" boolean,
    UNIQUE ("threadID", "username")
);

CREATE TABLE IF NOT EXISTS "replies" (
    "replyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "threadID" bigint REFERENCES "threads" ("threadID") ON UPDATE CASCADE ON DELETE CASCADE,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "content" text,
    "r18" boolean
);

CREATE TABLE IF NOT EXISTS "messages" (
    "messageID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "read" boolean,
    "delete" boolean,
    "title" text,
    "content" text,
    "r18" boolean
);

CREATE TABLE IF NOT EXISTS "message recipients" (
    "recipientID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "messageID" bigint REFERENCES "messages" ("messageID") ON UPDATE CASCADE ON DELETE CASCADE,
    "recipient" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "read" boolean,
    "delete" boolean
);

CREATE TABLE IF NOT EXISTS "message replies" (
    "replyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "messageID" bigint REFERENCES "messages" ("messageID") ON UPDATE CASCADE ON DELETE CASCADE,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "content" text,
    "r18" boolean
);

CREATE TABLE IF NOT EXISTS "aliases" (
    "aliasID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "alias" text,
    UNIQUE ("tag", "alias")
);

CREATE TABLE IF NOT EXISTS "unverified aliases" (
    "aliasID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "unverified tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "alias" text,
    UNIQUE ("tag", "alias")
);

CREATE TABLE IF NOT EXISTS "implications" (
    "implicationID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "implication" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE ("tag", "implication")
);

CREATE TABLE IF NOT EXISTS "child posts" (
    "childID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "parentID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "unverified child posts" (
    "childID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "parentID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "groups" (
    "groupID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "slug" text UNIQUE NOT NULL,
    "name" text UNIQUE NOT NULL,
    "rating" text,
    "description" text,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz
);

CREATE TABLE IF NOT EXISTS "group map" (
    "mapID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "groupID" bigint REFERENCES "groups" ("groupID") ON UPDATE CASCADE ON DELETE CASCADE,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "order" int,
    UNIQUE ("groupID", "postID")
);

CREATE TABLE IF NOT EXISTS "favgroups" (
    "favgroupID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "slug" text NOT NULL,
    "name" text NOT NULL,
    "rating" text,
    "private" boolean,
    "createDate" timestamptz,
    UNIQUE ("username", "slug")
);

CREATE TABLE IF NOT EXISTS "favgroup map" (
    "mapID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "favgroupID" bigint REFERENCES "favgroups" ("favgroupID") ON UPDATE CASCADE ON DELETE CASCADE,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "order" int,
    UNIQUE ("favgroupID", "postID")
);

CREATE TABLE IF NOT EXISTS "favorites" (
    "favoriteID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "favoriteDate" timestamptz,
    UNIQUE ("postID", "username")
);

CREATE TABLE IF NOT EXISTS "tag favorites" (
    "favoriteID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "favoriteDate" timestamptz,
    UNIQUE ("tag", "username")
);

CREATE TABLE IF NOT EXISTS "cuteness" (
    "cutenessID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "cuteness" int,
    "cutenessDate" timestamptz,
    UNIQUE ("postID", "username")
);

CREATE TABLE IF NOT EXISTS "comments" (
    "commentID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "postDate" timestamptz,
    "editor" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "editedDate" timestamptz,
    "comment" text
);

CREATE TABLE IF NOT EXISTS "notes" (
    "noteID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "transcript" text,
    "translation" text,
    "x" double precision,
    "y" double precision,
    "width" double precision,
    "height" double precision,
    "rotation" double precision,
    "imageWidth" int,
    "imageHeight" int,
    "imageHash" text,
    "overlay" boolean,
    "fontSize" int,
    "fontFamily" text,
    "bold" boolean,
    "italic" boolean,
    "textColor" text,
    "backgroundColor" text,
    "backgroundAlpha" int,
    "strokeColor" text,
    "strokeWidth" int,
    "breakWord" boolean,
    "borderRadius" int,
    "character" boolean,
    "characterTag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "unverified notes" (
    "noteID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "originalID" bigint REFERENCES posts ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "transcript" text,
    "translation" text,
    "x" double precision,
    "y" double precision,
    "width" double precision,
    "height" double precision,
    "rotation" double precision,
    "imageWidth" int,
    "imageHeight" int,
    "imageHash" text,
    "overlay" boolean,
    "fontSize" int,
    "fontFamily" text,
    "bold" boolean,
    "italic" boolean,
    "textColor" text,
    "backgroundColor" text,
    "backgroundAlpha" int,
    "strokeColor" text,
    "strokeWidth" int,
    "breakWord" boolean,
    "borderRadius" int,
    "character" boolean,
    "characterTag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE SET NULL,
    "addedEntries" text[],
    "removedEntries" text[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "sessionID" text PRIMARY KEY,
  "session" jsonb NOT NULL,
  "expires" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "email tokens" (
    "tokenID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "email" text UNIQUE NOT NULL,
    "token" text,
    "expires" timestamptz
);

CREATE TABLE IF NOT EXISTS "2fa tokens" (
    "tokenID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text UNIQUE REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "token" text,
    "qrcode" text
);

CREATE TABLE IF NOT EXISTS "password tokens" (
    "tokenID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text UNIQUE REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "token" text,
    "expires" timestamptz
);

CREATE TABLE IF NOT EXISTS "ip tokens" (
    "tokenID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text UNIQUE REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "token" text,
    "ip" inet,
    "expires" timestamptz
);

CREATE TABLE IF NOT EXISTS "delete requests" (
    "requestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "group" text REFERENCES "groups" ("slug") ON UPDATE CASCADE ON DELETE CASCADE,
    "groupPost" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "alias requests" (
    "requestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "aliasTo" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "tag edit requests" (
    "requestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "key" text,
    "type" text,
    "description" text,
    "image" text,
    "imageHash" text,
    "aliases" text[],
    "implications" text[],
    "website" text,
    "social" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[],
    "featuredPost" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL,
    "imageChanged" boolean,
    "changes" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "group requests" (
    "requestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "name" text,
    "slug" text,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "group edit requests" (
    "requestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "group" text REFERENCES "groups" ("slug") ON UPDATE CASCADE ON DELETE CASCADE,
    "name" text,
    "description" text,
    "addedPosts" text[],
    "removedPosts" text[],
    "orderChanged" boolean,
    "changes" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported comments" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "commentID" bigint REFERENCES "comments" ("commentID") ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported threads" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "threadID" bigint REFERENCES "threads" ("threadID") ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported replies" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "replyID" bigint REFERENCES "replies" ("replyID") ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "viewDate" timestamptz,
    UNIQUE ("username", "postID")
);

CREATE TABLE IF NOT EXISTS "note history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "notes" jsonb,
    "styleChanged" boolean,
    "addedEntries" text[],
    "removedEntries" text[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "group history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "groupID" bigint REFERENCES "groups" ("groupID") ON UPDATE CASCADE ON DELETE CASCADE,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "slug" text,
    "name" text,
    "rating" text,
    "description" text,
    "posts" jsonb,
    "addedPosts" text[],
    "removedPosts" text[],
    "orderChanged" boolean,
    "changes" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "tag history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "key" text,
    "type" text,
    "image" text,
    "imageHash" text,
    "description" text,
    "aliases" text[],
    "implications" text[],
    "website" text,
    "social" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[],
    "featuredPost" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL,
    "imageChanged" boolean,
    "changes" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "post history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "images" text[],
    "upscaledImages" text[],
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "rating" text,
    "style" text,
    "parentID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE SET NULL,
    "posted" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "title" text,
    "englishTitle" text,
    "artist" text,
    "source" text,
    "commentary" text,
    "englishCommentary" text,
    "bookmarks" int,
    "buyLink" text,
    "mirrors" jsonb,
    "slug" text,
    "hasOriginal" boolean,
    "hasUpscaled" boolean,
    "artists" text[],
    "characters" text[],
    "series" text[],
    "tags" text[],
    "tagGroups" jsonb,
    "addedTags" text[],
    "removedTags" text[],
    "addedTagGroups" text[],
    "removedTagGroups" text[],
    "imageChanged" boolean,
    "changes" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "alias history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "source" text,
    "target" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "type" text,
    "affectedPosts" bigint[],
    "sourceData" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "implication history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "source" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "target" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "type" text,
    "affectedPosts" bigint[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "login history" (
    "loginID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "type" text,
    "ip" inet,
    "device" text,
    "region" text,
    "timestamp" timestamptz
);

CREATE TABLE IF NOT EXISTS "bans" (
    "banID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "ip" inet,
    "banner" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "banDate" timestamptz,
    "reason" text,
    "active" boolean
);

CREATE TABLE IF NOT EXISTS "blacklist" (
    "blacklistID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "ip" inet UNIQUE,
    "reason" text,
    "blacklistDate" timestamptz
);

CREATE TABLE IF NOT EXISTS "payments" (
    "paymentID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "chargeID" text,
    "username" text,
    "email" text
);

CREATE TABLE IF NOT EXISTS "banner" (
    "bannerID" int PRIMARY KEY DEFAULT 1,
    "text" text,
    "link" text,
    "date" timestamptz
);

CREATE TABLE IF NOT EXISTS "api keys" (
    "keyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text UNIQUE REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "createDate" timestamptz,
    "key" text
);

CREATE TABLE IF NOT EXISTS "redirects" (
    "redirectID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ("postID") ON UPDATE CASCADE ON DELETE CASCADE,
    "createDate" timestamptz,
    "oldSlug" text UNIQUE
);

CREATE INDEX IF NOT EXISTS "idx_posts" ON "posts" ("postID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_post_type" ON "posts" ("type");
CREATE INDEX IF NOT EXISTS "idx_post_rating" ON "posts" ("rating");
CREATE INDEX IF NOT EXISTS "idx_post_style" ON "posts" ("style");
CREATE INDEX IF NOT EXISTS "idx_post_uploadDate" ON "posts" ("uploadDate");
CREATE INDEX IF NOT EXISTS "idx_post_posted" ON "posts" ("posted");
CREATE INDEX IF NOT EXISTS "idx_post_bookmarks" ON "posts" ("bookmarks");
CREATE INDEX IF NOT EXISTS "idx_images" ON "images" ("imageID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_images_size" ON "images" ("size");
CREATE INDEX IF NOT EXISTS "idx_cuteness" ON "cuteness" ("postID", "username");
CREATE INDEX IF NOT EXISTS "idx_cuteness_cuteness" ON "cuteness" ("cuteness");
CREATE INDEX IF NOT EXISTS "idx_favorites" ON "favorites" ("postID", "username");
CREATE INDEX IF NOT EXISTS "idx_favgroup_map_postID" ON "favgroup map" ("postID");
CREATE INDEX IF NOT EXISTS "idx_favgroup_map_favgroupID" ON "favgroup map" ("favgroupID");
CREATE INDEX IF NOT EXISTS "idx_favgroups_username_favgroupID" ON "favgroups" ("username", "favgroupID");
CREATE INDEX IF NOT EXISTS "idx_child_posts_parentID" ON "child posts" ("parentID");
CREATE INDEX IF NOT EXISTS "idx_history" ON "history" ("username", "postID");
CREATE INDEX IF NOT EXISTS "idx_unverified_aliases" ON "unverified aliases" ("tag", "alias");
CREATE INDEX IF NOT EXISTS "idx_comments" ON "comments" ("commentID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_notes" ON "notes" ("noteID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_tag_map_postID" ON "tag map" ("postID");
CREATE INDEX IF NOT EXISTS "idx_tags" ON "tags" ("tag");
CREATE INDEX IF NOT EXISTS "idx_aliases" ON "aliases" ("tag", "alias");
CREATE INDEX IF NOT EXISTS "idx_implications" ON "implications" ("tag", "implication");
CREATE INDEX IF NOT EXISTS "idx_users" ON "users" ("username" ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_threads" ON "threads" ("threadID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_replies" ON "replies" ("replyID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_messages" ON "messages" ("messageID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_message_replies" ON "message replies" ("replyID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_post_history" ON "post history" ("historyID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_tag_history" ON "tag history" ("historyID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_note_history" ON "note history" ("historyID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_unverified_images" ON "unverified images" ("imageID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_unverified_posts" ON "unverified posts" ("postID" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_unverified_tag_map" ON "unverified tag map" ("postID", "tag");
CREATE INDEX IF NOT EXISTS "idx_unverified_tags" ON "unverified tags" ("tag" ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_unverified_aliases" ON "unverified aliases" ("tag", "alias");
CREATE INDEX IF NOT EXISTS "idx_unverified_notes" ON "unverified notes" ("noteID" ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_sessions_expire" ON "sessions" ("expires");