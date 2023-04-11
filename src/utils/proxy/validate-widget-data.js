/* eslint-disable no-console */
import widgets from "widgets/widgets";

export default function validateWidgetData(widget, endpoint, data) {
    let valid = true;
    let dataParsed = data;
    let error;
    let mapping;
    if (Buffer.isBuffer(data)) {
        try {
            dataParsed = JSON.parse(data);
        } catch (e) {
            error = e;
            valid = false;
        }
    }

    if (dataParsed && Object.entries(dataParsed).length) {
        const mappings = widgets[widget.type]?.mappings;
        if (mappings) {
            mapping = Object.values(mappings).find(m => m.endpoint === endpoint);
            mapping?.validate?.forEach(key => {
                if (dataParsed[key] === undefined) {
                    valid = false;
                }
            });
        }
    }

    if (!valid) {
        console.warn(`Invalid data for widget '${widget.type}' endpoint '${endpoint}':\nExpected:${mapping?.validate}\nParse error: ${error ?? "none"}\nData: ${JSON.stringify(data)}`);
    }
    
    return valid;
}
