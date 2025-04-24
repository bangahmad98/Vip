const waktuSholat = ["Shubuh", "Dhuhur", "Ashar", "Maghrib", "Isya"];
const audioFiles = {
  Shubuh: "adzan_subuh.mp3",
  Dhuhur: "adzan_biasa.mp3",
  Ashar: "adzan_biasa.mp3",
  Maghrib: "adzan_biasa.mp3",
  Isya: "adzan_biasa.mp3"
};

function dapatkanJadwal(lat, lon) {
  return {
    Shubuh: "04:45",
    Dhuhur: "12:00",
    Ashar: "15:30",
    Maghrib: "18:10",
    Isya: "19:20"
  };
}

function mulai() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const jadwal = dapatkanJadwal(latitude, longitude);
    tampilkanJadwal(jadwal);
    cekWaktu(jadwal);
  });
}

function tampilkanJadwal(jadwal) {
  const container = document.getElementById("jadwal-container");
  container.innerHTML = "";
  for (let waktu in jadwal) {
    container.innerHTML += `<p>${waktu}: ${jadwal[waktu]}</p>`;
  }
}

function cekWaktu(jadwal) {
  setInterval(() => {
    const now = new Date();
    const sekarang = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    let waktuBerikutnya = null;

    for (let waktu of waktuSholat) {
      if (sekarang < jadwal[waktu]) {
        waktuBerikutnya = waktu;
        break;
      }
    }

    if (!waktuBerikutnya) waktuBerikutnya = "Shubuh";

    const target = new Date();
    const [jam, menit] = jadwal[waktuBerikutnya].split(":");
    target.setHours(jam, menit, 0, 0);

    const selisih = target - now;
    if (selisih <= 1000 && selisih > -1000) {
      const player = new Audio(audioFiles[waktuBerikutnya]);
      player.play();
    }

    const sisaDetik = Math.floor(selisih / 1000);
    const jamSisa = Math.floor(sisaDetik / 3600);
    const menitSisa = Math.floor((sisaDetik % 3600) / 60);
    const detikSisa = sisaDetik % 60;

    document.getElementById("countdown").textContent = 
      `Menuju ${waktuBerikutnya}: ${jamSisa}j ${menitSisa}m ${detikSisa}d`;
  }, 1000);
}

mulai();
