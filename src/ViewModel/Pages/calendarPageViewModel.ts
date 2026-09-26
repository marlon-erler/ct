import TaskViewModel from "./taskViewModel";
import TaskContainingPageViewModel from "./taskContainingPageViewModel";
import CoreViewModel from "../Global/coreViewModel";
import ChatViewModel, { ChatPageTypes } from "../Chat/chatViewModel";
import * as React from "../../react";
import { CommonKeys } from "../../View/keystrokes";
import {
    formatISO,
    formatISOFromParts,
    formatMonthStringFromParts,
    formatTime,
    isoToDateString,
    isoToMonthString,
    padZero,
} from "../../Model/Utility/utility";
import CalendarModel, { MonthGrid } from "../../Model/Files/calendarModel";
import BoardsAndTasksModel, {
    TaskFileContent,
} from "../../Model/Files/boardsAndTasksModel";

export const CALENDAR_EVENT_BOARD_ID = "events";

export default class CalendarPageViewModel extends TaskContainingPageViewModel {
    // data
    get monthString(): string {
        return formatMonthStringFromParts(
            this.selectedYear.value.toString(),
            this.selectedMonth.value.toString(),
        );
    }

    get selectedDateString(): string {
        return formatISOFromParts(
            this.selectedYear.value,
            this.selectedMonth.value,
            this.selectedDate.value,
        );
    }

    // paths
    getBasePath = (): string[] => {
        return [...this.calendarModel.getViewPath()];
    };

    // state
    currentTodayDate: string | undefined = undefined;
    selectedYear: React.State<number> = new React.State(0);
    selectedMonth: React.State<number> = new React.State(0);
    selectedDate: React.State<number> = new React.State(0);

    monthGrid: React.State<
        MonthGrid<React.MapState<TaskViewModel>> | undefined
    > = new React.State<any>(undefined);

    nextTask = new React.State<TaskViewModel | undefined>(undefined);

    // methods
    createEvent = (): void => {
        const taskFileContent: TaskFileContent =
            this.boardsAndTasksModel.createTask(CALENDAR_EVENT_BOARD_ID);
        taskFileContent.date = formatISOFromParts(
            this.selectedYear.value.toString(),
            this.selectedMonth.value.toString(),
            this.selectedDate.value.toString(),
        );

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

    getEventsForDate = (): React.MapState<TaskViewModel> | undefined => {
        const paddedDate: string = padZero(this.selectedDate.toString(), 2);

        if (this.monthGrid.value == undefined) {
            return undefined;
        }

        return this.monthGrid.value.days[paddedDate];
    };

    // view
    getTaskMapState = (
        taskFileContent: TaskFileContent,
    ): React.MapState<TaskViewModel> | null => {
        if (this.monthGrid.value == null) return null;

        const date: string = isoToDateString(taskFileContent.date ?? "");
        return this.monthGrid.value.days[date];
    };

    showTask = (taskFileContent: TaskFileContent): void => {
        const monthString: string | undefined = isoToMonthString(
            taskFileContent.date ?? "",
        );
        if (monthString == undefined || monthString != this.monthString) {
            this.removeTaskFromView(taskFileContent);
            this.calendarModel.deleteTaskReference(
                this.monthString,
                taskFileContent.fileId,
            );
            return;
        }

        const taskViewModel: TaskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent,
        );
        const mapState: React.MapState<TaskViewModel> | null =
            this.getTaskMapState(taskFileContent);

        this.taskViewModels.handleRemoval(taskViewModel, () => {
            mapState?.remove(taskFileContent.fileId);
        });

        this.taskViewModels.remove(taskFileContent.fileId);
        this.taskViewModels.set(taskFileContent.fileId, taskViewModel);

        mapState?.set(taskFileContent.fileId, taskViewModel);
        this.updateTaskIndices();
    };

    removeTaskFromView = (taskFileContent: TaskFileContent): void => {
        this.taskViewModels.remove(taskFileContent.fileId);
    };

    showToday = (): void => {
        const today: Date = this.coreViewModel.todayDate.value;
        this.selectedYear.value = today.getFullYear();
        this.selectedMonth.value = today.getMonth() + 1;
        this.selectedDate.value = today.getDate();
    };

    showPreviousMonth = (): void => {
        this.selectedMonth.value -= 1;

        if (this.selectedMonth.value <= 0) {
            this.selectedYear.value -= 1;
            this.selectedMonth.value = 12;
        }
    };

    showNextMonth = (): void => {
        this.selectedMonth.value += 1;

        if (this.selectedMonth.value >= 13) {
            this.selectedYear.value += 1;
            this.selectedMonth.value = 1;
        }
    };

    handleDrop = (year: string, month: string, date: string): void => {
        const ISOString: string = formatISOFromParts(year, month, date);

        const draggedObject: any = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;

        draggedObject.setDate(ISOString);
    };

    handleChron = (): void => {
        this.updateMonthGrid();
        this.updateNextTask();
    };

    updateMonthGrid = (): void => {
        const today = formatISO(this.coreViewModel.todayDate.value);
        if (this.currentTodayDate == today) return;
        this.loadMonthTasks();
        this.currentTodayDate = today;
        this.selectedDate.callSubscriptions();
    };

    updateNextTask = (): void => {
        if (this.selectedDateString != this.currentTodayDate) {
            this.nextTask.value = undefined;
            return;
        }

        const tasks = this.getEventsForDate();
        if (tasks == undefined) return;
        const taskArray = [...tasks.value.values()];
        const sorted = taskArray.sort((a, b) => a.index.value - b.index.value);
        for (const task of sorted) {
            if (task.time.value <= this.coreViewModel.time.value) continue;
            this.nextTask.value = task;
            break;
        }
    };

    // load
    loadMonthTasks = (): void => {
        this.monthGrid.value = this.calendarModel.generateMonthGrid(
            this.coreViewModel,
            this.selectedYear.value,
            this.selectedMonth.value,
            () => new React.MapState(),
        );
        const taskIds: string[] = this.calendarModel.listTaskIds(
            this.monthString,
        );

        for (const taskId of taskIds) {
            const taskFileContent: TaskFileContent | null =
                this.boardsAndTasksModel.getLatestTaskFileContent(taskId);
            if (taskFileContent == null) continue;
            this.showTask(taskFileContent);
        }
    };

    loadData = (): void => {};

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
        public readonly calendarModel: CalendarModel,
        public readonly boardsAndTasksModel: BoardsAndTasksModel,
    ) {
        super(coreViewModel, chatViewModel, boardsAndTasksModel, "calendar");

        this.calendarModel = calendarModel;
        this.boardsAndTasksModel = boardsAndTasksModel;

        this.chatViewModel = chatViewModel;

        React.bulkSubscribe([this.selectedYear, this.selectedMonth], () => {
            this.loadMonthTasks();
        });
        this.selectedDate.subscribeSilent(() => {
            this.updateNextTask();
        });

        // handlers
        boardsAndTasksModel.taskHandlerManager.setHandler(
            "calendar" + this.chatViewModel.chatModel.id,
            (taskFileContent: TaskFileContent) => {
                this.showTask(taskFileContent);
            },
        );
        this.coreViewModel.chronHandlerManager.setHandler(
            `calendar-${this.chatViewModel.chatModel.id}`,
            this.handleChron,
        );

        // initiate
        this.showToday();

        // keystrokes
        this.registerKeyStroke(CommonKeys.Reset, this.showToday);
        this.registerKeyStroke("k", this.showPreviousMonth);
        this.registerKeyStroke("l", this.showNextMonth);
        this.registerKeyStroke(CommonKeys.Create, this.createEvent);

        this.chatViewModel.registerContext(ChatPageTypes.Calendar, this);
    }
}

export enum TaskPageViewModelSubPaths {
    LastUsedBoard = "last-used-board",
}
