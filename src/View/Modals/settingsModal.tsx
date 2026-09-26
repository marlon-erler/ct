import { SplitModal } from "./splitModal";
import { languageNames } from "../translations";
import { PlaceholderView } from "../Components/placeholderView";
import { OptionButtonList } from "../Components/optionButtonList";
import { NavigationButton } from "../Components/navigationButton";
import { InfoTile } from "../Components/infoTile";
import * as React from "../../react";
import SettingsViewModel, {
    SettingsModalPages,
} from "../../ViewModel/Global/settingsViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import { Languages, ThemeSettings } from "../../Model/Global/settingsModel";

export function SettingsModal(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    const detailView = React.createProxyState(
        [settingsViewModel.selectedModalPage],
        () => {
            switch (settingsViewModel.selectedModalPage.value) {
                case undefined: {
                    return PlaceholderView(
                        coreViewModel.translations.general.noPageSelected,
                    );
                }
                case SettingsModalPages.Appearance:
                    return SettingsAppearancePane(
                        coreViewModel,
                        settingsViewModel,
                    );
                case SettingsModalPages.Regional:
                    return SettingsRegionalPane(
                        coreViewModel,
                        settingsViewModel,
                    );
                case SettingsModalPages.Info:
                    return SettingsInfoPane(coreViewModel, settingsViewModel);
            }
        },
    );

    return (
        <div
            class="modal"
            toggle:open={settingsViewModel.isShowingSettingsModal}
        >
            <div>
                <main class="padding-0">
                    {SplitModal(
                        coreViewModel,
                        new React.State(
                            SettingsLeftPane(coreViewModel, settingsViewModel),
                        ),
                        detailView,
                        true,
                        settingsViewModel.selectedModalPage,
                    )}
                </main>
                <button on:click={settingsViewModel.close}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}

function SettingsLeftPane(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    return (
        <div class="flex-column gap slide-up">
            <h2>{coreViewModel.translations.homePage.settingsButton}</h2>
            {SettingsPaneButton(
                coreViewModel,
                settingsViewModel,
                SettingsModalPages.Appearance,
                coreViewModel.translations.settings.pages.appearance,
            )}
            {SettingsPaneButton(
                coreViewModel,
                settingsViewModel,
                SettingsModalPages.Regional,
                coreViewModel.translations.settings.pages.regional,
            )}
            {SettingsPaneButton(
                coreViewModel,
                settingsViewModel,
                SettingsModalPages.Info,
                coreViewModel.translations.settings.pages.info,
            )}
        </div>
    );
}

function SettingsPaneButton(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
    page: SettingsModalPages,
    label: string,
) {
    return NavigationButton(
        coreViewModel,
        label,
        settingsViewModel.selectedModalPage,
        page,
        true,
    );
}

function SettingsInfoPane(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    return (
        <div class="slide-up">
            <h2>{coreViewModel.translations.homePage.appName}</h2>
            <hr></hr>
            <div class="flex-column gap">
                {InfoTile(
                    "build",
                    coreViewModel.translations.settings.version,
                    settingsViewModel.coreViewModel.version,
                )}

                <button
                    class="primary"
                    on:click={coreViewModel.update}
                    toggle:hidden={coreViewModel.noUpdateAvailable}
                >
                    <span subscribe:innerText={coreViewModel.updateText}></span>
                    <span class="icon">update</span>
                </button>

                <button class="standard" on:click={coreViewModel.checkUpdates}>
                    {coreViewModel.translations.settings.checkUpdatesButton}
                </button>
            </div>
        </div>
    );
}

function SettingsRegionalPane(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    return (
        <div class="slide-up">
            <h2>{coreViewModel.translations.settings.pages.regional}</h2>

            <hr></hr>
            <h3>{coreViewModel.translations.settings.language}</h3>
            {OptionButtonList(
                new React.ListState<[string, string]>(
                    Object.values(Languages).map((x) => [languageNames[x], x]),
                ),
                settingsViewModel.language,
            )}

            <hr></hr>
            <h3>{coreViewModel.translations.settings.firstDayOfWeekLabel}</h3>
            {OptionButtonList(
                new React.ListState<[string, string]>(
                    coreViewModel.translations.regional.weekdays.full.map(
                        (x, i) => [x, i.toString()],
                    ),
                ),
                settingsViewModel.firstDayOfWeek,
            )}
        </div>
    );
}

function SettingsAppearancePane(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    return (
        <div class="slide-up">
            <h2>{coreViewModel.translations.settings.pages.appearance}</h2>
            <hr></hr>
            {OptionButtonList(
                new React.ListState<[string, string]>([
                    [
                        coreViewModel.translations.settings.themes.dynamic,
                        ThemeSettings.Dynamic,
                    ],
                    [
                        coreViewModel.translations.settings.themes.system,
                        ThemeSettings.System,
                    ],
                    [
                        coreViewModel.translations.settings.themes.dark,
                        ThemeSettings.Dark,
                    ],
                    [
                        coreViewModel.translations.settings.themes.light,
                        ThemeSettings.Light,
                    ],
                    [
                        coreViewModel.translations.settings.themes.black,
                        ThemeSettings.Black,
                    ],
                ]),
                settingsViewModel.theme,
            )}
        </div>
    );
}
