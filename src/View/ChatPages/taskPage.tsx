import "./taskPage.css";
import { BoardPage } from "./boardPage";
import { ViewController } from "../viewController";
import { PlaceholderView } from "../Components/placeholderView";
import { NewItemEntry } from "../Components/newItemEntry";
import { BoardViewModelToEntry } from "../Components/boardEntry";
import * as React from "../../react";
import TaskPageViewModel from "../../ViewModel/Pages/taskPageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function TaskPage(
    coreViewModel: CoreViewModel,
    taskPageViewModel: TaskPageViewModel,
) {
    taskPageViewModel.loadData();

    const isShowingBoard = React.createProxyState(
        [taskPageViewModel.selectedBoardId],
        () => taskPageViewModel.selectedBoardId.value != undefined,
    );

    const persistenceId = taskPageViewModel.chatViewModel.chatModel.id;
    const pages = ViewController.taskPages.setState(persistenceId, () =>
        React.createProxyState([taskPageViewModel.selectedBoardId], () => {
            const selectedBoardId = taskPageViewModel.selectedBoardId.value;
            if (selectedBoardId == undefined) {
                return PlaceholderView(
                    coreViewModel.translations.chatPage.task.noBoardSelected,
                );
            }
            const selectedBoard =
                taskPageViewModel.boardViewModels.value.get(selectedBoardId);
            if (selectedBoard == undefined) {
                return (
                    <div class="pane align-center justify-center">
                        <span class="secondary">
                            {
                                coreViewModel.translations.chatPage.task
                                    .boardNotFound
                            }
                        </span>
                    </div>
                );
            }

            return BoardPage(coreViewModel, selectedBoard);
        }),
    );

    return (
        <div
            id="task-page"
            toggle:isshowingboard={isShowingBoard}
            set:showingboardlist={taskPageViewModel.isShowingBoadList}
        >
            <div
                id="board-list"
                class="pane-wrapper side background"
                set:color={taskPageViewModel.chatViewModel.displayedColor}
            >
                <div class="pane">
                    <div class="toolbar">
                        <div class="flex-row width-input">
                            <input
                                class="no-outline"
                                bind:value={taskPageViewModel.boardQuery}
                                on:enter={taskPageViewModel.createBoard}
                                placeholder={coreViewModel.translations.general.filterOrCreateLabel(
                                    coreViewModel.translations.chatPage.task
                                        .typeBoard,
                                )}
                            ></input>
                        </div>
                    </div>
                    <div class="content gap">
                        {NewItemEntry(
                            coreViewModel,
                            taskPageViewModel.boardQuery,
                            taskPageViewModel.createBoard,
                        )}
                        <div
                            class="grid gap"
                            style="grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))"
                            children:append={[
                                taskPageViewModel.boardMatches,
                                BoardViewModelToEntry,
                            ]}
                        ></div>
                    </div>
                </div>
            </div>
            <div
                id="board-content"
                class="pane-wrapper"
                children:set={pages}
            ></div>
        </div>
    );
}
