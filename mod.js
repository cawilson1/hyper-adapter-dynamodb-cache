import { ApiFactory, DynamoDB, dotenv } from "./deps.js";
import createAdapter from "./adapter.js";
import PORT_NAME from "./port_name.js";

const env = Deno.env.get;
const { config } = dotenv;

const { awsAccessKeyId, awsSecretKey, region } = config();

//check environment first
//check .env file second
const ddb = new ApiFactory({
  credentials: {
    awsAccessKeyId: env("awsAccessKeyId") || awsAccessKeyId,
    awsSecretKey: env("awsSecretKey") || awsSecretKey,
    region: env("region") || region
  }
}).makeNew(DynamoDB);

export default name => ({
  id: "dynamodb-cache-adapter",
  port: PORT_NAME,
  load: () => ddb,
  link: env => _ => createAdapter(env) // link adapter
});
