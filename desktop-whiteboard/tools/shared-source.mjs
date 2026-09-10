import {parse} from 'acorn';
import {readFile} from 'node:fs/promises';

// Reuse the web client's implementation verbatim, without changing the web app
// or keeping a second business-logic copy that could drift from it.
export async function sharedSource() {
  const source = await readFile(new URL('../../our-class-quest/firebase-client.js', import.meta.url), 'utf8');
  const ast = parse(source, {ecmaVersion: 'latest', sourceType: 'module'});
  const found = new Map();
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'VariableDeclarator' && node.id.name === 'firebaseConfig') found.set('config', node.init);
    if (node.type === 'FunctionDeclaration' && ['groupScoreTransactionFields', 'groupScoreError'].includes(node.id.name)) found.set(node.id.name, node);
    if (node.type === 'Property' && node.key.name === 'applyGroupScoreChange') found.set('mutation', node.value);
    Object.values(node).forEach(value => Array.isArray(value) ? value.forEach(visit) : visit(value));
  }
  visit(ast);
  const take = key => {
    const node = found.get(key);
    if (!node) throw new Error(`Web client shared API changed: ${key}. Review before building.`);
    return source.slice(node.start, node.end);
  };
  return `export const firebaseConfig = ${take('config')};\n${take('groupScoreTransactionFields')}\n${take('groupScoreError')}\nexport function existingGroupMutation({auth, db, activeClassId, doc, runTransaction, serverTimestamp}) { return ${take('mutation')}; }`;
}
