import Component from '@ember/component';
import { A } from '@ember/array';
import { set } from '@ember/object';
export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('transcript', A([]));
  },
  registerUserVideo(video) {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
          video.srcObject = stream;
        });
    }
  },
  registerVoice() {
    const speech =  window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new speech();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = this.updateTranscript.bind(this);
  },
  updateTranscript({ results }) {
    const last = results[results.length - 1];
    if (last.isFinal) {
      const message = last[0].transcript.trim().toLowerCase();
      set(this.transcript.lastObject,'message', message);
      set(this.transcript.lastObject,'isFinal', true);

      if (message == 'what are you wearing') {
        this.snapPic();
      }
    } else if (this.transcript.lastObject && !this.transcript.lastObject.isFinal) {
      const newMessage = this.transcript.lastObject.message + '.';
      set(this.transcript.lastObject,'message', newMessage);
    } else {
      this.transcript.pushObject({ message: '...', isFinal: false });
    }
  },
  snapPic() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const canvasOverlay = document.getElementById('canvas-overlay');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvasOverlay.classList.add("flash");
    context.drawImage(video, 0, 0);
  },
  didInsertElement() {
    this.registerVoice();
    this.registerUserVideo(document.getElementById('video'));

    const canvasOverlay = document.getElementById('canvas-overlay');
    canvasOverlay.addEventListener("animationend", () => {
        canvasOverlay.classList.remove("flash");
    });
  },
  actions: {
    click() {
      this.snapPic();
    }
  }
});
