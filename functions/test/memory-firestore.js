// Offline optimistic-transaction harness. No credentials or production connection.
const clone = value => value === undefined ? undefined : structuredClone(value);
class Ref {
  constructor(db, path) { this.db = db; this.path = path; this.id = path.split("/").at(-1); }
  collection(name) { return new Query(this.db, `${this.path}/${name}`); }
  get() { return Promise.resolve(this.db.snapshot(this.path)); }
}
class Query {
  constructor(db, path, filters = [], cursor = "", maximum = Infinity) { Object.assign(this, {db, path, filters, cursor, maximum}); }
  doc(id) { if (!id || id.includes("/")) throw Error("Invalid document ID"); return new Ref(this.db, `${this.path}/${id}`); }
  where(field, op, value) { if (op !== "==") throw Error("Unsupported operator"); return new Query(this.db, this.path, [...this.filters, [field, value]], this.cursor, this.maximum); }
  orderBy(field) { if (field !== "__name__") throw Error("Unsupported order"); return this; }
  limit(maximum) { return new Query(this.db, this.path, this.filters, this.cursor, maximum); }
  startAfter(doc) { return new Query(this.db, this.path, this.filters, doc.id, this.maximum); }
  get() {
    const docs = [...this.db.rows.keys()].filter(path => path.startsWith(this.path + "/") &&
      path.split("/").length === this.path.split("/").length + 1).sort().map(path => this.db.snapshot(path))
      .filter(doc => doc.id > this.cursor && this.filters.every(([field, value]) => doc.data()[field] === value)).slice(0, this.maximum);
    return Promise.resolve({docs, size: docs.length, empty: !docs.length});
  }
}
class MemoryFirestore {
  constructor(seed = {}) { this.rows = new Map(Object.entries(seed)); this.versions = new Map(); this.retries = 0; this.commits = 0; }
  doc(path) { return new Ref(this, path); }
  collection(path) { return new Query(this, path); }
  snapshot(path) { const value = clone(this.rows.get(path)); return {id: path.split("/").at(-1), ref: this.doc(path), exists: value !== undefined, data: () => clone(value)}; }
  put(path, value) {
    if (value === undefined) this.rows.delete(path); else this.rows.set(path, clone(value));
    for (const key of [path, path.slice(0, path.lastIndexOf("/"))]) this.versions.set(key, (this.versions.get(key) || 0) + 1);
  }
  async runTransaction(callback) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const reads = new Map(); const writes = [];
      const result = await callback({
        get: async ref => {
          if (writes.length) throw Error("Firestore reads must precede writes");
          reads.set(ref.path, this.versions.get(ref.path) || 0); return ref.get();
        },
        set: (ref, value, options) => writes.push([ref.path, value, options?.merge ? "merge" : "set"]),
        update: (ref, value) => writes.push([ref.path, value, "update"]),
        create: (ref, value) => writes.push([ref.path, value, "create"]),
      });
      if ([...reads].some(([path, version]) => (this.versions.get(path) || 0) !== version)) { this.retries++; continue; }
      for (const [path, , type] of writes) {
        if (type === "create" && this.rows.has(path)) throw Error("Already exists");
        if (type === "update" && !this.rows.has(path)) throw Error("Missing update target");
      }
      for (const [path, value, type] of writes) this.put(path, type === "merge" || type === "update" ? {...this.rows.get(path), ...value} : value);
      this.commits++; return result;
    }
    throw Error("Transaction retries exhausted");
  }
}
module.exports = {MemoryFirestore};
