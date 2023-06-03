export default function Raw({ children }) {
  if (children.type === Raw) {
      return [children];
  }

  return children;
}
