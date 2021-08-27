# MTV Help

This should help you get up and running with MTV and Discord.

* [Introduction](#intro)
* [Discord Preparation](#discord)
  * [Set your MTV nickname!](#nickname)
  * [Give yourself a record label!](#label)
* [Watching MTV](#watch)
* [Giving Your Opinion](#opinion)
  * [Emojis](#emojis)
* [Autoskip](#autoskip)
* [Action Basics](#basics)
* [Actions](#actions)
  * [Adding a New Video (to the "pool")](#add)
  * [Queueing a (New) Video (to the "pool" _and_ the "queue")](#queue)
  * [Skipping the Current Video](#skip)
  * [Repeating the Current Video](#repeat)
  * [Get Info About the Current Video](#who)
  * [Removing a Video](#remove)
  * [Setting/Removing Your Opinion](#opinions)
  * [Trending / Adopt](#trending)
  * [NSFW / SFW Toggling](#nsfw)
  * [Echo Toggling](#echo)
  * [Tags](#tag)
  * [MTV Blocks](#block)
  * [Queueing Playlists](#playlist)
  * [Ignore List (Autoskip)](#ignore)
  * [Editing a Video in the Pool](#edit)
* [Solo Mode](#solo)
  * [Basics](#solobasics)
  * [Filters](#filters)
  * [Playlists](#playlists)
  * [Mirrors](#mirrors)

## Introduction {#intro}

MTV is a living playlist of music videos, known as the "pool". The MTV server takes all of the videos in this pool, shuffles them once into what is called the "queue", and then plays the entire queue in order. When the queue runs out, the server then takes the pool (which may have changed) and repeats the process. Everyone watching is synchronized to the same part of the currently playing song, so we can talk about it in Discord as it plays.

At any time, any Discord user can add or remove things from the pool, add things to the front of the queue, skip the current playing song, or simply offer their opinion of the current song. The goal is to collaboratively create our very own MTV full of cool videos, as well as offering mechanisms for automatically skipping songs some of us aren't excited about.

When you visit the [main page](/), you will be shown What is **Now Playing**. This is simply the current playing song along with a thumbnail of the video, along with the most recent 20 songs that just played (in case you only caught the end and wanted to watch it again).

You can then click on [Up Next](/#queue) to see the full queue of upcoming songs, which might be hundreds of songs. If you want to see both **Now Playing** and **Up Next** at the same time, use the [Both](/#both) link. For fun stats about how many songs are in MTV or how many each user has provided, visit the [Stats](/#stats) page. If you just want to see the full pool of songs, go to [All](/#all).

## Discord Preparation {#discord}

These are some quick things to check before really digging into MTV.

### Set your MTV nickname! {#nickname}

All interactions with MTV are done through the #mtv Discord channel, and your identity with the server is determined by Discord handle (`SomeName#5555`). To keep this information private, you should choose a nickname that MTV should refer to you by. It doesn't have to be the same as your Discord nickname, but that is a good start. To set your nickname, type something like this into the #mtv Discord channel:

    #mtv nickname YourNickname

You should be able to change this freely and all things MTV should update on the fly, including the lists on the dashboard and all shown opinions.

### Give yourself a record label! {#label}

Every video you add to MTV will be associated to your nickname, but when it is displayed in MTV, it is shown instead as your record label, which is silly and fun. Let's say you wanted to your fake record label to be `Example Records`. You would accomplish this by typing this into the #mtv Discord channel:

    #mtv label Example Records

Congrats, you're now the owner of `Example Records`. This isn't set in stone, so feel free to change it up if you come up with a better one.

## Watching MTV {#watch}

To watch MTV, simply visit the [main page](/) and click on **Watch** at the top. It will ask for your Discord nickname and offer you a handful of choices. Type in your Discord handle exactly (such as `SomeName#5555`, case matters), choose some options, and hit the Watch button. If you want to watch anonymously, leave the nickname box empty. This will simply remove you from consideration when MTV chooses to "autoskip" (see **Autoskip** below).

Here's what the checkboxes mean:

* **SFW Only** - Force MTV to skip any videos flagged as `nsfw`. This forces this for everyone, so keep this in mind.
* **Show Ctrls** - Show the Youtube controls, such as the volume slider.
* **Hide Titles** - Do not show the title info in the bottom left at the start/end of videos.

## Giving Your Opinion {#opinion}

Alright, so you're finally watching MTV, congrats! Not only that, but this first song is fantastic! Or is it bad? Let's make it official. Type _one_ of these words (with nothing before or after it) into the #mtv channel:

    love
    like
    meh
    bleh
    hate

    #mtv like https://www.youtube.com/watch?v=dQw4w9WgXcQ
    #mtv like last

It should reply with something like this:

> MTV: Playing **Some Artist** - **Some Title**  [`bill, 3m44s, 1 like (ted), 1 hate (rufus)`]

Your name will be listed in the appropriate category based on the opinion you chose. Here's what the ratings mean:

* **love** - I love everything about this video.
* **like** - I like when this video is on, but it isn't perfect.
* **meh** - I'm not really into this song, but I don't really mind it being on. Leave it on or skip it, up to you.
* **bleh** - I don't like this song, and I'd prefer to never watch it again. Please skip it.
* **hate** - I hate this song so much, and I'd love it to be skipped as often as possible.

This offers a simple vocabulary for us to hint at each other whether or not someone should skip it, _including the server_ (see **Autoskip** below)! For example, let's say you and one other person are watching MTV, and a song comes on that you don't have much of an opinion on (or maybe even like), but the other person says they `hate` it. If you want to be polite, you can simply type this (with nothing before or after it):

    skip

This will skip the video for everyone, so this goes both ways. Don't be rude and force skip things a bunch of people are currently enjoying. You can always just click on the video itself to pause this song until the next one plays, for example.

To update your opinion of a video that isn't currently playing, use the `#mtv like ...` syntax shown to supply the video you'd like to update. If you wanted to give your opinion of a video that just ended playback (the last video), use `last` here.

### Emojis {#emojis}

If you use certain Discord emojis in the #mtv channel (_anywhere in your text_), they will be interpreted as a specific opinion. These are subject to change, but here is a general list:

* **love** - `:heart:`, `:disguised_face:`, `:smiley_cat:`
* **like** - `:thumbsup:`
* **meh&nbsp;** - `:neutral_face:`, `:rolling_eyes:`
* **bleh** - `:weary:`
* **hate** - `:thumbsdown:`, `:frowning:`, `:face_vomiting:`


## Autoskip {#autoskip}

Even if only one person is watching, when nobody watching likes the current song (`bleh` or `hate`), there's no real reason to keep the song going. This is where autoskip comes in, and is why **Watch** asks for your Discord handle or MTV nickname. If the server recognizes your Discord handle or MTV nickname when you type it into the Watch name box, it will mark you as `(Auto)`, which means it knows you and you can participate in Autoskip.

If the server detects that all _known_ watchers have a negative opinion of the current song, it will automatically perform a skip! This can happen multiple times in a row. This allows for people watching alone (or with like minded folks) to get exactly the MTV experience they're looking for. This autoskip is immediately applied after every opinion too, so if a new song comes on for you that you hate, there's no need to use `hate` and then `skip`. If you `hate` it and nobody else watching disagrees with you, the skip will immediately just happen for you.

If you want to watch MTV, but don't want to participate / interfere with Autoskip, simply watch "anonymously", or using a name that MTV doesn't know. You will still be able to give your opinion in the Discord channel, but only those that provided their nicknames will interact with Autoskip. You'll know that you're not participating in autoskip if you don't see `(Auto)` written after your name in the Watching list at the top of the dashboard or when using `#mtv here`.

## Action Basics {#basics}

All basic interaction with MTV involves actually using the `#mtv` action in the #mtv Discord channel. Here are a few simple examples:

    #mtv who
    #mtv here
    #mtv like
    #mtv skip

If you use `#mtv` without anything after it (or at the end of something you just typed), it behaves the same as `#mtv who`, which will simply just tell you what is currently playing, along with who added the video, its duration, and people's opinions of the video.

`#mtv here` tells you who is watching right now (if anyone). `#mtv like` sets your opinion of the currently playing video to `like`, and `#mtv skip` will immediately skip the current song for everyone. See below for a full list of actions and how to use them.

## Actions {#actions}

### Adding a New Video (to the "pool") {#add}

    #mtv add https://www.youtube.com/watch?v=dQw4w9WgXcQ

This is the general form for adding new videos. This will add the *entire video* (including any intros or outros) to the pool, which won't be seen until the next time the server runs out of videos in the queue and has to do a fresh shuffle. If you want to watch it right away, see **Queueing a Video**.

If that exact video exists already, it'll simply tell you "already in pool" and tell you about it (who added it already, etc).

Let's say the video has a 2 minute introduction that should be skipped. You can adjust the link you provide from Youtube to have a `start` (and/or `end`), and MTV will honor it. For example:


    #mtv add https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=60&end=90

This tells MTV to add this video to the pool, but start it 60 seconds into the actual video, and go to the next video at the 90 second mark (making the duration only 30 seconds). Feel free to ask in the #mtv channel if you're struggling to do this kind of trick. You can always just add the video the simple way and then use `#mtv edit` to adjust `start` and `end` later.

There are only a few **general guidelines on adding a new video**:

* Try not to add a duplicate (it could already be in MTV with a different ID).
* It has to be a _video_, not just a song with a static image. Visualizers are borderline, but allowed.
* When adding it, if the Artist/Title it guesses for the video are bad, please fix them with `#mtv edit` (see below), and/or ask for help.

### Queueing a (New) Video (to the "pool" _and_ the "queue") {#queue}

    #mtv queue https://www.youtube.com/watch?v=dQw4w9WgXcQ
    #mtv q https://www.youtube.com/watch?v=dQw4w9WgXcQ

This action behaves identically to `#mtv add`, but also throws it in the front of the queue, so that it'll play immediately after the current song (for everyone). This works great with videos already in the pool too, so feel free to offer links from the actual main page.

### Skipping the Current Video {#skip}

    skip
    #mtv skip
    #mtv skip X

This will skip the currently playing songs, or X songs (if X is a number). For example, `#mtv skip 5` will skip the next 5 songs.

### Repeating the Current Video {#repeat}

    #mtv repeat
    #mtv repeat X

This will re-queue the currently playing song to repeat it once, or X times (if X is a number). For example, `#mtv repeat 5` will queue the current song 5 more times.

### Get Info About the Current Video {#who}

    #mtv
    #mtv who
    #mtv what
    #mtv why

This just prints the info about the current song. There are a bunch of other aliases, most times people just use `#mtv`.

### Removing a Video {#remove}

    #mtv remove https://www.youtube.com/watch?v=dQw4w9WgXcQ

This will only remove videos from the pool. This is useful for videos that have been removed or age-restricted on YouTube so they don't work anymore, or some video that universally hated.

### Setting/Removing Your Opinion {#opinions}

    love
    like
    meh
    bleh
    hate
    #mtv love
    #mtv like
    #mtv meh
    #mtv bleh
    #mtv hate
    #mtv none

The only new one here from above is `#mtv none`, which _removes_ your opinion.

Instead of giving your opinion on the current playing song, you can append a video or the word `last` in order to adjust your opinion of it directly, such as:

    #mtv like https://www.youtube.com/watch?v=dQw4w9WgXcQ
    #mtv like last

### Trending / Adopt {#trending}

    #mtv trending
    #mtv adopt

The `trending` action asks YouTube for the top 50 Music Videos in the US _right now_, shuffles them, and puts them at the front of the queue, owned by `YouTube`. This does _not_ put them in the pool; it is just a one-time fun thing for those currently watching. This will most likely be followed up by quite a few `skip`s, or perhaps a `#mtv skip 50` if you're desperate.

However, once in a while, you'll find a new gem! If you see a new video that you think belongs permanently in MTV, use `#mtv adopt`, and you'll claim ownership from YouTube over the video, and it'll put it in the pool with your name attached.

### NSFW / SFW Toggling {#nsfw}

    nsfw
    sfw
    #mtv nsfw
    #mtv sfw

MTV doesn't have any clue if a video is NSFW (Not Safe For Work); you have to help it out. The only reason this matters at all on a video is if someone currently watching has "SFW Only" checked, in which no NSFW videos will be shown (they'll all be autoskipped).

### Tags {#tag}

    #mtv tags
    #mtv tag someTag
    #mtv tag someTag someOtherTag
    #mtv untag someTag
    #mtv untag someTag someOtherTag

Tags categorize videos into officially-allowed tags. To see the current official tag list, use `tags`, then tag/untag the current video with whatever tags are appropriate. To edit tags of a video that are not the current video, use [edit](#edit).

### MTV Blocks {#block}

    #mtv block artist Some Artist
    #mtv block title  Some Title
    #mtv block tag    SomeTag
    #mtv block full   Some Artist - Some Title

MTV Blocks were something MTV used to do where it'd play 3-4 of the same artist back-to-back in a "block". The `block` command simulates that by finding all videos matching the text of an artist/song's name (or a tag), shuffles them, and puts them in the front of the queue.

### Queueing Playlists {#playlist}

    #mtv playlist https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ
    #mtv playlist RDdQw4w9WgXcQ

This command accepts a valid YouTube playlist URL, shuffles up to 50 of the first entries, and puts them in the front of the queue.

### Ignore List {#ignore}

    #mtv ignore list
    #mtv ignore add username
    #mtv ignore remove username

When a watching user's nickname is recognized by MTV, it will consider them during Autoskip, which flags them in the `who` list as `(Auto)`. This means that until that user has offered their opinion on the current video, Autoskip will avoid skipping the song.

If there is a user that is not intending to actively participate in Autoskip (you're/they're AFK or just using MTV as background music), putting the user's nickname in the ignore list will change their tag from `(Auto)` to `(Ignored)`, and will treat them as if the Auto tag isn't on them.

### Echo Toggling {#echo}

    #mtv echo

This toggles whether or not "echo" is enabled. Echo has the MTV server do the equivalent of an `#mtv who` automatically when the song changes. It is automatically disabled when nobody is watching for a long enough period.

### Editing a Video in the Pool {#edit}

    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ user bill
    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ artist Some Artist
    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ title Some Title
    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ nsfw
    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ sfw
    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ start 60
    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ end 90
    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ tag someTag
    #mtv edit https://www.youtube.com/watch?v=dQw4w9WgXcQ untag someTag

This is an advanced action! The `edit` action allows you to directly poke at the MTV database -- Please be extra careful with this! Use this to adjust songs that have too-long intros or outros, or have incorrect artist or title names, or have the wrong owner. Do not use this to adopt a song from YouTube when using the `trending` action; use `adopt` for that.

## Solo {#solo}

### Basics {#solobasics}

The [Solo page](/solo) offers a way to watch MTV without being social in Discord, and have full control over what videos show up. This can be leveraged to find new/recent videos, videos you haven't yet voted on, or simply make a playlist for yourself (or to share)! When you first visit the page, it will generate you a `Solo ID` which you can see as your own private MTV channel. You can simply hit `Watch` or `Cast`, and MTV will shuffle all of its videos just for you and play them privately. The Solo webpage will then turn into a remote control, where you can skip videos, restart, go back to a previous video, or (if logged in) even give your opinion!

**Note:** To see the full set of solo controls, make sure you're logged in on the [main dashboard](/). Simply choose `Login` in the top right and let MTV know who you are in Discord. If you do this correctly, you should see your Discord name and nickname in the top left of the Dashboard. If this doesn't work, ask in the MTV Discord channel. The most common error is that you haven't yet set your nickname in Discord. Once you're logged in, refresh the [Solo page](/solo).

### Filters {#filters}

Filters are how you decide what ends up on your personal Solo MTV channel. If you press `Settings` on the Solo page, you will see your current `Solo ID`, an empty `Filters` box, and a few additional buttons for saving/loading playlists and sharing your Solo experience.

By default, an empty Filters list simply means _no filters, just shuffle everything MTV offers_. Most likely though, you've given your opinion on some videos by now, and you would prefer to not see some of them ever again. Or perhaps you just want to see videos from the last week, or videos by a certain artist (or two), or everything by a specific artist _except_ that one song, etc. All of this is possible, and here's how it works.

The filter system works by first taking all of the videos available on MTV and marking each one as "**not allowed**" and "**not skipped**". Then each line of the Filters box is a rule which either marks a handful of videos as **allowed**, or the rule marks a handful of videos as **skipped**. When all of the filters are done, any video that is **allowed** and _not_ **skipped** goes in your playlist.

Let's try a few examples:

Let's say you want to listen to some 2Pac. You can use the `artist` filter like this:

    artist 2Pac

This filter marks all songs that have `2Pac` somewhere in the artist's name as **allowed**. When MTV is done reading this single filter, it looks over the list and finds 14 videos, and starts to play them.

**Note:** You can use the `List` button to see what the filters choose in order to help dial in your playlist.

This looks great, but maybe you also want to add some RUN DMC to the list. Simply add another `artist` rule (capitalization is ignored for the artists):

    artist 2Pac
    artist run dmc

Now we're up to 19 videos! Let's say you look at the list and realize that there's a Digital Underground song mixed in there (as 2Pac features on one of their songs), and you didn't want that. This is where the `skip` prefix comes into play:

    artist 2Pac
    artist run dmc
    skip artist digital underground


The `skip` prefix simply runs whatever rule is after it, but instead of marking videos as **allowed**, it marks them as **skipped**. When the final list is then made, anything marked **skipped** is skipped over, and don't show up in your playlist.

Here's the full list of available rules:

* **artist** - search the artist's name for these words

* **title** - search the song title for these words

* **added** - added by this specific nickname

* **since** - Only show videos since a duration, given in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) format. For example, `since P2W` filters videos added in the last two weeks.

* **tag** - Video has a specific [tag](#tag)

* **untagged** - Video has no tags at all

* **love**, **like**, **meh**, **bleh**, **hate** - Give a specific user (like `love joe`) to filter videos with this opinion by this specific nickname

* **none** - Give a specific user (like `none joe`) to filter videos in which this nickname has no opinion

* **id** - Give one or more specific videos by ID

* **private** - This playlist should not be listed publicly on MTV's [Lists](/#lists) page.


(TODO: add more complicated examples)

### Playlists {#playlists}

If you're [logged in](#solobasics), you should be able to type in a name for the playlist you've created and hit `Save`, and it'll save the playlist server-side under your nickname. You can then use the `Load` button in the future to load your playlist, or share a permalink to it by name to someone else using the `Perma` button. If you don't want your playlist to show up in the [Lists](/#lists) page, make sure one of your filters is the word `private` on its own line.

### Mirrors {#mirrors}

Solo sessions don't need to be completely antisocial!

If you start a solo session (using `Watch` or `Cast`), you can create a "mirror link" using the `Mirror` button in the settings, and send it to friends. When they open the link, their UI will not show the Filters box, but when they choose `Watch` or `Cast`, they'll simply mimic whatever your current Solo session watches. This includes skipping tracks, restarting, etc. You can even change your filters and hit `Watch` again and their mirror will autoupdate! As long as you're both using the same `Solo ID`, this will all work. They can also give their opinion and control next/previous/restart.
