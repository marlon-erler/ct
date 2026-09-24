import TaskViewModel from "./taskViewModel";
import TaskPageViewModel from "./taskPageViewModel";
import TaskContainingPageViewModel from "./taskContainingPageViewModel";
import SearchViewModel from "../Utility/searchViewModel";
import CoreViewModel from "../Global/coreViewModel";
import ChatViewModel, { ChatPageTypes } from "../Chat/chatViewModel";
import * as React from "../../react";
import { Colors } from "../../colors";
import { CommonKeys } from "../../View/keystrokes";
import BoardsAndTasksModel, {
    BoardInfoFileContent,
    TaskFileContent,
} from "../../Model/Files/boardsAndTasksModel";
import {PinchToZoomData} from "../../Model/Utility/utility";

export default class BoardViewModel extends TaskContainingPageViewModel {
    // state
    name: React.State<string> = new React.State("");
    color: React.State<Colors> = new React.State<any>(Colors.Standard);

    index: React.State<number> = new React.State(0);

    selectedPage: React.State<BoardPageTypes> = new React.State<any>(
        BoardPageTypes.List,
    );

    isSelected: React.State<boolean>;
    isPresentingSettingsModal: React.State<boolean> = new React.State(false);
    isPresentingFilterModal: React.State<boolean> = new React.State(false);

    searchViewModel: SearchViewModel<TaskViewModel>;
    searchSuggestions = new React.ListState<string>();
    filteredTaskViewModels: React.ListState<TaskViewModel> =
        new React.ListState();
    isFilterActive: React.State<boolean>;

    pinchToZoomData: React.State<PinchToZoomData> = new React.State({zoom: 1, x: 0, y: 0});

    // paths
    getBasePath = (): string[] => {
        return [
            ...this.taskPageViewModel.getBoardViewPath(this.boardInfo.fileId),
        ];
    };

    getLastUsedBoardPath = (): string[] => {
        return [...this.getBasePath(), BoardViewModelSubPaths.LastUsedView];
    };

    getPreviousSearchesPath = (): string[] => {
        return [...this.getBasePath(), BoardViewModelSubPaths.PreviousSearches];
    };

    getLastSearchPath = (): string[] => {
        return [...this.getBasePath(), BoardViewModelSubPaths.LastSearch];
    };

    // settings
    saveSettings = (): void => {
        const newBoardInfoFileContent: BoardInfoFileContent =
            BoardsAndTasksModel.createBoardInfoFileContent(
                this.boardInfo.fileId,
                this.name.value,
                this.color.value,
            );

        this.taskPageViewModel.updateBoard(newBoardInfoFileContent);
    };

    applyColor = (): void => {
        this.taskPageViewModel.chatViewModel.setDisplayedColor(
            this.color.value,
        );
    };

    deleteBoard = (): void => {
        this.taskPageViewModel.deleteBoard(this.boardInfo);
        this.chatViewModel.taskBoardSuggestions.remove(this.boardInfo.fileId);
        this.close();
    };

    // methods
    createTask = (): void => {
        this.createTaskFromBoardId(this.boardInfo.fileId);
    };

    handleDropWithinBoard = (category?: string, status?: string): void => {
        const draggedObject: any = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setCategoryAndStatus(category, status);
    };

    handleDropBetweenBoards = (): void => {
        const draggedObject: any = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setBoardId(this.boardInfo.fileId);
    };

    // storage
    storeLastUsedView = (): void => {
        const path: string[] = this.getLastUsedBoardPath();
        const lastUsedView: string = this.selectedPage.value;
        this.coreViewModel.storageModel.write(path, lastUsedView);
    };

    restoreLastUsedView = (): void => {
        const path: string[] = this.getLastUsedBoardPath();
        const lastUsedView: string | null =
            this.coreViewModel.storageModel.read(path);
        if (lastUsedView == null) return;

        this.selectedPage.value = lastUsedView as BoardPageTypes;
    };

    handleNewSearch = (searchTerm: string): void => {
        const suggestionPath: string[] = [
            ...this.getPreviousSearchesPath(),
            searchTerm,
        ];
        this.coreViewModel.storageModel.write(suggestionPath, "");
        if (!this.searchSuggestions.value.has(searchTerm) && searchTerm != "") {
            this.searchSuggestions.add(searchTerm);
        }

        const lastSearchPath: string[] = this.getLastSearchPath();
        this.coreViewModel.storageModel.write(lastSearchPath, searchTerm);
    };

    handleSearchRemoved = (searchTerm: string): void => {
        const suggestionPath: string[] = [
            ...this.getPreviousSearchesPath(),
            searchTerm,
        ];
        this.coreViewModel.storageModel.remove(suggestionPath);
    };

    // view
    showTask = (taskFileContent: TaskFileContent): void => {
        if (taskFileContent.boardId != this.boardInfo.fileId) {
            // remove task that was moved to different board
            this.boardsAndTasksModel.deleteTaskReference(
                this.boardInfo.fileId,
                taskFileContent.fileId,
            );
            this.removeTaskFromView(taskFileContent);
            return;
        }

        const taskViewModel: TaskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent,
        );
        console.log("STILL HERE", taskFileContent.fileId);
        this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
    };

    removeTaskFromView = (taskFileContent: TaskFileContent): void => {
        this.taskViewModels.remove(taskFileContent.fileId);
        this.updateIndex();
    };

    select = (): void => {
        this.taskPageViewModel.selectBoard(this);
    };

    close = (): void => {
        this.taskPageViewModel.closeBoard();
        this.taskPageViewModel.storeLastUsedBoard();
        this.taskViewModels.clear();
    };

    showSettings = (): void => {
        this.isPresentingSettingsModal.value = true;
    };

    hideSettings = (): void => {
        this.saveSettings();
        this.isPresentingSettingsModal.value = false;
    };

    showFilterModal = (): void => {
        this.isPresentingFilterModal.value = true;
    };

    hideFilterModal = (): void => {
        this.isPresentingFilterModal.value = false;
    };

    resetFilter = (): void => {
        this.searchViewModel.search("");
    };

    updateIndex = (): void => {
        const index: number =
            this.taskPageViewModel.boardIndexManager.getIndex(this);
        this.index.value = index;
    };

    // load
    preloadData = (): void => {
        this.name.value = this.boardInfo.name;
        this.color.value = this.boardInfo.color;
    };

    loadTasks = (): void => {
        const taskIds: string[] = this.boardsAndTasksModel.listTaskIds(
            this.boardInfo.fileId,
        );
        for (const taskId of taskIds) {
            if (this.taskViewModels.value.has(taskId)) continue;

            const taskFileContent: TaskFileContent | null =
                this.boardsAndTasksModel.getLatestTaskFileContent(taskId);
            if (taskFileContent == null) continue;

            const taskViewModel: TaskViewModel = new TaskViewModel(
                this.coreViewModel,
                this.chatViewModel,
                this.boardsAndTasksModel,
                this,
                taskFileContent,
            );
            this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
        }

        this.updateTaskIndices();
    };

    loadSearchSuggestions = (): void => {
        const dirPath: string[] = this.getPreviousSearchesPath();
        const searches: string[] =
            this.coreViewModel.storageModel.list(dirPath);
        this.searchSuggestions.add(...searches.filter((x) => x != ""));
    };

    restoreSearch = (): void => {
        const lastSearchPath: string[] = this.getLastSearchPath();
        const lastSearch: string | null =
            this.coreViewModel.storageModel.read(lastSearchPath);
        if (lastSearch != null) {
            this.searchViewModel.search(lastSearch);
        }
    };

    loadData = (): void => {
        this.restoreLastUsedView();
        this.loadTasks();
        this.loadSearchSuggestions();
    };

    // exit
    handleContextClose = (fromHistoryEvent: boolean): void => {
        this.taskPageViewModel.handleBoardClosed(this);

        if (!fromHistoryEvent) return;
        this.taskPageViewModel.storeLastUsedBoard();
    };

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
        public readonly boardsAndTasksModel: BoardsAndTasksModel,
        public readonly taskPageViewModel: TaskPageViewModel,
        public readonly boardInfo: BoardInfoFileContent,
    ) {
        super(coreViewModel, chatViewModel, boardsAndTasksModel, "board");

        // load
        this.preloadData();

        // subscriptions
        this.isSelected = React.createProxyState(
            [this.taskPageViewModel.selectedBoardId],
            () =>
                this.taskPageViewModel.selectedBoardId.value ==
                this.boardInfo.fileId,
        );

        this.color.subscribe(() => {
            if (this.isSelected.value == false) return;
            if (this.chatViewModel.selectedPage.value != ChatPageTypes.Tasks)
                return;
            this.applyColor();
        });

        this.selectedPage.subscribeSilent(() => {
            this.storeLastUsedView();
        });

        // handlers
        boardsAndTasksModel.taskHandlerManager.setHandler(
            this.boardInfo.fileId,
            (taskFileContent: TaskFileContent) => {
                if (taskFileContent.boardId != this.boardInfo.fileId) return;
                this.showTask(taskFileContent);
                this.updateTaskIndices();
            },
        );

        // search
        this.searchViewModel = new SearchViewModel(
            this.taskViewModels,
            this.filteredTaskViewModels,
            TaskViewModel.getStringsForFilter,
            this.searchSuggestions,
        );
        this.searchViewModel.appliedQuery.subscribeSilent((newQuery) => {
            this.handleNewSearch(newQuery);
        });
        this.restoreSearch();
        this.searchSuggestions.handleRemovals(this.handleSearchRemoved);

        this.isFilterActive = React.createProxyState(
            [this.searchViewModel.appliedQuery],
            () => this.searchViewModel.appliedQuery.value != "",
        );

        // keystrokes
        this.registerKeyStroke(CommonKeys.Filter, this.showFilterModal);
        this.registerKeyStroke(CommonKeys.Reset, this.resetFilter);
        this.registerKeyStroke(CommonKeys.CloseOrCancel, this.hideFilterModal);
        this.registerKeyStroke(CommonKeys.Settings, this.showSettings);
        this.registerKeyStroke(CommonKeys.Apply, this.hideSettings);
        this.registerKeyStroke(CommonKeys.Create, this.createTask);

        this.registerKeyStroke(
            "j",
            () => (this.selectedPage.value = BoardPageTypes.List),
        );
        this.registerKeyStroke(
            "k",
            () => (this.selectedPage.value = BoardPageTypes.Kanban),
        );
        this.registerKeyStroke(
            "l",
            () => (this.selectedPage.value = BoardPageTypes.StatusGrid),
        );

        this.taskPageViewModel.registerContext(this.boardInfo.fileId, this);
    }
}

export enum BoardViewModelSubPaths {
    LastUsedView = "last-used-view",
    PreviousSearches = "previous-searches",
    LastSearch = "last-search",
}

// types
export enum BoardPageTypes {
    List = "list",
    Kanban = "kanban",
    StatusGrid = "status-grid",
}
