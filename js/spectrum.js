/**
 * Created by Administrator on 2018/8/16.
 * https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
 */

function Spectrum(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
}

Spectrum.prototype.listen = function (audioContext, audioSrc) {
    // 创建媒体源,除了audio本身可以获取，也可以通过oCtx对象提供的api进行媒体源操作
    // this.audioSrc = audioContext.createMediaElementSource(stream);
    this.audioSrc = audioSrc;
    // 创建分析机
    this.analyser = audioContext.createAnalyser();
    // 媒体源与分析机连接
    this.audioSrc.connect(this.analyser);

    // 输出的目标：将分析机分析出来的处理结果与目标点（耳机/扬声器）连接
    this.analyser.connect(audioContext.destination);
};

Spectrum.prototype.style1 = function () {
    var that = this;
    var oW = that.canvas.width;
    var oH = that.canvas.height;

    var color1 = this.ctx.createLinearGradient(oW / 2, oH / 2 - 30, oW / 2, oH / 2 - 100);
    var color2 = this.ctx.createLinearGradient(oW / 2, oH / 2 + 30, oW / 2, oH / 2 + 100);
    color1.addColorStop(0, '#44BFA3');
    // color1.addColorStop(.5, '#F8FFAE');
    color1.addColorStop(1, '#f6f');

    color2.addColorStop(0, '#44BFA3');
    // color2.addColorStop(.5, '#F8FFAE');
    color2.addColorStop(1, '#f6f');
    // 音频图的条数
    var count = 150;
    // 缓冲区:进行数据的缓冲处理，转换成二进制数据
    var voiceHeight = new Uint8Array(this.analyser.frequencyBinCount);
    // console.log(voiceHeight);
    function draw() {
        // 将当前的频率数据复制到传入的无符号字节数组中，做到实时连接
        that.analyser.getByteFrequencyData(voiceHeight);
        // console.log(voiceHeight);
        // 自定义获取数组里边数据的频步
        var step = Math.round(voiceHeight.length / count);
        that.ctx.clearRect(0, 0, oW, oH);
        for (var i = 0; i < count; i++) {
            var audioHeight = voiceHeight[step * i] * 1.5;
            that.ctx.fillStyle = color1;  // 绘制向上的线条
            that.ctx.fillRect(oW / 2 + (i * 10), oH / 2, 7, -audioHeight);
            that.ctx.fillRect(oW / 2 - (i * 10), oH / 2, 7, -audioHeight);
            that.ctx.fillStyle = color2;  // 绘制向下的线条
            that.ctx.fillRect(oW / 2 + (i * 10), oH / 2, 7, audioHeight);
            that.ctx.fillRect(oW / 2 - (i * 10), oH / 2, 7, audioHeight);
        }
        window.requestAnimationFrame(draw);
    }
    draw();
};