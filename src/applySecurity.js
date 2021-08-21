import {
  securityCache,
  securityLoaded,
  _EVENT_UI_SECURITY_READY,
} from "./loadSecurity";

export default function applySecurity(pageId) {
  return new Promise(function (resolve, reject) {
    let page = document.getElementById(pageId);
    let htmlNodeIterator = new HTMLNodeIterator();
    if (securityLoaded) {
      htmlNodeIterator.iterate(applySec, page);
    } else {
      window.addEventListener(_EVENT_UI_SECURITY_READY, () => {
        htmlNodeIterator.iterate(applySec, page);
        resolve();
      });
    }
  });
}
function applySec(element) {
  if (securityCache.has(element.id)) {
    element[securityCache.get(element.id)] = true;
  }
}

function HTMLNodeIterator() {
  this.iterate = function iterate(task, node) {
    for (let x = 0; x < node.childNodes.length; x++) {
      var childNode = node.childNodes[x];

      task(childNode);

      if (childNode.childNodes.length > 0) this.iterate(task, childNode);
    }
  };
}
