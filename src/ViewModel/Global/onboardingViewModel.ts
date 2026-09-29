import CoreViewModel from "./coreViewModel";
import * as React from "../../react";
import FileTransferViewModel from "./fileTransferViewModel";
import ConnectionViewModel from "./connectionViewModel";
import SettingsViewModel from "./settingsViewModel";

export default class OnboardingViewModel {
    // state
    presentedModal: React.State<OnboardingModals | undefined> = new React.State<any>(undefined);

    // navigation 
    open = (): void => {
	this.presentedModal.value = OnboardingModals.Connection;
    }

    showTransfer = (): void => {
	this.presentedModal.value = OnboardingModals.TransferOrNew;
    }

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
    Name
}
