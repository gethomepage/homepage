export default function withWidgetFields(service, defaultFields, maxFields = 4) {
  const configuredFields = service.widget.fields;
  const fields = (configuredFields?.length ? configuredFields : defaultFields).slice(0, maxFields);

  return {
    ...service,
    widget: {
      ...service.widget,
      fields,
    },
  };
}
