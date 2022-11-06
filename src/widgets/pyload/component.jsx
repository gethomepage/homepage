import { useTranslation } from 'next-i18next'

import Container from 'components/services/widget/container'
import Block from 'components/services/widget/block'
import useWidgetAPI from 'utils/proxy/use-widget-api'

export default function Component({ service }) {
  const { t } = useTranslation()
  const { widget } = service
  const { data: pyloadData, error: pyloadError } = useWidgetAPI(
    widget,
    'statusServer',
  )

  if (pyloadError || !pyloadData) {
    return <Container error={t('widget.api_error')} />
  }

  return (
    <Container service={service}>
      <Block label="pyload.speed" value={t("common.bitrate", { value: pyloadData.speed })} />
      <Block label="pyload.active" value={t("common.number", { value: pyloadData.active })} />
      <Block label="pyload.queue" value={t("common.number", { value: pyloadData.queue })} />
      <Block label="pyload.total" value={t("common.number", { value: pyloadData.total })} />
    </Container>
  )
}
