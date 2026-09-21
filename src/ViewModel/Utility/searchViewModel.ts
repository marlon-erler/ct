import * as React from "bloatless-react";
import { checkDoesObjectMatchSearch } from "../../Model/Utility/utility";

export default class SearchViewModel<T> {
    // data
    allObjects: React.ListState<T> | React.MapState<T>;
    getStringsOfObject: (object: T) => string[];

    // state
    appliedQuery = new React.State<string>("");
    searchInput = new React.State<string>("");
    matchingObjects: React.ListState<T>;

    suggestions: React.ListState<string>;

    // guards
    cannotApplySearch: React.State<boolean> = React.createProxyState(
        [this.searchInput, this.appliedQuery],
        () => this.searchInput.value == this.appliedQuery.value,
    );
    cannotClear: React.State<boolean> = React.createProxyState(
        [this.searchInput],
        () => this.searchInput.value == "",
    );

    // methods
    search = (searchTerm: string): void => {
        this.searchInput.value = searchTerm;
        this.applySearch();
    };

    applySearch = (): void => {
        this.appliedQuery.value = this.searchInput.value;

        this.matchingObjects.clear();
        for (const object of this.allObjects.value.values()) {
            const doesMatch: boolean = this.checkDoesMatchSearch(object);
            if (doesMatch == false) continue;

            this.matchingObjects.add(object);
        }
    };

    clear = (): void => {
	this.searchInput.value = "";
    }

    // init
    constructor(
        allObjects: React.ListState<T> | React.MapState<T>,
        matchingObjects: React.ListState<T>,
        getStringsOfObject: (object: T) => string[],
        suggestions: React.ListState<string>,
    ) {
        this.allObjects = allObjects;
        this.matchingObjects = matchingObjects;
        this.getStringsOfObject = getStringsOfObject;
        this.suggestions = suggestions;

        // handle new objects
        this.allObjects.handleAddition((newObject: T) => {
            const doesMatch: boolean = this.checkDoesMatchSearch(newObject);
            if (doesMatch == false) {
                this.matchingObjects.remove(newObject);
            } else {
                if (this.matchingObjects.value.has(newObject)) return;
                this.matchingObjects.add(newObject);
                this.allObjects.handleRemoval(newObject, () => {
                    this.matchingObjects.remove(newObject);
                });
            }
        });
    }

    // utility
    checkDoesMatchSearch = (object: T): boolean => {
        return checkDoesObjectMatchSearch(
            this.appliedQuery.value,
            this.getStringsOfObject,
            object,
        );
    };
}
