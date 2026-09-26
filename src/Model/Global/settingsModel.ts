import {UUID} from "../../react";
import StorageModel, { StorageModelSubPaths, filePaths } from "./storageModel";

export default class SettingsModel {
    readonly storageModel: StorageModel;

    // data
    username: string = "";
    userid: string = "";
    firstDayOfWeek: string = "";
    language: string = "";
    theme: string = "";

    // storage
    private readonly storeSetting = (
        pathName: keyof typeof filePaths.settingsModel,
        value: string,
    ): void => {
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel[pathName],
        );
        this.storageModel.write(path, value);
    };

    readonly setId = (newValue: string): void => {
        this.userid = newValue;
        this.storeSetting("userid", newValue);
    };
    
    readonly setName = (newValue: string): void => {
        this.username = newValue;
        this.storeSetting("username", newValue);
    };

    readonly setFirstDayOfWeek = (newValue: string): void => {
        this.firstDayOfWeek = newValue;
        this.storeSetting("firstDayOfWeek", newValue);
    };

    readonly setLanguage = (newValue: string): void => {
        this.language = newValue;
        this.storeSetting("language", newValue);
    };

    readonly setTheme = (newValue: string): void => {
        this.theme = newValue;
        this.storeSetting("theme", newValue);
    };

    // load
    private readonly readSetting = (
        pathName: keyof typeof filePaths.settingsModel,
    ): string | null => {
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel[pathName],
        );
        return this.storageModel.read(path);
    };
    
    readonly loadId = (): void => {
        const content: string | null = this.readSetting("userid");
	const id = content ?? UUID();
        if (content) this.userid = content;
	else this.setId(id);
    };

    readonly loadUsername = (): void => {
        const content: string | null = this.readSetting("username");
        this.username = content ?? "";
    };

    readonly loadFirstDayofWeek = (): void => {
        const content: string | null = this.readSetting("firstDayOfWeek");
        this.firstDayOfWeek = content ?? "0";
    };

    readonly loadLanguage = (): void => {
        const content: string | null = this.readSetting("language");
        this.language = content ?? SettingsModel.getSystemLanguage();
    };

    readonly loadTheme = (): void => {
        const content: string | null = this.readSetting("theme");
        this.theme = content ?? ThemeSettings.System;
    };

    // init
    constructor(storageModel: StorageModel) {
        this.storageModel = storageModel;

	this.loadId();
        this.loadUsername();
        this.loadFirstDayofWeek();
        this.loadLanguage();
        this.loadTheme();
    }

    static getSystemLanguage(): Languages {
        switch (navigator.language.substring(0, 2)) {
            case "de":
                return Languages.German;
            case "es":
                return Languages.Spanish;
            default:
                return Languages.English;
        }
    }
}

export enum Languages {
    English = "en",
    German = "de",
    Spanish = "es",
}

export enum ThemeSettings {
    Dark = "dark",
    Light = "light",
    System = "system",
    Dynamic = "dynamic",
    Black = "black",
}
