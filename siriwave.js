/*

SiriWave JS
Have you ever thought on how to get the Siri wave effect on your website or mobile app? SiriWaveJS is a library that easily allows you to get this effect.

https://github.com/CaffeinaLab/SiriWaveJS

*/

function SiriWave(opt){
	this.opt = opt || {};

	this.K = 2;
	this.K2 = 2*this.K;
	this.K4 = 2*this.K2;
        this.K_K2 = this.K / this.K2;
	this.F = 6;
	this.phase = 0;

	this.speed = opt.speed || 0.1;
	this.noise = opt.noise || 1;

	this.color = (function hex2rgb(hex){
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m,r,g,b) { return r + r + g + g + b + b; });
    		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ?
		parseInt(result[1],16).toString()+','+parseInt(result[2], 16).toString()+','+parseInt(result[3], 16).toString()
		: null;
	})(opt.color || '#fff') || '255,255,255';

	var ratio = opt.ratio ? opt.ratio : ( window.devicePixelRatio ? window.devicePixelRatio : 1 );
	this.width = ratio * (this.opt.width || 320);
	this.height = ratio * (this.opt.height || 100);
	this.height_2 = this.height/2;
	this.MAX = (this.height_2)-4;
	this.PI64 = Math.PI*64;
  
        this.width_K2 = this.width/this.K2;
        this.width_K_K2 = this.width*this.K_K2;

	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.canvas.style.width = (this.width/ratio)+'px';
	this.canvas.style.height = (this.height/ratio)+'px';

	(this.opt.container || document.body).appendChild(this.canvas);
	this.ctx = this.canvas.getContext('2d');

	this.run = false;
  
	// Memoize globalAttenuationFn
	this._globalAttenuationFn = function(x) {
	   this._GATF_cache = this._GATF_cache || {};
	   if (!this._GATF_cache[x]) {
	       var result = Math.pow(this.K4/(this.K4+x*x*x*x),this.K2);
	       this._GATF_cache[x] = result;
	   }
	   return this._GATF_cache[x];
	};
	
	// Memoize XPOS
	this._xpos = function(i) {
	   this._XPOS_cache = this._XPOS_cache || {};
	   if (!this._XPOS_cache[i]) {
	       var result = this.width_K_K2 + i*this.width_K2;
	       this._XPOS_cache[i] = result;
	   }
	   return this._XPOS_cache[i];
	};
  
}

SiriWave.prototype = {

	_drawLine: function(attenuation, color, width){
		this.ctx.moveTo(0,0);
		this.ctx.beginPath();
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = width || 1;
		var noise_attenuation = this.noise/attenuation;
		var i=-this.K-0.01;
		while ((i+=0.01)<=this.K) this.ctx.lineTo(
		  this._xpos(i),
		  this.height_2 + this._globalAttenuationFn(i) * noise_attenuation * Math.sin(this.F*i-this.phase)
		);
		this.ctx.stroke();
	},

	_clear: function(){
		this.ctx.globalCompositeOperation = 'destination-out';
		this.ctx.fillRect(0, 0, this.width, this.height);
		this.ctx.globalCompositeOperation = 'source-over';
	},

	_draw: function(){
		if (!this.run) return;

		this.phase = (this.phase+this.speed)%(this.PI64);
		this._clear();
		this._drawLine(-2, 'rgba('+this.color+',0.1)');
		this._drawLine(-6, 'rgba('+this.color+',0.2)');
		this._drawLine(4, 'rgba('+this.color+',0.4)');
		this._drawLine(2, 'rgba('+this.color+',0.6)');
		this._drawLine(1, 'rgba('+this.color+',1)', 1.5);

		window.requestAnimationFrame(this._draw.bind(this), 1000);
	},

	start: function(){
		this.phase = 0;
		this.run = true;
		this._draw();
	},

	stop: function(){
		this.speed = 0;
		this.phase = 0;
		this.noise = 0;
		this.run = false;
	},

	setNoise: function(v){
		this.noise = Math.min(v, 1)*this.MAX;
	},

	setSpeed: function(v){
		this.speed = v;
	},

	set: function(noise, speed) {
		this.setNoise(noise);
		this.setSpeed(speed);
	}

};
