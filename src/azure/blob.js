import { BlobServiceClient } from "@azure/storage-blob";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

let containerClientSingleton = null;
let containerReady = false;

function getContainerClient() {
  if (containerClientSingleton) return containerClientSingleton;

  const conn = requireEnv("AZURE_STORAGE_CONNECTION_STRING");
  const containerName = requireEnv("AZURE_STORAGE_CONTAINER_NAME");

  const blobService = BlobServiceClient.fromConnectionString(conn);
  containerClientSingleton = blobService.getContainerClient(containerName);

  return containerClientSingleton;
}

async function ensureContainer() {
  const containerClient = getContainerClient();
  if (!containerReady) {
    await containerClient.createIfNotExists();
    containerReady = true;
  }
  return containerClient;
}

export async function uploadToBlob({ buffer, blobName, contentType }) {
  const containerClient = await ensureContainer();

  const blob = containerClient.getBlockBlobClient(blobName);
  await blob.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType || "application/octet-stream",
    },
  });

  return { blobUrl: blob.url, blobName };
}

export async function deleteFromBlob(blobName) {
  const containerClient = await ensureContainer();

  const blob = containerClient.getBlockBlobClient(blobName);
  await blob.deleteIfExists();
}