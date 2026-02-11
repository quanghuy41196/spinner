import objAudio from "../assets/audio";

export const audioClickFunc = () => {
  const audio = new Audio(objAudio.click);
  audio.volume = 0.4;
  return audio;
};

export const audioLoopRoller = () => {
  const audio = new Audio(objAudio.loopRoller);
  audio.volume = 0.4;
  audio.playbackRate = 1;
  return audio;
};


export const audioWinnerFunc = () => {
  const audio = new Audio(objAudio.winner);
  audio.volume = 0.4;
  return audio;
};