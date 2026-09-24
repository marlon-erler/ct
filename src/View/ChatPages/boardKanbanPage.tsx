import { ViewController } from "../viewController";
import { TaskViewModelToEntry } from "../Components/taskEntry";
import {
    PropertyValueList,
    createPropertyValueIndexState,
} from "../Components/propertyValueList";
import { FilteredList } from "../Components/filteredList";
import * as React from "../../react";
import { TaskCategoryBulkChangeViewModel } from "../../ViewModel/Utility/taskPropertyBulkChangeViewModel";
import TaskViewModel from "../../ViewModel/Pages/taskViewModel";
import BoardViewModel from "../../ViewModel/Pages/boardViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import * as Utility from "../../Model/Utility/utility";

export function BoardKanbanPage(
    coreViewModel: CoreViewModel,
    boardViewModel: BoardViewModel,
) {
    return PropertyValueList(
        "category",
        (taskViewModel: TaskViewModel) => taskViewModel.task,
        boardViewModel.filteredTaskViewModels,
        (
            categories: React.ListState<string>,
            sortedCategories: React.State<string[]>,
        ) => {
            const categoryNameConverter: React.StateItemConverter<string> = (
                categoryName: string,
            ) => {
                const index: React.State<number> =
                    createPropertyValueIndexState(
                        sortedCategories,
                        categoryName,
                    );
                return Column(
                    coreViewModel,
                    categoryName,
                    index,
                    boardViewModel,
                );
            };

            return (
                <div
                    class="kanban-board-wrapper zoom allow-drag-move"
                    children:append={[categories, categoryNameConverter]}
                ></div>
            );
        },
    );
}

function Column(
    coreViewModel: CoreViewModel,
    categoryName: string,
    index: React.State<number>,
    boardViewModel: BoardViewModel,
) {
    return FilteredList(
        { category: categoryName },
        (taskViewModel: TaskViewModel) => taskViewModel.task,
        boardViewModel.filteredTaskViewModels,
        (taskViewModels: React.ListState<TaskViewModel>) => {
            const viewModel: TaskCategoryBulkChangeViewModel =
                new TaskCategoryBulkChangeViewModel(
                    taskViewModels,
                    categoryName,
                );

            function drop() {
                boardViewModel.handleDropWithinBoard(categoryName);
            }

            const view = (
                <div
                    class="flex-column flex-no"
                    on:dragover={ViewController.allowDrop}
                    on:drop={drop}
                >
                    <div class="flex-row width-input">
                        <input
                            placeholder={
                                coreViewModel.translations.chatPage.task
                                    .renameCategoryInputPlaceholder
                            }
                            bind:value={viewModel.inputValue}
                            on:enter={viewModel.set}
                        ></input>
                        <button
                            class="primary"
                            on:click={viewModel.set}
                            toggle:disabled={viewModel.cannotSet}
                        >
                            <span class="icon">check</span>
                        </button>
                    </div>

                    <hr></hr>

                    <div
                        class="kanban-column"
                        children:append={[taskViewModels, TaskViewModelToEntry]}
                    ></div>
                </div>
            );

            index.subscribe((newIndex) => {
                view.style.order = newIndex;
            });

            return view;
        },
    );
}
