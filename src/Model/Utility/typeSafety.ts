export function checkIsValidObject(object: any): boolean {
    return object.dataVersion == DATA_VERSION;
}

export function checkMatchesObjectStructure(
    objectToCheck: any,
    reference: any,
): boolean {
    if (typeof reference != "object") {
        return typeof objectToCheck == typeof reference;
    }

    for (const key of Object.keys(reference)) {
        const requiredType = typeof reference[key];
        const actualType = typeof objectToCheck[key];
        if (requiredType != actualType) return false;

        if (Array.isArray(reference[key]) || reference[key] instanceof Set) {
            // only check if array is not empty
            if (objectToCheck[key].length == 0) continue;
            if (objectToCheck[key].size == 0) continue;

            // check first item of array
            const [firstOfObjectToCheck] = objectToCheck[key];
            const [fisrtOfReference] = reference[key];
            const doesFirstItemMatch = checkMatchesObjectStructure(
                firstOfObjectToCheck,
                fisrtOfReference,
            );
            if (doesFirstItemMatch == false) return false;
        } else if (requiredType == "object") {
            // recurse into objects
            const doesNestedObjectMatch = checkMatchesObjectStructure(
                objectToCheck[key],
                reference[key],
            );
            if (doesNestedObjectMatch == false) return false;
        }
    }

    return true;
}

export const DATA_VERSION = "2610";
export interface ValidObject {
    dataVersion: "2610";
}
