const defaults = {
  enabled: true,
  interval: 10,
  volumeChaos: true,
  memeChaos: true,
  phantomAudio: true
};

async function load() {
  const s = await chrome.storage.local.get(defaults);
  document.querySelector("#frequency").value = s.interval;
  document.querySelector("#freqValue").textContent = `${s.interval}s`;
  document.querySelector("#volumeChaos").checked = s.volumeChaos;
  document.querySelector("#memeChaos").checked = s.memeChaos;
  document.querySelector("#phantomAudio").checked = s.phantomAudio;
  document.querySelector("#status").textContent = s.enabled ? "Ragebait is enabled" : "Ragebait is disabled";
}

async function save(patch) {
  await chrome.storage.local.set(patch);
  await load();
}

document.querySelector("#frequency").addEventListener("input", e => {
  document.querySelector("#freqValue").textContent = `${e.target.value}s`;
});
document.querySelector("#frequency").addEventListener("change", e => save({ interval: Number(e.target.value) }));
document.querySelector("#volumeChaos").addEventListener("change", e => save({ volumeChaos: e.target.checked }));
document.querySelector("#memeChaos").addEventListener("change", e => save({ memeChaos: e.target.checked }));
document.querySelector("#phantomAudio").addEventListener("change", e => save({ phantomAudio: e.target.checked }));
document.querySelector("#on").addEventListener("click", () => save({ enabled: true }));
document.querySelector("#off").addEventListener("click", () => save({ enabled: false }));

load();
