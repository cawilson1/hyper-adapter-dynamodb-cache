const { TableName } = require("./constants.js");
const { prop } = R;

//TODO: make this work with pagination with > 1000 documents
export const queryAll = ({ ddb, db }) =>
  ddb
    .query({
      TableName,
      ExpressionAttributeValues: {
        ":pk": {
          S: db
        }
      },
      KeyConditionExpression: "pk = :pk"
    })
    .then(prop("Items"));
