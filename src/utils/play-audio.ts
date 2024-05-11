export function playAudio(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audioEl = document.createElement("audio");
    audioEl.src = src;
    audioEl.autoplay = true;
    audioEl.style.display = "none";
    audioEl.onended = () => {
      document.body.removeChild(audioEl);
      resolve(true);
    };
    document.body.appendChild(audioEl);
  });
}
