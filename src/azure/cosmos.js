import { CosmosClient } from "@azure/cosmos";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}


const endpoint = requireEnv("COSMOS_ENDPOINT");
const key = requireEnv("COSMOS_KEY");
const dbId = requireEnv("COSMOS_DATABASE_ID");
const containerId = requireEnv("COSMOS_CONTAINER_ID");

const client = new CosmosClient({ endpoint, key });
const container = client.database(dbId).container(containerId);


export function getCosmosContainer() {
  return container;
}