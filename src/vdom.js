export const createVNode = (tagName, attrs = {}, children = []) => {
  return {
    tagName,
    attrs,
    children,
  };
};

export const createVButton = (props) => {
  const { text, onclick } = props;

  return createVNode("button", { onclick }, [text]);
};
