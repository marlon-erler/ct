import * as React from "../../react";
import TaskViewModel from "../Pages/taskViewModel";

export default class TaskPropertyBulkChangeViewModel {
    taskViewModels: React.ListState<TaskViewModel>;

    // state
    inputValue: React.State<string> = new React.State("");

    // guards
    cannotSet: React.State<boolean>;

    // methods
    set = (): void => {
        if (this.cannotSet.value == true) return;
        this.taskViewModels.value.forEach((taskViewModel: TaskViewModel) => {
            this.setValue(this.inputValue.value, taskViewModel);
        });
    };

    setValue: (newValue: string, taskViewModel: TaskViewModel) => void;

    // init
    constructor(
        taskViewModels: React.ListState<TaskViewModel>,
        valueSetter: (newValue: string, taskViewModel: TaskViewModel) => void,
        initialValue: string,
    ) {
        this.taskViewModels = taskViewModels;
        this.inputValue.value = initialValue;

        this.setValue = valueSetter;

        this.cannotSet = React.createProxyState(
            [this.inputValue],
            () =>
                this.inputValue.value == "" ||
                this.inputValue.value == initialValue,
        );
    }
}

export class TaskCategoryBulkChangeViewModel extends TaskPropertyBulkChangeViewModel {
    constructor(
        taskViewModels: React.ListState<TaskViewModel>,
        initialValue: string,
    ) {
        super(
            taskViewModels,
            (newCategory: string, taskViewModel: TaskViewModel) => {
                taskViewModel.category.value = newCategory;
                taskViewModel.save();
            },
            initialValue,
        );
    }
}

export class TaskStatusBulkChangeViewModel extends TaskPropertyBulkChangeViewModel {
    constructor(
        taskViewModels: React.ListState<TaskViewModel>,
        initialValue: string,
    ) {
        super(
            taskViewModels,
            (newStatus: string, taskViewModel: TaskViewModel) => {
                taskViewModel.status.value = newStatus;
                taskViewModel.save();
            },
            initialValue,
        );
    }
}
