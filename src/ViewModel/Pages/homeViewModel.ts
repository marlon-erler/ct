import StorageViewModel from "../Global/storageViewModel";
import SettingsViewModel from "../Global/settingsViewModel";
import FileTransferViewModel from "../Global/fileTransferViewModel";
import CoreViewModel, { Context } from "../Global/coreViewModel";
import ConnectionViewModel from "../Global/connectionViewModel";
import * as React from "../../react";
import { CommonKeys } from "../../View/keystrokes";

export default class HomeViewModel extends Context {
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly settingsViewModel: SettingsViewModel,
        public readonly fileTransferViewModel: FileTransferViewModel,
        public readonly storageViewModel: StorageViewModel,
        public readonly connectionViewModel: ConnectionViewModel,
    ) {
        super("home");

        this.coreViewModel.context = this;

        this.registerKeyStroke(
            CommonKeys.Settings,
            this.settingsViewModel.showSettingsModal,
        );
        this.registerKeyStroke(
            "t",
            this.fileTransferViewModel.showDirectionSelectionModal,
        );
        this.registerKeyStroke("e", this.storageViewModel.showStorageModal);
        this.registerKeyStroke("x", this.connectionViewModel.disconnect);
        this.registerKeyStroke("c", this.connectionViewModel.connect);
    }
}
