import { BoardStatusGridPage } from "./boardStatusGridPage";
import { BoardKanbanPage } from "./boardKanbanPage";
import { ViewController } from "../viewController";
import { CommonKeys, getKeySymbol } from "../keystrokes";
import { TaskSettingsModal } from "../Modals/taskSettingsModal";
import { SearchModal } from "../Modals/searchModal";
import { BoardSettingsModal } from "../Modals/boardSettingsModal";
import { TaskViewModelToEntry } from "../Components/taskEntry";
import { BoardViewToggleButton } from "../Components/boardViewToggleButton";
import * as React from "../../react";
import BoardViewModel, {
    BoardPageTypes,
} from "../../ViewModel/Pages/boardViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import * as Utility from "../../Model/Utility/utility";

export function BoardPage(
    coreViewModel: CoreViewModel,
    boardViewModel: BoardViewModel,
) {
    boardViewModel.loadData();

    // main content
    const persistenceId = boardViewModel.boardInfo.fileId;
    const pages = ViewController.boardPages.setState(persistenceId, () =>
        React.createProxyState([boardViewModel.selectedPage], () => {
            switch (boardViewModel.selectedPage.value) {
                case BoardPageTypes.Kanban: {
                    return BoardKanbanPage(coreViewModel, boardViewModel);
                }
                case BoardPageTypes.StatusGrid: {
                    return BoardStatusGridPage(coreViewModel, boardViewModel);
                }
                default: {
                    return (
                        <div
                            class="task-grid"
                            children:append={[
                                boardViewModel.filteredTaskViewModels,
                                TaskViewModelToEntry,
                            ]}
                        ></div>
                    );
                }
            }
        }),
    );

    const wrapper = (
        <div
            class="content main-content allow-drag-move"
            children:set={pages}
        ></div>
    );
    Utility.implementPinchZoom(wrapper, boardViewModel.pinchToZoomData);

    // task modal
    const taskSettingsModal = React.createProxyState(
        [boardViewModel.selectedTaskViewModel],
        () => {
            if (boardViewModel.selectedTaskViewModel.value == undefined) {
                return <div></div>;
            } else {
                ViewController.setFocusWithDelay();

                return TaskSettingsModal(
                    coreViewModel,
                    boardViewModel.selectedTaskViewModel.value,
                );
            }
        },
    );

    return (
        <div class="pane">
            <div class="toolbar">
                <span>
                    <button
                        class="ghost board-close-button"
                        aria-label={
                            coreViewModel.translations.chatPage.task
                                .closeBoardButtonAudioLabel
                        }
                        on:click={boardViewModel.close}
                    >
                        <span class="icon">arrow_back</span>
                    </button>
                    <button
                        class="ghost board-toggle-button inset-outline"
                        aria-label={
                            coreViewModel.translations.chatPage.task
                                .toggleBoardButtonAudioLabel
                        }
                        on:click={
                            boardViewModel.taskPageViewModel.toggleBoardList
                        }
                        toggle:selected={
                            boardViewModel.taskPageViewModel.isShowingBoadList
                        }
                        ctkeystroke={getKeySymbol(CommonKeys.Options)}
                    >
                        <span class="icon">dock_to_right</span>
                    </button>
                    <button
                        class="ghost"
                        aria-label={
                            coreViewModel.translations.chatPage.task
                                .boardSettingsHeadline
                        }
                        on:click={boardViewModel.showSettings}
                        ctkeystroke={getKeySymbol(CommonKeys.Settings)}
                    >
                        <span class="icon">settings</span>
                    </button>
                </span>
                <span class="scroll-h ribbon">
                    {BoardViewToggleButton(
                        coreViewModel.translations.chatPage.task
                            .listViewButtonAudioLabel,
                        "view_list",
                        BoardPageTypes.List,
                        boardViewModel,
                        "j",
                    )}
                    {BoardViewToggleButton(
                        coreViewModel.translations.chatPage.task
                            .kanbanViewButtonAudioLabel,
                        "view_kanban",
                        BoardPageTypes.Kanban,
                        boardViewModel,
                        "k",
                    )}
                    {BoardViewToggleButton(
                        coreViewModel.translations.chatPage.task
                            .statusViewButtonAudioLabel,
                        "grid_view",
                        BoardPageTypes.StatusGrid,
                        boardViewModel,
                        "l",
                    )}
                </span>
                <span>
                    <button
                        class="ghost inset-outline"
                        aria-label={
                            coreViewModel.translations.chatPage.task
                                .filterTasksButtonAudioLabel
                        }
                        on:click={boardViewModel.showFilterModal}
                        toggle:selected={boardViewModel.isFilterActive}
                        ctkeystroke={CommonKeys.Filter}
                    >
                        <span class="icon">filter_alt</span>
                    </button>
                    <button
                        class="ghost"
                        aria-label={
                            coreViewModel.translations.chatPage.task
                                .createTaskButtonAudioLabel
                        }
                        on:click={boardViewModel.createTask}
                        ctkeystroke={getKeySymbol(CommonKeys.Create)}
                    >
                        <span class="icon">add</span>
                    </button>
                </span>
            </div>

            {wrapper}

            {BoardSettingsModal(coreViewModel, boardViewModel)}
            {SearchModal(
                coreViewModel,
                boardViewModel.searchViewModel,
                coreViewModel.translations.chatPage.task.filterTasksHeadline,
                boardViewModel.isPresentingFilterModal,
            )}
            <div children:set={taskSettingsModal}></div>
        </div>
    );
}
