import * as React from "bloatless-react";
import "./colors.css";
import "./coloredTile.css";
import "./base.css";
import HomeViewModel from "./ViewModel/Pages/homeViewModel";
import StorageViewModel from "./ViewModel/Global/storageViewModel";
import SettingsViewModel from "./ViewModel/Global/settingsViewModel";
import FileTransferViewModel from "./ViewModel/Global/fileTransferViewModel";
import CoreViewModel from "./ViewModel/Global/coreViewModel";
import ConnectionViewModel from "./ViewModel/Global/connectionViewModel";
import ChatListViewModel from "./ViewModel/Chat/chatListViewModel";
import { HomePage } from "./View/homePage";
import { ChatPageWrapper } from "./View/chatPageWrapper";
import { StorageModal } from "./View/Modals/storageModal";
import { SettingsModal } from "./View/Modals/settingsModal";
import { DataTransferModalWrapper } from "./View/Modals/dataTransferModal";
import { ConnectionModal } from "./View/Modals/connectionModal";
import v1Upgrader from "./Upgrader/v1";
import StorageModel from "./Model/Global/storageModel";
import SettingsModel from "./Model/Global/settingsModel";
import FileTransferModel from "./Model/Global/fileTransferModel";
import ConnectionModel from "./Model/Global/connectionModel";
import ChatListModel from "./Model/Chat/chatListModel";

// models
const storageModel = new StorageModel();
const settingsModel = new SettingsModel(storageModel);
const connectionModel = new ConnectionModel(storageModel);
const chatListModel = new ChatListModel(
    storageModel,
    settingsModel,
    connectionModel,
);
const fileTransferModel = new FileTransferModel(storageModel, connectionModel);

// viewModels
const coreViewModel = new CoreViewModel(
    storageModel,
    settingsModel,
    connectionModel,
    chatListModel,
    fileTransferModel,
);

// upgrade
new v1Upgrader(coreViewModel);

const storageViewModel = new StorageViewModel(coreViewModel);
const settingsViewModel = new SettingsViewModel(coreViewModel);
const connectionViewModel = new ConnectionViewModel(coreViewModel);
const chatListViewModel = new ChatListViewModel(
    coreViewModel,
    settingsViewModel,
    connectionViewModel,
);
const fileTransferViewModel = new FileTransferViewModel(coreViewModel);

const homeViewModel = new HomeViewModel(
    coreViewModel,
    settingsViewModel,
    fileTransferViewModel,
    storageViewModel,
    connectionViewModel,
);

// view
chatListViewModel.selectedChat.subscribe(() => {
    document.body.toggleAttribute(
        "showing-chat",
        chatListViewModel.selectedChat.value != undefined,
    );
});

document.body.append(
    <div id="background-wrapper">
        <div id="sky"></div>
        <div id="grass-1"></div>
        <div id="grass-2"></div>
    </div>,
);
document
    .querySelector("main")!
    .append(
        HomePage(
            coreViewModel,
            storageViewModel,
            settingsViewModel,
            connectionViewModel,
            fileTransferViewModel,
            chatListViewModel,
        ),
        ChatPageWrapper(coreViewModel, chatListViewModel),
        ConnectionModal(coreViewModel, connectionViewModel),
        DataTransferModalWrapper(
            coreViewModel,
            connectionViewModel,
            fileTransferViewModel,
        ),
        StorageModal(coreViewModel, storageViewModel),
        SettingsModal(coreViewModel, settingsViewModel),
    );
