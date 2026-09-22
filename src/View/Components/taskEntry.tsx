import * as React from "../../react";
import TaskViewModel from "../../ViewModel/Pages/taskViewModel";

export function TaskEntry(taskViewModel: TaskViewModel) {
    const details: { [icon: string]: string } = {
        description: taskViewModel.description.value || "---",
        priority_high: taskViewModel.priority.value || "---",
        category: taskViewModel.category.value || "---",
        clock_loader_40: taskViewModel.status.value || "---",
        calendar_month: taskViewModel.date.value || "---",
        schedule: taskViewModel.time.value || "---",
    };

    const view = (
        <button
            draggable="true"
            class="tile flex-no"
            style="user-select: none; -webkit-user-select: none"
            on:click={taskViewModel.open}
            on:dragstart={taskViewModel.dragStart}
        >
            <div>
                <b
                    class="ellipsis"
                    subscribe:innerText={taskViewModel.name}
                ></b>
                <hr></hr>
                <div
                    class="grid secondary"
                    style="grid-template-columns: repeat(2, 1fr); column-gap: 1rem;  row-gap: .5rem"
                >
                    {...Object.entries(details).map((entry) => (
                        <span
                            class="flex-row align-center width-100 flex-no clip"
                            style="gap: 1rem"
                        >
                            <span class="icon" style="font-size: 1.1rem">
                                {entry[0]}
                            </span>
                            <span class="ellipsis">{entry[1]}</span>
                        </span>
                    ))}
                </div>
            </div>
        </button>
    );

    taskViewModel.index.subscribe((newIndex) => {
        view.style.order = newIndex;
    });

    return view;
}

export const TaskViewModelToEntry: React.StateItemConverter<TaskViewModel> = (
    taskViewModel: TaskViewModel,
) => {
    return TaskEntry(taskViewModel);
};
