import { createVButton, createVNode } from "./vdom.js";
import { patch } from "./dom.js";

const createVApp = (state) => {
  const { count } = state;

  return createVNode("div", { class: "container" }, [
    createVNode("h1", {}, ["Hello, Virtual DOM"]),
    createVNode("h2", {}, [`Count, ${count}`]),
    "Text node without tags", // <- TextNode
    createVNode("img", { src: "https://i.ibb.co/M6LdN5m/2.png", width: 200 }),
    createVNode("div", {}, [
      createVButton({ onclick: () => store.setState({ count: store.state.count - 1 }), text: "-1" }),
      createVButton({ onclick: () => store.setState({ count: store.state.count + 1 }), text: "+1" }),
    ]),
  ]);
};

const root = document.getElementById("root");
const state = { count: 0 };
let vApp = createVApp(state);
let app = patch(vApp, root);

const store = {
  state: { count: 0 },
  onStateChanged: function () {
    app = patch(createVApp(this.state), app);
  },
  setState(nextState) {
    this.state = nextState;
    this.onStateChanged();
  },
};
