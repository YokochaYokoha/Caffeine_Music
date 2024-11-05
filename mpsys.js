//////////////////////////////////////////////////////
//          Caffeine Music by YokochaYokoha         //
//              System Script Rev.1.0               //
//          Works by Y.Yokoha Studio Project        //
//              🄫2024 YokochaYokoha                //
//         Licensed under Y.Yokoha B License       //
/////////////////////////////////////////////////////
//コメントアウトには知っていること、知らなかったこと、更に無関係なこともメモしてあります♪

//Register Components/コンポーネント登録
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const folderInput = document.getElementById('folder-input');
const readfile = document.getElementById('file-input');
const readfolder = document.getElementById('folder-input');
const audioPlayer = document.getElementById('audio-player');
const playPauseButton = document.getElementById('play-pause-button');
const seekBar = document.getElementById('seek-bar');
const speedControl = document.getElementById('speed-control');
const timeInfo = document.getElementById('time0');
const timetotal=document.getElementById("time1");
const titlePlaceholder = document.getElementById('title');
const artistPlaceholder = document.getElementById('artist');
const albumPlaceholder = document.getElementById('album');
const albumArtPlaceholder = document.getElementById('album-art');
const lyricsDiv = document.getElementById('lyrics');
const playlistDiv = document.getElementById('playlist');
const spdcon=document.getElementById("spd");
const previousButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
//Variables/変数
let playlist = [];
let currentIndex = 0;
let isPlaying = false;

//Throw them 2 mediastore/メディアストアにパスします
readfile.addEventListener("change",()=>mstore(readfile.files));
readfolder.addEventListener("change",()=>mstore(readfolder.files));

//Show Drop-Div/ドロップを受け止めるdivを表示
//CSSのActiveクラス発動
document.addEventListener("dragenter",()=>
{
    dropArea.classList.add("active");
}
);

//Hide Drop-Div/ドロップ受け入れdivを隠す
// null→マウスが外にあるとnullを返すためです。
// ||→or  //dropA...rget))の前に"!"あり。これでTF入れ替え(Revert!)
//CSS class remove
document.addEventListener("dragleave",(event)=>
{
    if(event.relatedTarget===null||!dropArea.contains(event.relatedTarget))
    {
        dropArea.classList.remove("active");
    }
}
);

//Prevent&Disable default "Drag&Drop" function of Browsers/ブラウザーデフォルト動作を無効化
document.addEventListener("dragover",(event)=>
{
    event.preventDefault();
}
);

//Cope with Drop/ドロップへの対応

document.addEventListener("drop",(event)=>
{
    event.preventDefault();//ブラウザーデフォルト動作を無効化
    dropArea.classList.remove("active");//Hide Drop-Div
    const musicfiles=event.dataTransfer.items;//Gets files via Browser
    processtask(musicfiles);//Pass the files
}
);

//Retrieve Audio files in selected folder(s) and register files to the Playlist/オーディオファイルのみファイルから抽出し、プレイリスト化
async function processtask(musicfiles)
{
    playlist=[]; //Initalize!
    for(const items of musicfiles)//for文
    {
        const entry=items.webkitGetAsEntry();//エントリー(ファイルとフォルダー混合のオブジェクト)としてread
        if(entry)//Checks whether entry is empty or not
        {
            if(entry.isFile)
            {
                const afiles=await new Promise((res)=>entry.file(res));
                if(afiles.type.startsWith("audio/")) //distinguish Audio files by mime type
                {
                    playlist.push(afiles); //Add 2 Playlist!/プレイリスト登録処理
                }
            }
            else if (entry.isDirectory)
            {
                await readDir(entry);//Throw 2 Directory Extractor 
            }
        }
    }
    if(playlist.length>0)//Prevent unexpected No list Err/リストにファイルがない場合の予期せぬエラーを回避
    {
        currentIndex=0; //Init(Select:Track1)
        updateplaylistDSP();//Update playlist GUI/プレイリストGUIを更新
        loadAudio(playlist[currentIndex]);//Send "play signal" (Track1 is selected by default)/再生信号送信(一曲目から)
    }
}


//Directory Extractor/ディレクトリ展開
async function readDir(directoryEntry) //recieve await readDir(entry)'s "entry"& store it 2 directoryEntry
{
    const reader=directoryEntry.createReader(); //Prepare Dir Reader/ディレクトリ読み取り機能を準備
    const foldercontents=await new Promise((resolve)=>reader.readEntries(resolve));//Read contents in the folder
    for (const entry of foldercontents)
    {
        if(entry.isFile)// Same code
            {
                const afiles=await new Promise((res)=>entry.file(res));
                if(afiles.type.startsWith("audio/")) //distinguish Audio files by mime type
                {
                    playlist.push(afiles); //Add 2 Playlist!/プレイリスト登録処理
                }
            }
            else if (entry.isDirectory)
            {
                await readDir(entry);//帰納的に読む
            }
    }
}

//MediaStore register(Add2Playlist) /メディアストアの登録処理(プレイリストに入れる)
function mstore(files)
{
    playlist = Array.from(files).filter(file => file.type.startsWith('audio/'));//Extract only audio files,convert file list 2 Array(Playlist),then register
    if(playlist.length>0)
    {//same code
        currentIndex=0; //Init(Select:Track1)
        updateplaylistDSP();//Update playlist GUI/プレイリストGUIを更新
        loadAudio(playlist[currentIndex]);//Send "play signal" (Track1 is selected by default)/再生信号送信(一曲目から)  
    }

}

//Loads file! /ファイル読み込み!
function loadAudio(file)
{
    audioPlayer.src=URL.createObjectURL(file);//URL化してCore(Audioタグのエレメント)に送信
    audioPlayer.load();//読ませる
    DSPmetadata(file);//Retrieve Metadata
    audioPlayer.play();
    isPlaying=true;//Switch the status!
    playPauseButton.src="pause.png";//ボタン追従
}

//Retrieve MetaData Powered by jsmediatags!(Thanks a lot!!)/メタデータ抽出 by jsmediatags(誠にありがとうございます!!)
function DSPmetadata(file)
{
    jsmediatags.read(file,//ここからjsmediatags専用独自動作(コメントアウト説明省略)[jsmediatags dedicated function]
        {
            onSuccess: (tag)=>
                {
                    const { title, artist, album, picture } = tag.tags;
                    titlePlaceholder.textContent = title || "Music(タイトル情報不明)";
                    artistPlaceholder.textContent = artist || "アーティスト名不明";
                    albumPlaceholder.textContent = album || "アルバム名不明";
                    if (picture) 
                        {
                        const base64String = btoa(new Uint8Array(picture.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                        albumArtPlaceholder.src = `data:${picture.format};base64,${base64String}`;
                    } 
                    else 
                    {
                        albumArtPlaceholder.src = "art.png";
                    }
                    updateBackground(picture);
                    initsys();
                },
                onError: (error) => 
                    {
                    console.error("Failed to Retrieve Metadata in the file/メタデータ読み取り失敗(エラーハンドラー):", error);
                    titlePlaceholder.textContent =  "Music";
                    artistPlaceholder.textContent = "アーティスト名不明";
                    albumPlaceholder.textContent = "アルバム名不明";
                    updateBackground(null);
                }
                }
        

    );
}

//Update Playlist GUI/プレイリストGUIの作成と更新
function updateplaylistDSP() 
{
    playlistDiv.innerHTML = "";
    playlist.forEach((file, index) => {//ここから
        const item = document.createElement('div');
        item.className = 'marks-r-o';//CaffeineCSS Rev3.0 Text 2 Marks Div
        item.innerHTML = `<img src="music.png" alt="曲" style="width:20px;"><p><span>${file.name}</span></p>`;
        
        item.addEventListener('click', () => {//曲を指定して再生
            currentIndex = index;
            loadAudio(file);
        });

        playlistDiv.appendChild(item);

    });//ここまで
}

//Button Event Handlers
//イベントハンドラ追加
playPauseButton.addEventListener('click', () => 
    {
    if (audioPlayer.paused) {
        audioPlayer.play();
        isPlaying = true;//rewrite
        playPauseButton.src = "pause.png";//Stop mark
    } else {
        audioPlayer.pause();
        isPlaying = false;//rw
        playPauseButton.src = "play.png";//start mark!
    }
});

//Refrect progress(sync)
//シークバーと同期
     //Manual move追従
seekBar.addEventListener("input",()=>
{
    audioPlayer.currentTime=seekBar.value;
}
);

//Show current Track time
//現在のトラックの時間を表示
 audioPlayer.addEventListener('timeupdate', () => 
    {
 seekBar.max = audioPlayer.duration;
 seekBar.value = audioPlayer.currentTime;
 timeInfo.innerText = mktime(audioPlayer.currentTime) ;
 timetotal.innerText=mktime(audioPlayer.duration);
    });

//SpeedControler Tracking
//スピードコントローラー追従
    speedControl.addEventListener('input', () => {
        audioPlayer.playbackRate = speedControl.value;
        spdcon.innerText="Speed:"+speedControl.value+"x";
    });

//Procedure of making well-known time display(min:sec format)
//よく見かける分:秒表示生成手続き
function mktime(sec)
{
const min=Math.floor(sec/60);//秒を60で割って小数点切り捨て=>分数のみ取得
const sc=Math.floor(sec%60);//先ほどの計算の余りを取得=>ex: 90/60=1...30 30秒です。これも小数点切り捨て
return `${min}:${sc < 10 ? "0" : ""}${sc}`;//返り値 分:(10秒未満の秒数なら先頭に0付加。そうでなければ何もつけない)+秒
}

//Move 2 next Track
//次のトラックへ
audioPlayer.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % playlist.length;// 2/10だと 0...2。よって2となり3曲目が流されます。(1曲目は配列0)
    loadAudioFile(playlist[currentIndex]);
});

//Broadcast Media info 2 Client OS via Browser
//ブラウザー経由でユーザーのOSへ楽曲情報伝達
//Omit comments.. a little bit cumbersome...
function initsys()
{
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: titlePlaceholder.textContent,
            artist: artistPlaceholder.textContent,
            album: albumPlaceholder.textContent,
            artwork: [
                { src: albumArtPlaceholder.src, sizes: '96x96', type: 'image/png' },
                { src: albumArtPlaceholder.src, sizes: '128x128', type: 'image/png' },
                { src: albumArtPlaceholder.src, sizes: '192x192', type: 'image/png' },
                { src: albumArtPlaceholder.src, sizes: '256x256', type: 'image/png' },
                { src: albumArtPlaceholder.src, sizes: '384x384', type: 'image/png' },
                { src: albumArtPlaceholder.src, sizes: '512x512', type: 'image/png' },
            ]
        });
    
        navigator.mediaSession.setActionHandler('play', () => {
            audioPlayer.play();
            playPauseButton.src = "pause.png";
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            audioPlayer.pause();
            playPauseButton.src = "play.png";
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            loadAudioFile(playlist[currentIndex]);
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            currentIndex = (currentIndex + 1) % playlist.length;
            loadAudioFile(playlist[currentIndex]);
        });
    }
}

//Set Wallpaper(Change Background img)
//壁紙設定
function updateBackground(picture) {
    const body = document.body;
    
    if (picture) {

        const base64String = btoa(new Uint8Array(picture.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const imageUrl = `data:${picture.format};base64,${base64String}`;
        body.style.backgroundImage = `url(${imageUrl})`;
        body.style.backgroundPosition = 'center';     
        body.style.backgroundSize = 'cover';          
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundAttachment = 'fixed';    
        body.style.backdropFilter = 'blur(10px)';     
    } else {
        body.style.backgroundImage = ''; 
        body.style.backdropFilter = 'none';
        body.style.backgroundAttachment = ''; 
    }
}

//Back 2 previous Music
//前の音楽へ
previousButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; 
    loadAudio(playlist[currentIndex]);
});

//Move 2 next Music
//次の音楽へ
nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadAudio(playlist[currentIndex]);
});

//THE END OF THE CODE! I'M EXTREMELY TIRED!!! MY EYES NEED A REST! BUT,I'M GLAD TO RELEASE THIS SERVICE! やったぁ!(あれ、大文字で打ってた..)
//by Y.Yokoha 2024/11/05(Tue) UTC+9(JST)19:45 