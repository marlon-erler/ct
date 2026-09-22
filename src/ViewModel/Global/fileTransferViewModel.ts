import CoreViewModel, { Context } from "./coreViewModel";
import * as React from "../../react";
import { CommonKeys } from "../../View/keystrokes";
import StorageModel, {
    StorageModelSubPaths,
    filePaths,
} from "../../Model/Global/storageModel";
import { TransferData } from "../../Model/Global/fileTransferModel";
import ChatModel from "../../Model/Chat/chatModel";

export default class FileTransferViewModel extends Context {
    // state
    presentedModal: React.State<FileTransferModals | undefined> =
        new React.State<any>(undefined);

    generalFileOptions: React.ListState<FileTransferOption> =
        new React.ListState();
    chatFileOptions: React.ListState<FileTransferOption> =
        new React.ListState();
    selectedPaths: React.ListState<string[]> = new React.ListState();

    transferChannel: React.State<string> = new React.State("");
    transferKey: React.State<string> = new React.State("");

    receivingTransferChannel: React.State<string> = new React.State("");
    receivingTransferKey: React.State<string> = new React.State("");

    filePathsSent: React.ListState<string> = new React.ListState();
    filesSentCount: React.State<number> = React.createProxyState(
        [this.filePathsSent],
        () => this.filePathsSent.value.size,
    );
    filesSentText: React.State<string> = React.createProxyState(
        [this.filesSentCount],
        () =>
            this.coreViewModel.translations.dataTransferModal.filesSentCount(
                this.filesSentCount.value,
            ),
    );

    filePathsReceived: React.ListState<string> = new React.ListState();
    filesReceivedCount: React.State<number> = React.createProxyState(
        [this.filePathsReceived],
        () => this.filePathsReceived.value.size,
    );
    filesReceivedText: React.State<string> = React.createProxyState(
        [this.filesReceivedCount],
        () =>
            this.coreViewModel.translations.dataTransferModal.filesReceivedCount(
                this.filesReceivedCount.value,
            ),
    );

    exportKey: React.State<string> = new React.State("");
    exportKeyConfirmation: React.State<string> = new React.State("");

    importedFile: React.State<File | undefined> = new React.State<
        File | undefined
    >(undefined);
    importedFileString: React.State<string> = new React.State("");
    importKey: React.State<string> = new React.State("");
    isImportKeyCorrect: React.State<boolean> = new React.State(true);

    // guards
    hasNoPathsSelected: React.State<boolean> = React.createProxyState(
        [this.selectedPaths],
        () => this.selectedPaths.value.size == 0,
    );
    didNotFinishSending: React.State<boolean> = new React.State(true);
    cannotPrepareToReceive: React.State<boolean> = React.createProxyState(
        [this.receivingTransferChannel, this.receivingTransferKey],
        () =>
            this.receivingTransferChannel.value == "" ||
            this.receivingTransferKey.value == "",
    );
    cannotExitReception: React.State<boolean> = React.createProxyState(
        [this.filePathsReceived],
        () => this.filePathsReceived.value.size > 0,
    );

    cannotExport: React.State<boolean> = React.createProxyState(
        [this.exportKey, this.exportKeyConfirmation],
        () =>
            this.exportKey.value == "" ||
            this.exportKey.value != this.exportKeyConfirmation.value,
    );
    cannotImport: React.State<boolean> = React.createProxyState(
        [this.importedFile],
        () => this.importedFile.value == undefined,
    );
    importDecryptSuccessful: React.State<boolean> = React.createProxyState(
        [this.importKey],
        () => this.importKey.value == "",
    );

    // handlers
    handleReceivedFile = (path: string): void => {
        this.filePathsReceived.add(path);
    };

    // methods
    getOptions = (): void => {
        this.generalFileOptions.clear();
        this.chatFileOptions.clear();
        this.selectedPaths.clear();

        this.generalFileOptions.add(
            {
                label: this.coreViewModel.translations.dataTransferModal
                    .connectionData,
                path: StorageModel.getPath(
                    StorageModelSubPaths.ConnectionModel,
                    filePaths.connectionModel.previousAddresses,
                ),
            },
            {
                label: this.coreViewModel.translations.dataTransferModal
                    .settingsData,
                path: StorageModel.getPath(
                    StorageModelSubPaths.SettingsModel,
                    [],
                ),
            },
        );

        const chatModels: Set<ChatModel> =
            this.coreViewModel.chatListModel.chatModels;
        for (const chatModel of chatModels) {
            this.chatFileOptions.add({
                label: chatModel.unwrappedPrimaryChannel,
                path: chatModel.getBasePath(),
            });
        }
    };

    getTransferData = (): void => {
        const transferData: TransferData =
            this.coreViewModel.fileTransferModel.generateTransferData();
        this.transferChannel.value = transferData.channel;
        this.transferKey.value = transferData.key;
    };

    downloadFile = async (): Promise<void> => {
        if (this.cannotExport.value == true) return;
        const date = new Date().toISOString().split("T")[0];

        const backup: Blob =
            await this.coreViewModel.fileTransferModel.generateBackup(
                this.selectedPaths.value.values(),
                this.exportKey.value,
            );
        const anchor = document.createElement("a");
        anchor.href = window.URL.createObjectURL(backup);
        anchor.download = `comms-${date}.bak`;
        anchor.click();
    };

    updateImportSelection = (): void => {
        const input = document.getElementById("file-transfer-input");
        if (!input) return;
        if (!(input instanceof HTMLInputElement)) return;

        if (!input.files) return;
        const file = input.files[0];
        this.importedFile.value = file;
    };

    importFile = (): void => {
        const file = this.importedFile.value;
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file, "utf8");
        reader.onload = () => {
            const result = reader.result;
            if (!result) return;
            this.importedFileString.value = result.toString();
            this.showImportDecryptDataModal();
        };
    };

    decryptImport = async (): Promise<void> => {
        const fileString = this.importedFileString.value;
        const key = this.importKey.value;
        if (!fileString || !key) return;

        this.importDecryptSuccessful.value = true;
        try {
            await this.coreViewModel.fileTransferModel.handleBackupFile(
                fileString,
                key,
            );
            window.location.reload();
        } catch (e) {
            console.error(e);
            this.isImportKeyCorrect.value = false;
            this.importDecryptSuccessful.value = false;
        }
    };

    // view
    showDirectionSelectionModal = (): void => {
        this.coreViewModel.context = this;
        this.presentedModal.value = FileTransferModals.DirectionSelection;
        this.getOptions();
    };

    showFileSelectionModal = (): void => {
        this.presentedModal.value = FileTransferModals.FileSelection;
    };

    showTransferDataModal = (): void => {
        this.presentedModal.value = FileTransferModals.TransferDataDisplay;
        this.getTransferData();
        this.coreViewModel.fileTransferModel.prepareToSend();
    };

    initiateTransfer = (): void => {
        this.presentedModal.value = FileTransferModals.TransferDisplay;
        this.didNotFinishSending.value = true;
        this.filePathsSent.clear();

        this.coreViewModel.fileTransferModel.sendFiles(
            this.selectedPaths.value.values(),
            (path: string) => {
                this.filePathsSent.add(path);
            },
        );

        this.didNotFinishSending.value = false;
    };

    showTransferDataInputModal = (): void => {
        this.presentedModal.value = FileTransferModals.TransferDataInput;
    };

    showExportSelectionModal = (): void => {
        this.presentedModal.value = FileTransferModals.ExportFileSelection;
    };

    showExportModal = (): void => {
        this.presentedModal.value = FileTransferModals.Export;
    };

    showImportModal = (): void => {
        this.presentedModal.value = FileTransferModals.ImportSelection;
    };

    showImportDecryptDataModal = (): void => {
        this.presentedModal.value = FileTransferModals.ImportDecryptData;
    };

    prepareReceivingData = (): void => {
        if (this.cannotPrepareToReceive.value == true) return;
        this.presentedModal.value = FileTransferModals.ReceptionDisplay;
        this.filePathsReceived.clear();

        const transferData: TransferData = {
            channel: this.receivingTransferChannel.value,
            key: this.receivingTransferKey.value,
        };
        this.coreViewModel.fileTransferModel.prepareToReceive(transferData);
    };

    // exit
    close = (): void => {
        this.coreViewModel.closeContext(this.contextId);
    };

    handleContextClose = (): void => {
        this.presentedModal.value = undefined;
    };

    // init
    constructor(public readonly coreViewModel: CoreViewModel) {
        super("file-transfer");

        this.coreViewModel.fileTransferModel.fileHandlerManager.setHandler(
            "file-transfer-view-model",
            this.handleReceivedFile,
        );

        this.coreViewModel.fileTransferModel.readyToSendHandlerManager.setHandler(
            "file-transfer-view-model",
            () => this.initiateTransfer(),
        );

        // keystrokes
        this.registerKeyStroke(CommonKeys.CloseOrCancel, this.close);
    }
}

export interface FileTransferOption {
    label: string;
    path: string[];
}

export enum FileTransferModals {
    DirectionSelection,

    // sending
    FileSelection,
    TransferDataDisplay,
    TransferDisplay,

    // receiving
    TransferDataInput,
    ReceptionDisplay,

    // export
    ExportFileSelection,
    Export,
    ImportSelection,
    ImportDecryptData,
}
