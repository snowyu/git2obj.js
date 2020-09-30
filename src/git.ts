import fs from 'fs'
import http from 'isomorphic-git/http/node'
import git, {ParsedCommitObject, ParsedTreeObject, TreeEntry} from 'isomorphic-git'

const defaultOpts = {
  fs,
  http,
}

async function walkTree(tree: TreeEntry[], options: any, objects: any[]) {
  await Promise.all(tree.map(async item => {
    const obj = await git.readObject(Object.assign({}, options, {oid: item.oid}))
    delete obj.format
    delete obj.source
    objects.unshift(obj)
    if (item.type === 'tree') {
      return walkTree((obj as ParsedTreeObject).object, options, objects)
    }
  }))
}

export function jsonReplacer(key: string, val: any) {
  if (ArrayBuffer.isView(val)) {
    const bytes = [].slice.call(val)
    return val.constructor.name + '.from([' + bytes + '])'
  }
  return val
}

export async function gitToObj(options: any = {}) {
  const objects: any[] = []
  options = Object.assign(options, defaultOpts)
  if (!options.ref) options.ref = 'HEAD'
  let oid = await git.resolveRef(options)
  // let commit = await git.readObject(Object.assign({}, options, {oid: sha}))
  // objects.unshift({type: 'commit', oid: sha, object: commit})
  let obj: any = await git.readObject(Object.assign({}, options, {oid}))
  delete obj.format
  delete obj.source
  objects.unshift(obj)

  oid = (obj as ParsedCommitObject).object.tree
  obj = await git.readObject(Object.assign({}, options, {oid}))
  delete obj.format
  delete obj.source
  objects.unshift(obj)
  const tree = (obj as ParsedTreeObject).object
  await walkTree(tree, options, objects)
  return objects
}

