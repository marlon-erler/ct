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

export function HomePage(
    coreViewModel: CoreViewModel,
    storageViewModel: StorageViewModel,
    settingsViewModel: SettingsViewModel,
    connectionViewModel: ConnectionViewModel,
    fileTransferViewModel: FileTransferViewModel,
    chatListViewModel: ChatListViewModel,
) {
    // sections
    const overviewSection = (
        <div id="overview-section">
            <h2>{coreViewModel.translations.homePage.overviewHeadline}</h2>

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
                >
                    <span class="icon">link</span>
                </button>
            </div>

            <hr></hr>

            <label class="tile flex-no">
                <span class="icon">account_circle</span>
                <div>
                    <span>
                        {coreViewModel.translations.homePage.yourNameLabel}
                    </span>
                    <input
                        placeholder={
                            coreViewModel.translations.homePage
                                .yourNamePlaceholder
                        }
                        bind:value={settingsViewModel.usernameInput}
                        on:enter={settingsViewModel.setName}
                    ></input>
                </div>
            </label>
            <div class="flex-row justify-end">
                <button
                    class="width-50"
                    on:click={settingsViewModel.setName}
                    toggle:disabled={settingsViewModel.cannotSetName}
                    aria-label={
                        coreViewModel.translations.homePage
                            .setNameButtonAudioLabel
                    }
                >
                    {coreViewModel.translations.general.setButton}
                    <span class="icon">check</span>
                </button>
            </div>

            <hr></hr>

            {HomePageButton(
                settingsViewModel.showSettingsModal,
                coreViewModel.translations.homePage.settingsButton,
                "settings",
            )}
            {HomePageButton(
                fileTransferViewModel.showDirectionSelectionModal,
                coreViewModel.translations.homePage.transferDataButton,
                "sync_alt",
            )}
            {HomePageButton(
                storageViewModel.showStorageModal,
                coreViewModel.translations.homePage.manageStorageButton,
                "hard_drive",
            )}

            <div class="mobile-only">
                <hr></hr>

                <div class="flex-row justify-end">
                    <button class="ghost width-50" on:click={scrollToChat}>
                        {coreViewModel.translations.homePage.scrollToChatButton}
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const chatSection = (
        <div id="chat-section">
            <h2>{coreViewModel.translations.homePage.chatsHeadline}</h2>

            <div class="flex-row width-input">
                <input
                    placeholder={
                        coreViewModel.translations.homePage.addChatPlaceholder
                    }
                    aria-label={
                        coreViewModel.translations.homePage.addChatAudioLabel
                    }
                    bind:value={chatListViewModel.newChatPrimaryChannel}
                    on:enter={chatListViewModel.createChat}
                ></input>
                <button
                    class="primary"
                    aria-label={
                        coreViewModel.translations.homePage.addChatButton
                    }
                    on:click={chatListViewModel.createChat}
                    toggle:disabled={chatListViewModel.cannotCreateChat}
                >
                    <span class="icon">add</span>
                </button>
            </div>

            <div
                id="chat-grid"
                children:append={[
                    chatListViewModel.chatViewModels,
                    ChatViewModelToChatEntry,
                ]}
            ></div>
        </div>
    );

    // methods
    function scrollToChat() {
        chatSection.scrollIntoView();
    }

    // final
    return (
        <article id="home-page">
            <div>
                {overviewSection}
                {chatSection}
            </div>
        </article>
    );
}
