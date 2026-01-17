export class AudioEngine {
  constructor(src) {
    this.audio = new Audio(src);
    this.audio.crossOrigin = "anonymous";

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.ctx.createMediaElementSource(this.audio);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.source.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.data = new Uint8Array(this.analyser.frequencyBinCount);
  }

  play() {
    this.audio.play();
    this.ctx.resume();
  }

  pause() {
    this.audio.pause();
  }

  seek(pos) {
    this.audio.currentTime = pos;
  }

  getWaveformData() {
    this.analyser.getByteTimeDomainData(this.data);
    return this.data;
  }

  get duration() {
    return this.audio.duration || 0;
  }

  get current() {
    return this.audio.currentTime || 0;
  }

  set onend(cb) {
    this.audio.onended = cb;
  }
}
