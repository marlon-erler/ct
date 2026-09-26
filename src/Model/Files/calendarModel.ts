// cleanup: Phase A

import FileModel, { FileModelSubPath } from "./fileModel";
import { TaskFileContent } from "./boardsAndTasksModel";
import StorageModel from "../Global/storageModel";
import SettingsModel from "../Global/settingsModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import {isoToMonthString, padZero} from "../Utility/utility";

export default class CalendarModel {
    readonly storageModel: StorageModel;
    readonly fileModel: FileModel;
    readonly settingsModel: SettingsModel;

    // paths
    get basePath(): string[] {
        return this.fileModel.getModelContainerPath(
            FileModelSubPath.ModelCalendar,
        );
    }

    readonly getViewPath = (): string[] => {
        return [...this.basePath, FileModelSubPath.ModelView];
    };

    readonly getMonthContainerPath = (): string[] => {
        return [...this.basePath, CalendarModelSubPaths.Months];
    };

    readonly getMonthPath = (monthString: string): string[] => {
        return [...this.getMonthContainerPath(), monthString];
    };

    // task references
    readonly storeTaskReference = (taskFileContent: TaskFileContent): void => {
        if (taskFileContent.date == undefined) return;

        const monthString: string = isoToMonthString(
            taskFileContent.date,
        );

        const monthPath: string[] = this.getMonthPath(monthString);
        const referencePath: string[] = [...monthPath, taskFileContent.fileId];

        this.storageModel.write(referencePath, "");
    };

    readonly deleteTaskReference = (
        monthString: string,
        taskId: string,
    ): void => {
        const monthPath: string[] = this.getMonthPath(monthString);
        const referencePath: string[] = [...monthPath, taskId];

        this.storageModel.write(referencePath, "");
    };

    // data
    readonly listTaskIds = (monthString: string): string[] => {
        const monthPath: string[] = this.getMonthPath(monthString);
        return this.storageModel.list(monthPath);
    };

    // util
    readonly generateMonthGrid = <T>(
        coreViewModel: CoreViewModel,
        year: number,
        month: number,
        defaultValueCreator: () => T,
    ): MonthGrid<T> => {
        // get today
        const date = coreViewModel.unwrappedTodayDate;
        const isCurrentMonth: boolean =
            year == date.getFullYear() && month == date.getMonth() + 1;

        // get data for offset
        date.setDate(1);
        date.setMonth(month - 1);
        date.setFullYear(year);

        const firstWeekdayOfMonth: number = date.getDay();
        const firstDayOfWeekSetting: number = parseInt(
            this.settingsModel.firstDayOfWeek,
        );

        const offset: number =
            firstWeekdayOfMonth < firstDayOfWeekSetting
                ? 7 - firstDayOfWeekSetting
                : firstWeekdayOfMonth - firstDayOfWeekSetting;

        // get total day count
        date.setMonth(month);
        date.setDate(-1);
        const daysInMonth: number = date.getDate() + 1;

        const grid: MonthGrid<T> = {
            offset,
            firstDayOfWeek: parseInt(this.settingsModel.firstDayOfWeek),
            isCurrentMonth,
            year,
            month,
            days: {},
        };

        for (let i = 0; i < daysInMonth; i++) {
            const paddedDate: string = padZero(
                (i + 1).toString(), 2
            );
            grid.days[paddedDate] = defaultValueCreator();
        }

        return grid;
    };

    // init
    constructor(
        storageModel: StorageModel,
        settingsModel: SettingsModel,
        fileModel: FileModel,
    ) {
        this.storageModel = storageModel;
        this.settingsModel = settingsModel;
        this.fileModel = fileModel;
    }
}

export enum CalendarModelSubPaths {
    Months = "months",
}

// types
export interface MonthGrid<T> {
    readonly offset: number;
    readonly firstDayOfWeek: number;
    readonly isCurrentMonth: boolean;

    readonly year: number;
    readonly month: number;

    readonly days: { [date: string]: T };
}
