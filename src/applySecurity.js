import {
  securityCache,
  securityLoaded,
  getEventName,
  attributeMap,
} from "./loadSecurity";

export default function applySecurity(pageId) {
  return new Promise(function (resolve, reject) {
    if (securityLoaded) {
      _traverseDOM(pageId);
      resolve();
    } else {
      window.addEventListener(getEventName(), () => {
        _traverseDOM(pageId);
        resolve();
      });
    }
  });
}
function _applyStyles(element) {
  const { key } = attributeMap;
  const value = securityCache.get(element[key]);
  if (value && ["readOnly", "hidden", "disabled"].includes(value)) {
    element[value] = true;
  } else if (value && typeof value === "object") {
    for (const [propertyName, propertyValue] of Object.entries(value)) {
      element.style[propertyName] = propertyValue;
    }
  } else {
    console.error(`${value} is not a valid value`);
  }
}

function _traverseDOM(pageId) {
  const nodeIterator = document.createNodeIterator(
    document.getElementById(pageId),
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: function (node) {
        if (securityCache.has(node.id)) {
          return NodeFilter.FILTER_ACCEPT;
        }
      },
    },
    false
  );

  let node;

  while ((node = nodeIterator.nextNode())) {
    _applyStyles(node);
  }
}
