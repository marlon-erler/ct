import * as React from "../../react";
import { checkDoesObjectMatchSearch } from "../../Model/Utility/utility";

export default class SearchViewModel<T> {
    // state
    appliedQuery = new React.State<string>("");
    searchInput = new React.State<string>("");

    // guards
    cannotApplySearch: React.State<boolean> = React.createProxyState(
        [this.searchInput, this.appliedQuery],
        () => this.searchInput.value == this.appliedQuery.value,
    );
    cannotClear: React.State<boolean> = React.createProxyState(
        [this.searchInput],
        () => this.searchInput.value == "",
    );
    hasNoSuggestions: React.State<boolean> = React.createProxyState([this.suggestions], ()=>this.suggestions.value.size == 0);

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

    deleteSuggestion = (suggestion: string): void => {
	this.suggestions.remove(suggestion);
    }

    // init
    constructor(
        public allObjects: React.ListState<T> | React.MapState<T>,
        public matchingObjects: React.ListState<T>,
        public getStringsOfObject: (object: T) => string[],
        public suggestions: React.ListState<string>,
    ) {
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
