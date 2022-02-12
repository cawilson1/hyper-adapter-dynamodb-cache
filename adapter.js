// deno-lint-ignore-file no-unused-vars
import { TableName, LIST_STORES } from "./lib/constants.js";
import {
  queryAll,
  beginsWithQuery,
  endsWithQuery
} from "./lib/queryHelpers.js";
import { doBulkDelete } from "./lib/bulkHelpers.js";
import { marshall, unmarshall, R } from "./deps.js";

const { isEmpty, prop, compose, omit, tryCatch, pipe } = R;

const ok = () => ({ ok: true });
const okKeys = keys => ({ ok: true, keys });
const okDoc = doc => ({ ok: true, doc });
const notOk = error => ({ ok: false, error });
const notOkUnprocessedItems = unprocessedItems => ({
  ok: false,
  error: "Some items failed to delete",
  status: 500,
  unprocessedItems: JSON.parse(unprocessedItems)
});
const getItem = prop("Item");
const omitPkSk = tryCatch(omit(["pk", "sk"]), () => []); //remove partition key and sort key from response
const unmarshallDoc = compose(omitPkSk, unmarshall);
const unmarshallDocs = map(unmarshallDoc);
const okDocs = docs => ({ ok: true, docs: unmarshallDocs(docs) });
const _throw = e => {
  throw e;
};

export default function(ddb) {
  /**
   * @param {IndexDocumentArgs}
   * @returns {Promise<Response>}
   */
  async function index() {
    return queryAll({ ddb, db: LIST_STORES })
      .then(unmarshall)
      .catch(notOk);
  }

  /**
   * @param {CreateStoreArgs}
   * @returns {Promise<Response>}
   */
  //All tables will be listed at the pk LIST_STORES, and the sk will be the table name used in the pk elsewhere. This allows simple index for all tables
  async function createStore(name) {
    //first check existence by querying LIST_STORES,name
    return ddb
      .putItem({
        TableName,
        Item: marshall({
          dateTimeCreated: new Date().toISOString(),
          pk: LIST_STORES,
          sk: name
        })
      })
      .then(ok)
      .catch(notOk);
  }

  /**
   * @param {DestroyStoreArgs}
   * @returns {Promise<Response>}
   */
  async function destroyStore(name) {
    //first query all keys where pk = name
    //next batch delete all keys returned
    //if no unprocessed items returned, delete LIST_STORES pk storeName sk
    //if there are unprocessed items, return their keys in message to caller
    return queryAll({ ddb, db: name })
      .then(items => doBulkDelete({ ddb, db: name, docs: items }))
      .then(({ keys, unprocessedItems }) => {
        if (isEmpty(unprocessedItems)) return keys;
        _throw(JSON.stringify(unprocessedItems));
      })
      .then(keys => {
        ddb
          //delete the item from the index list
          .deleteItem({
            TableName,
            Item: marshall({
              pk: LIST_STORES,
              sk: name
            })
          })
          .then(() => keys)
          .catch(error => {
            console.log(error);
            _throw(JSON.stringify({ [LIST_STORES]: name })); //something went wrong, assign this as unprocessItems
          });
      })
      .then(okKeys)
      .catch(notOkUnprocessedItems);
  }

  /**
   * @param {CreateDocumentArgs}
   * @returns {Promise<Response>}
   */
  //TODO: use dynamodb's ttl if it is the time range is acceptable
  async function createDoc({ store, key, value, ttl }) {
    return isEmpty(value)
      ? _throw("missing value")
      : ddb
          .putItem({
            TableName,
            Item: marshall({ ...value, pk: store, sk: key }),
            ConditionExpression: "attribute_not_exists(#s)",
            ExpressionAttributeNames: { "#s": "sk" }
          })
          .then(ok)
          .catch(notOk);
  }

  /**
   * @param {GetDocumentsArgs}
   * @returns {Promise<Response>}
   */
  async function getDoc({ store, key }) {
    return ddb
      .getItem({
        TableName,
        Key: marshall({ pk: store, sk: key })
      })
      .then(pipe(getItem, unmarshallDoc, okDoc))
      .catch(notOk);
  }

  /**
   *
   * @param {UpdateDocumentArgs}
   * @returns {Promise<Response>}
   */

  async function updateDoc({ store, key, value, ttl }) {
    return ddb
      .putItem({
        TableName,
        Item: marshall({ ...value, pk: store, sk: key })
      })
      .then(ok)
      .catch(notOk);
  }

  /**
   *
   * @param {DeleteDocumentArgs}
   * @returns {Promise<Response>}
   */
  async function deleteDoc({ store, key }) {
    return (
      ddb
        //delete the item from the index list
        .deleteItem({
          TableName,
          Item: marshall({
            pk: store,
            sk: key
          })
        })
        .then(okDoc)
        .catch(notOk)
    );
  }

  /**
   *
   * @param {ListDocumentArgs}
   * @returns {Promise<Response>}
   */
  async function listDocs({ store, pattern = "*" }) {
    const handleResponse = p => p.then(okDocs).catch(notOk);
    const h = handleResponse;
    const p = o => new Promise(res => res(o));
    if (pattern.split("*").length > 2)
      return p(notOk("only allowed one wildcard in pattern"));
    if (pattern === "*") return queryAll({ ddb, db: name });
    else if (!pattern.includes("*"))
      return h(
        ddb.getItem({
          TableName,
          Key: marshall({ pk: store, sk: key })
        })
      );
    else if (pattern[0] === "*")
      return h(beginsWithQuery({ ddb, db: name, matcher }));
    else if (pattern[pattern.length - 1] === "*")
      return h(endsWithQuery({ ddb, db: name, matcher }));
    //must contain "*" not at beginning or end
    else return h(matchAroundQuery({ ddb, db: name, matcher }));

    //check middle, check exact match
  }

  return Object.freeze({
    index,
    createStore,
    destroyStore,
    createDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    listDocs
  });
}
