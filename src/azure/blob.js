import { BlobServiceClient } from "@azure/storage-blob";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}


const conn = requireEnv("AZURE_STORAGE_CONNECTION_STRING");
const containerName = requireEnv("AZURE_STORAGE_CONTAINER_NAME");


const blobService = BlobServiceClient.fromConnectionString(conn);
const containerClient = blobService.getContainerClient(containerName);


let containerReady = false;
async function ensureContainer() {
  if (!containerReady) {
    await containerClient.createIfNotExists();
    containerReady = true;
  }
}


export async function uploadToBlob({ buffer, blobName, contentType }) {
  await ensureContainer();

  const blob = containerClient.getBlockBlobClient(blobName);

  await blob.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType || "application/octet-stream"
    }
  });

  return { blobUrl: blob.url, blobName };
}


export async function deleteFromBlob(blobName) {
  await ensureContainer();

  const blob = containerClient.getBlockBlobClient(blobName);
  await blob.deleteIfExists();
}