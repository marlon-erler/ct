import CoreViewModel, { Context } from "../Global/coreViewModel";
import ChatViewModel, { ChatPageTypes } from "../Chat/chatViewModel";
import * as React from "../../react";
import { Colors } from "../../colors";
import {random} from "../../Model/Utility/crypto";

export default class SettingsPageViewModel extends Context {
    // state
    name: React.State<string> = new React.State("");
    nameInput: React.State<string> = new React.State("");

    secondaryChannels: React.ListState<string> = new React.ListState();
    newSecondaryChannelInput: React.State<string> = new React.State("");

    encryptionKeyInput: React.State<string> = new React.State("");
    shouldShowEncryptionKey: React.State<boolean> = new React.State(false);
    encryptionKeyInputType: React.State<"text" | "password"> =
        React.createProxyState([this.shouldShowEncryptionKey], () =>
            this.shouldShowEncryptionKey.value == true ? "text" : "password",
        );

    color: React.State<Colors> = new React.State<any>(Colors.Standard);
    appliedColor: React.State<Colors> = new React.State<any>(Colors.Standard);

    // guards
    cannotSetPrimaryChannel: React.State<boolean> = React.createProxyState(
        [this.name, this.nameInput],
        () =>
            this.nameInput.value == "" ||
            this.nameInput.value == this.name.value,
    );
    cannotSetColor: React.State<boolean> = React.createProxyState(
        [this.color, this.appliedColor],
        () => this.color.value == this.appliedColor.value,
    );
    cannotAddSecondaryChannel: React.State<boolean> = React.createProxyState(
        [this.newSecondaryChannelInput],
        () => this.newSecondaryChannelInput.value == "",
    );
    cannotSetEncryptionKey: React.State<boolean>;

    // methods
    setName = (): void => {
        this.chatViewModel.chatModel.setName(this.nameInput.value);
        this.name.value = this.chatViewModel.chatModel.info.name;

        this.chatViewModel.chatListViewModel.updateIndices();
    };

    addSecondaryChannel = (): void => {
        this.secondaryChannels.add(this.newSecondaryChannelInput.value);
        this.newSecondaryChannelInput.value = "";
        this.storeSecondaryChannels();
        this.loadSecondaryChannels();
    };

    removeSecondaryChannel = (secondaryChannel: string): void => {
        this.secondaryChannels.remove(secondaryChannel);
        this.storeSecondaryChannels();
    };

    storeSecondaryChannels = (): void => {
        this.chatViewModel.chatModel.setSecondaryChannels([
            ...this.secondaryChannels.value.values(),
        ]);
    };

    setEncryptionKey = (): void => {
        this.chatViewModel.chatModel.setEncryptionKey(
            this.encryptionKeyInput.value,
        );

        // disable button
        this.encryptionKeyInput.callSubscriptions();
    };

    randomizeKey = (): void => {
	this.encryptionKeyInput.value = random(24);
	this.setEncryptionKey();
    }

    applyColor = (): void => {
        this.chatViewModel.setColor(this.color.value);
        this.appliedColor.value = this.color.value;
    };

    remove = (): void => {
        this.chatViewModel.close();
        this.chatViewModel.chatModel.delete();
        this.chatViewModel.chatListViewModel.untrackChat(this.chatViewModel);
    };

    // load
    preloadData = (): void => {
        this.name.value = this.chatViewModel.chatModel.info.name;

        this.color.value = this.chatViewModel.chatModel.color;
        this.appliedColor.value = this.color.value;
    };

    updateData = (): void => {
        this.preloadData();
        this.nameInput.value = this.name.value;
        this.chatViewModel.resetColor();
    };

    loadData = (): void => {
        this.nameInput.value = this.name.value;

        this.loadSecondaryChannels();

        this.encryptionKeyInput.value =
            this.chatViewModel.chatModel.info.encryptionKey;
    };

    loadSecondaryChannels = (): void => {
        this.secondaryChannels.clear();
        for (const secondaryChannel of this.chatViewModel.chatModel
            .secondaryChannels) {
            this.secondaryChannels.add(secondaryChannel);
        }
    };

    // context
    handleContextClose = (fromHistoryEvent: boolean): void | boolean => {
	if (!fromHistoryEvent) return;
	return true;
    }

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
    ) {
        super("settings");

        this.preloadData();

        this.cannotSetEncryptionKey = React.createProxyState(
            [this.encryptionKeyInput],
            () =>
                this.encryptionKeyInput.value ==
                this.chatViewModel.chatModel.info.encryptionKey,
        );

        this.chatViewModel.registerContext(ChatPageTypes.Settings, this);
    }
}
