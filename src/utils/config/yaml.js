import * as yaml from "js-yaml";

const EMPTY_DOCUMENT_ERROR = "expected a document, but the input is empty";

export function loadYaml(input, options) {
  try {
    return yaml.load(input, options);
  } catch (error) {
    // js-yaml v4 returned undefined for empty and comment-only documents.
    if (error?.reason === EMPTY_DOCUMENT_ERROR) return undefined;
    throw error;
  }
}
