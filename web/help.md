# MTV Help

This should help you get up and running with MTV and Discord.

* [Introduction](#intro)
* [Discord Preparation](#discord)
  * [Set your Discord nickname](#nickname)
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
  * [Get Info About the Current Video](#who)
  * [Removing a Video](#remove)
  * [Setting/Removing Your Opinion](#opinions)
  * [Trending / Adopt](#trending)
  * [NSFW / SFW Toggling](#nsfw)
  * [Echo Toggling](#echo)
  * [Editing a Video in the Pool](#edit)

## Introduction {#intro}

MTV is a living playlist of music videos, known as the "pool". The MTV server takes all of the videos in this pool, shuffles them once into what is called the "queue", and then plays the entire queue in order. When the queue runs out, the server then takes the pool (which may have changed) and repeats the process. Everyone watching is synchronized to the same part of the currently playing song, so we can talk about it in Discord as it plays.

At any time, any Discord user can add or remove things from the pool, add things to the front of the queue, skip the current playing song, or simply offer their opinion of the current song. The goal is to collaboratively create our very own MTV full of cool videos, as well as offering mechanisms for automatically skipping songs some of us aren't excited about.

When you visit the [main page](/), you will be shown What is **Now Playing**. This is simply the current playing song along with a thumbnail of the video, along with the most recent 20 songs that just played (in case you only caught the end and wanted to watch it again).

You can then click on [Up Next](/#queue) to see the full queue of upcoming songs, which might be hundreds of songs. If you want to see both **Now Playing** and **Up Next** at the same time, use the [Both](/#both) link. For fun stats about how many songs are in MTV or how many each user has provided, visit the [Stats](/#stats) page. If you just want to see the full pool of songs, go to [All](/#all).

## Discord Preparation {#discord}

These are some quick things to check before really digging into MTV.

### Set your Discord nickname {#nickname}

All interactions with MTV are done through the #mtv Discord channel, and your identity with the server is determined by your current Discord nickname. It is important that you set it and continue to use the same one while interacting with MTV.

### Give yourself a record label! {#label}

Every video you add to MTV will be associated to your nickname, but when it is displayed in MTV, it is shown instead as your record label, which is silly and fun. Let's say you wanted to your fake record label to be `Example Records`. You would accomplish this by typing this into the #mtv Discord channel:

    #mtv label Example Records

Congrats, you're now the owner of `Example Records`. This isn't set in stone, so feel free to change it up if you come up with a better one.

## Watching MTV {#watch}

To watch MTV, simply visit the [main page](/) and click on **Watch** at the top. It will ask for your Discord nickname and offer you a handful of choices. Type in your nickname exactly (case matters), choose some options, and hit the Watch button. If you want to watch anonymously, leave the nickname box empty. This will simply remove you from consideration when MTV chooses to "autoskip" (see **Autoskip** below).

Here's what the checkboxes mean:

* **SFW Only** - Force MTV to skip any videos flagged as `nsfw`. This forces this for everyone, so keep this in mind.
* **Show Ctrls** - Show the Youtube controls, such as the volume slider.
* **Hide Titles** - Do not show the title info in the bottom left at the start/end of videos.

## Giving Your Opinion {#opinion}

Alright, so you're finally watching MTV, congrats! Not only that, but this first song is fantastic! Or is it bad? Let's make it official. Type _one_ of these words (with nothing before or after it) into the #mtv channel:

    like
    meh
    bleh
    hate

It should reply with something like this:

> MTV: Playing **Some Artist** - **Some Title**  [`bill, 3m44s, 1 like (ted), 1 hate (rufus)`]

Your name will be listed in the appropriate category based on the opinion you chose. Here's what the ratings mean:

* **like** (or **love**) - This song is awesome.
* **meh** - I'm not really into this song, but I don't really mind it being on. Leave it on or skip it, up to you.
* **bleh** - I don't like this song, and I'd prefer to never watch it again. Please skip it.
* **hate** - I hate this song so much, and I'd love it to be skipped as often as possible.

This offers a simple vocabulary for us to hint at each other whether or not someone should skip it, _including the server_ (see **Autoskip** below)! For example, let's say you and one other person are watching MTV, and a song comes on that you don't have much of an opinion on (or maybe even like), but the other person says they `hate` it. If you want to be polite, you can simply type this (with nothing before or after it):

    skip

This will skip the video for everyone, so this goes both ways. Don't be rude and force skip things a bunch of people are currently enjoying. You can always just click on the video itself to pause this song until the next one plays, for example.

### Emojis {#emojis}

If you use certain Discord emojis in the #mtv channel (_anywhere in your text_), they will be interpreted as a specific opinion. These are subject to change, but here is a general list:

* **like** - `:heart:`, `:thumbsup:`, `:disguised_face:`, `:smiley_cat:`
* **meh&nbsp;** - `:neutral_face:`, `:rolling_eyes:`
* **bleh** - `:weary:`
* **hate** - `:thumbsdown:`, `:frowning:`, `:face_vomiting:`


## Autoskip {#autoskip}

When _everyone_ that is watching (_even if only one person is watching_) all dislikes the current song (`bleh` or `hate`), there's no real reason to keep the song going. This is where autoskip comes in, and is why **Watch** asks for your Discord nickname.

If the server detects that all _named_ watchers have a negative opinion of the current song, it will automatically perform a skip! This can happen multiple times in a row. This allows for people watching alone (or with like minded folks) to get exactly the MTV experience they're looking for. This autoskip is immediately applied after every opinion too, so if a new song comes on for you that you hate, there's no need to use `hate` and then `skip`. If you `hate` it and nobody else watching disagrees with you, the skip will immediately just happen for you.

If you want to watch MTV, but don't want to participate / interfere with Autoskip, simply watch "anonymously". You will still be able to give your opinion in the Discord channel, but only those that provided their nicknames will interact with Autoskip.

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

This is an advanced action! The `edit` action allows you to directly poke at the MTV database -- Please be extra careful with this! Use this to adjust songs that have too-long intros or outros, or have incorrect artist or title names, or have the wrong owner. Do not use this to adopt a song from YouTube when using the `trending` action; use `adopt` for that.
