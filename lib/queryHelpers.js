import { TableName } from "./constants.js";
import { R } from "../deps.js";
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

export const beginsWithQuery = ({ ddb, db, matcher }) =>
  ddb
    .query({
      TableName,
      ExpressionAttributeValues: {
        ":pk": {
          S: db
        },
        ":skMatcher": {
          S: matcher
        }
      },
      KeyConditionExpression: `pk = :pk, sk begins_with(:skMatcher)`
    })
    .then(prop("Items"));

export const endsWithQuery = ({ ddb, db, matcher }) =>
  ddb
    .query({
      TableName,
      ExpressionAttributeValues: {
        ":pk": {
          S: db
        },
        ":skMatcher": {
          S: matcher
        }
      },
      KeyConditionExpression: `pk = :pk, sk not begins_with(:skMatcher) and sk contains(:skMatcher)`
    })
    .then(prop("Items"));

export const matchAroundQuery = ({ ddb, db, matcher }) =>
  ddb
    .query({
      TableName,
      ExpressionAttributeValues: {
        ":pk": {
          S: db
        },
        ":skMatcher1": {
          S: matcher.split("*")[0]
        },
        ":skMatcher2": {
          S: matcher.split("*")[1]
        }
      },
      KeyConditionExpression: `pk = :pk, sk begins_with(:skMatcher1) and sk contains(:skMatcher2)`
    })
    .then(prop("Items"));
