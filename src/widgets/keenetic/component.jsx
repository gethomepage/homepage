import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }){
    const { widget } = service;
    const { data, error } = useWidgetAPI(widget);

    if(error){
        return <Container service={service} error={error} />;
    }

    if(!data){
        return (
            <Container service={service}>
                <Block label="keenetic.registered" />
                <Block label="keenetic.unregistered" />
                <Block label="keenetic.active" />
                <Block label="keenetic.inactive" />
            </Container>
        )
    }

    return (
        <Container service={service}>
            <Block label="keenetic.registered" value={data.registered} />
            <Block label="keenetic.unregistered" value={data.unregistered} />
            <Block label="keenetic.active" value={data.active} />
            <Block label="keenetic.inactive" value={data.unactive} />
        </Container>
    )
}