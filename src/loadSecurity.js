export var securityLoaded = false;
export const securityCache = new Map();
export let attributeMap = {};
export let optionParam = {};
let workerInstance = 0;
let uiSecurityWorker;

export default function loadSecurity(securityParam, dataMap, optionParam) {
  const { url, payload } = securityParam;
  const { key, value } = dataMap;
  attributeMap = dataMap;
  if (!_isValidUrl() || !_isValidPayload() || !_isValidDataMap()) return;

  /**
   * validate the url.
   */
  function _isValidUrl() {
    try {
      new URL(url);
    } catch (e) {
      _showError("url is not valid");
      return false;
    }
    return true;
  }

  /**
   * validate the payload.
   */
  function _isValidPayload() {
    try {
      new Request(url, payload);
    } catch (e) {
      _showError("payload is not valid");
      return false;
    }
    return true;
  }

  /**
   * validate the dataMap.
   */
  function _isValidDataMap() {
    if (key && value) {
      return true;
    } else {
      _showError("dataMap is not valid");
      return false;
    }
  }

  /**
   * clears the secuirty cache.
   */
  function _clearUISecurityCache() {
    securityCache.clear();
  }

  _clearUISecurityCache();

  const worker_script = `onmessage = async function (e) {
    const url = e.data.url;
    const payload = e.data.payload;
    const request = new Request(url, payload);
    const response = await fetch(request)
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Oops, we haven't got JSON!");
        }
        return res.json();
      })
      .catch((error) => console.error(error));
    postMessage(response);
  };`;

  _retrieveSecurity();

  /**
   * Shows a message in the console.
   */
  function _showError(text) {
    window?.console?.error("uiSecurity: " + text);
  }

  /**
   * gets security for the elements .
   */

  function _retrieveSecurity() {
    return new Promise(function (resolve, reject) {
      try {
        if (workerInstance < 1) {
          const worker_url = URL.createObjectURL(
            new Blob([worker_script], { type: "text/javascript" })
          );
          uiSecurityWorker = new Worker(worker_url);
          workerInstance++;
        }
      } catch (e) {
        _showError("unable to create security worker.");
      }
      uiSecurityWorker.onmessage = function (e) {
        let uiSecurity = e.data;
        securityLoaded = true;
        if (!uiSecurity) {
          _showError(
            "No security is retrieved. Please make sure fetchSecurity has response."
          );
          reject();
        }
        if (uiSecurity) {
          for (let indx in uiSecurity) {
            securityCache.set(uiSecurity[indx][key], uiSecurity[indx][value]);
          }
        }
        window.dispatchEvent(new CustomEvent(getEventName()));
        resolve();
      };
      uiSecurityWorker.postMessage(securityParam);
    });
  }
}

export function getEventName() {
  const _EVENT_UI_SECURITY_READY = "ui-security-ready";
  return _EVENT_UI_SECURITY_READY;
}
