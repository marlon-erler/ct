import { DeletableListItem } from "../Components/deletableListItem";
import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ConnectionViewModel from "../../ViewModel/Global/connectionViewModel";

export function ConnectionModal(
    coreViewModel: CoreViewModel,
    connectionViewModel: ConnectionViewModel,
) {
    const previousAddressConverter: React.StateItemConverter<string> = (
        address: string,
    ) => {
        function connnect() {
            connectionViewModel.connectToAddress(address);
        }

        const cannotConnect = React.createProxyState(
            [connectionViewModel.isConnected],
            () =>
                connectionViewModel.isConnected.value == true &&
                connectionViewModel.coreViewModel.connectionModel.address ==
                    address,
        );

        return DeletableListItem(
            coreViewModel,
            address,
            <button
                class="primary"
                on:click={connnect}
                toggle:disabled={cannotConnect}
                aria-label={
                    coreViewModel.translations.connectionModal
                        .connectButtonAudioLabel
                }
            >
                <span class="icon">link</span>
            </button>,
            () => {
                connectionViewModel.removePreviousAddress(address);
            },
        );
    };

    return (
        <div
            class="modal"
            toggle:open={connectionViewModel.isShowingConnectionModal}
        >
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.connectionModal
                                .connectionModalHeadline
                        }
                    </h2>

                    <div
                        class="flex-column gap"
                        children:append={[
                            connectionViewModel.previousAddresses,
                            previousAddressConverter,
                        ]}
                    ></div>
                </main>
                <button on:click={connectionViewModel.hideConnectionModal}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
