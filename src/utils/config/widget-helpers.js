import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig from "utils/config/config";

export async function widgetsFromConfig() {
    checkAndCopyConfig("widgets.yaml");

    const widgetsYaml = path.join(process.cwd(), "config", "widgets.yaml");
    const fileContents = await fs.readFile(widgetsYaml, "utf8");
    const widgets = yaml.load(fileContents);

    if (!widgets) return [];

    // map easy to write YAML objects into easy to consume JS arrays
    const widgetsArray = widgets.map((group, index) => ({
        type: Object.keys(group)[0],
        options: {
            index,
            ...group[Object.keys(group)[0]]
        },
    }));
    return widgetsArray;
}

export async function cleanWidgetGroups(widgets) {
    return widgets.map((widget, index) => {
        const sanitizedOptions = widget.options;
        const optionKeys = Object.keys(sanitizedOptions);
        ["url", "username", "password", "key"].forEach((pO) => { 
            if (optionKeys.includes(pO)) {
                delete sanitizedOptions[pO];
            }
        });

        return {
            type: widget.type,
            options: {
                index,
                ...sanitizedOptions
            },
        }
    });
}

export async function getPrivateWidgetOptions(type, widgetIndex) {
    const widgets = await widgetsFromConfig();
  
    const privateOptions = widgets.map((widget) => {
        const {
            index,
            url,
            username,
            password,
            key
        } = widget.options;

        return {
            type: widget.type,
            options: {
                index,
                url,
                username,
                password,
                key
            },
        }
    });
  
    return (type !== undefined && widgetIndex !== undefined) ? privateOptions.find(o => o.type === type && o.options.index === parseInt(widgetIndex, 10))?.options : privateOptions;
}