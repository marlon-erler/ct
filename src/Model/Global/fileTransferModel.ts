// cleanup: Phase A

import { Message } from "udn-frontend";
import StorageModel from "./storageModel";
import ConnectionModel from "./connectionModel";
import {
    HandlerManager,
    generateRandomToken,
    parse,
    stringify,
} from "../Utility/utility";
import { checkMatchesObjectStructure } from "../Utility/typeSafety";
import { decryptString, encryptString } from "../Utility/crypto";

export default class FileTransferModel {
    readonly storageModel: StorageModel;
    readonly connectionModel: ConnectionModel;

    static READY_MESSAGE = "ready";

    // data
    transferData: TransferData | undefined;
    direction: TransferDirections = TransferDirections.Send;

    // handler managers
    readonly fileHandlerManager = new HandlerManager<string>();
    readonly readyToSendHandlerManager = new HandlerManager<boolean>();

    // general
    readonly generateTransferData = (): TransferData => {
        const transferData: TransferData = {
            channel: generateRandomToken(4),
            key: generateRandomToken(6),
        };
        this.transferData = transferData;
        return transferData;
    };

    readonly prepareToSend = (): void => {
        this.direction = TransferDirections.Send;
        this.connectionModel.addChannel(this.transferData.channel);
    };

    readonly prepareToReceive = (transferData: TransferData): void => {
        this.direction = TransferDirections.Receive;

        this.connectionModel.addChannel(transferData.channel);
        this.transferData = transferData;
        this.connectionModel.sendPlainMessage(
            transferData.channel,
            FileTransferModel.READY_MESSAGE,
        );
    };

    // handlers
    readonly handleMessage = (data: Message): void => {
        if (this.transferData == undefined) return;
        if (data.messageChannel != this.transferData.channel) return;
        if (
            data.messageBody == FileTransferModel.READY_MESSAGE &&
            this.direction == TransferDirections.Send
        ) {
            this.readyToSendHandlerManager.trigger(true);
        }

        if (this.transferData == undefined) return;
        if (data.messageBody == undefined) return;

        this.handleTransferredFile(data.messageBody);
    };

    readonly handleTransferredFile = async (
        encryptedFileData: string,
    ): Promise<void> => {
        if (this.transferData == undefined) return;

        const decrypted: string = await decryptString(
            encryptedFileData,
            this.transferData.key,
        );

        this.handleDecryptedFile(decrypted);
    };

    readonly handleBackupFile = async (
        encryptedBackup: string,
        passphrase: string,
    ): Promise<void> => {
        const decrypted: string = await decryptString(
            encryptedBackup,
            passphrase,
        );
        const parsed = parse(decrypted);
        if (!Array.isArray(parsed)) {
            console.error("Canceling backup - not an array", decrypted);
            throw "no array";
        }

        for (const file of parsed) {
            this.handleDecryptedFile(file);
        }
    };

    readonly handleDecryptedFile = (data: string): void => {
        const parsed: any = parse(data);
        const isFileData: boolean = checkMatchesObjectStructure(
            parsed,
            FileDataReference,
        );
        if (isFileData == false) throw "not file data";

        const fileData: FileData = parsed;
        this.storageModel.write(fileData.path, fileData.body);

        const pathString: string = StorageModel.pathComponentsToString(
            ...fileData.path,
        );
        this.fileHandlerManager.trigger(pathString);
    };

    // sending
    readonly sendFiles = (
        directoryPaths: IteratorObject<string[]>,
        fileCallback: (path: string) => void,
    ): void => {
        for (const directoryPath of directoryPaths) {
            this.storageModel.recurse(directoryPath, (filePath: string[]) => {
                const stringifiedFileData =
                    this.prepareFileForSending(filePath);
                this.sendFile(stringifiedFileData);
                const pathString: string = StorageModel.pathComponentsToString(
                    ...filePath,
                );
                fileCallback(pathString);
            });
        }
    };

    readonly generateBackup = async (
        directoryPaths: IteratorObject<string[]>,
        passphrase: string,
    ): Promise<Blob> => {
        const files: string[] = [];
        for (const directoryPath of directoryPaths) {
            this.storageModel.recurse(directoryPath, (filePath: string[]) => {
                const stringifiedFileData =
                    this.prepareFileForSending(filePath);
                files.push(stringifiedFileData);
            });
        }
        const rawBackup = stringify(files);
        console.log(rawBackup);
        const encrypted = await encryptString(rawBackup, passphrase);
        const blob = new Blob([encrypted], { type: "text/plain" });
        return blob;
    };

    readonly prepareFileForSending = (filePath: string[]): string => {
        const fileContent: string | undefined =
            this.storageModel.read(filePath);
        if (fileContent == null) return "";

        const fileData: FileData = {
            path: filePath,
            body: fileContent,
        };
        return stringify(fileData);
    };

    readonly sendFile = async (stringifiedFileData: string): Promise<void> => {
        const encryptedFileData: string = await encryptString(
            stringifiedFileData,
            this.transferData.key,
        );
        this.connectionModel.sendPlainMessage(
            this.transferData.channel,
            encryptedFileData,
        );
    };

    // init
    constructor(storageModel: StorageModel, connectionModel: ConnectionModel) {
        this.storageModel = storageModel;
        this.connectionModel = connectionModel;

        this.connectionModel.messageHandlerManager.setHandler(
            "file-transfer",
            this.handleMessage,
        );
    }
}

export interface TransferData {
    readonly channel: string;
    readonly key: string;
}

export interface FileData {
    path: string[];
    body: string;
}

export const FileDataReference: FileData = {
    path: [""],
    body: "",
};

export enum TransferDirections {
    Send,
    Receive,
}
