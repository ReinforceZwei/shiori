import { SpotlightStore } from "@mantine/spotlight";
import { clamp } from "@mantine/hooks";

// This file contains code that is copied from Mantine source code
// https://github.com/mantinedev/mantine/blob/e97f061b302139a73ed9c6101a6a3f616b31a358/packages/%40mantine/spotlight/src/spotlight.store.ts
// because Mantine does not export the store functions
// and we need to use them in our custom spotlight component
// to make the spotlight component work as expected

function findElementByQuerySelector<T extends HTMLElement>(
  selector: string,
  root: Document | Element | ShadowRoot = document
): T | null {
  // Directly try to find the element in the current root.
  const element = root.querySelector<T>(selector);
  if (element) {
    return element;
  }

  // Iterate through all children of the current root.
  const children = root instanceof ShadowRoot ? root.host.children : root.children;
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];

    // Recursively search in the child's shadow root if it exists.
    if (child.shadowRoot) {
      const shadowElement = findElementByQuerySelector<T>(selector, child.shadowRoot);
      if (shadowElement) {
        return shadowElement;
      }
    }

    // Also, search recursively in the child itself if it does not have a shadow root or the element wasn't found in its shadow root.
    const nestedElement = findElementByQuerySelector<T>(selector, child);
    if (nestedElement) {
      return nestedElement;
    }
  }

  // Return null if the element isn't found in the current root or any of its shadow DOMs.
  return null;
}

export function setSelectedAction(index: number, store: SpotlightStore) {
  store.updateState((state) => ({ ...state, selected: index }));
}

export function selectAction(index: number, store: SpotlightStore): number {
  const state = store.getState();
  const actionsList = state.listId ? findElementByQuerySelector(`#${state.listId}`) : null;
  const selected = actionsList?.querySelector<HTMLButtonElement>('[data-selected]');
  const actions = actionsList?.querySelectorAll<HTMLButtonElement>('[data-action]') ?? [];
  const nextIndex = index === -1 ? actions.length - 1 : index === actions.length ? 0 : index;

  const selectedIndex = clamp(nextIndex, 0, actions.length - 1);
  selected?.removeAttribute('data-selected');
  actions[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  actions[selectedIndex]?.setAttribute('data-selected', 'true');
  setSelectedAction(selectedIndex, store);

  return selectedIndex;
}