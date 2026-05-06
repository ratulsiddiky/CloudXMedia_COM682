import { BlobServiceClient } from "@azure/storage-blob";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function uploadToBlob({ buffer, blobName, contentType }) {
  const conn = requireEnv("AZURE_STORAGE_CONNECTION_STRING");
  const containerName = requireEnv("AZURE_STORAGE_CONTAINER_NAME");

  const service = BlobServiceClient.fromConnectionString(conn);
  const container = service.getContainerClient(containerName);
  await container.createIfNotExists();

  const blob = container.getBlockBlobClient(blobName);
  await blob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType || "application/octet-stream" }
  });

  return { blobUrl: blob.url, blobName };
}

export async function deleteFromBlob(blobName) {
  const conn = requireEnv("AZURE_STORAGE_CONNECTION_STRING");
  const containerName = requireEnv("AZURE_STORAGE_CONTAINER_NAME");

  const service = BlobServiceClient.fromConnectionString(conn);
  const container = service.getContainerClient(containerName);

  const blob = container.getBlockBlobClient(blobName);
  await blob.deleteIfExists();
}