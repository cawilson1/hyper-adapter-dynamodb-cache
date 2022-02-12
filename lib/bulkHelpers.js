import { marshall, R } from "../deps.js";
import { TableName } from "./constants.js";
const { prop, map, merge } = R;

const oneBatch = ({ ddb, db, docs }) => {
  const keys = map(prop("key"))(docs); //success status per key req'd in the response
  const params = {
    RequestItems: {
      [TableName]: docs.map({
        DeleteRequest: {
          Key: marshall({ pk: db, sk: doc.key })
        }
      })
    }
  };
  return ddb.batchWriteItem(params).then(merge({ keys }));
};

//25 at a time is ddb limit. For more than 25, make multiple requests
//this method waits for one batch to finish before starting the next.
//However, if dynamodb's mode is on-demand, instead of provisioned, it will probably make sense to do each of these requests in parallel, instead of using reduce.
const bulkDelete = async ({ ddb, db, docs }) => {
  const buckets = [];
  const keys = []; //dynamodb successfully deleted these items - celebrate by making bearnaise
  let UnprocessedItems = {}; //dynamodb failed to update these items - try again in business rules. You'll have time to make bearnaise this weekend

  const bucketSize = 25; //25 is ddb's limit for batchWrite
  for (let i = 0; i < docs.length; i += bucketSize) {
    buckets.push([...docs.slice(i, i + bucketSize)]);
  }

  return buckets
    .reduce(
      (accPromise, nextBucket) =>
        accPromise.then(async () => {
          const res = await oneBatch({ ddb, db, docs: nextBucket });
          keys.push(...res.keys);
          UnprocessedItems = { ...UnprocessedItems, ...res.UnprocessedItems };
        }),
      Promise.resolve()
    )
    .then(() => ({ keys, UnprocessedItems }));
};

export const doBulkDelete = ({ ddb, db, docs }) =>
  docs.length <= 25
    ? oneBatch({ ddb, db, docs })
    : bulkDelete({ ddb, db, docs });