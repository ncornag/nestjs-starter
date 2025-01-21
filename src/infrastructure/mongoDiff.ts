import { Value } from '@sinclair/typebox/value';

export const jsonPatchPathToDot = (path) =>
  path.replace(/^\//, '').replace(/\//g, '.').replace(/~1/g, '/').replace(/~0/g, '~');

function getTrailingPos(path: string): number {
  const parts = path.split('.');
  const pathTail = parts.slice(-1)[0];
  return parts.length > 1 ? (pathTail === '-' ? -1 : parseInt(pathTail, 10)) : NaN;
}

function $remove(path: any) {
  const result: any[] = [];
  const trailingPos = getTrailingPos(path);
  result.push({ $unset: { [path]: 1 } });
  if (!Number.isNaN(trailingPos)) {
    const pathHead = path.split('.').slice(0, -1).join('.');
    result.push({ $pull: { [pathHead]: null } });
  }
  return result;
}

function $add(path: any, value) {
  const trailingPos = getTrailingPos(path);
  if (Number.isNaN(trailingPos)) {
    return { $set: { [path]: value } };
  }
  const pathHead = path.split('.').slice(0, -1).join('.');
  return {
    $push: {
      [pathHead]: trailingPos >= 0 ? { $each: [value], $position: trailingPos } : value
    }
  };
}

export function mongoDiff(entity: any, data: any): { ops: any | undefined; updated: any } {
  const updated = Value.Clone(entity);
  Object.assign(updated, data);
  const patch: any[] = Value.Diff(entity, updated);
  const opsArray = patch.map((op) => {
    const path = jsonPatchPathToDot(op.path);
    switch (op.type) {
      case 'insert': {
        return $add(path, op.value);
      }
      case 'delete': {
        return $remove(path);
      }
      case 'update': {
        return { $set: { [path]: op.value } };
      }

      default: {
        throw new Error('Unsupported Operation! op = ' + op.op);
      }
    }
  });
  // Compute Updates
  if (!opsArray.length) return { ops: undefined, updated };
  const ops: any = {};
  opsArray.forEach((op: any) => {
    Object.keys(op).forEach((updateKey: string) => {
      if (ops[updateKey]) {
        Object.assign(ops[updateKey], op[updateKey]);
      } else {
        ops[updateKey] = op[updateKey];
      }
    });
  });
  return { ops, updated };
}
