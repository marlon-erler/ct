import * as React from "bloatless-react";
import TaskContainingPageViewModel from "./taskContainingPageViewModel";
import CoreViewModel, { Context } from "../Global/coreViewModel";
import ChatViewModel from "../Chat/chatViewModel";
import { ViewController } from "../../View/viewController";
import { CommonKeys } from "../../View/keystrokes";
import { localeCompare, padZero } from "../../Model/Utility/utility";
import BoardsAndTasksModel, {
    TaskFileContent,
} from "../../Model/Files/boardsAndTasksModel";

export default class TaskViewModel extends Context {
    // util
    get sortingString(): string {
        const splitDate: string[] = this.date.value.split("-");
        const year: string = padZero(splitDate[0], 4);
        const month: string = padZero(splitDate[1], 2);
        const date: string = padZero(splitDate[2], 2);

        const splitTime: string[] = this.time.value.split(":");
        const hour: string = padZero(splitTime[0], 2);
        const minute: string = padZero(splitTime[1], 2);

        const priorityNumber: number = parseInt(this.priority.value);
        const invertedPriority: number = 100 - priorityNumber;

        return (
            year +
            month +
            date +
            hour +
            minute +
            invertedPriority +
            this.name.value
        );
    }

    // paths
    getFilePath = (): string[] => {
        return this.boardsAndTasksModel.getTaskFilePath(this.task.fileId);
    };

    // state
    index: React.State<number> = new React.State(0);

    boardId: React.State<string> = new React.State("");

    name: React.State<string> = new React.State("");
    description: React.State<string> = new React.State("");

    category: React.State<string> = new React.State("");
    status: React.State<string> = new React.State("");
    priority: React.State<string> = new React.State("");

    date: React.State<string> = new React.State("");
    time: React.State<string> = new React.State("");

    selectedVersionId: React.State<string> = new React.State("");
    versionIds: React.ListState<string> = new React.ListState();

    isPresentingFullScreenDescription: React.State<boolean> = new React.State(false);

    // methods
    dragStart = (event: DragEvent): void => {
        ViewController.allowDrag(event);
        this.coreViewModel.draggedObject.value = this;
    };

    setCategoryAndStatus = (category?: string, status?: string): void => {
        if (category != undefined) this.category.value = category;
        if (status != undefined) this.status.value = status;
        this.save();
    };

    setBoardId = (boardId: string): void => {
        this.boardId.value = boardId;
        this.save();
    };

    setDate = (dateISOString: string): void => {
        this.date.value = dateISOString;
        this.save();
    };

    // view
    open = (): void => {
        this.coreViewModel.context = this;
        this.containingViewModel.selectTask(this);
    };

    closeAndDiscard = (): void => {
        this.close();
        this.loadTaskData();
    };

    closeAndSave = (): void => {
        this.close();
        this.save();
    };

    openFullscreenDecription = (): void => {
	this.isPresentingFullScreenDescription.value = true;
    }

    closeFullscreenDecription = (): void => {
	this.isPresentingFullScreenDescription.value = false;
    }

    updateIndex = (): void => {
        const index: number =
            this.containingViewModel.taskIndexManager.getIndex(this);
        this.index.value = index;
    };

    updateSuggestions = (): void => {
        if (
            this.containingViewModel.taskCategorySuggestions.value.has(
                this.category.value,
            ) == false
        ) {
            this.containingViewModel.taskCategorySuggestions.add(this.category.value);
        }

        if (
            this.containingViewModel.taskStatusSuggestions.value.has(
                this.status.value,
            ) == false
        ) {
            this.containingViewModel.taskStatusSuggestions.add(this.status.value);
        }
    };

    // settings
    save = (): void => {
        const newTaskFileContent: TaskFileContent =
            BoardsAndTasksModel.createTaskFileContent(
                this.task.fileId,
                this.name.value,
                this.task.boardId,
            );

        newTaskFileContent.boardId = this.boardId.value;
        newTaskFileContent.description = this.description.value;
        newTaskFileContent.status = this.status.value;
        newTaskFileContent.category = this.category.value;
        newTaskFileContent.priority = this.priority.value;
        newTaskFileContent.date = this.date.value;
        newTaskFileContent.time = this.time.value;

        this.boardsAndTasksModel.updateTaskAndSend(newTaskFileContent);

        this.containingViewModel.showTask(newTaskFileContent);
        this.containingViewModel.updateTaskIndices();

        this.updateSuggestions();
    };

    deleteTask = (): void => {
        this.close();
        this.boardsAndTasksModel.deleteTask(
            this.task.boardId,
            this.task.fileId,
        );
        this.containingViewModel.removeTaskFromView(this.task);
    };

    // load
    loadVersionIds = (): void => {
        const versionIds: string[] =
            this.boardsAndTasksModel.listTaskVersionIds(this.task.fileId);
        const sortedVersionIds: string[] = versionIds
            .sort(localeCompare)
            .reverse();
        this.versionIds.clear();
        this.versionIds.add(...sortedVersionIds);
    };

    switchVersion = (versionId: string): void => {
        const taskFileContent: TaskFileContent | null =
            this.boardsAndTasksModel.getSpecificTaskFileContent(
                this.task.fileId,
                versionId,
            );
        if (taskFileContent == null) return;

        this.task = taskFileContent;
        this.loadTaskData();
    };

    loadAllData = (): void => {
        this.loadTaskData();
        this.loadVersionIds();
    };

    loadTaskData = (): void => {
        this.boardId.value = this.task.boardId;

        this.name.value = this.task.name;
        this.description.value = this.task.description ?? "";

        this.category.value = this.task.category ?? "";
        this.status.value = this.task.status ?? "";
        this.priority.value = this.task.priority ?? "";

        this.date.value = this.task.date ?? "";
        this.time.value = this.task.time ?? "";

        this.updateSuggestions();
    };

    // exit
    close = (): void => {
        this.coreViewModel.closeContext(this.contextId);
    };

    handleContextClose = (): void => {
        this.containingViewModel.closeTask();
    };

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
        public readonly boardsAndTasksModel: BoardsAndTasksModel,
        public readonly containingViewModel: TaskContainingPageViewModel,
        public task: TaskFileContent,
    ) {
        super("task");

        // load
        this.loadAllData();

        // subscriptions
        this.selectedVersionId.subscribeSilent((selectedVersionId) => {
            this.switchVersion(selectedVersionId);
        });

        // keystrokes
        this.registerKeyStroke(CommonKeys.Apply, this.closeAndSave);
        this.registerKeyStroke(CommonKeys.CloseOrCancel, this.closeAndDiscard);
    }

    // utility
    static getStringsForFilter = (taskViewModel: TaskViewModel): string[] => {
        return [
            taskViewModel.task.name,
            taskViewModel.task.category ?? "",
            taskViewModel.task.status ?? "",
            taskViewModel.task.priority ?? "",
            taskViewModel.task.date ?? "",
            taskViewModel.task.time ?? "",
        ];
    };
}
