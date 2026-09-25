import { ViewController } from "../viewController";
import { TaskViewModelToEntry } from "../Components/taskEntry";
import {
    PropertyValueList,
    collectPropertyValuesToState,
    createPropertyValueIndexState,
    createSortedPropertyValueState,
} from "../Components/propertyValueList";
import { FilteredList } from "../Components/filteredList";
import * as React from "../../react";
import {
    TaskCategoryBulkChangeViewModel,
    TaskStatusBulkChangeViewModel,
} from "../../ViewModel/Utility/taskPropertyBulkChangeViewModel";
import TaskViewModel from "../../ViewModel/Pages/taskViewModel";
import BoardViewModel from "../../ViewModel/Pages/boardViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import * as Utility from "../../Model/Utility/utility";

export function BoardStatusGridPage(
    coreViewModel: CoreViewModel,
    boardViewModel: BoardViewModel,
) {
    const statuses: React.ListState<string> = new React.ListState();
    const sortedStatuses: React.State<string[]> =
        createSortedPropertyValueState(statuses);

    boardViewModel.filteredTaskViewModels.subscribe(() => {
        collectPropertyValuesToState(
            "status",
            (taskViewModel: TaskViewModel) => taskViewModel.task,
            boardViewModel.filteredTaskViewModels,
            statuses,
        );
    });

    const statusNameCellConverter: React.StateItemConverter<string> = (
        statusName: string,
    ) => {
        const index = createPropertyValueIndexState(sortedStatuses, statusName);
        return StatusNameCell(coreViewModel, statusName, index, boardViewModel);
    };

    return (
        <div class="status-page-content zoom">
            <div
                class="status-name-row"
                children:append={[statuses, statusNameCellConverter]}
            ></div>
            {PropertyValueList(
                "category",
                (taskViewModel: TaskViewModel) => taskViewModel.task,
                boardViewModel.filteredTaskViewModels,
                (
                    categories: React.ListState<string>,
                    sortedCategories: React.State<string[]>,
                ) => {
                    const categoryRowConverter: React.StateItemConverter<
                        string
                    > = (categoryName: string) => {
                        const index: React.State<number> =
                            createPropertyValueIndexState(
                                sortedCategories,
                                categoryName,
                            );

                        return CategoryRow(
                            coreViewModel,
                            categoryName,
                            index,
                            statuses,
                            sortedStatuses,
                            boardViewModel,
                        );
                    };

                    return (
                        <div
                            class="status-grid-wrapper"
                            children:append={[categories, categoryRowConverter]}
                        ></div>
                    );
                },
            )}
        </div>
    );
}

function StatusNameCell(
    coreViewModel: CoreViewModel,
    statusName: string,
    index: React.State<number>,
    boardViewModel: BoardViewModel,
) {
    const taskViewModelsWithMatchingStatus: React.ListState<TaskViewModel> =
        new React.ListState();

    boardViewModel.filteredTaskViewModels.handleAddition(
        (taskViewModel: TaskViewModel) => {
            const doesMatchStatus: boolean =
                taskViewModel.task.status == statusName;
            if (doesMatchStatus == false) return;

            taskViewModelsWithMatchingStatus.add(taskViewModel);
            boardViewModel.filteredTaskViewModels.handleRemoval(
                taskViewModel,
                () => {
                    taskViewModelsWithMatchingStatus.remove(taskViewModel);
                },
            );
        },
    );

    const viewModel: TaskStatusBulkChangeViewModel =
        new TaskStatusBulkChangeViewModel(
            taskViewModelsWithMatchingStatus,
            statusName,
        );

    const view = (
        <div class="flex-row">
            <div class="property-input-wrapper">
                <input
                    placeholder={
                        coreViewModel.translations.chatPage.task
                            .renameStatusInputPlaceholder
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
        </div>
    );

    index.subscribe((newIndex) => {
        view.style.order = newIndex;
    });

    return view;
}

function CategoryRow(
    coreViewModel: CoreViewModel,
    categoryName: string,
    index: React.State<number>,
    allStatuses: React.ListState<string>,
    sortedStatuses: React.State<string[]>,
    boardViewModel: BoardViewModel,
) {
    return FilteredList(
        { category: categoryName },
        (taskViewModel: TaskViewModel) => taskViewModel.task,
        boardViewModel.filteredTaskViewModels,
        (taskViewModels: React.ListState<TaskViewModel>) => {
            const statusNameConverter: React.StateItemConverter<string> = (
                statusName: string,
            ) => {
                const index = createPropertyValueIndexState(
                    sortedStatuses,
                    statusName,
                );
                return StatusColumn(
                    categoryName,
                    statusName,
                    index,
                    boardViewModel,
                    taskViewModels,
                );
            };

            const viewModel: TaskCategoryBulkChangeViewModel =
                new TaskCategoryBulkChangeViewModel(
                    taskViewModels,
                    categoryName,
                );

            const view = (
                <div class="flex-row flex-no large-gap">
                    <div class="property-input-wrapper allow-drag-move">
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

                    <div
                        class="flex-row large-gap padding-right"
                        children:append={[allStatuses, statusNameConverter]}
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

function StatusColumn(
    categoryName: string,
    statusName: string,
    index: React.State<number>,
    boardViewModel: BoardViewModel,
    taskViewModelsWithMatchingCategory: React.ListState<TaskViewModel>,
) {
    const taskViewModels: React.ListState<TaskViewModel> =
        new React.ListState();

    taskViewModelsWithMatchingCategory.handleAddition((taskViewModel) => {
        const doesMatchStatus: boolean =
            taskViewModel.status.value == statusName;
        if (doesMatchStatus == false) return;

        taskViewModels.add(taskViewModel);
        taskViewModelsWithMatchingCategory.handleRemoval(taskViewModel, () => {
            taskViewModels.remove(taskViewModel);
        });
    });

    function drop() {
        boardViewModel.handleDropWithinBoard(categoryName, statusName);
    }

    const view = (
        <div
            class="status-column gap allow-drag-move"
            on:dragover={ViewController.allowDrop}
            on:drop={drop}
            children:append={[taskViewModels, TaskViewModelToEntry]}
        ></div>
    );

    index.subscribe((newIndex) => {
        view.style.order = newIndex;
    });

    return view;
}
