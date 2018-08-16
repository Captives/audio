function start() {
    document.removeEventListener('click', start);
    document.removeEventListener('touchend', start);

    //AudioContext接口表示由音频模块连接而成的音频处理图，每个模块对应一个AudioNode。
    //AudioContext可以控制它所包含的节点的创建，以及音频处理、解码操作的执行。
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();

    // 媒体源
    var mediaElement = document.querySelector('audio');
    //创建媒体源,除了audio本身可以获取，也可以通过audioContext对象提供的api进行媒体源操作
    var source = audioContext.createMediaElementSource(mediaElement);

    // 创建分析机
    var analyser = audioContext.createAnalyser();
    // 媒体源与分析机连接
    source.connect(analyser);
    // 输出的目标：将分析机分析出来的处理结果与目标点（耳机/扬声器）连接
    analyser.connect(audioContext.destination);

    //频谱
    var spectrum = new Spectrum(document.querySelector('#canvas'));
    spectrum.listen(analyser);
    spectrum.style1();

    // 创建一个BiquadFilterNode，它代表一个双二阶滤波器，
    // 可以设置几种不同且常见滤波器类型：高通、低通、带通等。
    var highShelf = audioContext.createBiquadFilter();
    var lowShelf = audioContext.createBiquadFilter();
    var highPass = audioContext.createBiquadFilter();
    var lowPass = audioContext.createBiquadFilter();
    let controlSet = {
        highShelf,
        lowShelf,
        highPass,
        lowPass
    };

    source.connect(highShelf);
    highShelf.connect(lowShelf);
    lowShelf.connect(highPass);
    highPass.connect(lowPass);
    //audioContext.destination, 表示当前audio context中所有节点的最终节点，一般表示音频渲染设备。
    lowPass.connect(audioContext.destination);

    highShelf.type = "highshelf";
    highShelf.frequency.value = 4700;
    highShelf.gain.value = 50;

    lowShelf.type = "lowshelf";
    lowShelf.frequency.value = 35;
    lowShelf.gain.value = 50;

    highPass.type = "highpass";
    highPass.frequency.value = 800;
    highPass.Q.value = 0.7;

    lowPass.type = "lowpass";
    lowPass.frequency.value = 880;
    lowPass.Q.value = 0.7;

    var ranges = document.querySelectorAll('input[type=range]');
    ranges.forEach(function (range) {
        range.addEventListener('input', function () {
            controlSet[this.dataset.filter][this.dataset.param].value = this.value;
        });
    });
}

document.addEventListener('click', start);
document.addEventListener('touchend', start);


var audioPlayer = document.querySelector('.green-audio-player');
var playPause = audioPlayer.querySelector('#playPause');
var playpauseBtn = audioPlayer.querySelector('.play-pause-btn');
var loading = audioPlayer.querySelector('.loading');
var progress = audioPlayer.querySelector('.progress');
var sliders = audioPlayer.querySelectorAll('.slider');
var volumeBtn = audioPlayer.querySelector('.volume-btn');
var volumeControls = audioPlayer.querySelector('.volume-controls');
var volumeProgress = volumeControls.querySelector('.slider .progress');
var player = audioPlayer.querySelector('audio');
var currentTime = audioPlayer.querySelector('.current-time');
var totalTime = audioPlayer.querySelector('.total-time');
var speaker = audioPlayer.querySelector('#speaker');

var draggableClasses = ['pin'];
var currentlyDragged = null;

window.addEventListener('mousedown', function (event) {

    if (!isDraggable(event.target)) return false;

    currentlyDragged = event.target;
    var handleMethod = currentlyDragged.dataset.method;

    this.addEventListener('mousemove', window[handleMethod], false);

    window.addEventListener('mouseup', function () {
        currentlyDragged = false;
        window.removeEventListener('mousemove', window[handleMethod], false);
    }, false);
});

playpauseBtn.addEventListener('click', togglePlay);
player.addEventListener('timeupdate', updateProgress);
player.addEventListener('volumechange', updateVolume);
player.addEventListener('loadedmetadata', function () {
    totalTime.textContent = formatTime(player.duration);
});
player.addEventListener('canplay', makePlay);
player.addEventListener('ended', function () {
    playPause.attributes.d.value = "M18 12L0 24V0";
    player.currentTime = 0;
});

volumeBtn.addEventListener('click', function () {
    volumeBtn.classList.toggle('open');
    volumeControls.classList.toggle('hidden');
});

window.addEventListener('resize', directionAware);

sliders.forEach(function (slider) {
    var pin = slider.querySelector('.pin');
    slider.addEventListener('click', window[pin.dataset.method]);
});

directionAware();

function isDraggable(el) {
    var canDrag = false;
    var classes = Array.from(el.classList);
    draggableClasses.forEach(function (draggable) {
        if (classes.indexOf(draggable) !== -1)
            canDrag = true;
    });
    return canDrag;
}

function inRange(event) {
    var rangeBox = getRangeBox(event);
    var rect = rangeBox.getBoundingClientRect();
    var direction = rangeBox.dataset.direction;
    if (direction == 'horizontal') {
        var min = rangeBox.offsetLeft;
        var max = min + rangeBox.offsetWidth;
        if (event.clientX < min || event.clientX > max) return false;
    } else {
        var min = rect.top;
        var max = min + rangeBox.offsetHeight;
        if (event.clientY < min || event.clientY > max) return false;
    }
    return true;
}

function updateProgress() {
    var current = player.currentTime;
    var percent = current / player.duration * 100;
    progress.style.width = percent + '%';

    currentTime.textContent = formatTime(current);
}

function updateVolume() {
    volumeProgress.style.height = player.volume * 100 + '%';
    if (player.volume >= 0.5) {
        speaker.attributes.d.value = 'M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';
    } else if (player.volume < 0.5 && player.volume > 0.05) {
        speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
    } else if (player.volume <= 0.05) {
        speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667';
    }
}

function getRangeBox(event) {
    var rangeBox = event.target;
    var el = currentlyDragged;
    if (event.type == 'click' && isDraggable(event.target)) {
        rangeBox = event.target.parentElement.parentElement;
    }
    if (event.type == 'mousemove') {
        rangeBox = el.parentElement.parentElement;
    }
    return rangeBox;
}

function getCoefficient(event) {
    var slider = getRangeBox(event);
    var rect = slider.getBoundingClientRect();
    var K = 0;
    if (slider.dataset.direction == 'horizontal') {

        var offsetX = event.clientX - slider.offsetLeft;
        var width = slider.clientWidth;
        K = offsetX / width;

    } else if (slider.dataset.direction == 'vertical') {

        var height = slider.clientHeight;
        var offsetY = event.clientY - rect.top;
        K = 1 - offsetY / height;

    }
    return K;
}

function rewind(event) {
    if (inRange(event)) {
        player.currentTime = player.duration * getCoefficient(event);
    }
}

function changeVolume(event) {
    if (inRange(event)) {
        player.volume = getCoefficient(event);
    }
}

function formatTime(time) {
    var min = Math.floor(time / 60);
    var sec = Math.floor(time % 60);
    return min + ':' + (sec < 10 ? '0' + sec : sec);
}

function togglePlay() {
    if (player.paused) {
        playPause.attributes.d.value = "M0 0h6v24H0zM12 0h6v24h-6z";
        player.play();
    } else {
        playPause.attributes.d.value = "M18 12L0 24V0";
        player.pause();
    }
}

function makePlay() {
    playpauseBtn.style.display = 'block';
    loading.style.display = 'none';
}

function directionAware() {
    if (window.innerHeight < 250) {
        volumeControls.style.bottom = '-54px';
        volumeControls.style.left = '54px';
    } else if (audioPlayer.offsetTop < 154) {
        volumeControls.style.bottom = '-164px';
        volumeControls.style.left = '-3px';
    } else {
        volumeControls.style.bottom = '52px';
        volumeControls.style.left = '-3px';
    }
}

var list = document.querySelectorAll('.audio-btn') || [];
list.forEach(function (item) {
    item.onclick = function (event) {
        console.log(event.target.dataset.value);
        var audio  = document.querySelector('audio');
        audio.src = event.target.dataset.value;
        audio.autoplay = true;
        audio.onplay = function (e) {
            audio.play();
        };

        audio.onplaying = function (e) {
            playPause.attributes.d.value = "M0 0h6v24H0zM12 0h6v24h-6z";
        };

        audio.onpause = function (e) {
            playPause.attributes.d.value = "M18 12L0 24V0";
        };

        audio.onended = function (e) {
            playPause.attributes.d.value = "M0 0h6v24H0zM12 0h6v24h-6z";
        };

        audio.onerror = function (e) {

        };
    };
});