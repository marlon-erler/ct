import * as React from "bloatless-react";
import CoreViewModel, { Context } from "./coreViewModel";
import { CommonKeys } from "../../View/keystrokes";
import { Languages, ThemeSettings } from "../../Model/Global/settingsModel";

export default class SettingsViewModel extends Context {
    // state
    username: React.State<string> = new React.State("");
    usernameInput: React.State<string> = new React.State("");
    isShowingSettingsModal: React.State<boolean> = new React.State(false);
    selectedModalPage: React.State<SettingsModalPages | undefined> =
        new React.State<SettingsModalPages | undefined>(undefined);
    requiresReload = new React.State<boolean>(false);

    firstDayOfWeek: React.State<string> = new React.State("0");
    language: React.State<Languages | string> = new React.State<Languages | string>(
        Languages.English,
    );
    theme: React.State<ThemeSettings | string> = new React.State<ThemeSettings | string>(
        ThemeSettings.System,
    );

    // guards
    cannotSetName: React.State<boolean> = React.createProxyState(
        [this.usernameInput],
        () =>
            this.usernameInput.value == "" ||
            this.usernameInput.value ==
                this.coreViewModel.settingsModel.username,
    );

    // methods
    setName = (): void => {
        this.coreViewModel.settingsModel.setName(this.usernameInput.value);
        this.username.value = this.coreViewModel.settingsModel.username;
        this.usernameInput.callSubscriptions();
    };

    setFirstDayofWeek = (): void => {
        this.coreViewModel.settingsModel.setFirstDayOfWeek(
            this.firstDayOfWeek.value,
        );
    };

    showSettingsModal = (): void => {
        this.coreViewModel.context = this;
        this.isShowingSettingsModal.value = true;
    };

    showModalPage = (page: SettingsModalPages): void => {
        this.selectedModalPage.value = page;
    };

    // view
    applyTheme = (): void => {
        let theme: string = this.theme.value;
        if (theme == ThemeSettings.System) {
            theme = SettingsViewModel.getSystemTheme();
        }
        document.body.setAttribute("theme", theme);
    };

    // exit
    close = (): void => {
        this.coreViewModel.closeContext(this.contextId);
    };

    handleContextClose = (): void => {
        this.isShowingSettingsModal.value = false;
        if (this.requiresReload.value == true) {
            window.location.reload();
        }
    };

    // init
    constructor(public readonly coreViewModel: CoreViewModel) {
        super("settings");

        this.username.value = coreViewModel.settingsModel.username;
        this.usernameInput.value = coreViewModel.settingsModel.username;
        this.firstDayOfWeek.value = coreViewModel.settingsModel.firstDayOfWeek;
        this.language.value = coreViewModel.settingsModel.language;
        this.theme.value = coreViewModel.settingsModel.theme;

        // subscriptions
        this.firstDayOfWeek.subscribe(this.setFirstDayofWeek);
        this.language.subscribeSilent((newValue) => {
            this.coreViewModel.settingsModel.setLanguage(newValue);
            this.requiresReload.value = true;
        });
        this.theme.subscribeSilent((newValue) => {
            this.coreViewModel.settingsModel.setTheme(newValue);
        });

        // set theme
        this.theme.subscribe(() => {
            this.applyTheme();
        });
        SettingsViewModel.generateThemeMedia().addEventListener("change", () =>
            this.applyTheme(),
        );

        // keystrokes
        this.registerKeyStroke(CommonKeys.CloseOrCancel, this.close);
    }

    static generateThemeMedia(): MediaQueryList {
        return window.matchMedia("(prefers-color-scheme: dark)");
    }

    static getSystemTheme(): string {
        const media = SettingsViewModel.generateThemeMedia();
        return media.matches == true ? ThemeSettings.Dark : ThemeSettings.Light;
    }
}

export enum SettingsModalPages {
    Appearance,
    Regional,
    Info,
}
