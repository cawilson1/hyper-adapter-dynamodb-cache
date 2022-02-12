import { appOpine, core } from "../dev_deps.js";
import dynamoDb from "../mod.js";
import PORT_NAME from "../port_name.js";

const hyperConfig = {
  app: appOpine,
  adapters: [{ port: PORT_NAME, plugins: [dynamoDb()] }]
};

core(hyperConfig);
