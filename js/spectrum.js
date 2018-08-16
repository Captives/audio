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

Spectrum.prototype.listen = function (analyser) {
    this.analyser = analyser;
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
            that.ctx.fillRect(oW / 2 + (i * 10), oH / 2, 7, -audioHeight);//右上
            that.ctx.fillRect(oW / 2 - (i * 10), oH / 2, 7, -audioHeight);//左上
            that.ctx.fillStyle = color2;  // 绘制向下的线条
            that.ctx.fillRect(oW / 2 + (i * 10), oH / 2, 7, audioHeight);//右下
            that.ctx.fillRect(oW / 2 - (i * 10), oH / 2, 7, audioHeight);//左下
        }
        window.requestAnimationFrame(draw);
    }
    draw();
};


Spectrum.prototype.style2 = function () {
    var that = this;
    var oW = that.canvas.width;
    var oH = that.canvas.height;

    var gradient = that.ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(1, '#0f0');
    gradient.addColorStop(0.5, '#ff0');
    gradient.addColorStop(0, '#f00');
    function draw() {
        // 缓冲区:进行数据的缓冲处理，转换成二进制数据
        var voiceHeight = new Uint8Array(that.analyser.frequencyBinCount);

        // 将当前的频率数据复制到传入的无符号字节数组中，做到实时连接
        that.analyser.getByteFrequencyData(voiceHeight);
        console.log(voiceHeight.length, oW, oH);
        that.ctx.clearRect(0, 0, oW, oH);
        for (var i = 0; i < voiceHeight.length; i++) {
            var audioHeight = voiceHeight[i];
            that.ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
            //context.fillRect(x,y,width,height);
            that.ctx.fillRect(oW/voiceHeight.length * i + 12, oH - audioHeight, 10, audioHeight); //the meter
        }
        window.requestAnimationFrame(draw);
    }
    draw();
};