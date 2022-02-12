import { dotenv } from "../deps.js";

const env = Deno.env.get;
const { config } = dotenv;

var { DynamoDbTable } = config();

export const TableName = env("DynamoDbTable") || DynamoDbTable;
export const LIST_STORES = "LIST_STORES";
