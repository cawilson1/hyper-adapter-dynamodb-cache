// deno-lint-ignore-file no-unused-vars

/**
 *
 * @typedef {Object} CreateDocumentArgs
 * @property {string} db
 * @property {string} id
 * @property {object} doc
 *
 * @typedef {Object} RetrieveDocumentArgs
 * @property {string} db
 * @property {string} id
 *
 * @typedef {Object} QueryDocumentsArgs
 * @property {string} db
 * @property {QueryArgs} query
 *
 * @typedef {Object} QueryArgs
 * @property {object} selector
 * @property {string[]} fields
 * @property {number} limit
 * @property {object[]} sort
 * @property {string} use_index
 *
 * @typedef {Object} IndexDocumentArgs
 * @property {string} db
 * @property {string} name
 * @property {string[]} fields
 *
 * @typedef {Object} ListDocumentArgs
 * @property {string} db
 * @property {number} limit
 * @property {string} startkey
 * @property {string} endkey
 * @property {string[]} keys
 *
 * @typedef {Object} BulkDocumentsArgs
 * @property {string} db
 * @property {object[]} docs
 *
 * @typedef {Object} Response
 * @property {boolean} ok
 */

export default function(ddb) {
  /**
   * @param {IndexDocumentArgs}
   * @returns {Promise<Response>}
   */
  async function index() {}

  /**
   * @param {CreateStoreArgs}
   * @returns {Promise<Response>}
   */
  async function createStore(name) {}

  /**
   * @param {DestroyStoreArgs}
   * @returns {Promise<Response>}
   */
  async function destroyStore(name) {}

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
