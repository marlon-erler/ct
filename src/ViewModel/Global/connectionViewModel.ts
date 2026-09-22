import * as React from "../../react";
import CoreViewModel from "./coreViewModel";

export default class ConnectionViewModel {
    // state
    serverAddressInput: React.State<string> = new React.State("");
    isConnected: React.State<boolean> = new React.State(false);

    isShowingConnectionModal: React.State<boolean> = new React.State(false);

    previousAddresses: React.ListState<string> = new React.ListState();

    // guards
    cannotConnect: React.State<boolean> = React.createProxyState(
        [this.serverAddressInput, this.isConnected],
        () =>
            (this.isConnected.value == true &&
                this.serverAddressInput.value ==
                    this.coreViewModel.connectionModel.address) ||
            this.serverAddressInput.value == "",
    );
    cannotDisonnect: React.State<boolean> = React.createProxyState(
        [this.isConnected],
        () => this.isConnected.value == false,
    );
    hasNoPreviousConnections: React.State<boolean> = React.createProxyState(
        [this.previousAddresses],
        () => this.previousAddresses.value.size == 0,
    );

    // handlers
    connectionChangeHandler = (): void => {
        this.isConnected.value = this.coreViewModel.connectionModel.isConnected;

        if (this.coreViewModel.connectionModel.isConnected == false) return;
        if (this.coreViewModel.connectionModel.address == undefined) return;

        this.serverAddressInput.value =
            this.coreViewModel.connectionModel.address;

        if (
            !this.previousAddresses.value.has(
                this.coreViewModel.connectionModel.address,
            )
        ) {
            this.previousAddresses.add(
                this.coreViewModel.connectionModel.address,
            );
        }
    };

    // methods
    connect = (): void => {
        this.connectToAddress(this.serverAddressInput.value);
    };

    connectToAddress = (address: string): void => {
        console.log(address);
        this.coreViewModel.connectionModel.connect(address);
    };

    disconnect = (): void => {
        this.coreViewModel.connectionModel.disconnect();
    };

    removePreviousAddress = (address: string): void => {
        this.coreViewModel.connectionModel.removeAddress(address);
        this.updatePreviousAddresses();
    };

    // view
    showConnectionModal = (): void => {
        this.isShowingConnectionModal.value = true;
    };

    hideConnectionModal = (): void => {
        this.isShowingConnectionModal.value = false;
    };

    updatePreviousAddresses = (): void => {
        this.previousAddresses.clear();
        this.previousAddresses.add(
            ...this.coreViewModel.connectionModel.addresses,
        );
    };

    // init
    constructor(public readonly coreViewModel: CoreViewModel) {
        this.updatePreviousAddresses();

        coreViewModel.connectionModel.connectionChangeHandlerManager.setHandler(
            "connection-view-model",
            this.connectionChangeHandler,
        );
    }
}
