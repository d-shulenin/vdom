import { createVNode } from "./vdom.js";

export const createDOMNode = (vNode) => {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }

  const { tagName, attrs, children } = vNode;

  // создаем DOM-узел
  const node = document.createElement(tagName);

  // Добавляем атрибуты к DOM-узлу
  patchAttrs(node, {}, attrs);

  // Рекурсивно обрабатываем дочерные узлы
  children.forEach((child) => {
    node.appendChild(createDOMNode(child));
  });

  return node;
};

export const mount = (node, target) => {
  target.appendChild(node);
  return node;
};

function listener(event) {
  return this[event.type](event);
}

const patchAttr = (node, key, value, nextValue) => {
  if (key.startsWith("on")) {
    const eventName = key.slice(2);

    node[eventName] = nextValue;

    if (!nextValue) {
      node.removeEventListener(eventName, listener);
    } else if (!value) {
      node.addEventListener(eventName, listener);
    }
    return;
  }

  // Если новое значение не задано, то удаляем атрибут
  if (nextValue == null || nextValue === false) {
    node.removeAttribute(key);
    return;
  }

  // Устанавливаем новое значение атрибута
  node.setAttribute(key, nextValue);
};

const patchAttrs = (node, attrs, nextAttrs) => {
  // Объект с общими свойствами
  const mergedAttrs = { ...attrs, ...nextAttrs };

  Object.keys(mergedAttrs).forEach((key) => {
    // Если значение не изменилось, то ничего не обновляем
    if (attrs[key] !== nextAttrs[key]) {
      patchAttr(node, key, attrs[key], nextAttrs[key]);
    }
  });
};

const patchChildren = (parent, vChildren, nextVChildren) => {
  parent.childNodes.forEach((childNode, i) => {
    patchDOMNode(childNode, vChildren[i], nextVChildren[i]);
  });

  nextVChildren.slice(vChildren.length).forEach((vChild) => {
    parent.appendChild(createDOMNode(vChild));
  });
};

export const patchDOMNode = (node, vNode, nextVNode) => {
  // Удаляем ноду, если значение nextVNode не задано
  if (nextVNode === undefined) {
    node.remove();
    return;
  }

  if (typeof vNode === "string" || typeof nextVNode === "string") {
    // Заменяем ноду на новую, если как минимум одно из значений равно строке
    // и эти значения не равны друг другу
    if (vNode !== nextVNode) {
      const nextNode = createDOMNode(nextVNode);
      node.replaceWith(nextNode);
      return nextNode;
    }

    // Если два значения - это строки и они равны,
    // просто возвращаем текущую ноду
    return node;
  }

  // Заменяем ноду на новую, если теги не равны
  if (vNode.tagName !== nextVNode.tagName) {
    const nextNode = createDOMNode(nextVNode);
    node.replaceWith(nextNode);
    return nextNode;
  }

  patchAttrs(node, vNode.attrs, nextVNode.attrs);
  patchChildren(node, vNode.children, nextVNode.children);

  // Возвращаем обновленный DOM-элемент
  return node;
};

const TEXT_NODE_TYPE = 3;

const recycleNode = (node) => {
  // Если текстовая нода - то возвращаем текст
  if (node.nodeType === TEXT_NODE_TYPE) {
    return node.nodeValue;
  }

  //  Получаем имя тега
  const tagName = node.nodeName.toLowerCase();

  // Рекурсивно обрабатываем дочерние ноды
  const children = [].map.call(node.childNodes, recycleNode);

  // Создаем виртуальную ноду
  return createVNode(tagName, {}, children);
};

export const patch = (nextVNode, node) => {
  // Получаем текущее виртуальное дерево из DOM-ноды
  const vNode = node.v || recycleNode(node);

  // Патчим DOM-ноду
  node = patchDOMNode(node, vNode, nextVNode);

  // Сохраняем виртуальное дерево в DOM-ноду
  node.v = nextVNode;

  return node;
};
