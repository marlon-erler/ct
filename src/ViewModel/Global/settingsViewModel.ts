import CoreViewModel, { Context } from "./coreViewModel";
import * as React from "../../react";
import { CommonKeys } from "../../View/keystrokes";
import SettingsModel, {
    Languages,
    ThemeSettings,
} from "../../Model/Global/settingsModel";

export default class SettingsViewModel extends Context {
    // state
    username: React.State<string> = new React.State("");
    usernameInput: React.State<string> = new React.State("");
    isShowingSettingsModal: React.State<boolean> = new React.State(false);
    selectedModalPage: React.State<SettingsModalPages | undefined> =
        new React.State<SettingsModalPages | undefined>(undefined);
    requiresReload = new React.State<boolean>(false);

    firstDayOfWeek: React.State<string> = new React.State("0");
    language: React.State<Languages | string> = new React.State<
        Languages | string
    >(Languages.English);
    theme: React.State<ThemeSettings | string> = new React.State<
        ThemeSettings | string
    >(ThemeSettings.System);

    // guards
    cannotSetName: React.State<boolean> = React.createProxyState(
        [this.usernameInput],
        () =>
            this.usernameInput.value == "" ||
            this.usernameInput.value ==
                this.coreViewModel.settingsModel.username,
    );

    // methods
    setName = (name?: string): void => {
        if (typeof name == "string") {
            this.usernameInput.value = name;
        }
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

        if (theme == ThemeSettings.System)
            theme = SettingsViewModel.getSystemTheme();

        switch (theme) {
            case ThemeSettings.Dynamic:
                const scene = this.selectDynamicScene();
                this.setScene(scene);
                break;
            case ThemeSettings.Dark:
                this.setScene(DynamicSceneNight);
                break;
            case ThemeSettings.Black:
                this.setScene(DynamicSceneBlack);
                break;
            default:
                this.setScene(DynamicSceneDay);
        }
    };

    selectDynamicScene = (): DynamicScene => {
        let hour = new Date().getHours();

        if (hour >= 21 || hour <= 6) {
            return DynamicSceneNight;
        } else if (hour > 6 && hour < 10) {
            return DynamicSceneSunrise;
        } else if (hour < 14) {
            return DynamicSceneDay;
        } else if (hour < 17) {
            return DynamicSceneAfternoon;
        } else {
            return DynamicSceneSunset;
        }
    };

    setScene = (scene: DynamicScene): void => {
        document.body.style.setProperty(
            "--backdrop-grass-filter",
            `brightness(${scene.brightness})`,
        );

        function setSkyColor(
            tone: 1 | 2,
            hue: number,
            saturation: number,
            luma: number,
        ) {
            document.body.style.setProperty(
                `--sky-${tone}`,
                `hsl(${hue}, ${saturation}%, ${luma}%)`,
            );
        }
        setSkyColor(1, scene.hue1, scene.saturation, scene.luma);
        setSkyColor(2, scene.hue2, scene.saturation - 10, scene.luma - 10);

        document.body.setAttribute("theme", scene.baseTheme);
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
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly settingsModel: SettingsModel,
    ) {
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
        const seconds = new Date().getSeconds();
        const secondsUntilNewMinute = 60 - seconds;
        setTimeout(() => {
            setInterval(this.applyTheme, 1000 * 60);
        }, secondsUntilNewMinute);

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
    Account,
    Regional,
    Info,
}

export interface DynamicScene {
    hue1: number;
    hue2: number;
    saturation: number;
    luma: number;
    brightness: number;
    baseTheme: ThemeSettings;
}
export const DynamicSceneNight: DynamicScene = {
    hue1: 215,
    hue2: 220,
    saturation: 50,
    luma: 25,
    brightness: 0.4,
    baseTheme: ThemeSettings.Dark,
};
export const DynamicSceneSunrise: DynamicScene = {
    hue1: 45,
    hue2: 190,
    saturation: 100,
    luma: 50,
    brightness: 1.2,
    baseTheme: ThemeSettings.Light,
};
export const DynamicSceneDay: DynamicScene = {
    hue1: 190,
    hue2: 230,
    saturation: 100,
    luma: 70,
    brightness: 1.1,
    baseTheme: ThemeSettings.Light,
};
export const DynamicSceneAfternoon: DynamicScene = {
    hue1: 220,
    hue2: 250,
    saturation: 100,
    luma: 50,
    brightness: 0.8,
    baseTheme: ThemeSettings.Light,
};
export const DynamicSceneSunset: DynamicScene = {
    hue1: 20,
    hue2: 260,
    saturation: 100,
    luma: 50,
    brightness: 0.4,
    baseTheme: ThemeSettings.Dark,
};
export const DynamicSceneBlack: DynamicScene = {
    hue1: 0,
    hue2: 0,
    saturation: 0,
    luma: 0,
    brightness: 0,
    baseTheme: ThemeSettings.Black,
};
