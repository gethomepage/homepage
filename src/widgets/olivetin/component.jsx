import Container from "components/services/widget/container";
import Button from "components/services/widget/button";

export default function Component({ service }) {
  const { widget } = service;
  const { url, actions = [] } = widget;

  function startAction(actionId) {
    if (actionId) {
      fetch(url.replace(/\/$/, "") + "/api/StartActionByGet/" + actionId).then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(res.statusText);
        }
      });
    }
  }

  return (
    <Container service={service}>
      {actions.map((action) => (
        <Button
          click={() => {
            startAction(action.id);
          }}
          label={action.label}
          className={action.class}
          key={action.id || action.label}
        />
      ))}
    </Container>
  );
}
