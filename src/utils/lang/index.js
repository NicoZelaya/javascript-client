/**
 * Checks if the target string starts with the sub string.
 */
export function startsWith(target, sub) {
  if (!(isString(target) && isString(sub))) {
    return false;
  }
  return target.slice(0, sub.length) === sub;
}

/**
 * Checks if the target string ends with the sub string.
 */
export function endsWith(target, sub) {
  if (!(isString(target) && isString(sub))) {
    return false;
  }
  return target.slice(target.length - sub.length) === sub;
}

/**
 * Safely retrieve the specified prop from obj. If we can't retrieve
 * that property value, we return the default value.
 */
export function get(obj, prop, val) {
  let res = val;

  try { // No risks nor lots of checks.
    const pathPieces = prop.split('.');
    let partial = obj;
    pathPieces.forEach(pathPiece => partial = partial[pathPiece]);

    res = partial;
  } catch (e) {
    // noop
  }
  return res;
}

export function findIndex(target, iteratee) {
  if (Array.isArray(target) && typeof iteratee === 'function') {
    return target.findIndex(iteratee);
  }

  return -1;
}

export function find(source, iteratee) {
  let res;

  if (isObject(source)) {
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length && !res; i++) {
      const key = keys[i];
      const iterateeResult = iteratee(source[key], key, source);

      if (iterateeResult) res = source[key];
    }
  } else if (Array.isArray(source)) {
    for (let i = 0; i < source.length && !res; i++) {
      const iterateeResult = iteratee(source[i], i, source);

      if (iterateeResult) res = source[i];
    }
  }

  return res;
}

export function isString(obj) {
  return typeof obj === 'string' || obj instanceof String;
}

export function isFinite(val) {
  return typeof val == 'number' && Number.isFinite(val);
}

let uniqueIdCounter = -1;

export function uniqueId() {
  return uniqueIdCounter++;
}

export function isObject(obj) {
  return obj && typeof obj === 'object' && obj.constructor === Object;
}

/**
 * There are some assumptions here. It's for internal use and we don't need verbose errors
 * or to ensure the data types or whatever. Parameters should always be correct (at least have a target and a source, of type object).
 */
export function merge(target, source, ...rest) {
  let res = target;

  isObject(source) && Object.keys(source).forEach(key => {
    let val = source[key];

    if (isObject(val) && res[key] && isObject(res[key])) {
      val = merge({}, res[key], val);
    }

    if (val !== undefined) {
      res[key] = val;
    }
  });

  if (rest && rest.length) {
    const nextSource = rest.splice(0, 1)[0];
    res = merge(res, nextSource, ...rest);
  }

  return res;
}

/**
 * Removes duplicate items on an array of strings.
 */
export function uniq(arr) {
  const seen = {};
  return Array.filter(arr, function(item) {
    return seen.hasOwnProperty(item) ? false : seen[item] = true;
  });
}

export function toString(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(val => isString(val) ? val : '') + '';

  let result = val + '';
  return (result === '0' && (1 / val) === Number.NEGATIVE_INFINITY) ? '-0' : result;
}

export function toNumber(val) {
  if (typeof val === 'number') return val;

  if (isObject(val) && typeof val.valueOf === 'function') {
    let valOf = val.valueOf();
    val = isObject(valOf) ? valOf + '' : valOf;
  }

  if (typeof val !== 'string') {
    return val === 0 ? val : +val;
  }
  // Remove trailing whitespaces.
  val = val.replace(/^\s+|\s+$/g, '');

  return +val;
}

export function forOwn(obj, iteratee) {
  const keys = Object.keys(obj);

  keys.forEach(key => iteratee(obj[key], key, obj));

  return obj;
}

export function groupBy(source, prop) {
  const map = {};

  if (Array.isArray(source) && isString(prop)) {
    for(let i = 0; i < source.length; i++) {
      const key = source[i][prop];

      // Skip the element if the key is not a string.
      if (isString(key)) {
        if (!map[key]) map[key] = [];

        map[key].push(source[i]);
      }
    }
  }

  return map;
}
