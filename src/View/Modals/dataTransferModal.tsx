import { ViewController } from "../viewController";
import { StringToTextSpan } from "../Components/textSpan";
import * as React from "../../react";
import FileTransferViewModel, {
    FileTransferModals,
    FileTransferOption,
} from "../../ViewModel/Global/fileTransferViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ConnectionViewModel from "../../ViewModel/Global/connectionViewModel";
import StorageModel from "../../Model/Global/storageModel";

// MAIN
export function DataTransferModalWrapper(
    coreViewModel: CoreViewModel,
    connectionViewModel: ConnectionViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    return (
        <div>
            {DirectionSelectionModal(
                coreViewModel,
                connectionViewModel,
                fileTransferViewModel,
            )}
            {FileSelectionModal(coreViewModel, fileTransferViewModel)}
            {TransferDataDisplayModal(coreViewModel, fileTransferViewModel)}
            {TransferDisplayModal(coreViewModel, fileTransferViewModel)}
            {TransferDataInputModal(coreViewModel, fileTransferViewModel)}
            {DataReceptionModal(coreViewModel, fileTransferViewModel)}
            {ExportFileSelectionModal(coreViewModel, fileTransferViewModel)}
            {ExportModal(coreViewModel, fileTransferViewModel)}
            {ImportModal(coreViewModel, fileTransferViewModel)}
            {ImportDecryptionDataModal(coreViewModel, fileTransferViewModel)}
        </div>
    );
}

// COMPONENTS
function OptionEntry(
    fileOption: FileTransferOption,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isSelected = new React.State(false);
    if (fileTransferViewModel.selectedPaths.value.has(fileOption.path)) {
        isSelected.value = true;
    }
    isSelected.subscribeSilent((isSelected) => {
        if (isSelected == true) {
            fileTransferViewModel.selectedPaths.add(fileOption.path);
        } else {
            fileTransferViewModel.selectedPaths.remove(fileOption.path);
        }
    });
    function toggle() {
        isSelected.value = !isSelected.value;
    }

    return (
        <button class="tile" toggle:selected={isSelected} on:click={toggle}>
            <div>
                <b class="ellipsis">{fileOption.label}</b>
                <span class="secondary ellipsis">
                    {StorageModel.pathComponentsToString(...fileOption.path)}
                </span>
            </div>
        </button>
    );
}

// MODALS
function DirectionSelectionModal(
    coreViewModel: CoreViewModel,
    connectionViewModel: ConnectionViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.DirectionSelection,
    );

    const isDisconnected = React.createProxyState(
        [connectionViewModel.isConnected],
        () => connectionViewModel.isConnected.value == false,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .transferDataHeadline
                        }
                    </h2>

                    <div class="flex-column gap content-margin-bottom">
                        <button
                            class="tile"
                            toggle:disabled={isDisconnected}
                            on:click={
                                fileTransferViewModel.showFileSelectionModal
                            }
                        >
                            <span class="icon">share_windows</span>
                            <div>
                                <b>
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .fromThisDeviceButton
                                    }
                                </b>
                            </div>
                            <span class="icon">arrow_forward</span>
                        </button>
                        <button
                            class="tile"
                            toggle:disabled={isDisconnected}
                            on:click={
                                fileTransferViewModel.showTransferDataInputModal
                            }
                        >
                            <span class="icon">cloud_download</span>
                            <div>
                                <b>
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .toThisDeviceButton
                                    }
                                </b>
                            </div>
                            <span class="icon">arrow_forward</span>
                        </button>

                        <hr></hr>

                        <button
                            class="tile"
                            on:click={
                                fileTransferViewModel.showExportSelectionModal
                            }
                        >
                            <span class="icon">file_save</span>
                            <div>
                                <b>
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal.exportButton
                                    }
                                </b>
                            </div>
                            <span class="icon">arrow_forward</span>
                        </button>
                        <button
                            class="tile"
                            on:click={fileTransferViewModel.showImportModal}
                        >
                            <span class="icon">upload_file</span>
                            <div>
                                <b>
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal.importButton
                                    }
                                </b>
                            </div>
                            <span class="icon">arrow_forward</span>
                        </button>
                    </div>
                </main>
                <button on:click={fileTransferViewModel.close}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}

function FileSelectionModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const OptionConverter: React.StateItemConverter<FileTransferOption> = (
        fileOption: FileTransferOption,
    ) => {
        return OptionEntry(fileOption, fileTransferViewModel);
    };

    // state
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.FileSelection,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .sendHeadline
                        }
                    </h2>
                    <span class="secondary">
                        {
                            coreViewModel.translations.dataTransferModal
                                .selectionDescription
                        }
                    </span>

                    <hr></hr>

                    <h3>
                        {
                            coreViewModel.translations.dataTransferModal
                                .generalHeadline
                        }
                    </h3>
                    <div
                        class="flex-column gap content-margin-bottom"
                        children:append={[
                            fileTransferViewModel.generalFileOptions,
                            OptionConverter,
                        ]}
                    ></div>

                    <h3>
                        {
                            coreViewModel.translations.dataTransferModal
                                .chatsHeadline
                        }
                    </h3>
                    <div
                        class="flex-column gap"
                        children:append={[
                            fileTransferViewModel.chatFileOptions,
                            OptionConverter,
                        ]}
                    ></div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={
                            fileTransferViewModel.showDirectionSelectionModal
                        }
                    >
                        {coreViewModel.translations.general.backButton}
                    </button>
                    <button
                        class="primary flex"
                        on:click={fileTransferViewModel.showTransferDataModal}
                        toggle:disabled={
                            fileTransferViewModel.hasNoPathsSelected
                        }
                    >
                        {coreViewModel.translations.general.continueButton}
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function TransferDataDisplayModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.TransferDataDisplay,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .sendHeadline
                        }
                    </h2>

                    <span class="secondary">
                        {
                            coreViewModel.translations.dataTransferModal
                                .dataEntryDescription
                        }
                    </span>

                    <hr></hr>

                    <div class="flex-column gap content-margin-bottom">
                        <div class="tile">
                            <span class="icon">forum</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .transferChannelHeadline
                                    }
                                </span>
                                <b
                                    subscribe:innerText={
                                        fileTransferViewModel.transferChannel
                                    }
                                ></b>
                            </div>
                        </div>
                        <div class="tile">
                            <span class="icon">key</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .transferKeyHeadline
                                    }
                                </span>
                                <b
                                    subscribe:innerText={
                                        fileTransferViewModel.transferKey
                                    }
                                ></b>
                            </div>
                        </div>
                    </div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={fileTransferViewModel.showFileSelectionModal}
                    >
                        {coreViewModel.translations.general.backButton}
                    </button>
                    <button disabled class="flex">
                        {coreViewModel.translations.general.waitingLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TransferDisplayModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.TransferDisplay,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .transferDataHeadline
                        }
                    </h2>

                    <p
                        class="secondary"
                        subscribe:innerText={
                            fileTransferViewModel.filesSentText
                        }
                    ></p>

                    <p
                        class="secondary"
                        toggle:hidden={
                            fileTransferViewModel.didNotFinishSending
                        }
                    >
                        {
                            coreViewModel.translations.dataTransferModal
                                .allFilesSent
                        }
                    </p>

                    <hr></hr>

                    <div class="flex-column gap content-margin-bottom">
                        <div class="tile">
                            <span class="icon">forum</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .transferChannelHeadline
                                    }
                                </span>
                                <b
                                    subscribe:innerText={
                                        fileTransferViewModel.transferChannel
                                    }
                                ></b>
                            </div>
                        </div>
                        <div class="tile">
                            <span class="icon">key</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .transferKeyHeadline
                                    }
                                </span>
                                <b
                                    subscribe:innerText={
                                        fileTransferViewModel.transferKey
                                    }
                                ></b>
                            </div>
                        </div>
                    </div>

                    <hr></hr>

                    <div
                        class="tile flex-column align-start"
                        children:append={[
                            fileTransferViewModel.filePathsSent,
                            StringToTextSpan,
                        ]}
                    ></div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={fileTransferViewModel.initiateTransfer}
                    >
                        {
                            coreViewModel.translations.dataTransferModal
                                .sendAgainButton
                        }
                        <span class="icon">restart_alt</span>
                    </button>
                    <button
                        class="flex"
                        on:click={fileTransferViewModel.close}
                        toggle:disabled={
                            fileTransferViewModel.didNotFinishSending
                        }
                    >
                        {coreViewModel.translations.general.closeButton}
                        <span class="icon">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function TransferDataInputModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.TransferDataInput,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .receiveHeadline
                        }
                    </h2>

                    <span class="secondary">
                        {
                            coreViewModel.translations.dataTransferModal
                                .dataEntryInputDescription
                        }
                    </span>

                    <hr></hr>

                    <div class="flex-column gap content-margin-bottom">
                        <label class="tile">
                            <span class="icon">forum</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .transferChannelHeadline
                                    }
                                </span>
                                <input
                                    type="number"
                                    on:enter={
                                        fileTransferViewModel.prepareReceivingData
                                    }
                                    bind:value={
                                        fileTransferViewModel.receivingTransferChannel
                                    }
                                ></input>
                            </div>
                        </label>
                        <label class="tile">
                            <span class="icon">key</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .transferKeyHeadline
                                    }
                                </span>
                                <input
                                    type="number"
                                    on:enter={
                                        fileTransferViewModel.prepareReceivingData
                                    }
                                    bind:value={
                                        fileTransferViewModel.receivingTransferKey
                                    }
                                ></input>
                            </div>
                        </label>
                    </div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={
                            fileTransferViewModel.showDirectionSelectionModal
                        }
                    >
                        {coreViewModel.translations.general.backButton}
                    </button>
                    <button
                        class="primary flex"
                        on:click={fileTransferViewModel.prepareReceivingData}
                        toggle:disabled={
                            fileTransferViewModel.cannotPrepareToReceive
                        }
                    >
                        {coreViewModel.translations.general.continueButton}
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function DataReceptionModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.ReceptionDisplay,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .receiveHeadline
                        }
                    </h2>

                    <p
                        class="secondary"
                        subscribe:innerText={
                            fileTransferViewModel.filesReceivedText
                        }
                    ></p>

                    <hr></hr>

                    <div
                        class="tile flex-column align-start"
                        children:append={[
                            fileTransferViewModel.filePathsReceived,
                            StringToTextSpan,
                        ]}
                    ></div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={fileTransferViewModel.correctTransferData}
                        toggle:disabled={
                            fileTransferViewModel.cannotExitReception
                        }
                    >
                        {coreViewModel.translations.general.backButton}
                    </button>
                    <button class="flex" on:click={ViewController.reload}>
                        {coreViewModel.translations.general.reloadAppButton}
                        <span class="icon">refresh</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ExportFileSelectionModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const OptionConverter: React.StateItemConverter<FileTransferOption> = (
        fileOption: FileTransferOption,
    ) => {
        return OptionEntry(fileOption, fileTransferViewModel);
    };

    // state
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.ExportFileSelection,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .exportHeadline
                        }
                    </h2>
                    <span class="secondary">
                        {
                            coreViewModel.translations.dataTransferModal
                                .exportSelectionDescription
                        }
                    </span>

                    <hr></hr>

                    <h3>
                        {
                            coreViewModel.translations.dataTransferModal
                                .generalHeadline
                        }
                    </h3>
                    <div
                        class="flex-column gap content-margin-bottom"
                        children:append={[
                            fileTransferViewModel.generalFileOptions,
                            OptionConverter,
                        ]}
                    ></div>

                    <h3>
                        {
                            coreViewModel.translations.dataTransferModal
                                .chatsHeadline
                        }
                    </h3>
                    <div
                        class="flex-column gap"
                        children:append={[
                            fileTransferViewModel.chatFileOptions,
                            OptionConverter,
                        ]}
                    ></div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={
                            fileTransferViewModel.showDirectionSelectionModal
                        }
                    >
                        {coreViewModel.translations.general.backButton}
                    </button>
                    <button
                        class="primary flex"
                        on:click={fileTransferViewModel.showExportModal}
                        toggle:disabled={
                            fileTransferViewModel.hasNoPathsSelected
                        }
                    >
                        {coreViewModel.translations.general.continueButton}
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ExportModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.Export,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .exportHeadline
                        }
                    </h2>

                    <div class="flex-column gap content-margin-bottom">
                        <label class="tile">
                            <span class="icon">key</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal.exportKey
                                    }
                                </span>
                                <input
                                    bind:value={fileTransferViewModel.exportKey}
                                    on:enter={
                                        fileTransferViewModel.downloadFile
                                    }
                                    type="password"
                                ></input>
                            </div>
                        </label>
                        <label class="tile">
                            <span class="icon">check_circle</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal
                                            .exportKeyConfirmation
                                    }
                                </span>
                                <input
                                    bind:value={
                                        fileTransferViewModel.exportKeyConfirmation
                                    }
                                    on:enter={
                                        fileTransferViewModel.downloadFile
                                    }
                                    type="password"
                                ></input>
                            </div>
                        </label>
                    </div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={
                            fileTransferViewModel.showExportSelectionModal
                        }
                    >
                        {coreViewModel.translations.general.backButton}
                    </button>
                    <button
                        class="primary flex"
                        on:click={fileTransferViewModel.downloadFile}
                        toggle:disabled={fileTransferViewModel.cannotExport}
                    >
                        {
                            coreViewModel.translations.dataTransferModal
                                .downloadFileButton
                        }
                        <span class="icon">download</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ImportModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.ImportSelection,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .importHeadline
                        }
                    </h2>

                    <div class="flex-column gap content-margin-bottom">
                        <input
                            id="file-transfer-input"
                            type="file"
                            on:change={
                                fileTransferViewModel.updateImportSelection
                            }
                        ></input>
                    </div>
                </main>

                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={
                            fileTransferViewModel.showDirectionSelectionModal
                        }
                    >
                        {coreViewModel.translations.general.backButton}
                    </button>
                    <button
                        class="primary flex"
                        on:click={fileTransferViewModel.importFile}
                        toggle:disabled={fileTransferViewModel.cannotImport}
                    >
                        {
                            coreViewModel.translations.dataTransferModal
                                .importFileButton
                        }
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ImportDecryptionDataModal(
    coreViewModel: CoreViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModals.ImportDecryptData,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.dataTransferModal
                                .importHeadline
                        }
                    </h2>

                    <div class="flex-column gap content-margin-bottom">
                        <label class="tile">
                            <span class="icon">key</span>
                            <div>
                                <span class="secondary">
                                    {
                                        coreViewModel.translations
                                            .dataTransferModal.exportKey
                                    }
                                </span>
                                <input
                                    bind:value={fileTransferViewModel.importKey}
                                    on:enter={
                                        fileTransferViewModel.decryptImport
                                    }
                                    type="password"
                                ></input>
                            </div>
                        </label>
                    </div>

                    <p
                        class="error"
                        toggle:hidden={fileTransferViewModel.isImportKeyCorrect}
                    >
                        {
                            coreViewModel.translations.dataTransferModal
                                .incorrectPassphraseError
                        }
                    </p>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={fileTransferViewModel.showImportModal}
                    >
                        {coreViewModel.translations.general.backButton}
                    </button>
                    <button
                        class="primary flex"
                        on:click={fileTransferViewModel.decryptImport}
                        toggle:disabled={
                            fileTransferViewModel.importDecryptSuccessful
                        }
                    >
                        {
                            coreViewModel.translations.dataTransferModal
                                .decryptImportButton
                        }
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
