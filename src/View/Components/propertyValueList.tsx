import * as React from "../../react";
import {
    StringEntryObject,
    collectObjectValuesForKey,
    localeCompare,
} from "../../Model/Utility/utility";

export function PropertyValueList<T>(
    propertyKey: string,
    stringEntryObjectConverter: (object: T) => StringEntryObject,
    objects: React.ListState<T> | React.MapState<T>,
    viewBuilder: (
        keys: React.ListState<string>,
        sortedKeys: React.State<string[]>,
    ) => HTMLElement,
) {
    const propertyValues: React.ListState<string> = new React.ListState();
    const sortedPropertyValues: React.State<string[]> =
        createSortedPropertyValueState(propertyValues);
    objects.subscribe(() => {
        collectPropertyValuesToState(
            propertyKey,
            stringEntryObjectConverter,
            objects,
            propertyValues,
        );
    });

    return viewBuilder(propertyValues, sortedPropertyValues);
}

export function collectPropertyValuesToState<T>(
    propertyKey: string,
    stringEntryObjectConverter: (object: T) => StringEntryObject,
    objects: React.ListState<T> | React.MapState<T>,
    propertyValues: React.ListState<string>,
) {
    const values: string[] = collectObjectValuesForKey(
        propertyKey,
        stringEntryObjectConverter,
        [...objects.value.values()],
    );
    for (const existingValue of values) {
        if (propertyValues.value.has(existingValue)) continue;
        propertyValues.add(existingValue);
    }

    for (const displayedValue of propertyValues.value.values()) {
        if (values.includes(displayedValue)) continue;
        propertyValues.remove(displayedValue);
    }
}

export function createSortedPropertyValueState(
    propertyValues: React.ListState<string>,
): React.State<string[]> {
    return React.createProxyState([propertyValues], () =>
        [...propertyValues.value.values()].sort(localeCompare),
    );
}

export function createPropertyValueIndexState(
    sortedKeys: React.State<string[]>,
    key: string,
): React.State<number> {
    return React.createProxyState([sortedKeys], () =>
        sortedKeys.value.indexOf(key),
    );
}
