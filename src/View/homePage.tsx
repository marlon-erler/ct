import "./homePage.css";
import { StringToOption } from "./Components/option";
import { HomePageButton } from "./Components/homePageButton";
import { ChatViewModelToChatEntry } from "./Components/chatEntry";
import * as React from "../react";
import StorageViewModel from "../ViewModel/Global/storageViewModel";
import SettingsViewModel from "../ViewModel/Global/settingsViewModel";
import FileTransferViewModel from "../ViewModel/Global/fileTransferViewModel";
import CoreViewModel from "../ViewModel/Global/coreViewModel";
import ConnectionViewModel from "../ViewModel/Global/connectionViewModel";
import ChatListViewModel from "../ViewModel/Chat/chatListViewModel";
import {NewItemEntry} from "./Components/newItemEntry";

export function HomePage(
    coreViewModel: CoreViewModel,
    storageViewModel: StorageViewModel,
    settingsViewModel: SettingsViewModel,
    connectionViewModel: ConnectionViewModel,
    fileTransferViewModel: FileTransferViewModel,
    chatListViewModel: ChatListViewModel,
) {
    const greeting = React.createProxyState([settingsViewModel.username], ()=>coreViewModel.translations.homePage.greeting(settingsViewModel.username.value));

    // sections
    const overviewSection = (
        <div id="overview-section">
            <label class="tile flex-no">
                <span class="icon">cell_tower</span>
                <div>
                    <span>
                        {coreViewModel.translations.homePage.serverAddress}
                    </span>
                    <input
                        list="previous-connection-list"
                        placeholder={
                            coreViewModel.translations.homePage
                                .serverAddressPlaceholder
                        }
                        bind:value={connectionViewModel.serverAddressInput}
                        on:enter={connectionViewModel.connect}
                    ></input>
                    <datalist
                        hidden
                        id="previous-connection-list"
                        children:append={[
                            connectionViewModel.previousAddresses,
                            StringToOption,
                        ]}
                    ></datalist>
                </div>
            </label>

            <div class="flex-row">
                <button
                    class="danger flex justify-center"
                    aria-label={
                        coreViewModel.translations.homePage.disconnectAudioLabel
                    }
                    on:click={connectionViewModel.disconnect}
                    toggle:disabled={connectionViewModel.cannotDisonnect}
                    ctkeystroke="x"
                >
                    <span class="icon">link_off</span>
                </button>
                <button
                    class="flex justify-center"
                    aria-label={
                        coreViewModel.translations.homePage
                            .manageConnectionsAudioLabel
                    }
                    on:click={connectionViewModel.showConnectionModal}
                    toggle:disabled={
                        connectionViewModel.hasNoPreviousConnections
                    }
                >
                    <span class="icon">history</span>
                </button>
                <button
                    class="primary flex justify-center"
                    aria-label={
                        coreViewModel.translations.homePage.connectAudioLabel
                    }
                    on:click={connectionViewModel.connect}
                    toggle:disabled={connectionViewModel.cannotConnect}
                    ctkeystroke="c"
                >
                    <span class="icon">link</span>
                </button>
            </div>

            <hr></hr>

            {HomePageButton(
                settingsViewModel.showSettingsModal,
                coreViewModel.translations.homePage.settingsButton,
                "settings",
                ",",
            )}
            {HomePageButton(
                fileTransferViewModel.showDirectionSelectionModal,
                coreViewModel.translations.homePage.transferDataButton,
                "sync_alt",
                "t",
            )}
            {HomePageButton(
                storageViewModel.showStorageModal,
                coreViewModel.translations.homePage.manageStorageButton,
                "hard_drive",
                "e",
            )}

            <button
                class="primary"
                on:click={coreViewModel.update}
                toggle:hidden={coreViewModel.noUpdateAvailable}
            >
                <span subscribe:innerText={coreViewModel.updateText}></span>
                <span class="icon">update</span>
            </button>
	
	    <hr class="mobile-only"></hr>
        </div>
    );

    const chatSection = (
        <div id="chat-section">
            <div class="flex-row width-input">
                <input
                                placeholder={
                                    coreViewModel.translations.general
                                        .filterOrCreateLabel(coreViewModel.translations.homePage.typeChat)
                                }
                    bind:value={chatListViewModel.chatQuery}
                    on:enter={chatListViewModel.createChat}
                ></input>
	    </div>

	    <hr></hr>

	    {NewItemEntry(coreViewModel, chatListViewModel.chatQuery, chatListViewModel.createChat)}

            <div
                id="chat-grid"
                children:append={[
                    chatListViewModel.chatMatches,
                    ChatViewModelToChatEntry,
                ]}
	    ></div>
        </div>
    );

    // final
    return (
	<article id="home-page">
	    <h1 subscribe:innerText={greeting}></h1>
            <div>
                {overviewSection}
                {chatSection}
            </div>
        </article>
    );
}
