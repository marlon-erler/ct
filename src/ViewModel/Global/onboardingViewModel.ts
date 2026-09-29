import SettingsViewModel from "./settingsViewModel";
import FileTransferViewModel from "./fileTransferViewModel";
import CoreViewModel from "./coreViewModel";
import ConnectionViewModel from "./connectionViewModel";
import * as React from "../../react";

export default class OnboardingViewModel {
    // state
    presentedModal: React.State<OnboardingModals | undefined> =
        new React.State<any>(undefined);

    // guards
    cannotTransfer: React.State<boolean> = React.createProxyState(
        [this.connectionViewmodel.isConnected],
        () => !this.connectionViewmodel.isConnected.value,
    );

    // navigation
    open = (): void => {
        this.presentedModal.value = OnboardingModals.Connection;
    };

    showTransferOption = (): void => {
        this.presentedModal.value = OnboardingModals.TransferOrNew;
    };

    setupNew = (): void => {
        this.presentedModal.value = OnboardingModals.Name;
    };

    showTransferData = (): void => {
        this.presentedModal.value = OnboardingModals.Transfer;
    };

    // methods
    transferData = (): void => {
        this.fileTransferViewModel.exitReception = () =>
            this.showTransferData();
        this.fileTransferViewModel.prepareReceivingData();
        this.presentedModal.value = undefined;
    };

    finish = (): void => {
        this.settingsViewModel.setName();
        this.presentedModal.value = undefined;
    };

    // init
    constructor(
        public connectionViewmodel: ConnectionViewModel,
        public fileTransferViewModel: FileTransferViewModel,
        public settingsViewModel: SettingsViewModel,
    ) {
        if (this.settingsViewModel.settingsModel.username == "") this.open();
    }
}

export enum OnboardingModals {
    Connection,
    TransferOrNew,
    Name,
    Transfer,
}
