const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')



const app = {
    currentIndex: 0,
    isPlaying:  false,
    isRandom:false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name:'Cầu Hôn',
            singer:' Văn Mai Hương',
            image:' ./assets/img/huong.jpg',
            path:'./assets/music/CauHon-VanMaiHuong-5849944.mp3'
        },
        {
            name:'Vì Mẹ Anh Bắt Chia Tay',
            singer:' Karik & Miu Lê',
            image:' ./assets/img/karik.jpg',
            path:'./assets/music/ViMeAnhBatChiaTay-MiuLe-7503053.mp3'
        },
        {
            name:'Thương Em Là Điều Anh Không Thể Ngờ',
            singer:' Noo Phước Thịnh',
            image:' ./assets/img/noo.jpg',
            path:'./assets/music/ThuongEmLaDieuAnhKhongTheNgo-NooPhuocThinh-5827347.mp3'
        },
        {
            name:'Still Life',
            singer:' BigBang',
            image:' ./assets/img/bigbag.jpeg',
            path:'./assets/music/StillLife-BIGBANG-7182115.mp3'
        }
    ],
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))

    },
    render: function(){
        const htmls = this.songs.map((song, index)=>{
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
            </div>
            <div class="option">
            <i class="fas fa-ellipsis-h"></i>
            </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('\n')

    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function(){
        const _this =this
        const cdWidth = cd.offsetWidth

        // xu ly cd quay / dung
        const cdThumbAnimate = cdThumb.animate([
            {transform: ' rotate(360deg)'}
        ],{
            duration: 10000,//10s
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //  xử lý phóng to/ thu nhỏ CD
        document.onscroll = function(){
            const scrollTop= window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause()
            }else{  
                audio.play()
            }

        }
        // khi song dk play
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        //khi song bi pause
        audio.onpause= function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()

        }

        //khi tien do song thay doi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent

            }
        }
        // xu ly khi tua song
        progress.onchange = function(e){
            const seekTime = audio.duration / 100 *  e.target.value
            audio.currentTime = seekTime
        }
        
        //khi next song
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }

        // random
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        // xu ly repeat
        repeatBtn.onclick = function(e) {
            _this.isRepeat = ! this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)

        }


        // xu ly next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            } else{
                nextBtn.click()
            }

        }
        // lang nghe click vafo playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            //xu ly khi click vao song
            if(songNode || e.target.closest('.option')
            ){
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()

                }
                if(e.target.closest('.option')){

                }

            }

        }

    },
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block:'nearest',
            })
        }, 300)
    },
   loadCurrentSong: function(){
    
       heading.textContent = this.currentSong.name
       cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
       audio.src = this.currentSong.path

   },
   loadConfig: function(){
       this.isRandom = this.config.isRandom
       this.isRepeat = this.config.isRepeat


   },
   nextSong: function(){
       this.currentIndex++
       if(this.currentIndex >= this.songs.length ){
           this.currentIndex = 0
         }
        this.loadCurrentSong()
   },
   prevSong: function(){
          this.currentIndex--
          if(this.currentIndex < 0){
              this.currentIndex = this.songs.length - 1
           }
          this.loadCurrentSong()
    },
    playRandomSong: function()  {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex == this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()

    },
     
  

    start: function(){
        //gan cau hinh tu config vao app
        this.loadConfig()

        //dn các thuộc tính cho object
        this.defineProperties()

        //lắng nghe /  xử lý các sự kiện(DOM events)
        this.handleEvents()

        //tải thông tin bài hát đầu tiên khi vào UI khi ứng dụng đang chạy
        this.loadCurrentSong()

        // render lại các ds bài hát
        this.render()

        //hien thi trasng thai ban dau cuar btn repeat &random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)



    }
}
app.start()

