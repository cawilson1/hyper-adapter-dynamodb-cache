import { dotenv } from "../deps.js";

const env = Deno.env.get;
const { config } = dotenv;

var { DynamoDbTable, BATCH_IN_PARALLEL } = config();

export const TableName = env("DynamoDbTable") || DynamoDbTable;
export const BATCH_IN_PARALLEL =
  env("BATCH_IN_PARALLEL") === "true" || BATCH_IN_PARALLEL === "true" || false;
export const LIST_STORES = "LIST_STORES";
