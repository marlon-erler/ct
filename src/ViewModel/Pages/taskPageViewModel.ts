import * as React from "../../react";
import BoardViewModel from "./boardViewModel";
import CoreViewModel, { ContextHost } from "../Global/coreViewModel";
import ChatViewModel, { ChatPageTypes } from "../Chat/chatViewModel";
import { CommonKeys } from "../../View/keystrokes";
import { IndexManager } from "../../Model/Utility/utility";
import BoardsAndTasksModel, {
    BoardInfoFileContent,
} from "../../Model/Files/boardsAndTasksModel";

export default class TaskPageViewModel extends ContextHost<string> {
    // data
    readonly boardIndexManager = new IndexManager<BoardViewModel>(
        (boardViewModel: BoardViewModel) => boardViewModel.name.value,
    );

    // paths
    getBasePath = (): string[] => {
        return [...this.boardsAndTasksModel.getViewPath()];
    };
    getBoardViewPath = (boardId: string): string[] => {
        return [...this.getBasePath(), boardId];
    };
    getLastUsedBoardPath = (): string[] => {
        return [...this.getBasePath(), TaskPageViewModelSubPaths.LastUsedBoard];
    };

    // state
    newBoardNameInput: React.State<string> = new React.State("");
    boardViewModels: React.MapState<BoardViewModel> = new React.MapState();
    isShowingBoadList: React.State<boolean> = new React.State(true);
    selectedBoardId: React.State<string | undefined> = new React.State<any>(
        undefined,
    );

    // context
    get isOpen(): boolean {
        return (
            this.chatViewModel.isOpen &&
            this.chatViewModel.selectedPage.value == ChatPageTypes.Tasks
        );
    }

    get contextSelection(): string | undefined {
        return this.selectedBoardId.value;
    }

    // guards
    cannotCreateBoard: React.State<boolean> = React.createProxyState(
        [this.newBoardNameInput],
        () => this.newBoardNameInput.value == "",
    );

    // methods
    createBoard = (): void => {
        if (this.cannotCreateBoard.value == true) return;

        const boardInfoFileContent: BoardInfoFileContent =
            this.boardsAndTasksModel.createBoard(this.newBoardNameInput.value);
        this.newBoardNameInput.value = "";

        this.showBoardInList(boardInfoFileContent);
        this.boardsAndTasksModel.updateBoardAndSend(boardInfoFileContent);
        this.updateBoardIndices();
    };

    updateBoard = (boardInfoFileContent: BoardInfoFileContent): void => {
        this.boardsAndTasksModel.updateBoardAndSend(boardInfoFileContent);
    };

    deleteBoard = (boardInfoFileContent: BoardInfoFileContent): void => {
        this.boardsAndTasksModel.deleteBoard(boardInfoFileContent.fileId);
        this.boardViewModels.remove(boardInfoFileContent.fileId);
        this.updateBoardIndices();
    };

    // view
    toggleBoardList = (): void => {
        this.isShowingBoadList.value = !this.isShowingBoadList.value;
    };

    showBoardInList = (boardInfo: BoardInfoFileContent): void => {
        const boardViewModel: BoardViewModel = new BoardViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            boardInfo,
        );
        this.boardViewModels.set(boardInfo.fileId, boardViewModel);

        this.chatViewModel.taskBoardSuggestions.set(boardInfo.fileId, [
            boardInfo.fileId,
            this.boardsAndTasksModel.getBoardName(boardInfo.fileId),
        ]);
    };

    selectBoard = (boardViewModel: BoardViewModel): void => {
        this.chatViewModel.displayedColor.value = boardViewModel.color.value;

        if (this.selectedBoardId.value == boardViewModel.boardInfo.fileId) {
            this.updateContexts();
            return;
        }
        this.selectedBoardId.value = boardViewModel.boardInfo.fileId;

        this.storeLastUsedBoard();
    };

    closeBoard = (): void => {
        this.closeCurrentContext();
    };

    handleBoardClosed = (boardViewModel: BoardViewModel): void => {
        if (boardViewModel.boardInfo.fileId != this.selectedBoardId.value)
            return;

        this.selectedBoardId.value = undefined;
        this.chatViewModel.resetColor();
    };

    updateBoardIndices = (): void => {
        this.boardIndexManager.update([...this.boardViewModels.value.values()]);
        for (const boardViewModel of this.boardViewModels.value.values()) {
            boardViewModel.updateIndex();
        }
    };

    // storage
    storeLastUsedBoard = (): void => {
        const path: string[] = this.getLastUsedBoardPath();
        const lastUsedBoardId: string = this.selectedBoardId.value ?? "";
        this.coreViewModel.storageModel.write(path, lastUsedBoardId);
    };

    openLastUsedBoard = (): void => {
        const path: string[] = this.getLastUsedBoardPath();
        const lastUsedBoardId: string | null =
            this.coreViewModel.storageModel.read(path);
        if (lastUsedBoardId == null) return;

        const boardViewModel: BoardViewModel | undefined =
            this.boardViewModels.value.get(lastUsedBoardId);
        if (boardViewModel == undefined) return;

        this.selectBoard(boardViewModel);
    };

    // load
    loadData = (): void => {
        this.closeCurrentContext();

        const boardIds: string[] = this.boardsAndTasksModel.listBoardIds();
        for (const boardId of boardIds) {
            if (this.boardViewModels.value.has(boardId)) continue;

            const boardInfo: BoardInfoFileContent | null =
                this.boardsAndTasksModel.getBoardInfo(boardId);
            if (boardInfo == null) continue;

            this.showBoardInList(boardInfo);
        }

        this.updateBoardIndices();
        this.openLastUsedBoard();
    };

    // init
    constructor(
        readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
        public readonly boardsAndTasksModel: BoardsAndTasksModel,
    ) {
        super("task-page", coreViewModel);

        this.loadData(); // needed for board options in calendar

        this.chatViewModel = chatViewModel;

        // context
        this.chatViewModel.registerContext(ChatPageTypes.Tasks, this);
        this.selectedBoardId.subscribeSilent(this.updateContexts);

        // handlers
        boardsAndTasksModel.boardHandlerManager.setHandler(
            "task-page" + this.chatViewModel.chatModel.id,
            (boardInfoFileContent: BoardInfoFileContent) => {
                this.showBoardInList(boardInfoFileContent);
                this.updateBoardIndices();
            },
        );

        this.chatViewModel.currentContext.subscribeSilent((context) => {
            if (!this.isOpen) return;
            if (context != this) return;
            this.openLastUsedBoard();
        });

        // keystrokes
        this.registerKeyStroke(CommonKeys.Options, this.toggleBoardList);
    }
}

export enum TaskPageViewModelSubPaths {
    LastUsedBoard = "last-used-board",
}
