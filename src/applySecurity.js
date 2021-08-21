import { securityCache } from "./loadSecurity";
import getSecurity from "./getSecurity";
export default async function applySecurity(parentId) {
  const observer = new MutationObserver(function (mutations_list) {
    for (const mutation of mutations_list) {
      for (const added_node of mutation.addedNodes) {
        if (securityCache.has(added_node.id)) {
          let access = await getSecurity(added_node.id);
          added_node[access] = true;
        }
      }
    }
    observer.disconnect();
  });

  observer.observe(document.getElementById(parentId), {
    subtree: true,
    childList: true,
  });

  return;
}
