(async () => {
    var streamer = null;
    var data = {};

    // Parse URL param
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Parse PUBG username
    if(urlParams.has('streamer')) {
        streamer = urlParams.get('streamer');
        data = await fetchStreamersonglistData(streamer);
        setData(data);
        setInterval(async () => {
            data = await fetchStreamersonglistData(streamer);
        }, 2*60*1000);
    } else {
        alert('Streamername muss gesetzt werden! (?streamer=<STREAMERNAME>)');
    }

    // Connect to chat
    const { chat } = new window.TwitchJs({channel: streamer});
    chat.connect().then(() => {
        chat.join(streamer);
    });

    const handleMessage = message => {
        if(message.event != 'PRIVMSG') {
            return;
        }

        // Show current title
        if(message.message.startsWith('!titel')) {
            const queueHolder = document.getElementById('queue');
            const titleHolder = document.getElementById('current');

            // Hide queue, show current title
            queueHolder.classList.add('animate__slideOutLeft');
            titleHolder.classList.remove('animate__slideOutLeft');
            titleHolder.classList.add('animate__slideInLeft');
            // Hide after 5 seconds
            setTimeout(() => {
                titleHolder.classList.remove('animate__slideInLeft');
                titleHolder.classList.add('animate__slideOutLeft');
                queueHolder.classList.remove('animate__slideOutLeft');
                queueHolder.classList.add('animate__slideInLeft');
            }, 5*1000);
        }
        
        // Show top 10
        if(message.message.startsWith('!top10')) {
            const topHolder = document.getElementById('top');

            // Hide queue, show current title
            topHolder.classList.remove('animate__slideOutRight');
            topHolder.classList.add('animate__slideInRight');
            // Hide after 10 seconds
            setTimeout(() => {
                topHolder.classList.remove('animate__slideInRight');
                topHolder.classList.add('animate__slideOutRight');
            }, 30*1000);
        }
        
        // Show songs
        if(message.message.startsWith('!songs')) {
            const songsHolder = document.getElementById('songs');

            // Hide queue, show current title
            songsHolder.classList.remove('animate__slideOutDown');
            songsHolder.classList.add('animate__slideInUp');
            // Hide after 10 seconds
            setTimeout(() => {
                songsHolder.classList.remove('animate__slideInUp');
                songsHolder.classList.add('animate__slideOutDown');
            }, 30*1000);
        }
        
        
    };

    // Listen for all events.
    chat.on(TwitchJs.Chat.Events.ALL, handleMessage);
})();

// Fetch streamersonglist API data
async function fetchStreamersonglistData(streamer) {
    const data = {
        queue: null,
        history: null,
        songs: null
    };

    // Fetch queue
    const queueUrl = `https://api.streamersonglist.com/v1/streamers/${streamer}/queue`;
    data.queue = await performFetch(queueUrl);

    // Fetch history
    const historyUrl = `https://api.streamersonglist.com/v1/streamers/${streamer}/playHistory`;
    data.history = await performFetch(historyUrl);

    // Fetch songs
    const songsUrl = `https://api.streamersonglist.com/v1/streamers/${streamer}/songs`;
    data.songs = await performFetch(songsUrl);

    return data;
}

async function performFetch(url) {
    let response = await fetch(url);
    if(response.ok) {
        let json = await response.json();
        return json;
    } else {
        alert("HTTP-Error: " + response.status);
        return false;
    }
}

function parseInteger(number) {
    if(typeof number == 'undefined') {
        return 0;
    }
    return parseInt(number.toLocaleString('de-DE'));
}

function setData(data) {
    let title = data.queue.list[0];
    setTitle(title);

    let queue = data.queue.list;
    setQueue(queue);

    let songs = data.songs.items;
    setSongs(songs);

    let top = songs.slice(0, songs.length-1).sort((a, b) => {
        return b.timesPlayed - a.timesPlayed;
    }).slice(0, 10);
    setTop(top);
}

function setTitle(element) {
    const artistHolder = document.getElementById('current-artist');
    const titleHolder = document.getElementById('current-title');
    if(element.song != null && typeof element.song == 'object') {
        artistHolder.innerText = element.song.artist;
        titleHolder.innerText = element.song.title;
    } else {
        if(element.nonlistSong != null) {
            titleHolder.innerHTML = element.nonlistSong;
        }
    }
}

function setQueue(queue) {
    const queueHolder = document.getElementById('queue');
    const list = document.createElement('ul');
    for(let i = 0; i < queue.length; i++) {
        const queueItem = queue[i];
        let html = '';
        if(queueItem.song != null && typeof queueItem.song == 'object') {
            html = `<li>
                            <span class="queue-artist">${queueItem.song.artist}</span>
                            <span class="queue-title">${queueItem.song.title}</span>
                            <span class="queue-requester">${queueItem.requests[0]?.name}</span>
                        </li>`;
                        
        } else {
            if(queueItem.nonlistSong != null) {
                html = `<li>
                                <span class="queue-artist"></span>
                                <span class="queue-title">${queueItem.nonlistSong}</span>
                                <span class="queue-requester">${queueItem.requests[0]?.name}</span>
                            </li>`;
            }
        }
        list.innerHTML += html;
    }
    queueHolder.append(list);
}

function setTop(top) {
    const topHolder = document.getElementById('top');
    const list = document.createElement('ul');
    for(let i = 0; i < top.length; i++) {
        const topItem = top[i];
        let html = '';
        html = `<li>
                    <span class="top-artist">${topItem.artist}</span>
                    <span class="top-title">${topItem.title}</span>
                    <span class="top-times-played">${topItem.timesPlayed}</span>
                </li>`;
        list.innerHTML += html;
    }
    topHolder.append(list);
}

function setSongs(songs) {
    const songsHolder = document.getElementById('songs');
    const list = document.createElement('ul');
    for(let i = 0; i < songs.length; i++) {
        const songItem = songs[i];
        let html = '';
        html = `<li>
                    <span class="song-artist">${songItem.artist}</span>
                    <span class="song-title">${songItem.title}</span>
                </li>`;
        list.innerHTML += html;
    }
    songsHolder.append(list);
}