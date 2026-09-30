import { v4 } from "uuid";
import * as React from "../../react";
import { allTranslations, Translations } from "../../View/translations";
import { formatTime, HandlerManager } from "../../Model/Utility/utility";
import StorageModel from "../../Model/Global/storageModel";
import SettingsModel from "../../Model/Global/settingsModel";
import FileTransferModel from "../../Model/Global/fileTransferModel";
import ConnectionModel from "../../Model/Global/connectionModel";
import ChatListModel from "../../Model/Chat/chatListModel";

export default class CoreViewModel {
    swRegistration: ServiceWorkerRegistration | undefined = undefined;

    version: React.State<string> = new React.State("");
    latestVersion: React.State<string> = new React.State("");
    noUpdateAvailable: React.State<boolean> = React.createProxyState(
        [this.latestVersion],
        () => {
            return (
                this.latestVersion.value == "" ||
                this.latestVersion.value == this.version.value
            );
        },
    );
    updateText: React.State<string> = new React.State("");

    translations: Translations;

    // CONTEXT
    private contextStack = new Map<string, Context>();

    get contexts(): Context[] {
        return [...this.contextStack.values()];
    }
    get context(): Context | undefined {
        return this.contexts.pop();
    }
    set context(context: Context) {
        if (this.contextStack.has(context.contextId)) return;
        this.contextStack.set(context.contextId, context);
        history.pushState({ id: context.contextId }, "");
    }

    closeContext = (
        contextId: string,
        fromHistoryEvent: boolean = false,
    ): void => {
        if (
            !this.contexts
                .map((context) => context.contextId)
                .includes(contextId)
        )
            return;

        let exitNext: boolean = false;

        while (this.contexts.length > 0) {
            const currentContext: Context | undefined = this.context;
            if (!currentContext) break;
            const response =
                currentContext.handleContextClose(fromHistoryEvent);
            if (response == false) break;
            this.contextStack.delete(currentContext.contextId);
            if (response == true) {
                exitNext = true;
                continue;
            } else if (exitNext == true) {
                break;
            } else if (currentContext.contextId == contextId) {
                break;
            }
        }
    };

    handleKeyDown = (e: KeyboardEvent): void => {
        if (!(e instanceof KeyboardEvent))
            return console.trace("NOT A KEY EVENT");
        if (CoreViewModel.checkIsKeystroke(e) == false) return;
        document.body.setAttribute("keystroke-active", "");
        e.preventDefault();
        const contexts: Context[] = this.contexts;
        while (contexts.length > 0) {
            const currentContext: Context | undefined = contexts.pop();
            if (!currentContext) return;
            const isHandled: boolean = currentContext.handleKeystroke(e);
            if (isHandled == true) break;
        }
    };

    handleKeyUp = (): void => {
        document.body.removeAttribute("keystroke-active");
    };

    // CHRON
    chronHandlerManager = new HandlerManager<void>();
    todayDate = new React.State<Date>(new Date());
    time = new React.State<string>("99:99");
    get unwrappedTodayDate(): Date {
        return new Date(this.todayDate.value);
    }

    startChron = (): void => {
        setInterval(this.chronHandlerManager.trigger, 1000);
    };

    handleChron = (): void => {
        const newDate = new Date();
        if (this.unwrappedTodayDate.toDateString() != newDate.toDateString())
            this.todayDate.value = new Date();
        if (formatTime(newDate) != this.time.value)
            this.time.value = formatTime(newDate);
    };

    // DRAG & DROP
    draggedObject: React.State<any> = new React.State<any>(undefined);

    // OFFLINE MODE & UPDATE
    configureServiceWorker = async (): Promise<void> => {
        if ("serviceWorker" in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register(
                    "sw.js",
                    {
                        scope: "/",
                    },
                );
                if (this.swRegistration.active) {
                    console.log("Service worker active");
                }
            } catch (error) {
                console.error(`Could not install service worker: ${error}`);
            }
        }
    };

    checkUpdates = (): void => {
        fetch("/version").then(async (response) => {
            this.version.value = await response.text();
        });
        fetch("/latestVersion").then(async (response) => {
            this.latestVersion.value = (await response.text()).replace(
                "\n",
                "",
            );
        });
    };

    update = async (): Promise<void> => {
        if (!this.swRegistration) return;
        await this.swRegistration.update();
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    // init
    constructor(
        public readonly storageModel: StorageModel,
        public readonly settingsModel: SettingsModel,
        public readonly connectionModel: ConnectionModel,
        public readonly chatListModel: ChatListModel,
        public readonly fileTransferModel: FileTransferModel,
    ) {
        this.translations =
            allTranslations[settingsModel.language] || allTranslations.en;

        this.latestVersion.subscribe((latestVersion) => {
            this.updateText.value =
                this.translations.homePage.updateButton(latestVersion);
        });

        document.body.addEventListener("keydown", this.handleKeyDown);
        document.body.addEventListener("keyup", this.handleKeyUp);

        window.onpopstate = () => {
            if (!this.context) return;
            this.closeContext(this.context.contextId, true);
        };

        this.configureServiceWorker();
        this.checkUpdates();

        this.startChron();
        this.chronHandlerManager.setHandler(
            "core-view-model",
            this.handleChron,
        );
    }

    // util
    static checkIsKeystroke(e: KeyboardEvent): boolean {
        return (e.metaKey || e.altKey) && e.ctrlKey;
    }
}

export class Context {
    contextId = v4();
    keystrokes = new Map<string, () => void>();

    handleKeystroke = (e: KeyboardEvent): boolean => {
        const fn: (() => void) | undefined = this.keystrokes.get(
            e.key.toLowerCase(),
        );
        if (!fn) return false;
        fn();
        return true;
    };

    close = (): void => {};
    handleContextClose = (fromHistoryEvent: boolean): void | boolean => {};

    registerKeyStroke = (key: string, fn: () => void): void => {
        this.keystrokes.set(key, fn);
    };

    constructor(public contextDebugDescription: string) {}
}

export class ContextHost<T> extends Context {
    contexts = new Map<T, Context>();
    currentContext = new React.State<Context | undefined>(undefined);

    get isOpen(): boolean {
        return false;
    }
    get contextSelection(): T | undefined {
        return undefined;
    }

    registerContext = (key: T, context: Context): void => {
        this.contexts.set(key, context);
    };

    closeCurrentContext = (): void => {
        if (this.currentContext.value) {
            this.coreViewModel.closeContext(
                this.currentContext.value.contextId,
            );
        }
        this.currentContext.value = undefined;
    };

    updateContexts = (): void => {
        if (this.isOpen == false) return;

        const selection = this.contextSelection;
        if (!selection) return;
        const selectedContext: Context | undefined =
            this.contexts.get(selection);
        if (!selectedContext) return;
        if (selectedContext != this.currentContext.value) {
            this.closeCurrentContext();
        }

        this.coreViewModel.context = selectedContext;
        this.currentContext.value = selectedContext;
    };

    constructor(
        contextDebugDescription: string,
        public coreViewModel: CoreViewModel,
    ) {
        super(contextDebugDescription);
    }
}
