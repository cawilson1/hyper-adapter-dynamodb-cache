// deno-lint-ignore-file no-unused-vars
import { TableName, LIST_STORES } from "./lib/constants.js";
import { queryAll } from "./lib/queryHelpers.js";
import { doBulkDelete } from "./lib/bulkHelpers.js";
import { marshall, unmarshall } from "./deps.js";

const ok = () => ({ ok: true });
const okKeys = keys => ({ ok: true, keys });
const notOk = error => ({ ok: false, error });
const notOkUnprocessedItems = unprocessedItems => ({
  ok: false,
  error: "Some items failed to delete",
  status: 500,
  unprocessedItems: JSON.parse(unprocessedItems)
});
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
  async function createDoc({ store, key, value, ttl }) {}

  /**
   * @param {GetDocumentsArgs}
   * @returns {Promise<Response>}
   */
  async function getDoc({ store, key }) {}

  /**
   *
   * @param {UpdateDocumentArgs}
   * @returns {Promise<Response>}
   */

  async function updateDoc({ store, key, value, ttl }) {}

  /**
   *
   * @param {DeleteDocumentArgs}
   * @returns {Promise<Response>}
   */
  async function deleteDoc({ store, key }) {}

  /**
   *
   * @param {ListDocumentArgs}
   * @returns {Promise<Response>}
   */
  async function listDocs({ store, pattern = "*" }) {}

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
