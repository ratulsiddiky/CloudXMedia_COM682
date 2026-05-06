const USER_ID = "student-123";

const statusEl = document.getElementById("status");
const galleryEl = document.getElementById("gallery");

document.getElementById("btnUpload").addEventListener("click", upload);
document.getElementById("btnRefresh").addEventListener("click", load);

function setStatus(msg) {
  statusEl.textContent = msg;
}

async function upload() {
  const title = document.getElementById("title").value.trim();
  const file = document.getElementById("file").files[0];

  if (!title || !file) {
    alert("Enter a title and select an image.");
    return;
  }

  setStatus("Uploading...");

  const form = new FormData();
  form.append("title", title);
  form.append("userId", USER_ID);
  form.append("file", file);

  const res = await fetch("/api/media/upload", { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok || !data.ok) {
    console.error(data);
    alert(data.error || "Upload failed");
    setStatus("Upload failed.");
    return;
  }

  setStatus("Upload success.");
  addCard(data.item, { prepend: true });

  // Clear inputs AFTER successful upload
  document.getElementById("title").value = "";
  document.getElementById("file").value = "";
}

async function load() {
  setStatus("Loading...");
  const res = await fetch(`/api/media?userId=${encodeURIComponent(USER_ID)}`);
  const data = await res.json();

  if (!res.ok || !data.ok) {
    console.error(data);
    alert(data.error || "Failed to load gallery");
    setStatus("Failed.");
    return;
  }

  galleryEl.innerHTML = "";

  for (const item of data.items) {
    addCard(item);
  }

  setStatus(`Loaded ${data.items.length} item(s).`);
}

function addCard(item, options = {}) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = item.id;

  const img = document.createElement("img");
  img.src = item.blobUrl;
  img.alt = item.title;
  img.loading = "lazy";
  card.appendChild(img);

  const meta = document.createElement("div");
  meta.className = "meta";

  const titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.textContent = item.title;
  meta.appendChild(titleEl);

  const btn = document.createElement("button");
  btn.className = "danger";
  btn.textContent = "Delete";
  btn.addEventListener("click", () => del(item.id));
  meta.appendChild(btn);

  card.appendChild(meta);

  if (options.prepend) {
    galleryEl.prepend(card);
  } else {
    galleryEl.appendChild(card);
  }
}

async function del(id) {
  if (!confirm("Delete this item?")) return;

  const res = await fetch(`/api/media/${encodeURIComponent(id)}?userId=${encodeURIComponent(USER_ID)}`, {
    method: "DELETE"
  });
  const data = await res.json();

  if (!res.ok || !data.ok) {
    console.error(data);
    alert(data.error || "Delete failed");
    return;
  }

  const card = document.querySelector(`[data-id="${id}"]`);
  if (card) card.remove();
}