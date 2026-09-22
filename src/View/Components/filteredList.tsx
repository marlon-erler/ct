import * as React from "../../react";
import {
    StringEntryObject,
    checkDoesObjectMatchReference,
} from "../../Model/Utility/utility";

export function FilteredList<T>(
    reference: StringEntryObject,
    stringEntryObjectConverter: (object: T) => StringEntryObject,
    objects: React.ListState<T> | React.MapState<T>,
    viewBuilder: (matchingObjects: React.ListState<T>) => HTMLElement,
) {
    const matchingObjects: React.ListState<T> = new React.ListState();

    objects.handleAddition((newObject) => {
        const doesMatch: boolean = checkDoesObjectMatchReference(
            reference,
            stringEntryObjectConverter(newObject),
            true,
        );
        if (doesMatch == false) return;

        matchingObjects.add(newObject);
        objects.handleRemoval(newObject, () => {
            matchingObjects.remove(newObject);
        });
    });

    return viewBuilder(matchingObjects);
}
