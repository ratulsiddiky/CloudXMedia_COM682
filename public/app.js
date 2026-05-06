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
  await load();
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
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.blobUrl}" alt="${item.title}">
      <div class="meta">
        <div class="title">${item.title}</div>
        <button class="danger">Delete</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => del(item.id));
    galleryEl.appendChild(card);
  }

  setStatus(`Loaded ${data.items.length} item(s).`);
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

  await load();
}