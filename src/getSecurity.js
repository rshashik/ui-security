import {
  securityCache,
  securityLoaded,
  _EVENT_UI_SECURITY_READY,
} from "./loadSecurity";

/**
 * Get the security value of HTML element.
 * @param {string} id unique id of element.
 */
export default function getSecurity(id) {
  return _getUISecurityPromise(id);
}

/**
 * Get the security of element.
 * @param {string} id unique id of element.
 */
function _getUISecurityPromise(id) {
  return new Promise(function (resolve, reject) {
    let cachedValue = _getSecurityCachedValue(id);
    if (cachedValue === null) {
      window.addEventListener(
        _EVENT_UI_SECURITY_READY,
        () => {
          cachedValue = _getSecurityCachedValue(id);
          resolve(cachedValue);
        },
        {
          capture: true,
          once: true,
        }
      );
    } else {
      resolve(cachedValue);
    }
  });
}

/**
 * Get the security of element from cache.
 * @param {string} id unique id of element.
 */
function _getSecurityCachedValue(id) {
  if (securityLoaded) {
    return securityCache.get(id);
  } else {
    return null;
  }
}
