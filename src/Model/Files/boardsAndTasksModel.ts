// cleanup: Phase A

import { v4 } from "uuid";
import FileModel, { FileContent, FileModelSubPath } from "./fileModel";
import CalendarModel from "./calendarModel";
import { HandlerManager } from "../Utility/utility";
import {
    DATA_VERSION,
    checkMatchesObjectStructure,
} from "../Utility/typeSafety";
import StorageModel from "../Global/storageModel";
import SettingsModel from "../Global/settingsModel";
import ChatModel from "../Chat/chatModel";
import { Colors } from "../../colors";

export default class BoardsAndTasksModel {
    readonly storageModel: StorageModel;
    readonly settingsModel: SettingsModel;
    readonly chatModel: ChatModel;
    readonly fileModel: FileModel;

    readonly calendarModel: CalendarModel;

    // data
    readonly boardHandlerManager = new HandlerManager<BoardInfoFileContent>();
    readonly taskHandlerManager = new HandlerManager<TaskFileContent>();

    // paths
    readonly getBasePath = (): string[] => {
        return this.fileModel.getModelContainerPath(FileModelSubPath.ModelTask);
    };

    readonly getViewPath = (): string[] => {
        return [...this.getBasePath(), FileModelSubPath.ModelView];
    };

    readonly getBoardFilePath = (boardId: string): string[] => {
        return [...this.fileModel.getFilePath(boardId)];
    };

    readonly getTaskFilePath = (taskId: string): string[] => {
        return [...this.fileModel.getFilePath(taskId)];
    };

    readonly getBoardContainerPath = (): string[] => {
        return [...this.getBasePath(), TaskModelSubPaths.Boards];
    };

    readonly getBoardDirectoryPath = (boardId: string): string[] => {
        return [...this.getBoardContainerPath(), boardId];
    };

    readonly getTaskContainerPath = (boardId: string): string[] => {
        return [
            ...this.getBoardDirectoryPath(boardId),
            TaskModelSubPaths.BoardTasks,
        ];
    };

    readonly getTaskReferencePath = (
        boardId: string,
        fileId: string,
    ): string[] => {
        return [...this.getTaskContainerPath(boardId), fileId];
    };

    // handlers
    readonly handleFileContent = (fileContent: FileContent<string>): void => {
        if (
            checkMatchesObjectStructure(
                fileContent,
                BoardInfoFileContentReference,
            ) == true
        ) {
            this.handleBoard(fileContent as BoardInfoFileContent);
        } else if (
            checkMatchesObjectStructure(
                fileContent,
                TaskFileContentReference,
            ) == true
        ) {
            this.handleTask(fileContent as TaskFileContent);
        }
    };

    readonly handleBoard = (boardInfoFileContent: BoardInfoFileContent) => {
        this.updateBoard(boardInfoFileContent);
    };

    readonly handleTask = (taskFileContent: TaskFileContent) => {
        this.updateTask(taskFileContent);
    };

    // boards
    readonly createBoard = (name: string): BoardInfoFileContent => {
        const boardInfoFileContent: BoardInfoFileContent =
            BoardsAndTasksModel.createBoardInfoFileContent(
                v4(),
                name,
                Colors.Standard,
            );
        return boardInfoFileContent;
    };

    readonly updateBoard = (
        boardInfoFileContent: BoardInfoFileContent,
    ): void => {
        this.storeBoard(boardInfoFileContent);
        this.boardHandlerManager.trigger(boardInfoFileContent);
    };

    readonly updateBoardAndSend = (
        boardInfoFileContent: BoardInfoFileContent,
    ): void => {
        this.updateBoard(boardInfoFileContent);
        this.chatModel.sendMessage("", undefined, boardInfoFileContent);
    };

    readonly storeBoard = (
        boardInfoFileContent: BoardInfoFileContent,
    ): void => {
        // store info
        this.fileModel.storeFileContent(boardInfoFileContent);

        // add to list
        const boardDirectoryPath: string[] = this.getBoardDirectoryPath(
            boardInfoFileContent.fileId,
        );
        this.storageModel.write(boardDirectoryPath, "");
    };

    readonly deleteBoard = (boardId: string): void => {
        const boardFilePath: string[] = this.getBoardFilePath(boardId);
        const boardDirectoryPath: string[] =
            this.getBoardDirectoryPath(boardId);

        this.storageModel.removeRecursively(boardFilePath);
        this.storageModel.removeRecursively(boardDirectoryPath);
    };

    readonly listBoardIds = (): string[] => {
        const boardContainerPath: string[] = this.getBoardContainerPath();
        const boardIds: string[] = this.storageModel.list(boardContainerPath);
        return boardIds;
    };

    readonly getBoardInfo = (fileId: string): BoardInfoFileContent | null => {
        const boardInfoFileContentOrNull: BoardInfoFileContent | null =
            this.fileModel.getLatestFileContent(
                fileId,
                BoardInfoFileContentReference,
            );
        return boardInfoFileContentOrNull;
    };

    readonly getBoardName = (boardId: string): string => {
        const boardInfo: BoardInfoFileContent | null =
            this.getBoardInfo(boardId);
        if (boardInfo == null) return "";
        return boardInfo.name;
    };

    //tasks
    readonly createTask = (boardId: string): TaskFileContent => {
        const taskFileContent: TaskFileContent =
            BoardsAndTasksModel.createTaskFileContent(v4(), "", boardId);
        return taskFileContent;
    };

    readonly updateTask = (taskFileContent: TaskFileContent): void => {
        this.storeTask(taskFileContent);
        this.taskHandlerManager.trigger(taskFileContent);
    };

    readonly updateTaskAndSend = (taskFileContent: TaskFileContent): void => {
        this.updateTask(taskFileContent);
        this.chatModel.sendMessage("", undefined, taskFileContent);
    };

    readonly storeTask = (taskFileContent: TaskFileContent): void => {
        // store info
        this.fileModel.storeFileContent(taskFileContent);

        // add to board
        const taskReferencePath: string[] = this.getTaskReferencePath(
            taskFileContent.boardId,
            taskFileContent.fileId,
        );
        this.storageModel.write(taskReferencePath, "");

        // add to calendar
        this.calendarModel.storeTaskReference(taskFileContent);
    };

    readonly listTaskIds = (boardId: string): string[] => {
        const taskContainerPath: string[] = this.getTaskContainerPath(boardId);
        const fileIds: string[] = this.storageModel.list(taskContainerPath);
        return fileIds;
    };

    readonly listTaskVersionIds = (taskId: string): string[] => {
        const versionIds: string[] = this.fileModel.listFileContentIds(taskId);
        return versionIds;
    };

    readonly getLatestTaskFileContent = (
        taskId: string,
    ): TaskFileContent | null => {
        const taskFileContentOrNull: TaskFileContent | null =
            this.fileModel.getLatestFileContent(
                taskId,
                TaskFileContentReference,
            );
        return taskFileContentOrNull;
    };

    readonly getSpecificTaskFileContent = (
        taskId: string,
        versionId: string,
    ): TaskFileContent | null => {
        const taskFileContentOrNull: TaskFileContent | null =
            this.fileModel.getFileContent(
                taskId,
                versionId,
                TaskFileContentReference,
            );
        return taskFileContentOrNull;
    };

    readonly deleteTask = (boardId: string, taskId: string): void => {
        const taskFilePath: string[] = this.getTaskFilePath(taskId);
        this.storageModel.removeRecursively(taskFilePath);

        this.deleteTaskReference(boardId, taskId);
    };

    readonly deleteTaskReference = (boardId: string, taskId: string): void => {
        const taskReferencePath: string[] = this.getTaskReferencePath(
            boardId,
            taskId,
        );
        this.storageModel.removeRecursively(taskReferencePath);
    };

    // init
    constructor(
        storageModel: StorageModel,
        settingsModel: SettingsModel,
        chatModel: ChatModel,
        fileModel: FileModel,
    ) {
        this.storageModel = storageModel;
        this.settingsModel = settingsModel;
        this.chatModel = chatModel;
        this.fileModel = fileModel;

        this.calendarModel = new CalendarModel(
            this.storageModel,
            this.settingsModel,
            this.fileModel,
        );
    }

    // utility
    static createBoardInfoFileContent = (
        fileId: string,
        name: string,
        color: Colors,
    ): BoardInfoFileContent => {
        const fileContent: FileContent<"board-info"> =
            FileModel.createFileContent(fileId, "board-info");
        return {
            ...fileContent,

            name,
            color,
        };
    };

    static createTaskFileContent = (
        fileId: string,
        name: string,
        boardId: string,
    ): TaskFileContent => {
        const fileContent: FileContent<"task"> = FileModel.createFileContent(
            fileId,
            "task",
        );
        return {
            ...fileContent,

            name,
            boardId,
        };
    };
}

export enum TaskModelSubPaths {
    Boards = "boards",
    BoardTasks = "tasks",
}

// types
export interface BoardInfoFileContent extends FileContent<"board-info"> {
    name: string;
    color: Colors;
}

export interface TaskFileContent extends FileContent<"task"> {
    name: string;
    boardId: string;

    description?: string;

    category?: string;
    status?: string;
    priority?: string;

    date?: string;
    time?: string;
}

// reference
export const BoardInfoFileContentReference: BoardInfoFileContent = {
    dataVersion: DATA_VERSION,

    fileId: "",
    fileContentId: "",
    creationDate: "",

    type: "board-info",

    name: "",
    color: "" as Colors,
};

export const TaskFileContentReference: TaskFileContent = {
    dataVersion: DATA_VERSION,

    fileId: "string",
    fileContentId: "",
    creationDate: "",
    type: "task",

    name: "",
    boardId: "",
};
