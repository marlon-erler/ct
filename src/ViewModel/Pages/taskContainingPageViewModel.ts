import TaskViewModel from "./taskViewModel";
import CoreViewModel, { Context } from "../Global/coreViewModel";
import ChatViewModel from "../Chat/chatViewModel";
import * as React from "../../react";
import { IndexManager } from "../../Model/Utility/utility";
import BoardsAndTasksModel, {
    TaskFileContent,
} from "../../Model/Files/boardsAndTasksModel";

export default class TaskContainingPageViewModel extends Context {
    // state
    readonly taskIndexManager = new IndexManager<TaskViewModel>(
        (taskViewModel: TaskViewModel) => taskViewModel.sortingString,
    );

    selectedTaskViewModel: React.State<TaskViewModel | undefined> =
        new React.State<any>(undefined);

    taskViewModels: React.MapState<TaskViewModel> = new React.MapState();

    taskCategorySuggestions: React.ListState<string> = new React.ListState();
    taskStatusSuggestions: React.ListState<string> = new React.ListState();

    // methods
    createTaskFromBoardId = (boardId: string): void => {
        const taskFileContent: TaskFileContent =
            this.boardsAndTasksModel.createTask(boardId);
        const taskViewModel: TaskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent,
        );
        taskViewModel.open();
        this.updateTaskIndices();
    };

    // view
    showTask = (taskFileContent: TaskFileContent): void => {};
    removeTaskFromView = (taskFileContent: TaskFileContent): void => {};

    selectTask = (selectedTask: TaskViewModel): void => {
        this.selectedTaskViewModel.value = selectedTask;
    };

    closeTask = () => {
        this.selectedTaskViewModel.value = undefined;
    };

    updateTaskIndices = (): void => {
        this.taskIndexManager.update([...this.taskViewModels.value.values()]);
        for (const taskViewModel of this.taskViewModels.value.values()) {
            taskViewModel.updateIndex();
        }
    };

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
        public readonly boardsAndTasksModel: BoardsAndTasksModel,
        contextDebugDescription: string,
    ) {
        super(contextDebugDescription);
    }
}
