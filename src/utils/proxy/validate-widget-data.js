import widgets from "widgets/widgets";

export default function validateWidgetData(widget, endpoint, data) {
    let valid = true;
    let dataParsed;
    try {
        dataParsed = JSON.parse(data);
    } catch (e) {
        valid = false;
    }

    if (dataParsed) {
        const validate = widgets[widget.type]?.mappings?.[endpoint]?.validate;
        validate.forEach(key => {
            if (dataParsed[key] === undefined) {
                valid = false;
            }
        });
    }
    
    return valid;
}
