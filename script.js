const timerCard = document.querySelector(".timer-card");
const timeDisplay = document.querySelector("#time-display");
const statusMessage = document.querySelector("#status-message");
const inputError = document.querySelector("#input-error");
const minutesInput = document.querySelector("#minutes-input");
const secondsInput = document.querySelector("#seconds-input");
const quickButtons = document.querySelectorAll(".quick-button");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const resetButton = document.querySelector("#reset-button");
const stopAlarmButton = document.querySelector("#stop-alarm-button");
const fullscreenButton = document.querySelector("#fullscreen-button");

let selectedSeconds = 5 * 60;
let remainingSeconds = selectedSeconds;
let timerId = null;
let endTime = null;
let audioContext = null;
let alarmOscillators = [];
let alarmEndTimeout = null;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateDisplay() {
  const formattedTime = formatTime(remainingSeconds);
  timeDisplay.textContent = formattedTime;
  timeDisplay.setAttribute("aria-label", `남은 시간 ${Math.floor(remainingSeconds / 60)}분 ${remainingSeconds % 60}초`);
  document.title = `${formattedTime} | 우리 반 수업 타이머`;
}

function setSettingsDisabled(disabled) {
  minutesInput.disabled = disabled;
  secondsInput.disabled = disabled;
  quickButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
  endTime = null;
}

function prepareAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (audioContext === null) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function stopAlarm() {
  alarmOscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch (error) {
      // 이미 재생이 끝난 소리는 다시 멈출 필요가 없습니다.
    }
  });
  alarmOscillators = [];

  if (alarmEndTimeout !== null) {
    clearTimeout(alarmEndTimeout);
    alarmEndTimeout = null;
  }

  stopAlarmButton.hidden = true;
}

function playAlarm() {
  prepareAudio();
  if (audioContext === null) return;

  stopAlarm();
  const startTime = audioContext.currentTime + 0.05;

  for (let index = 0; index < 3; index += 1) {
    const noteStart = startTime + index * 0.42;
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, noteStart);
    oscillator.frequency.linearRampToValueAtTime(880, noteStart + 0.16);
    volume.gain.setValueAtTime(0.0001, noteStart);
    volume.gain.exponentialRampToValueAtTime(0.22, noteStart + 0.025);
    volume.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);

    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.23);
    oscillator.addEventListener("ended", () => {
      alarmOscillators = alarmOscillators.filter((item) => item !== oscillator);
    });
    alarmOscillators.push(oscillator);
  }

  stopAlarmButton.hidden = false;
  alarmEndTimeout = setTimeout(() => {
    stopAlarmButton.hidden = true;
    alarmEndTimeout = null;
  }, 1500);
}

function finishTimer() {
  stopTimer();
  remainingSeconds = 0;
  updateDisplay();
  timerCard.classList.add("finished");
  statusMessage.textContent = "시간이 끝났습니다!";
  startButton.disabled = true;
  pauseButton.disabled = true;
  setSettingsDisabled(false);
  playAlarm();
}

function tick() {
  remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  updateDisplay();

  if (remainingSeconds === 0) {
    finishTimer();
  }
}

function readInputTime() {
  const minutes = Number(minutesInput.value);
  const seconds = Number(secondsInput.value);

  if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || minutes > 999 || seconds < 0 || seconds > 59) {
    inputError.textContent = "분은 0~999, 초는 0~59 사이의 정수로 입력해 주세요.";
    return null;
  }

  const totalSeconds = minutes * 60 + seconds;
  if (totalSeconds === 0) {
    inputError.textContent = "1초 이상의 시간을 입력해 주세요.";
    return null;
  }

  inputError.textContent = "";
  return totalSeconds;
}

function applyInputTime() {
  if (timerId !== null) return;

  const inputSeconds = readInputTime();
  if (inputSeconds === null) return;

  selectedSeconds = inputSeconds;
  remainingSeconds = selectedSeconds;
  timerCard.classList.remove("finished");
  stopAlarm();
  startButton.disabled = false;
  quickButtons.forEach((button) => button.classList.remove("active"));
  statusMessage.textContent = "준비되면 시작 버튼을 눌러 주세요.";
  updateDisplay();
}

quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.minutes);
    minutesInput.value = minutes;
    secondsInput.value = 0;
    selectedSeconds = minutes * 60;
    remainingSeconds = selectedSeconds;
    inputError.textContent = "";
    timerCard.classList.remove("finished");
    stopAlarm();
    startButton.disabled = false;
    statusMessage.textContent = "준비되면 시작 버튼을 눌러 주세요.";

    quickButtons.forEach((quickButton) => quickButton.classList.remove("active"));
    button.classList.add("active");
    updateDisplay();
  });
});

minutesInput.addEventListener("change", applyInputTime);
secondsInput.addEventListener("change", applyInputTime);

startButton.addEventListener("click", () => {
  if (timerId !== null) return;

  prepareAudio();
  stopAlarm();

  if (remainingSeconds === selectedSeconds) {
    const inputSeconds = readInputTime();
    if (inputSeconds === null) return;
    selectedSeconds = inputSeconds;
    remainingSeconds = inputSeconds;
  }

  timerCard.classList.remove("finished");
  statusMessage.textContent = "집중하는 시간이에요!";
  startButton.disabled = true;
  pauseButton.disabled = false;
  setSettingsDisabled(true);
  endTime = Date.now() + remainingSeconds * 1000;
  timerId = setInterval(tick, 250);
});

pauseButton.addEventListener("click", () => {
  tick();
  if (remainingSeconds === 0) return;
  stopTimer();
  statusMessage.textContent = "잠시 멈췄어요. 시작을 누르면 이어집니다.";
  startButton.disabled = false;
  pauseButton.disabled = true;
});

resetButton.addEventListener("click", () => {
  stopTimer();
  stopAlarm();
  remainingSeconds = selectedSeconds;
  timerCard.classList.remove("finished");
  statusMessage.textContent = "준비되면 시작 버튼을 눌러 주세요.";
  inputError.textContent = "";
  startButton.disabled = false;
  pauseButton.disabled = true;
  setSettingsDisabled(false);
  updateDisplay();
});

stopAlarmButton.addEventListener("click", stopAlarm);

fullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    statusMessage.textContent = "이 브라우저에서는 전체화면을 사용할 수 없습니다.";
  }
});

document.addEventListener("fullscreenchange", () => {
  fullscreenButton.textContent = document.fullscreenElement ? "전체화면 종료" : "전체화면";
});

updateDisplay();
