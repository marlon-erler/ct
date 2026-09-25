import CoreViewModel, { Context } from "./coreViewModel";
import * as React from "../../react";
import { CommonKeys } from "../../View/keystrokes";
import StorageModel, {
    PATH_COMPONENT_SEPARATOR,
} from "../../Model/Global/storageModel";

export default class StorageViewModel extends Context {
    // state
    isShowingStorageModal: React.State<boolean> = new React.State(false);
    selectedPath: React.State<string> = new React.State(
        PATH_COMPONENT_SEPARATOR,
    );
    didMakeChanges: React.State<boolean> = new React.State(false);

    occupiedSpaceMB: React.State<number> = new React.State(0);
    maximumSpaceMB: React.State<number> = new React.State(0);

    selectedFileName: React.State<string>;
    selectedFileContent: React.State<string>;

    lastDeletedItemPath: React.State<string> = new React.State("");

    // methods
    getSelectedItemContent = (): string => {
        const path: string[] = StorageModel.stringToPathComponents(
            this.selectedPath.value,
        );
        const content: string | null =
            this.coreViewModel.storageModel.read(path);
        return (
            (content ?? this.coreViewModel.translations.storage.notAFile) ||
            this.coreViewModel.translations.storage.contentEmpty
        );
    };

    deleteSelectedItem = (): void => {
        const path: string[] = StorageModel.stringToPathComponents(
            this.selectedPath.value,
        );
        this.lastDeletedItemPath.value = this.selectedPath.value;

        this.coreViewModel.storageModel.removeRecursively(path);
        this.didMakeChanges.value = true;
    };

    removeJunk = (): void => {
        this.coreViewModel.storageModel.removeJunk();
        this.selectedPath.value = PATH_COMPONENT_SEPARATOR;
    };

    calculateUsage = (): void => {
	this.occupiedSpaceMB.value = this.coreViewModel.storageModel.calculateUsage();
	this.maximumSpaceMB.value = this.coreViewModel.storageModel.determineCapacity();
    }

    // view
    showStorageModal = (): void => {
        this.coreViewModel.context = this;
        this.isShowingStorageModal.value = true;
	this.calculateUsage();
    };

    // exit
    close = (): void => {
        this.coreViewModel.closeContext(this.contextId);
    };

    handleContextClose = (): void => {
        if (this.didMakeChanges.value == true) {
            window.location.reload();
            return;
        }
        this.isShowingStorageModal.value = false;
    };

    // init
    constructor(public readonly coreViewModel: CoreViewModel) {
        super("storage");

        this.selectedFileName = React.createProxyState(
            [this.selectedPath],
            () => StorageModel.getFileNameFromString(this.selectedPath.value),
        );
        this.selectedFileContent = React.createProxyState(
            [this.selectedPath],
            () => this.getSelectedItemContent(),
        );

        // keystrokes
        this.registerKeyStroke(CommonKeys.CloseOrCancel, this.close);
    }
}
