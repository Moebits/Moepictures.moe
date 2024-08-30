CREATE TABLE IF NOT EXISTS "users" (
    "username" text PRIMARY KEY,
    "email" text UNIQUE NOT NULL,
    "joinDate" date,
    "role" text,
    "bio" text,
    "emailVerified" boolean,
    "$2fa" boolean,
    "publicFavorites" boolean,
    "showRelated" boolean,
    "showTooltips" boolean,
    "showTagBanner" boolean,
    "downloadPixivID" boolean,
    "autosearchInterval" int,
    "image" text,
    "imagePost" bigint REFERENCES posts ("postID") ON UPDATE CASCADE ON DELETE SET NULL,
    "ip" inet,
    "banned" boolean,
    "password" text
);

CREATE TABLE IF NOT EXISTS "posts" (
    "postID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "restrict" text,
    "style" text,
    "thirdParty" boolean,
    "drawn" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "title" text,
    "translatedTitle" text,
    "artist" text,
    "link" text,
    "commentary" text,
    "translatedCommentary" text,
    "bookmarks" int,
    "hidden" boolean,
    "mirrors" jsonb
);

CREATE TABLE IF NOT EXISTS "unverified posts" (
    "postID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "originalID" bigint REFERENCES posts ("postID") ON DELETE CASCADE,
    "reason" text,
    "duplicates" boolean,
    "newTags" int,
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "restrict" text,
    "style" text,
    "thirdParty" boolean,
    "drawn" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "title" text,
    "translatedTitle" text,
    "artist" text,
    "link" text,
    "commentary" text,
    "translatedCommentary" text,
    "bookmarks" int,
    "hidden" boolean,
    "mirrors" jsonb,
    "thumbnail" text
);

CREATE TABLE IF NOT EXISTS "images" (
    "imageID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES posts ON DELETE CASCADE,
    "type" text,
    "filename" text,
    "width" int,
    "height" int,
    "size" int,
    "order" int,
    "hash" text
);

CREATE TABLE IF NOT EXISTS "unverified images" (
    "imageID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ON DELETE CASCADE,
    "type" text,
    "filename" text,
    "width" int,
    "height" int,
    "size" int,
    "order" int,
    "hash" text
);

CREATE TABLE IF NOT EXISTS "tags" (
    "tag" text PRIMARY KEY,
    "type" text,
    "image" text,
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
    "banned" boolean
);

CREATE TABLE IF NOT EXISTS "unverified tags" (
    "tag" text PRIMARY KEY,
    "type" text,
    "image" text,
    "description" text,
    "website" text,
    "social" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[]
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
    "content" text
);

CREATE TABLE IF NOT EXISTS "replies" (
    "replyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "threadID" bigint REFERENCES "threads" ("threadID") ON UPDATE CASCADE ON DELETE CASCADE,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updatedDate" timestamptz,
    "content" text
);

CREATE TABLE IF NOT EXISTS "messages" (
    "messageID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "recipient" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "title" text,
    "content" text
);

CREATE TABLE IF NOT EXISTS "message replies" (
    "replyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "messageID" bigint REFERENCES "messages" ("messageID") ON UPDATE CASCADE ON DELETE CASCADE,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updatedDate" timestamptz,
    "content" text
);

CREATE TABLE IF NOT EXISTS "tag map" (
    "tagID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "unverified tag map" (
    "tagID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ON DELETE CASCADE,
    "tag" text REFERENCES "unverified tags" ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "aliases" (
    "aliasID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "alias" text
);

CREATE TABLE IF NOT EXISTS "unverified aliases" (
    "aliasID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "unverified tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "alias" text
);

CREATE TABLE IF NOT EXISTS "implications" (
    "implicationID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "implication" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "third party" (
    "thirdPartyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "parentID" bigint REFERENCES "posts" ("postID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "unverified third party" (
    "thirdPartyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ON DELETE CASCADE,
    "parentID" bigint REFERENCES "posts" ("postID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "sessionID" varchar NOT NULL COLLATE "default" PRIMARY KEY NOT DEFERRABLE INITIALLY IMMEDIATE,
  "session" json NOT NULL,
  "expires" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "idx_session_expire" ON "session" ("expires");

CREATE TABLE IF NOT EXISTS "email tokens" (
    "email" text PRIMARY KEY,
    "token" text,
    "expires" timestamptz
);

CREATE TABLE IF NOT EXISTS "2fa tokens" (
    "username" text PRIMARY KEY REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "token" text,
    "qrcode" text
);

CREATE TABLE IF NOT EXISTS "password tokens" (
    "username" text PRIMARY KEY REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "token" text,
    "expires" timestamptz
);

CREATE TABLE IF NOT EXISTS "comments" (
    "commentID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "comment" text,
    "postDate" timestamptz,
    "editedDate" timestamptz
);

CREATE TABLE IF NOT EXISTS "translations" (
    "translationID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "data" jsonb
);

CREATE TABLE IF NOT EXISTS "unverified translations" (
    "translationID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "data" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "favorites" (
    "favoriteID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "favoriteDate" timestamptz
);

CREATE TABLE IF NOT EXISTS "cuteness" (
    "cutenessID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "cuteness" int,
    "cutenessDate" timestamptz
);

CREATE TABLE IF NOT EXISTS "delete requests" (
    "deleteRequestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "alias requests" (
    "aliasRequestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "aliasTo" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "tag edit requests" (
    "tagEditRequestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "key" text,
    "description" text,
    "image" text,
    "aliases" text[],
    "implications" text[],
    "website" text,
    "social" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported comments" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "commentID" bigint REFERENCES "comments" ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported threads" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "threadID" bigint REFERENCES "threads" ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported replies" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "replyID" bigint REFERENCES "replies" ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "translation history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "data" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "tag history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "key" text,
    "type" text,
    "image" text,
    "description" text,
    "aliases" text[],
    "implications" text[],
    "website" text,
    "social" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "post history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON UPDATE CASCADE ON DELETE CASCADE,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "images" text[],
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "restrict" text,
    "style" text,
    "thirdParty" boolean,
    "drawn" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "title" text,
    "translatedTitle" text,
    "artist" text,
    "link" text,
    "commentary" text,
    "translatedCommentary" text,
    "bookmarks" int,
    "mirrors" jsonb,
    "artists" text[],
    "characters" text[],
    "series" text[],
    "tags" text[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "bans" (
    "banID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "banner" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "banDate" timestamptz,
    "reason" text
);

CREATE INDEX IF NOT EXISTS "idx_posts"
    ON "posts" USING btree
    ("postID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_post_type" 
    ON "posts" USING btree ("type");

CREATE INDEX IF NOT EXISTS "idx_post_restrict" 
    ON "posts" USING btree ("restrict");

CREATE INDEX IF NOT EXISTS "idx_post_style" 
    ON "posts" USING btree ("style");

CREATE INDEX IF NOT EXISTS "idx_post_uploadDate" 
    ON "posts" USING btree ("uploadDate");

CREATE INDEX IF NOT EXISTS "idx_post_drawn" 
    ON "posts" USING btree ("drawn");

CREATE INDEX IF NOT EXISTS "idx_post_bookmarks" 
    ON "posts" USING btree ("bookmarks");

CREATE INDEX IF NOT EXISTS "idx_images"
    ON "images" USING btree
    ("imageID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_images_size"
    ON "images" USING btree ("size");

CREATE INDEX IF NOT EXISTS "idx_cuteness"
    ON "cuteness" USING btree
    ("cutenessID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_cuteness_cuteness"
    ON "cuteness" USING btree ("cuteness");

CREATE INDEX IF NOT EXISTS "idx_favorites"
    ON "favorites" USING btree
    ("favoriteID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_comments"
    ON "comments" USING btree
    ("commentID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_translations"
    ON "translations" USING btree
    ("translationID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_tag_map"
    ON "tag map" USING btree
    ("tagID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_tags"
    ON "tags" USING btree
    ("tag" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_aliases"
    ON "aliases" USING btree
    ("aliasID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_implications"
    ON "implications" USING btree
    ("implicationID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_users"
    ON "users" USING btree
    (username ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_threads"
    ON "threads" USING btree
    ("threadID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_replies"
    ON "replies" USING btree
    ("replyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_messages"
    ON "messages" USING btree
    ("messageID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_message_replies"
    ON "message replies" USING btree
    ("replyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_post_history"
    ON "post history" USING btree
    ("historyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_tag_history"
    ON "tag history" USING btree
    ("historyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_translation_history"
    ON "translation history" USING btree
    ("historyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_unverified_images"
    ON "unverified images" USING btree
    ("imageID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_unverified_posts"
    ON "unverified posts" USING btree
    ("postID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_unverified_tag_map"
    ON "unverified tag map" USING btree
    ("tagID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_unverified_tags"
    ON "unverified tags" USING btree
    (tag ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_unverified_aliases"
    ON "unverified aliases" USING btree
    ("aliasID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_unverified_translations"
    ON "unverified translations" USING btree
    ("translationID" ASC NULLS LAST);