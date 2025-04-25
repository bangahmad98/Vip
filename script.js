const adzanSounds = {
  Shubuh: new Audio("adzan-subuh.mp3"),
  Default: new Audio("adzan.mp3"),
};

let notifBeforeMinutes = 5;

document.getElementById("notifTime").addEventListener("input", (e) => {
  notifBeforeMinutes = parseInt(e.target.value) || 0;
});

async function getPrayerTimes(lat, lon) {
  const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
  const data = await res.json();
  return data.data.timings;
}

function updateCountdown(nextTime, name) {
  const now = new Date();
  const timeDiff = nextTime - now;
  if (timeDiff <= 0) return;

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const mins = Math.floor((timeDiff / (1000 * 60)) % 60);
  const secs = Math.floor((timeDiff / 1000) % 60);
  document.getElementById("countdown").textContent =
    `Menuju ${name}: ${hours}j ${mins}m ${secs}d`;
}

function playAdzan(name) {
  const audio = name === "Shubuh" ? adzanSounds.Shubuh : adzanSounds.Default;
  audio.play().catch(() => {});
}

function notify(name) {
  if (Notification.permission === "granted") {
    new Notification(`Waktunya ${name}`);
  }
  playAdzan(name);
}

async function setup() {
  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const times = await getPrayerTimes(latitude, longitude);

    const schedule = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const names = ["Shubuh", "Dhuhur", "Ashar", "Maghrib", "Isya"];
    const prayerDates = [];

    schedule.forEach((key, i) => {
      const timeStr = times[key];
      const [hour, min] = timeStr.split(":").map(Number);
      const now = new Date();
      const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, min);
      prayerDates.push({ name: names[i], time: prayerTime });
      document.getElementById(names[i].toLowerCase()).textContent = `${names[i]}: ${prayerTime.getHours().toString().padStart(2, '0')}:${prayerTime.getMinutes().toString().padStart(2, '0')}`;
    });

    setInterval(() => {
      const now = new Date();
      const nextPrayer = prayerDates.find(p => p.time > now);
      if (nextPrayer) {
        updateCountdown(nextPrayer.time, nextPrayer.name);
        const diff = (nextPrayer.time - now) / 60000;
        if (Math.abs(diff - notifBeforeMinutes) < 0.1) {
          notify(`segera ${nextPrayer.name}`);
        }
        if (Math.abs(diff) < 0.1) {
          notify(nextPrayer.name);
        }
      }
    }, 1000);
  });
}

setup();