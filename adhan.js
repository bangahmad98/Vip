const jadwalSholat = {};
let countdown = document.getElementById('countdown');
let jadwalDiv = document.getElementById('jadwal');
let offsetInput = document.getElementById('offsetInput');
let namaSholat = '';
let waktuBerikutnya = null;
let audio = new Audio();
audio.loop = false;

function tampilkanJadwal(jadwal) {
  jadwalDiv.innerHTML = '';
  for (const [key, value] of Object.entries(jadwal)) {
    const p = document.createElement('p');
    p.textContent = `${key}: ${value}`;
    jadwalDiv.appendChild(p);
  }
}

function updateCountdown() {
  const now = new Date();
  const offset = parseInt(offsetInput.value) || 0;
  for (let [nama, jam] of Object.entries(jadwalSholat)) {
    const [h, m] = jam.split(":");
    const waktu = new Date(now);
    waktu.setHours(parseInt(h), parseInt(m), 0, 0);
    const waktuNotifikasi = new Date(waktu - offset * 60000);

    if (waktuNotifikasi > now) {
      waktuBerikutnya = waktu;
      namaSholat = nama;
      const selisih = new Date(waktuNotifikasi - now);
      const jamSisa = Math.floor(selisih / (1000 * 60 * 60));
      const menit = Math.floor((selisih / (1000 * 60)) % 60);
      const detik = Math.floor((selisih / 1000) % 60);
      countdown.textContent = `Menuju ${nama} (notifikasi ${offset} menit sebelumnya): ${jamSisa}j ${menit}m ${detik}d`;
      break;
    }
  }
}

function cekAdzan() {
  if (!waktuBerikutnya) return;
  const now = new Date();
  const offset = parseInt(offsetInput.value) || 0;
  const selisih = waktuBerikutnya - now;
  if (selisih <= offset * 60000 + 1000 && selisih > offset * 60000 - 1000) {
    if (namaSholat === "Shubuh") {
      audio.src = "adzan-subuh.mp3";
    } else {
      audio.src = "adzan-biasa.mp3";
    }
    audio.play();
    new Notification(`Waktunya sholat ${namaSholat}`);
  }
}

function requestNotif() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function getJadwal(lat, lon) {
  const today = new Date();
  const url = `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}?latitude=${lat}&longitude=${lon}&method=2`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const waktu = data.data.timings;
      jadwalSholat.Shubuh = waktu.Fajr.substring(0,5);
      jadwalSholat.Dhuhur = waktu.Dhuhr.substring(0,5);
      jadwalSholat.Ashar = waktu.Asr.substring(0,5);
      jadwalSholat.Maghrib = waktu.Maghrib.substring(0,5);
      jadwalSholat.Isya = waktu.Isha.substring(0,5);
      tampilkanJadwal(jadwalSholat);
    });
}

requestNotif();
navigator.geolocation.getCurrentPosition(pos => {
  getJadwal(pos.coords.latitude, pos.coords.longitude);
});

setInterval(updateCountdown, 1000);
setInterval(cekAdzan, 1000);