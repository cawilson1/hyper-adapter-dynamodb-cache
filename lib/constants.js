import { dotenv } from "../deps.js";

const env = Deno.env.get;
const { config } = dotenv;

var { DynamoDbTable, DO_BATCH_IN_PARALLEL, WCURate } = config();

export const TableName = env("DynamoDbTable") || DynamoDbTable;
export const BATCH_IN_PARALLEL =
  env("DO_BATCH_IN_PARALLEL") === "true" ||
  DO_BATCH_IN_PARALLEL === "true" ||
  false;
export const LIST_STORES = "LIST_STORES";
