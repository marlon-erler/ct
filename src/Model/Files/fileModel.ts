import { v4 } from "uuid";
import BoardsAndTasksModel from "./boardsAndTasksModel";
import {
    StringEntryObject,
    createTimestamp,
    parseValidObject,
    stringify,
} from "../Utility/utility";
import {
    checkMatchesObjectStructure,
    DATA_VERSION,
    ValidObject,
} from "../Utility/typeSafety";
import StorageModel, {
    StorageModelSubPaths,
    filePaths,
} from "../Global/storageModel";
import SettingsModel from "../Global/settingsModel";
import ChatModel, {
    ChatInfoFileContent,
    ChatInfoReference,
} from "../Chat/chatModel";

export default class FileModel {
    readonly storageModel: StorageModel;
    readonly settingsModel: SettingsModel;

    readonly chatModel: ChatModel;
    readonly boardsAndTasksModel: BoardsAndTasksModel;

    // paths
    get basePath(): string[] {
        return StorageModel.getPath(
            StorageModelSubPaths.Chat,
            filePaths.chat.files(this.chatModel.id),
        );
    }

    readonly getFileContainerPath = (): string[] => {
        return [...this.basePath, FileModelSubPath.Data];
    };

    readonly getModelContainerPath = (
        modelName: FileModelSubPath,
    ): string[] => {
        return [...this.basePath, FileModelSubPath.Model, modelName];
    };

    readonly getFilePath = (fileId: string): string[] => {
        return [...this.getFileContainerPath(), fileId];
    };

    readonly getFileContentPath = (
        fileId: string,
        fileContentId: string,
    ): string[] => {
        const filePath: string[] = this.getFilePath(fileId);
        return [...filePath, fileContentId];
    };

    // handlers
    readonly handleStringifiedFileContent = (
        stringifiedFileContent: string,
    ): void => {
        const fileContent: FileContent<string> | null = parseValidObject(
            stringifiedFileContent,
            FileContentReference,
        );
        if (fileContent == null) return;

        this.handleFileContent(fileContent);
    };

    readonly handleFileContent = (fileContent: FileContent<string>): void => {
        console.log(fileContent.type);

        if (fileContent.type == "chat-info") {
            if (
                checkMatchesObjectStructure(fileContent, ChatInfoReference) ==
                false
            )
                return;
            this.chatModel.handleInfo(fileContent as ChatInfoFileContent);
        }

        const didStore: boolean = this.storeFileContent(fileContent);
        if (didStore == false) return;

        switch (fileContent.type) {
            case "board-info":
            case "task":
                this.boardsAndTasksModel.handleFileContent(fileContent);
                break;
            case "reaction":
                this.chatModel.handleReaction(fileContent);
                break;
        }
    };

    // methods
    readonly addFileContentAndSend = (
        fileContent: FileContent<string>,
    ): void => {
        this.handleFileContent(fileContent);
        this.chatModel.sendMessage("", undefined, fileContent);
    };

    // storage
    readonly storeFileContent = (fileContent: FileContent<string>): boolean => {
        const fileContentPath: string[] = this.getFileContentPath(
            fileContent.fileId,
            fileContent.fileContentId,
        );

        // check if fileContent already exists
        const existingFileContent: string | null =
            this.storageModel.read(fileContentPath);
        if (existingFileContent != null) return false;

        const stringifiedContent: string = stringify(fileContent);
        this.storageModel.write(fileContentPath, stringifiedContent);
        return true;
    };

    readonly listFileIds = (): string[] => {
        return this.storageModel.list(this.basePath);
    };

    readonly listFileContentIds = (fileId: string): string[] => {
        const filePath: string[] = this.getFilePath(fileId);
        return this.storageModel.list(filePath);
    };

    readonly selectLatestFileContentId = (
        fileContentIds: string[],
    ): string | undefined => {
        return fileContentIds[fileContentIds.length - 1];
    };

    readonly getFileContent = <T extends FileContent<string>>(
        fileId: string,
        fileContentName: string,
        reference: T,
    ): T | null => {
        const filePath: string[] = this.getFileContentPath(
            fileId,
            fileContentName,
        );
        const fileContentOrNull: T | null = this.storageModel.readStringifiable(
            filePath,
            reference,
        );
        return fileContentOrNull;
    };

    readonly getLatestFileContent = <T extends FileContent<string>>(
        fileId: string,
        reference: T,
    ): T | null => {
        const fileContentsIds: string[] = this.listFileContentIds(fileId);
        const latestFileContentId: string | undefined =
            this.selectLatestFileContentId(fileContentsIds);
        if (latestFileContentId == undefined) return null;

        const fileContent: T | null = this.getFileContent(
            fileId,
            latestFileContentId,
            reference,
        );
        return fileContent;
    };

    // init
    constructor(
        storageModel: StorageModel,
        settingsModel: SettingsModel,
        chatModel: ChatModel,
    ) {
        this.chatModel = chatModel;
        this.settingsModel = settingsModel;
        this.storageModel = storageModel;

        this.boardsAndTasksModel = new BoardsAndTasksModel(
            this.storageModel,
            this.settingsModel,
            chatModel,
            this,
        );
    }

    // utility
    static generateFileContentId = (creationDate: string): string => {
        return creationDate + v4();
    };

    static createFileContent = <T extends string>(
        fileId: string,
        type: T,
    ): FileContent<T> => {
        const creationDate: string = createTimestamp();
        const fileContentId: string =
            FileModel.generateFileContentId(creationDate);

        return {
            dataVersion: DATA_VERSION,

            fileId,
            fileContentId,
            creationDate,
            type,
        };
    };
}

// paths
export enum FileModelSubPath {
    Data = "data",
    Model = "model",
    Chat = "chat",
    ModelView = "view",
    ModelTask = "tasks",
    ModelCalendar = "calendar",
}

// types
export interface FileContent<T extends string>
    extends ValidObject, StringEntryObject {
    readonly fileId: string;
    readonly fileContentId: string;
    readonly creationDate: string;

    readonly type: T;
}

// references
export const FileContentReference: FileContent<string> = {
    dataVersion: DATA_VERSION,

    fileId: "",
    fileContentId: "",
    creationDate: "",

    type: "",
};
