(() => {
  // node_modules/uuid/dist/stringify.js
  var byteToHex = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  // node_modules/uuid/dist/rng.js
  var rnds8 = new Uint8Array(16);
  function rng() {
    return crypto.getRandomValues(rnds8);
  }

  // node_modules/uuid/dist/v4.js
  function v4(options, buf, offset) {
    if (!buf && !options && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return _v4(options, buf, offset);
  }
  function _v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
      throw new Error("Random bytes length must be >= 16");
    }
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      if (offset < 0 || offset + 16 > buf.length) {
        throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
      }
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default = v4;

  // src/react.ts
  function UUID() {
    return v4_default();
  }
  var State = class {
    // init
    constructor(initialValue) {
      this._bindings = /* @__PURE__ */ new Set();
      this._value = initialValue;
    }
    // value
    get value() {
      return this._value;
    }
    set value(newValue) {
      this._value = newValue;
      this.callSubscriptions();
    }
    // subscriptions
    callSubscriptions() {
      this._bindings.forEach((fn) => fn(this._value));
    }
    subscribe(fn) {
      this._bindings.add(fn);
      fn(this._value);
    }
    subscribeSilent(fn) {
      this._bindings.add(fn);
    }
    // stringify
    toString() {
      return JSON.stringify(this._value);
    }
  };
  var ListState = class extends State {
    // init
    constructor(initialItems) {
      super(new Set(initialItems));
      this.additionHandlers = /* @__PURE__ */ new Set();
      this.removalHandlers = /* @__PURE__ */ new Map();
      this.genericRemovalHandlers = /* @__PURE__ */ new Set();
    }
    // list
    add(...items) {
      items.forEach((item) => {
        if (this.value.has(item)) return;
        this.value.add(item);
        this.additionHandlers.forEach((handler) => handler(item));
      });
      this.callSubscriptions();
    }
    remove(...items) {
      items.forEach((item) => {
        this.value.delete(item);
        this.genericRemovalHandlers.forEach((handler) => handler(item));
        if (!this.removalHandlers.has(item)) return;
        this.removalHandlers.get(item).forEach((handler) => handler(item));
        this.removalHandlers.delete(item);
      });
      this.callSubscriptions();
    }
    clear() {
      this.remove(...this.value.values());
    }
    // handlers
    handleAddition(handler) {
      this.additionHandlers.add(handler);
      [...this.value.values()].forEach(handler);
    }
    handleRemoval(item, handler) {
      if (!this.removalHandlers.has(item))
        this.removalHandlers.set(item, /* @__PURE__ */ new Set());
      this.removalHandlers.get(item).add(handler);
    }
    handleRemovals(handler) {
      this.genericRemovalHandlers.add(handler);
    }
    // stringification
    toString() {
      const array = [...this.value.values()];
      const json = JSON.stringify(array);
      return json;
    }
  };
  var MapState = class extends State {
    // init
    constructor(initialItems) {
      super(new Map(initialItems));
      this.additionHandlers = /* @__PURE__ */ new Set();
      this.removalHandlers = /* @__PURE__ */ new Map();
      this.genericRemovalHandlers = /* @__PURE__ */ new Set();
    }
    // list
    set(key, item) {
      this.remove(key);
      this.value.set(key, item);
      this.additionHandlers.forEach((handler) => handler(item));
      this.callSubscriptions();
    }
    remove(key) {
      const item = this.value.get(key);
      if (!item) return;
      this.value.delete(key);
      this.callSubscriptions();
      this.genericRemovalHandlers.forEach((handler) => handler(item));
      if (!this.removalHandlers.has(item)) return;
      this.removalHandlers.get(item).forEach((handler) => handler(item));
      this.removalHandlers.delete(item);
    }
    clear() {
      [...this.value.keys()].forEach((key) => this.remove(key));
    }
    // handlers
    handleAddition(handler) {
      this.additionHandlers.add(handler);
      [...this.value.values()].forEach(handler);
    }
    handleRemoval(item, handler) {
      if (!this.removalHandlers.has(item))
        this.removalHandlers.set(item, /* @__PURE__ */ new Set());
      this.removalHandlers.get(item).add(handler);
    }
    handleRemovals(handler) {
      this.genericRemovalHandlers.add(handler);
    }
    // stringification
    toString() {
      const array = [...this.value.entries()];
      const json = JSON.stringify(array);
      return json;
    }
  };
  function createProxyState(statesToSubscibe, fn) {
    const proxyState = new State(fn());
    statesToSubscibe.forEach(
      (state) => state.subscribeSilent(() => proxyState.value = fn())
    );
    return proxyState;
  }
  function bulkSubscribe(statesToSubscibe, fn) {
    statesToSubscibe.forEach((state) => state.subscribeSilent(fn));
  }
  function createElement(tagName, attributes = {}, ...children) {
    const element = document.createElement(tagName);
    if (attributes != null)
      Object.entries(attributes).forEach((entry) => {
        const [attributename, value] = entry;
        const [directiveKey, directiveValue] = attributename.split(":");
        switch (directiveKey) {
          case "on": {
            switch (directiveValue) {
              case "enter": {
                element.addEventListener("keydown", (e) => {
                  if (!(e instanceof KeyboardEvent)) return;
                  if (e.key != "Enter") return;
                  value(e);
                });
                break;
              }
              default: {
                element.addEventListener(directiveValue, value);
              }
            }
            break;
          }
          case "keystroke": {
            element.addEventListener("keydown", (e) => {
              if (!(e instanceof KeyboardEvent)) return;
              if (e.metaKey == false && e.ctrlKey == false) return;
              if (e.key != directiveValue) return;
              value(e);
            });
            break;
          }
          case "subscribe": {
            const state = value;
            state.subscribe(
              (newValue) => element[directiveValue] = newValue
            );
            break;
          }
          case "bind": {
            const state = value;
            state.subscribe(
              (newValue) => element[directiveValue] = newValue
            );
            element.addEventListener(
              "input",
              () => state.value = element[directiveValue]
            );
            break;
          }
          case "toggle": {
            if (value.subscribe) {
              const state = value;
              state.subscribe(
                (newValue) => element.toggleAttribute(directiveValue, newValue)
              );
            } else {
              element.toggleAttribute(directiveValue, value);
            }
            break;
          }
          case "set": {
            const state = value;
            state.subscribe(
              (newValue) => element.setAttribute(directiveValue, newValue)
            );
            break;
          }
          case "children": {
            switch (directiveValue) {
              case "set": {
                const state = value;
                state.subscribe((newValue) => {
                  element.innerHTML = "";
                  element.append(...[newValue].flat());
                });
                break;
              }
              case "append":
              case "prepend": {
                try {
                  const [listState, toElement] = value;
                  listState.handleAddition((newItem) => {
                    const child = toElement(newItem);
                    listState.handleRemoval(
                      newItem,
                      () => child.remove()
                    );
                    if (directiveValue == "append") {
                      element.append(child);
                    } else if (directiveValue == "prepend") {
                      element.prepend(child);
                    }
                  });
                } catch (error) {
                  console.error(error);
                  throw `error: cannot process subscribe:children directive. 
 Usage: "children:append={[list, converter]}"; you can find a more detailed example in the documentation.`;
                }
              }
            }
            break;
          }
          default:
            element.setAttribute(attributename, value);
        }
      });
    children.filter((x) => x).forEach((child) => element.append(child));
    return element;
  }

  // src/View/translations.ts
  var englishTranslations = {
    updater: {
      migrated: "Migrated"
    },
    general: {
      deleteItemButtonAudioLabel: "delete item",
      searchButtonAudioLabel: "search",
      searchButtonClearAudioLabel: "clear search query",
      abortButton: "Abort",
      applyButton: "Apply",
      backButton: "Back",
      cancelButton: "Cancel",
      confirmButton: "Confirm",
      continueButton: "Continue",
      closeButton: "Close",
      deleteButton: "Delete",
      exitButton: "Exit",
      fullscreenButton: "Fullscreen",
      refreshButton: "Refresh",
      saveButton: "Save",
      setButton: "Set",
      filterOrCreateLabel: "Search or create",
      createLabel: (query) => `Create "${query}"`,
      reloadAppButton: "Reload App",
      fileVersionLabel: "Version",
      searchLabel: "Search",
      searchSuggestionsLabel: "Recent searches",
      waitingLabel: "Waiting...",
      restoreConnection: "Restore connection",
      noPageSelected: "No page selected"
    },
    regional: {
      weekdays: {
        full: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      }
    },
    homePage: {
      appName: "Coordination Tool",
      ///
      overviewHeadline: "Overview",
      serverAddress: "Server address",
      serverAddressPlaceholder: "wss://192.168.0.69:3000",
      connectAudioLabel: "connect to server",
      disconnectAudioLabel: "disconnect from server",
      manageConnectionsAudioLabel: "manage connections",
      settingsButton: "Settings",
      manageStorageButton: "Manage storage",
      transferDataButton: "Transfer or export data",
      updateButton: (version) => `Update to ${version}`,
      scrollToChatButton: "Chats",
      ///
      backToOverviewAudioLabel: "go back to overview",
      chatsHeadline: "Chats",
      addChatAudioLabel: "name of new chat",
      addChatPlaceholder: "Add chat",
      addChatButton: "Add chat"
    },
    settings: {
      pages: {
        appearance: "Appearance",
        account: "Account",
        regional: "Language & Region",
        info: "About CT"
      },
      themes: {
        dynamic: "Dynamic",
        dark: "Dark",
        light: "Light",
        system: "Device theme",
        black: "Black"
      },
      account: {
        yourNameLabel: "Your name",
        yourNamePlaceholder: "Jane Doe",
        setNameButtonAudioLabel: "set name"
      },
      regional: {
        language: "Language",
        firstDayOfWeekLabel: "First day of week"
      },
      about: {
        version: "Version",
        checkUpdatesButton: "Check for updates"
      }
    },
    onboarding: {
      connectionHeadline: "Connect to UDN",
      connectionDescription: "To transfer files and send messages, connect to the Universal Decentralized Network (UDN).",
      connectButton: "Connect",
      connectionNextButton: (isConnected) => isConnected ? "Continue" : "Set up without UDN",
      ///
      transferOptionsHeadline: "Copy Your Data",
      transferOptionsDescription: "If you already use the Coordination Tool on another device, copy your identity here. You can use both devices at the same time.",
      transferOptionTransfer: "Copy my data here",
      transferOptionNew: "Set up as new device",
      //
      nameHeadline: "Your Name",
      nameDescription: "This is what others see when you send messages. You can always change your name in settings.",
      //
      transferHeadline: "Data Transfer",
      transferDescription: "On your other device, prepare to transfer your identity and personal data alongside any chats you wish to copy. Then, enter the displayed data here. You can find the data transfer on the home screen of the other device.",
      transferButton: "Copy data"
    },
    connectionModal: {
      connectionModalHeadline: "Manage Connections",
      ///
      connectButtonAudioLabel: "connect"
    },
    dataTransferModal: {
      transferDataHeadline: "Data Transfer",
      sendHeadline: "Transfer to other device",
      receiveHeadline: "Transfer to This Device",
      exportHeadline: "Export Data",
      importHeadline: "Import Data",
      selectionDescription: "Select the data that you want to transfer.",
      exportSelectionDescription: "Select the data that you want to export.",
      dataEntryDescription: "Enter this data on the other device.",
      dataEntryInputDescription: "Enter the data displayed on the other device.",
      ///
      fromThisDeviceButton: "Send to other device",
      toThisDeviceButton: "Send to this device",
      exportButton: "Export to file",
      importButton: "Import from file",
      ///
      generalHeadline: "General",
      connectionData: "Connection data",
      settingsData: "Identity & personal data",
      chatsHeadline: "Chats",
      ///
      transferChannelHeadline: "Transfer Chanel",
      transferKeyHeadline: "Transfer Encryption Key",
      sendButton: "Send",
      sendAgainButton: "Send again",
      ///
      filesSentCount: (count) => `Files sent: ${count}.`,
      allFilesSent: "Done.",
      filesReceivedCount: (count) => `Files processed: ${count}.`,
      //
      exportKey: "Encryption key",
      exportKeyConfirmation: "Confirm",
      downloadFileButton: "Download",
      importFileButton: "Import",
      decryptImportButton: "Decrypt",
      incorrectPassphraseError: "The encryption key is incorrect"
    },
    storage: {
      noItemSelected: "No item selected",
      notAFile: "(not a file)",
      contentEmpty: "(empty)",
      usageLabel: "Usage",
      usageVauleLabel: (used, max) => `${used} of ${max} MB`,
      path: "Path",
      content: "Content",
      deleteItem: "Delete item",
      removeJunkButton: "Delete junk files"
    },
    chatPage: {
      closeChatAudioLabe: "close chat",
      chatSettingsAudioLabel: "chat settings",
      pages: {
        settings: "Settings",
        messages: "Messages",
        tasks: "Tasks",
        calendar: "Calendar"
      },
      settings: {
        settingsHeadline: "Settings",
        nameLabel: "Chat name",
        setNameButtonAudioLabel: "set name",
        newSecondaryChannelPlaceholder: "Add secondary channel",
        newSecondaryChannelAudioLabel: "name of new secondary channel",
        addSecondaryChannelButtonAudioLabel: "add secondary channel",
        encryptionKeyLabel: "Encryption key",
        setEncryptionKeyButtonAudioLabel: "set encryption key",
        showEncryptionKey: "Show encryption key",
        setColorButtonAudioLabel: "set color",
        deleteChatButton: "Delete entire chat"
      },
      message: {
        messagesHeadline: "Messages",
        messageFilterHeadline: "Filter messages",
        messageFilterReactionsHadline: "Reactions",
        messageFilterAllReactionsButton: "Show all",
        ///
        composerInputPlaceholder: "Type a message...",
        sendMessageButtonAudioLabel: "send message",
        filterMessagesButtonAudioLabel: "filter messages",
        ///
        showMessageInfoButtonAudioLabel: "show message info",
        messageInfoHeadline: "Message Info",
        cancelReplyAudioLabel: "cancel reply",
        sentBy: "Sent by",
        timeSent: "Time sent",
        channel: "Channel",
        messageContent: "Message content",
        copyMessageButton: "Copy message",
        resendMessageButton: "Resend message",
        decryptMessageButton: "Decrypt message",
        replyToMessageButton: "Reply to message",
        deleteMessageButton: "Delete message",
        //
        thumbsUpReaction: "Reaction: thumbs up",
        checkReaction: "Reaction: check",
        stopReaction: "Reaction: stop sign",
        attentionReaction: "Reaction: exclamation mark",
        doubleAttentionReaction: "Reaction: double exclamation mark",
        questionReaction: "Reaction: question mark",
        //
        replyPrefixLabel: "Replies: ",
        replyHeaderLabel: (message) => `Replies to "${message}"`
      },
      task: {
        noBoardSelected: "No board selected",
        boardNotFound: "Board not found",
        ///
        closeBoardButtonAudioLabel: "close board",
        toggleBoardButtonAudioLabel: "toggle board list",
        showBoardSettingsButtonAudioLabel: "show board settigns",
        listViewButtonAudioLabel: "list view",
        kanbanViewButtonAudioLabel: "kanban view",
        statusViewButtonAudioLabel: "status grid view",
        filterTasksButtonAudioLabel: "filter tasks",
        createTaskButtonAudioLabel: "create new task",
        ///
        boardSettingsHeadline: "Board Settings",
        boardNameInputLabel: "Board name",
        deleteBoardButton: "Delete board and all tasks",
        ///
        taskSettingsHeadline: "Edit Task",
        taskNameLabel: "Title",
        taskBoardLabel: "Board",
        taskCategoryLabel: "Category",
        taskStatusLabel: "Status",
        taskPriorityLabel: "Priority",
        taskDescriptionLabel: "Description",
        taskDateLabel: "Date",
        taskTimeLabel: "Time",
        deleteTaskButton: "Delete task",
        ///
        filterTasksHeadline: "Filter Tasks",
        ///
        renameCategoryInputPlaceholder: "Rename category",
        renameStatusInputPlaceholder: "Rename status"
      },
      calendar: {
        eventsBoard: "Events",
        ///
        todayButtonAudioLabel: "go to today",
        previousMonthButtonAudioLabel: "previous month",
        nextMonthButtonAudioLabel: "next month",
        yearInputAudioLabel: "year",
        monthInputAudioLabel: "month",
        yearInputPlaceholder: "2000",
        monthInputPlaceholder: "01",
        ///
        searchEventsHeadline: "Search Events",
        ///
        events: "Events",
        noEvents: "No events",
        //
        eventNext: "Up next"
      }
    }
  };
  var allTranslations = {
    en: englishTranslations,
    de: {
      updater: {
        migrated: "Migriert"
      },
      general: {
        deleteItemButtonAudioLabel: "element l\xF6schen",
        searchButtonAudioLabel: "suchen",
        searchButtonClearAudioLabel: "suche zur\xFCcksetzen",
        abortButton: "Abbrechen",
        applyButton: "Anwenden",
        backButton: "Zur\xFCck",
        cancelButton: "Abbrechen",
        continueButton: "Weiter",
        confirmButton: "Best\xE4tigen",
        closeButton: "Schlie\xDFen",
        deleteButton: "L\xF6schen",
        exitButton: "Schlie\xDFen",
        fullscreenButton: "Vollbild",
        refreshButton: "Aktualisieren",
        saveButton: "Speichern",
        setButton: "OK",
        filterOrCreateLabel: "Suchen oder erstellen",
        createLabel: (query) => `"${query}" erstellen`,
        reloadAppButton: "Neu laden",
        fileVersionLabel: "Version",
        searchLabel: "Suche",
        searchSuggestionsLabel: "Vorherige Suchen",
        waitingLabel: "Warten...",
        restoreConnection: "Verbindung wiederherstellen",
        noPageSelected: "Keine Seite ausgew\xE4hlt"
      },
      regional: {
        weekdays: {
          full: [
            "Sonntag",
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag",
            "Freitag",
            "Samstag"
          ],
          abbreviated: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
        }
      },
      homePage: {
        appName: "Coordination Tool",
        overviewHeadline: "\xDCbersicht",
        serverAddress: "Serveradresse",
        serverAddressPlaceholder: "wss://192.168.0.69:3000",
        connectAudioLabel: "mit Server verbinden",
        disconnectAudioLabel: "vom Server trennen",
        manageConnectionsAudioLabel: "Verbindungen verwalten",
        settingsButton: "Einstellungen",
        manageStorageButton: "Daten verwalten",
        transferDataButton: "Daten \xFCbertragen",
        updateButton: (version) => `Aktualisieren: ${version}`,
        scrollToChatButton: "Chats",
        backToOverviewAudioLabel: "zur\xFCck zur \xFCbersicht",
        chatsHeadline: "Chats",
        addChatAudioLabel: "Name des neuen Chats",
        addChatPlaceholder: "Chat hinzuf\xFCgen",
        addChatButton: "Chat hinzuf\xFCgen"
      },
      settings: {
        pages: {
          appearance: "Erscheinungsbild",
          account: "Konto",
          regional: "Sprache & Region",
          info: "\xDCber CT"
        },
        themes: {
          dynamic: "Dynamisch",
          dark: "Dunkel",
          light: "Hell",
          system: "Ger\xE4teeinstellung",
          black: "Schwarz"
        },
        account: {
          yourNameLabel: "Dein Name",
          yourNamePlaceholder: "Max Mustermann",
          setNameButtonAudioLabel: "Namen festlegen"
        },
        regional: {
          language: "Sprache",
          firstDayOfWeekLabel: "Erster Wochentag"
        },
        about: {
          version: "Version",
          checkUpdatesButton: "Nach Updates suchen"
        }
      },
      onboarding: {
        connectionHeadline: "Mit UDN verbinden",
        connectionDescription: "Um Daten und Nachichten zu verschicken, verbinde dich mit dem Universellen Dezentralen Netzwerk (UDN).",
        connectButton: "Verbinden",
        connectionNextButton: (isConnected) => isConnected ? "Weiter" : "Ohne UDN einrichten",
        ///
        transferOptionsHeadline: "Deine Daten kopieren",
        transferOptionsDescription: "Wenn du Coordination Tool bereits auf einem anderen Ger\xE4t verwendest, kopiere deine Kontodaten. Du kannst beide Ger\xE4te gleichzeitig verwenden.",
        transferOptionTransfer: "Daten \xFCbertragen",
        transferOptionNew: "Als neues Ger\xE4t enrichten",
        //
        nameHeadline: "Dein Name",
        nameDescription: "Diesen Namen sehen andere, wenn du Nachrichten versendest. Du kannst deinen Namen jederzeit in den Einstellungen \xE4ndern.",
        //
        transferHeadline: "Daten\xFCbertragung",
        transferDescription: "Verwende die Funktion zur Daten\xFCbertragung auf deinem anderen Get\xE4t, um deine Identit\xE4t und pers\xF6nlichen Daten zu kopieren. Gib die dazu angezeigten Daten unten ein. Du findest die Daten\xFCbertragung auf der Startseite des anderen Ger\xE4ts.",
        transferButton: "Daten kopieren"
      },
      connectionModal: {
        connectionModalHeadline: "Verbindungen verwalten",
        connectButtonAudioLabel: "verbinden"
      },
      dataTransferModal: {
        transferDataHeadline: "Daten\xFCbertragung",
        sendHeadline: "An anderes Ger\xE4t senden",
        receiveHeadline: "An dieses Ger\xE4t senden",
        exportHeadline: "Daten exportieren",
        importHeadline: "Daten importieren",
        selectionDescription: "W\xE4hle die Daten aus, die du \xFCbertragen m\xF6chtest.",
        exportSelectionDescription: "W\xE4hle die Daten aus, die du exportieren m\xF6chtest.",
        dataEntryDescription: "Gib diese Informationen auf dem anderen Ger\xE4t ein.",
        dataEntryInputDescription: "Gib die auf dem anderen Ger\xE4t angezeigten Informationen ein.",
        fromThisDeviceButton: "An anderes Ger\xE4t senden",
        toThisDeviceButton: "An dieses Ger\xE4t senden",
        exportButton: "Als Datei exportieren",
        importButton: "Aus Datei importieren",
        generalHeadline: "Allgemein",
        connectionData: "Verbindungsdaten",
        settingsData: "Identit\xE4t und pers\xF6nliche Daten",
        chatsHeadline: "Chats",
        transferChannelHeadline: "\xDCbertragungskanal",
        transferKeyHeadline: "Schl\xFCssel",
        sendButton: "Senden",
        sendAgainButton: "Erneut senden",
        filesSentCount: (count) => `Dateien gesendet: ${count}.`,
        allFilesSent: "Fertig.",
        filesReceivedCount: (count) => `Dateien empfangen: ${count}.`,
        exportKey: "Schl\xFCssel",
        exportKeyConfirmation: "Schl\xFCssel best\xE4tigen",
        downloadFileButton: "Herunterladen",
        importFileButton: "Importieren",
        decryptImportButton: "Entschl\xFCsseln",
        incorrectPassphraseError: "Der Schl\xFCssel ist nicht korrekt"
      },
      storage: {
        noItemSelected: "Kein Element ausgew\xE4hlt",
        notAFile: "(keine Datei)",
        contentEmpty: "(leer)",
        usageLabel: "Speicher",
        usageVauleLabel: (used, max) => `${used} von ${max} MB belegt`,
        path: "Pfad",
        content: "Inhalt",
        deleteItem: "Element l\xF6schen",
        removeJunkButton: "Datenm\xFCll l\xF6schen"
      },
      chatPage: {
        closeChatAudioLabe: "Chat schlie\xDFen",
        chatSettingsAudioLabel: "Chateinstellungen",
        pages: {
          settings: "Einstellungen",
          messages: "Nachrichten",
          tasks: "Aufgaben",
          calendar: "Kalender"
        },
        settings: {
          settingsHeadline: "Einstellungen",
          nameLabel: "Name",
          setNameButtonAudioLabel: "namen festlegen",
          newSecondaryChannelPlaceholder: "Sekund\xE4ren Kanal hinzuf\xFCgen",
          newSecondaryChannelAudioLabel: "Name des neuen sekund\xE4ren Kanals",
          addSecondaryChannelButtonAudioLabel: "Sekund\xE4ren Kanal hinzuf\xFCgen",
          encryptionKeyLabel: "Schl\xFCssel",
          setEncryptionKeyButtonAudioLabel: "Schl\xFCssel festlegen",
          showEncryptionKey: "Schl\xFCssel anzeigen",
          setColorButtonAudioLabel: "Farbe festlegen",
          deleteChatButton: "Gesamten Chat l\xF6schen"
        },
        message: {
          messagesHeadline: "Nachrichten",
          messageFilterHeadline: "Nachrichten filtern",
          messageFilterReactionsHadline: "Reaktionen",
          messageFilterAllReactionsButton: "Alle anzeigen",
          composerInputPlaceholder: "Schreib eine Nachricht...",
          sendMessageButtonAudioLabel: "nachricht senden",
          filterMessagesButtonAudioLabel: "nachrichten filtern",
          showMessageInfoButtonAudioLabel: "nachrichteninfo anzeigen",
          messageInfoHeadline: "Nachrichteninfo",
          cancelReplyAudioLabel: "antwort abbrechen",
          sentBy: "Gesendet von",
          timeSent: "Sendezeit",
          channel: "Kanal",
          messageContent: "Nachrichteninhalt",
          copyMessageButton: "Nachricht kopieren",
          resendMessageButton: "Nachricht erneut senden",
          decryptMessageButton: "Nachricht entschl\xFCsseln",
          replyToMessageButton: "Auf Nachricht antworten",
          deleteMessageButton: "Nachricht l\xF6schen",
          //
          thumbsUpReaction: "Reaktion: Daumen hoch",
          checkReaction: "Reaktion: Haken",
          stopReaction: "Reaktion: Stopp",
          attentionReaction: "Reaktion: Ausrufezeichen",
          doubleAttentionReaction: "Reaktion: doppeltes Ausrufezeichen",
          questionReaction: "Reaktion: Fragezeichen",
          replyPrefixLabel: "Antworten: ",
          replyHeaderLabel: (message) => `Antworten an "${message}"`
        },
        task: {
          noBoardSelected: "Kein Board ausgew\xE4hlt",
          boardNotFound: "Board nicht gefunden",
          closeBoardButtonAudioLabel: "board schlie\xDFen",
          toggleBoardButtonAudioLabel: "board-liste ein/ausblenden",
          showBoardSettingsButtonAudioLabel: "Board-Einstellungen anzeigen",
          listViewButtonAudioLabel: "Listenansicht",
          kanbanViewButtonAudioLabel: "Kanban-Ansicht",
          statusViewButtonAudioLabel: "Statusrasteransicht",
          filterTasksButtonAudioLabel: "Aufgaben filtern",
          createTaskButtonAudioLabel: "Neue Aufgabe erstellen",
          boardSettingsHeadline: "Board-Einstellungen",
          boardNameInputLabel: "Boardname",
          deleteBoardButton: "Board und alle Aufgaben l\xF6schen",
          taskSettingsHeadline: "Aufgabe bearbeiten",
          taskNameLabel: "Titel",
          taskBoardLabel: "Board",
          taskCategoryLabel: "Kategorie",
          taskStatusLabel: "Status",
          taskPriorityLabel: "Priorit\xE4t",
          taskDescriptionLabel: "Beschreibung",
          taskDateLabel: "Datum",
          taskTimeLabel: "Uhrzeit",
          deleteTaskButton: "Aufgabe l\xF6schen",
          filterTasksHeadline: "Aufgaben filtern",
          renameCategoryInputPlaceholder: "Kategorie umbenennen",
          renameStatusInputPlaceholder: "Status umbenennen"
        },
        calendar: {
          eventsBoard: "Ereignisse",
          ///
          todayButtonAudioLabel: "gehe zu heute",
          previousMonthButtonAudioLabel: "vorheriger monat",
          nextMonthButtonAudioLabel: "n\xE4chster monat",
          yearInputAudioLabel: "Jahr",
          monthInputAudioLabel: "Monat",
          yearInputPlaceholder: "2000",
          monthInputPlaceholder: "01",
          searchEventsHeadline: "Ereignisse suchen",
          events: "Ereignisse",
          noEvents: "Keine Ereignisse",
          eventNext: "Als n\xE4chstes"
        }
      }
    },
    es: {
      updater: {
        migrated: "Migrado"
      },
      general: {
        deleteItemButtonAudioLabel: "eliminar elemento",
        searchButtonAudioLabel: "buscar",
        searchButtonClearAudioLabel: "borrar b\xFCsqueda",
        abortButton: "Abortar",
        applyButton: "Guardar",
        backButton: "Atr\xE1s",
        cancelButton: "Cancelar",
        continueButton: "Continuar",
        confirmButton: "Confirmar",
        closeButton: "Cerrar",
        deleteButton: "Borrar",
        exitButton: "Salir",
        fullscreenButton: "Pantalla completa",
        refreshButton: "Actualizar",
        saveButton: "Guardar",
        setButton: "OK",
        filterOrCreateLabel: "Buscar o crear",
        createLabel: (query) => `Crear "${query}"`,
        reloadAppButton: "Recargar app",
        fileVersionLabel: "Versi\xF3n",
        searchLabel: "Buscar",
        searchSuggestionsLabel: "B\xFAsquedas anteriores",
        waitingLabel: "Esperando...",
        restoreConnection: "Conectar de nuevo",
        noPageSelected: "No p\xE1gina seleccionada"
      },
      regional: {
        weekdays: {
          full: [
            "Domingo",
            "Lunes",
            "Martes",
            "Mi\xE9rcoles",
            "Jueves",
            "Viernes",
            "S\xE1bado"
          ],
          abbreviated: ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"]
        }
      },
      homePage: {
        appName: "Coordination Tool",
        overviewHeadline: "Resumen",
        serverAddress: "Direcci\xF3n del servidor",
        serverAddressPlaceholder: "wss://192.168.0.69:3000",
        connectAudioLabel: "conectar al servidor",
        disconnectAudioLabel: "desconectar del servidor",
        manageConnectionsAudioLabel: "gestionar conexiones",
        settingsButton: "Ajustes",
        manageStorageButton: "Gestionar almacenamiento",
        transferDataButton: "Enviar o exportar archivos",
        updateButton: (version) => `Actualizar a ${version}`,
        scrollToChatButton: "Chats",
        backToOverviewAudioLabel: "volver al resumen",
        chatsHeadline: "Chats",
        addChatAudioLabel: "nombre del nuevo chat",
        addChatPlaceholder: "A\xF1adir chat",
        addChatButton: "A\xF1adir chat"
      },
      settings: {
        pages: {
          appearance: "Aspecto",
          account: "Cuenta",
          regional: "Idioma y Regi\xF3n",
          info: "Sobre CT"
        },
        themes: {
          dynamic: "Din\xE1mico",
          dark: "Oscuro",
          light: "Claro",
          system: "Seg\xFAn dispositivo",
          black: "Negro"
        },
        account: {
          yourNameLabel: "Tu nombre",
          yourNamePlaceholder: "Juan P\xE9rez",
          setNameButtonAudioLabel: "establecer nombre"
        },
        regional: {
          language: "Idioma",
          firstDayOfWeekLabel: "Primer d\xEDa de la semana"
        },
        about: {
          version: "Versi\xF3n",
          checkUpdatesButton: "Buscar actualisaciones"
        }
      },
      onboarding: {
        connectionHeadline: "Conectar al UDN",
        connectionDescription: "Para transferir datos y enviar mensajes, con\xE9ctate a la Red Descentralizada Universal (UDN).",
        connectButton: "Conectar",
        connectionNextButton: (isConnected) => isConnected ? "Continuar" : "Configurar sin UDN",
        ///
        transferOptionsHeadline: "Copiar tus datos",
        transferOptionsDescription: "Si ya usas el Coordination Tool en otro disposistivo, copia tu idantidad aqu\xED. Puedes usar ambos dispositivos al mismo tiempo.",
        transferOptionTransfer: "Copiar mis datos aqu\xED",
        transferOptionNew: "Configurar como dispositivo nuevo",
        //
        nameHeadline: "Tu nombre",
        nameDescription: "Esto es lo que ven otros cuando env\xEDas menajes. Siempre lo puedes cambiar en las ajustes.",
        //
        transferHeadline: "Transferencia de datos",
        transferDescription: "En el otro dispositivo, prepara la transferencia de tu identidad y datos personales. Ingresa los datos que se muestran a continuaci\xF3n. La opci\xF3n de la transferencia de datos se encuentra en la pantalla inicial en el otro dispositivo.",
        transferButton: "Copiar datos"
      },
      connectionModal: {
        connectionModalHeadline: "Gestionar Conexiones",
        connectButtonAudioLabel: "conectar"
      },
      dataTransferModal: {
        transferDataHeadline: "Transferencia de datos",
        sendHeadline: "Enviar a otro dispositivo",
        receiveHeadline: "Enviar a este dispositivo",
        exportHeadline: "Exportar archivo",
        importHeadline: "Importar archivo",
        selectionDescription: "Selecciona los datos que quieres transferir.",
        exportSelectionDescription: "Selecciona los datos que quieres exportar.",
        dataEntryDescription: "Introduce estos datos en el otro dispositivo.",
        dataEntryInputDescription: "Introduce los datos mostrados en el otro dispositivo.",
        fromThisDeviceButton: "Enviar a otro dispositivo",
        toThisDeviceButton: "Enviar a este dispositivo",
        exportButton: "Exportar archivo",
        importButton: "Importar archivo",
        generalHeadline: "General",
        connectionData: "Datos de conexi\xF3n",
        settingsData: "Identidad y datos personales",
        chatsHeadline: "Chats",
        transferChannelHeadline: "Canal de Transferencia",
        transferKeyHeadline: "Clave de encriptaci\xF3n de transferencia",
        sendButton: "Enviar",
        sendAgainButton: "Enviar otra vez",
        filesSentCount: (count) => `Archivos enviados: ${count}.`,
        allFilesSent: "Hecho.",
        filesReceivedCount: (count) => `Archivos recibidos: ${count}.`,
        exportKey: "Clave de encriptaci\xF3n",
        exportKeyConfirmation: "Confirmar clave",
        downloadFileButton: "Descargar",
        importFileButton: "Importar",
        decryptImportButton: "Descifrar",
        incorrectPassphraseError: "La clave no es correcta"
      },
      storage: {
        noItemSelected: "Ning\xFAn elemento seleccionado",
        notAFile: "(no es un archivo)",
        contentEmpty: "(vac\xEDo)",
        usageLabel: "Almacenamiento",
        usageVauleLabel: (used, max) => `${used} de ${max} MB en uso`,
        path: "Ruta",
        content: "Contenido",
        deleteItem: "Eliminar elemento",
        removeJunkButton: "Eliminar archivos basura"
      },
      chatPage: {
        closeChatAudioLabe: "cerrar chat",
        chatSettingsAudioLabel: "configuraci\xF3n del chat",
        pages: {
          settings: "Configuraci\xF3n",
          messages: "Mensajes",
          tasks: "Tareas",
          calendar: "Calendario"
        },
        settings: {
          settingsHeadline: "Configuraci\xF3n",
          nameLabel: "Nombre del chat",
          setNameButtonAudioLabel: "establecer nombre",
          newSecondaryChannelPlaceholder: "A\xF1adir canal secundario",
          newSecondaryChannelAudioLabel: "nombre del nuevo canal secundario",
          addSecondaryChannelButtonAudioLabel: "a\xF1adir canal secundario",
          encryptionKeyLabel: "Clave de encriptaci\xF3n",
          setEncryptionKeyButtonAudioLabel: "establecer clave de encriptaci\xF3n",
          showEncryptionKey: "Mostrar clave de encriptaci\xF3n",
          setColorButtonAudioLabel: "establecer color",
          deleteChatButton: "Eliminar todo el chat"
        },
        message: {
          messagesHeadline: "Mensajes",
          messageFilterHeadline: "Filtrar mensajes",
          messageFilterReactionsHadline: "Reacciones",
          messageFilterAllReactionsButton: "Mostrar todas",
          composerInputPlaceholder: "Escribe un mensaje...",
          sendMessageButtonAudioLabel: "enviar mensaje",
          filterMessagesButtonAudioLabel: "filtrar mensajes",
          showMessageInfoButtonAudioLabel: "mostrar informaci\xF3n del mensaje",
          messageInfoHeadline: "Informaci\xF3n del Mensaje",
          cancelReplyAudioLabel: "abortar la respuesta",
          sentBy: "Enviado por",
          timeSent: "Hora de env\xEDo",
          channel: "Canal",
          messageContent: "Contenido del mensaje",
          copyMessageButton: "Copiar mensaje",
          resendMessageButton: "Reenviar mensaje",
          decryptMessageButton: "Desencriptar mensaje",
          replyToMessageButton: "Responder al mensaje",
          deleteMessageButton: "Eliminar mensaje",
          //
          thumbsUpReaction: "Reacci\xF3n: pulgar hacia arriba",
          checkReaction: "Reacci\xF3n: marca de verificaci\xF3n",
          stopReaction: "Reacci\xF3n: signo de parada",
          attentionReaction: "Reaccion: signo de atenci\xF3n",
          doubleAttentionReaction: "Reaccion: signo de atenci\xF3n doble",
          questionReaction: "Reaccion: signo de interrogaci\xF3n",
          replyPrefixLabel: "Respuestas: ",
          replyHeaderLabel: (message) => `Respuestas a "${message}"`
        },
        task: {
          noBoardSelected: "Ning\xFAn tablero seleccionado",
          boardNotFound: "Tablero no encontrado",
          closeBoardButtonAudioLabel: "cerrar tablero",
          toggleBoardButtonAudioLabel: "mostrar o ocultar lista de tableros",
          showBoardSettingsButtonAudioLabel: "mostrar configuraci\xF3n del tablero",
          listViewButtonAudioLabel: "vista de lista",
          kanbanViewButtonAudioLabel: "vista kanban",
          statusViewButtonAudioLabel: "vista de cuadr\xEDcula de estado",
          filterTasksButtonAudioLabel: "filtrar tareas",
          createTaskButtonAudioLabel: "crear nueva tarea",
          boardSettingsHeadline: "Configuraci\xF3n del Tablero",
          boardNameInputLabel: "Nombre del tablero",
          deleteBoardButton: "Eliminar tablero y todas las tareas",
          taskSettingsHeadline: "Editar Tarea",
          taskNameLabel: "T\xEDtulo",
          taskBoardLabel: "Tablero",
          taskCategoryLabel: "Categor\xEDa",
          taskStatusLabel: "Estado",
          taskPriorityLabel: "Prioridad",
          taskDescriptionLabel: "Descripci\xF3n",
          taskDateLabel: "Fecha",
          taskTimeLabel: "Hora",
          deleteTaskButton: "Eliminar tarea",
          filterTasksHeadline: "Filtrar Tareas",
          renameCategoryInputPlaceholder: "Renombrar categor\xEDa",
          renameStatusInputPlaceholder: "Renombrar estado"
        },
        calendar: {
          eventsBoard: "Eventos",
          ///
          todayButtonAudioLabel: "ir a hoy",
          previousMonthButtonAudioLabel: "mes anterior",
          nextMonthButtonAudioLabel: "mes siguiente",
          yearInputAudioLabel: "a\xF1o",
          monthInputAudioLabel: "mes",
          yearInputPlaceholder: "2000",
          monthInputPlaceholder: "01",
          searchEventsHeadline: "Buscar Eventos",
          events: "Eventos",
          noEvents: "No hay eventos",
          eventNext: "A continuaci\xF3n"
        }
      }
    }
  };
  var languageNames = {
    en: "English",
    de: "Deutsch",
    es: "Espa\xF1ol"
  };

  // src/Model/Utility/typeSafety.ts
  function checkIsValidObject(object) {
    return object.dataVersion == DATA_VERSION;
  }
  function checkMatchesObjectStructure(objectToCheck, reference) {
    if (typeof reference != "object") {
      return typeof objectToCheck == typeof reference;
    }
    for (const key of Object.keys(reference)) {
      const requiredType = typeof reference[key];
      const actualType = typeof objectToCheck[key];
      if (requiredType != actualType) return false;
      if (Array.isArray(reference[key]) || reference[key] instanceof Set) {
        if (objectToCheck[key].length == 0) continue;
        if (objectToCheck[key].size == 0) continue;
        const [firstOfObjectToCheck] = objectToCheck[key];
        const [fisrtOfReference] = reference[key];
        const doesFirstItemMatch = checkMatchesObjectStructure(
          firstOfObjectToCheck,
          fisrtOfReference
        );
        if (doesFirstItemMatch == false) return false;
      } else if (requiredType == "object") {
        const doesNestedObjectMatch = checkMatchesObjectStructure(
          objectToCheck[key],
          reference[key]
        );
        if (doesNestedObjectMatch == false) return false;
      }
    }
    return true;
  }
  var DATA_VERSION = "2610";

  // src/Model/Utility/utility.ts
  function generateRandomToken(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const string = array.join("");
    return string.substring(0, length);
  }
  function createTimestamp() {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  function isoToDateString(dateISOString) {
    const [year, month, date] = dateISOString.split("-");
    const paddedDate = padZero(date ?? "", 2);
    return paddedDate;
  }
  function isoToMonthString(dateISOString) {
    const [year, month, _] = dateISOString.split("-");
    return formatMonthStringFromParts(year, month);
  }
  function formatISO(date) {
    return formatISOFromParts(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
  }
  function formatISOFromParts(year, month, date) {
    return [year, month, date].map((x, i) => i == 0 ? x : padZero(x.toString(), 2)).join("-");
  }
  function formatMonthStringFromParts(year = "", month = "") {
    const paddedYear = padZero(year, 4);
    const paddedMonth = padZero(month, 2);
    return `${paddedYear}-${paddedMonth}`;
  }
  function formatTime(date) {
    return [date.getHours(), date.getMinutes()].map((x) => padZero(x.toString(), 2)).join(":");
  }
  function checkDoesObjectMatchSearch(query, getStringsOfObject, object) {
    if (query == "") return true;
    const stringsInObject = getStringsOfObject(object);
    const wordsInObject = [];
    for (const string of stringsInObject) {
      const lowercaseWordsInString = string.toString().toLowerCase().split(" ").filter((word) => word != "");
      wordsInObject.push(...lowercaseWordsInString);
    }
    const lowercaseWordsInQuery = query.toLowerCase().split(" ").filter((word) => word != "");
    for (const queryWord of lowercaseWordsInQuery) {
      if (queryWord[0] == "-") {
        const wordContent = queryWord.substring(1);
        if (wordsInObject.includes(wordContent)) {
          return false;
        }
      } else {
        if (wordsInObject.includes(queryWord) == false) {
          return false;
        }
      }
    }
    return true;
  }
  function implementFilter(allItems, matches, query, itemToString) {
    function update() {
      matches.clear();
      allItems.value.forEach((item) => {
        if (!itemToString(item).toLowerCase().includes(query.value.toLowerCase()))
          return;
        matches.add(item);
        allItems.handleRemoval(item, () => {
          matches.remove(item);
        });
      });
    }
    query.subscribe(update);
    allItems.handleAddition(update);
  }
  var HandlerManager = class {
    constructor() {
      this.handlers = /* @__PURE__ */ new Map();
      // manage
      this.setHandler = (id, handler) => {
        this.handlers.set(id, handler);
      };
      this.deleteHandler = (id) => {
        this.handlers.delete(id);
      };
      // trigger
      this.trigger = (item) => {
        [...this.handlers.values()].forEach((handler) => handler(item));
      };
    }
  };
  var IndexManager = class {
    // init
    constructor(itemToString) {
      this.sortedStrings = [];
      // methods
      this.update = (items) => {
        this.sortedStrings = [];
        let strings = [];
        for (const item of items) {
          const string = this.itemToString(item);
          strings.push(string);
        }
        this.sortedStrings = strings.sort(localeCompare);
      };
      this.getIndex = (item) => {
        const string = this.itemToString(item);
        const index = this.sortedStrings.indexOf(string);
        return index;
      };
      this.itemToString = itemToString;
    }
  };
  function bytesToMB(bytes) {
    return bytes / (1024 * 1024);
  }
  function stringify(data) {
    return JSON.stringify(data, null, 4);
  }
  function padZero(string, length) {
    return (string ?? "").padStart(length, "0");
  }
  function parse(string) {
    try {
      return JSON.parse(string);
    } catch {
      return {};
    }
  }
  function parseValidObject(string, reference) {
    const parsed = parse(string);
    if (checkIsValidObject(parsed) == false) return null;
    const doesMatchReference = checkMatchesObjectStructure(
      parsed,
      reference
    );
    if (doesMatchReference == false) return null;
    return parsed;
  }
  function localeCompare(a, b) {
    return a.localeCompare(b);
  }
  function implementPinchZoom(canvas, data) {
    let pinching = false;
    let dragging = false;
    let lastElement = void 0;
    let initialDistance, initialZoom, initialX, initialY, initialTouchX, initialTouchY;
    function reset() {
      initialDistance = 0;
      initialZoom = 1;
      initialX = 0;
      initialY = 0;
      initialTouchX = 0;
      initialTouchY = 0;
    }
    reset();
    const MIN = 0.25;
    const MAX = 5;
    const element = () => canvas.querySelector(".zoom");
    const distance = (e) => Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
    const point = (e, direction, i) => e.touches[i][direction == "x" ? "clientX" : "clientY"];
    const midpoint = (e, direction) => (point(e, direction, 0) + point(e, direction, 1)) / 2;
    function apply(zoom, _offset) {
      if (zoom < MIN) return apply(MIN, _offset);
      if (zoom > MAX) return apply(5, _offset);
      let { x, y } = data.value;
      if (_offset) [x, y] = _offset;
      data.value = {
        zoom,
        x,
        y
      };
    }
    data.subscribe((data2) => {
      const el = element();
      if (!el) return;
      el.style.transform = `scale(${data2.zoom.toString()}) translate(${data2.x}px, ${data2.y}px)`;
    });
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      initialZoom = data.value.zoom;
      initialX = data.value.x;
      initialY = data.value.y;
      apply(data.value.zoom - event.deltaY * 5e-3);
    });
    canvas.addEventListener("scroll", (event) => {
      event.preventDefault();
    });
    canvas.addEventListener("mousedown", (event) => {
      const target = event.target;
      console.log(target);
      if (!target || !target.classList.contains("allow-drag-move")) return;
      event.preventDefault();
      initialZoom = data.value.zoom;
      initialX = data.value.x;
      initialY = data.value.y;
      initialTouchX = event.clientX;
      initialTouchY = event.clientY;
      dragging = true;
    });
    canvas.addEventListener("mouseup", () => {
      dragging = false;
    });
    canvas.addEventListener("mousemove", (event) => {
      if (!dragging) return;
      event.preventDefault();
      apply(data.value.zoom, [
        initialX + (event.clientX - initialTouchX) / initialZoom,
        initialY + (event.clientY - initialTouchY) / initialZoom
      ]);
    });
    canvas.addEventListener("touchstart", (event) => {
      document.activeElement?.blur();
      const el = element();
      if (!el) return;
      if (lastElement != void 0 && lastElement != el) reset();
      lastElement = el;
      initialZoom = data.value.zoom;
      initialX = data.value.x;
      initialY = data.value.y;
      if (event.touches.length != 2) {
        pinching = false;
        initialTouchX = event.touches[0].clientX;
        initialTouchY = event.touches[0].clientY;
        return;
      }
      pinching = true;
      initialDistance = distance(event);
      initialTouchX = midpoint(event, "x");
      initialTouchY = midpoint(event, "y");
    });
    canvas.addEventListener("touchmove", (event) => {
      if (!pinching) {
        apply(data.value.zoom, [
          initialX + (event.touches[0].clientX - initialTouchX) / initialZoom,
          initialY + (event.touches[0].clientY - initialTouchY) / initialZoom
        ]);
        return;
      }
      if (event.touches.length < 2) return;
      event.preventDefault();
      const currentDistance = distance(event);
      const midX = midpoint(event, "x");
      const midY = midpoint(event, "y");
      const ratio = currentDistance / initialDistance;
      const difference = currentDistance - initialDistance;
      apply(initialZoom * ratio, [
        initialX + (midX - difference - initialTouchX) / initialZoom / 2,
        initialY + (midY - difference - initialTouchY) / initialZoom / 2
      ]);
    });
  }
  function collectObjectValuesForKey(key, converter, objects) {
    const values = /* @__PURE__ */ new Set();
    for (const object of objects) {
      const stringEntryObject = converter(object);
      const stringEntryObjectValue = stringEntryObject[key];
      if (stringEntryObjectValue == void 0) continue;
      values.add(stringEntryObjectValue.toString());
    }
    return [...values.values()];
  }
  function checkDoesObjectMatchReference(reference, stringEntryObject, explicitEmptyValue = false) {
    reference_entry_loop: for (const referenceEntry of Object.entries(
      reference
    )) {
      const [referenceKey, referenceValue] = referenceEntry;
      const stringEntryObjectValue = stringEntryObject[referenceKey];
      if (referenceValue == void 0) return false;
      if (referenceValue[0] == "-") {
        const strippedReferenceValue = referenceValue.toString().substring(1);
        if (strippedReferenceValue == "" && stringEntryObjectValue != void 0 && stringEntryObjectValue != "") {
          return false;
        }
        if (stringEntryObjectValue == strippedReferenceValue) {
          return false;
        }
      } else {
        if (explicitEmptyValue == false) {
          if (referenceValue == "" && (stringEntryObjectValue == void 0 || stringEntryObjectValue == "")) {
            return false;
          } else if (referenceValue == "") {
            continue reference_entry_loop;
          }
        }
        if (stringEntryObjectValue != referenceValue) {
          return false;
        }
      }
    }
    return true;
  }

  // src/ViewModel/Global/coreViewModel.ts
  var CoreViewModel = class _CoreViewModel {
    // init
    constructor(storageModel2, settingsModel2, connectionModel2, chatListModel2, fileTransferModel2) {
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.connectionModel = connectionModel2;
      this.chatListModel = chatListModel2;
      this.fileTransferModel = fileTransferModel2;
      this.swRegistration = void 0;
      this.version = new State("");
      this.latestVersion = new State("");
      this.noUpdateAvailable = createProxyState(
        [this.latestVersion],
        () => {
          return this.latestVersion.value == "" || this.latestVersion.value == this.version.value;
        }
      );
      this.updateText = new State("");
      // CONTEXT
      this.contextStack = /* @__PURE__ */ new Map();
      this.closeContext = (contextId, fromHistoryEvent = false) => {
        if (!this.contexts.map((context) => context.contextId).includes(contextId))
          return;
        while (this.contexts.length > 0) {
          const currentContext = this.context;
          if (!currentContext) return;
          currentContext.handleContextClose(fromHistoryEvent);
          this.contextStack.delete(currentContext.contextId);
          if (currentContext.contextId == contextId) break;
        }
      };
      this.handleKeyDown = (e) => {
        if (!(e instanceof KeyboardEvent))
          return console.trace("NOT A KEY EVENT");
        if (_CoreViewModel.checkIsKeystroke(e) == false) return;
        e.preventDefault();
        const contexts = this.contexts;
        while (contexts.length > 0) {
          const currentContext = contexts.pop();
          if (!currentContext) return;
          const isHandled = currentContext.handleKeystroke(e);
          if (isHandled == true) break;
        }
      };
      // CHRON
      this.chronHandlerManager = new HandlerManager();
      this.todayDate = new State(/* @__PURE__ */ new Date());
      this.time = new State("99:99");
      this.startChron = () => {
        setInterval(this.chronHandlerManager.trigger, 1e3);
      };
      this.handleChron = () => {
        const newDate = /* @__PURE__ */ new Date();
        if (this.unwrappedTodayDate.toDateString() != newDate.toDateString())
          this.todayDate.value = /* @__PURE__ */ new Date();
        if (formatTime(newDate) != this.time.value)
          this.time.value = formatTime(newDate);
      };
      // DRAG & DROP
      this.draggedObject = new State(void 0);
      // OFFLINE MODE & UPDATE
      this.configureServiceWorker = async () => {
        if ("serviceWorker" in navigator) {
          try {
            this.swRegistration = await navigator.serviceWorker.register(
              "sw.js",
              {
                scope: "/"
              }
            );
            if (this.swRegistration.active) {
              console.log("Service worker active");
            }
          } catch (error) {
            console.error(`Could not install service worker: ${error}`);
          }
        }
      };
      this.checkUpdates = () => {
        fetch("/version").then(async (response) => {
          this.version.value = await response.text();
        });
        fetch("/latestVersion").then(async (response) => {
          this.latestVersion.value = (await response.text()).replace(
            "\n",
            ""
          );
        });
      };
      this.update = async () => {
        if (!this.swRegistration) return;
        await this.swRegistration.update();
        setTimeout(() => {
          window.location.reload();
        }, 500);
      };
      this.translations = allTranslations[settingsModel2.language] || allTranslations.en;
      this.latestVersion.subscribe((latestVersion) => {
        this.updateText.value = this.translations.homePage.updateButton(latestVersion);
      });
      document.body.addEventListener("keydown", this.handleKeyDown);
      window.onpopstate = () => {
        if (!this.context) return;
        this.closeContext(this.context.contextId, true);
      };
      this.configureServiceWorker();
      this.checkUpdates();
      this.startChron();
      this.chronHandlerManager.setHandler(
        "core-view-model",
        this.handleChron
      );
    }
    get contexts() {
      return [...this.contextStack.values()];
    }
    get context() {
      return this.contexts.pop();
    }
    set context(context) {
      if (this.contextStack.has(context.contextId)) return;
      this.contextStack.set(context.contextId, context);
      history.pushState({ id: context.contextId }, "");
    }
    get unwrappedTodayDate() {
      return new Date(this.todayDate.value);
    }
    // util
    static checkIsKeystroke(e) {
      return (e.metaKey || e.altKey) && e.ctrlKey;
    }
  };
  var Context = class {
    constructor(contextDebugDescription) {
      this.contextDebugDescription = contextDebugDescription;
      this.contextId = v4_default();
      this.keystrokes = /* @__PURE__ */ new Map();
      this.handleKeystroke = (e) => {
        const fn = this.keystrokes.get(
          e.key.toLowerCase()
        );
        if (!fn) return false;
        fn();
        return true;
      };
      this.close = () => {
      };
      this.handleContextClose = (fromHistoryEvent) => {
      };
      this.registerKeyStroke = (key, fn) => {
        this.keystrokes.set(key, fn);
      };
    }
  };
  var ContextHost = class extends Context {
    constructor(contextDebugDescription, coreViewModel2) {
      super(contextDebugDescription);
      this.coreViewModel = coreViewModel2;
      this.contexts = /* @__PURE__ */ new Map();
      this.currentContext = new State(void 0);
      this.registerContext = (key, context) => {
        this.contexts.set(key, context);
      };
      this.closeCurrentContext = () => {
        if (this.currentContext.value) {
          this.coreViewModel.closeContext(
            this.currentContext.value.contextId
          );
        }
        this.currentContext.value = void 0;
      };
      this.updateContexts = () => {
        if (this.isOpen == false) return;
        const selection = this.contextSelection;
        if (!selection) return;
        const selectedContext = this.contexts.get(selection);
        if (!selectedContext) return;
        if (selectedContext != this.currentContext.value) {
          this.closeCurrentContext();
        }
        this.coreViewModel.context = selectedContext;
        this.currentContext.value = selectedContext;
      };
    }
    get isOpen() {
      return false;
    }
    get contextSelection() {
      return void 0;
    }
  };

  // src/ViewModel/Pages/homeViewModel.ts
  var HomeViewModel = class extends Context {
    constructor(coreViewModel2, settingsViewModel2, fileTransferViewModel2, storageViewModel2, connectionViewModel2) {
      super("home");
      this.coreViewModel = coreViewModel2;
      this.settingsViewModel = settingsViewModel2;
      this.fileTransferViewModel = fileTransferViewModel2;
      this.storageViewModel = storageViewModel2;
      this.connectionViewModel = connectionViewModel2;
      this.coreViewModel.context = this;
      this.registerKeyStroke(
        "," /* Settings */,
        this.settingsViewModel.showSettingsModal
      );
      this.registerKeyStroke(
        "t",
        this.fileTransferViewModel.showDirectionSelectionModal
      );
      this.registerKeyStroke("e", this.storageViewModel.showStorageModal);
      this.registerKeyStroke("x", this.connectionViewModel.disconnect);
      this.registerKeyStroke("c", this.connectionViewModel.connect);
    }
  };

  // src/Model/Global/storageModel.ts
  var PATH_COMPONENT_SEPARATOR = "\\";
  var StorageModel = class _StorageModel {
    // init
    constructor() {
      this.storageEntryTree = {};
      // read
      this.read = (pathComponents) => {
        const pathString = _StorageModel.pathComponentsToString(
          ...pathComponents
        );
        return localStorage.getItem(pathString);
      };
      this.list = (pathComponents) => {
        let currentParent = this.storageEntryTree;
        for (const component of pathComponents) {
          const nextParent = currentParent[component];
          if (nextParent == void 0) return [];
          currentParent = nextParent;
        }
        return [...Object.keys(currentParent).sort(localeCompare)];
      };
      // write
      this.write = (pathComponents, value) => {
        const pathString = _StorageModel.pathComponentsToString(
          ...pathComponents
        );
        localStorage.setItem(pathString, value);
        this.updateTree(...pathComponents);
      };
      this.remove = (pathComponents, shouldInitialize = true) => {
        const pathString = _StorageModel.pathComponentsToString(
          ...pathComponents
        );
        localStorage.removeItem(pathString);
        if (shouldInitialize == true) {
          this.initializeTree();
        }
      };
      this.rename = (sourcePathComponents, destinationPathComponents, shouldInitialize = true) => {
        const content = this.read(sourcePathComponents);
        if (content == null) return false;
        this.write(destinationPathComponents, content);
        this.remove(sourcePathComponents);
        if (shouldInitialize == true) {
          this.initializeTree();
        }
        return true;
      };
      // recursion
      this.recurse = (rootDirectory, fn) => {
        loop_over_files: for (const key of Object.keys(localStorage)) {
          const pathComponentsOfCurrentEntity = _StorageModel.stringToPathComponents(key);
          loop_over_path_components: for (let i = 0; i < rootDirectory.length; i++) {
            if (!pathComponentsOfCurrentEntity[i]) continue loop_over_files;
            if (pathComponentsOfCurrentEntity[i] != rootDirectory[i])
              continue loop_over_files;
          }
          fn(pathComponentsOfCurrentEntity);
        }
        this.initializeTree();
      };
      this.removeRecursively = (pathComponents) => {
        this.recurse(
          pathComponents,
          (path) => this.remove(path, false)
        );
        this.initializeTree();
      };
      this.renameRecursively = (sourcePathComponents, destinationPathComponents) => {
        this.recurse(sourcePathComponents, (path) => {
          const relativePathOfCurrentEntity = path.slice(
            sourcePathComponents.length
          );
          const destinationPathComponentsOfCurrentEntity = [
            ...destinationPathComponents,
            ...relativePathOfCurrentEntity
          ];
          this.rename(path, destinationPathComponentsOfCurrentEntity, false);
        });
        this.initializeTree();
      };
      // stringifiable
      this.writeStringifiable = (pathComponents, value) => {
        const valueString = stringify(value);
        this.write(pathComponents, valueString);
      };
      this.readStringifiable = (pathComponents, reference) => {
        const valueString = this.read(pathComponents);
        if (!valueString) return null;
        const object = parseValidObject(valueString, reference);
        if (object == null) return null;
        return object;
      };
      // cleaning & usage
      this.removeJunk = () => {
        this.recurse([], (path) => {
          if (path[0] == DATA_VERSION) return;
          this.remove(path);
        });
      };
      this.determineCapacity = () => {
        const KEY = "storage-capacity-check";
        let chunk = "0";
        for (let i = 0; i < 1024 * 256; i++) {
          chunk += "0";
        }
        localStorage.setItem(KEY, "");
        while (true) {
          try {
            const current = localStorage.getItem(KEY);
            console.log(current);
            localStorage.setItem(KEY, current + chunk);
          } catch (e) {
            const capacity = this.calculateUsage();
            localStorage.removeItem(KEY);
            return capacity;
          }
        }
      };
      this.calculateUsage = () => {
        let data = JSON.stringify(localStorage);
        const encoder = new TextEncoder();
        const encoded = encoder.encode(data);
        const bytes = encoded.byteLength;
        const mb = bytesToMB(bytes);
        const rounded = Math.round(mb * 100) / 100;
        return rounded;
      };
      // tree
      this.initializeTree = () => {
        console.log("initializing tree");
        this.storageEntryTree = {};
        for (const key of Object.keys(localStorage)) {
          const components = _StorageModel.stringToPathComponents(key);
          this.updateTree(...components);
        }
      };
      this.updateTree = (...pathComponents) => {
        let currentParent = this.storageEntryTree;
        for (const pathPart of pathComponents) {
          if (!currentParent[pathPart]) {
            currentParent[pathPart] = {};
          }
          currentParent = currentParent[pathPart];
        }
      };
      this.printTree = () => {
        return stringify(this.storageEntryTree);
      };
      // upgrade
      this.upgrade = () => {
      };
      this.initializeTree();
      this.upgrade();
    }
    static {
      // utility
      this.getFileName = (pathComponents) => {
        return pathComponents[pathComponents.length - 1] || "\\";
      };
    }
    static {
      this.getFileNameFromString = (pathString) => {
        const pathComponents = this.stringToPathComponents(pathString);
        return pathComponents[pathComponents.length - 1] || "\\";
      };
    }
    static {
      this.pathComponentsToString = (...pathComponents) => {
        return pathComponents.filter((x) => x != "").join(PATH_COMPONENT_SEPARATOR);
      };
    }
    static {
      this.stringToPathComponents = (string) => {
        return string.split(PATH_COMPONENT_SEPARATOR).filter((x) => x != "");
      };
    }
    static {
      this.join = (...items) => {
        let allComponents = [];
        for (const item of items) {
          const parts = this.stringToPathComponents(item);
          allComponents.push(...parts);
        }
        return _StorageModel.pathComponentsToString(...allComponents);
      };
    }
    static getPath(locationName, filePath) {
      return [DATA_VERSION, locationName, ...filePath];
    }
  };
  var filePaths = {
    connectionModel: {
      socketAddress: ["socket-address"],
      reconnectAddress: ["reconnect-address"],
      outbox: ["outbox"],
      mailboxes: ["mailboxes"],
      previousAddresses: ["previous-addresses"]
    },
    chat: {
      base: [],
      chatBase: (id) => [id],
      info: (id) => [...filePaths.chat.chatBase(id), "info"],
      color: (id) => [...filePaths.chat.chatBase(id), "color"],
      messages: (id) => [...filePaths.chat.chatBase(id), "messages"],
      reactions: (id) => [
        ...filePaths.chat.chatBase(id),
        "reactions"
      ],
      previousFilter: (id) => [
        ...filePaths.chat.chatBase(id),
        "previous-filter"
      ],
      lastUsedPage: (id) => [
        ...filePaths.chat.chatBase(id),
        "last-used-page"
      ],
      files: (id) => [...filePaths.chat.chatBase(id), "files"]
    },
    notificationModel: {
      base: []
    },
    settingsModel: {
      username: ["user-name"],
      userid: ["user-id"],
      firstDayOfWeek: ["first-day-of-week"],
      language: ["language"],
      theme: ["theme"]
    }
  };

  // src/ViewModel/Global/storageViewModel.ts
  var StorageViewModel = class extends Context {
    // init
    constructor(coreViewModel2) {
      super("storage");
      this.coreViewModel = coreViewModel2;
      // state
      this.isShowingStorageModal = new State(false);
      this.selectedPath = new State(
        PATH_COMPONENT_SEPARATOR
      );
      this.didMakeChanges = new State(false);
      this.occupiedSpaceMB = new State(0);
      this.maximumSpaceMB = new State(0);
      this.lastDeletedItemPath = new State("");
      // methods
      this.getSelectedItemContent = () => {
        const path = StorageModel.stringToPathComponents(
          this.selectedPath.value
        );
        const content = this.coreViewModel.storageModel.read(path);
        return (content ?? this.coreViewModel.translations.storage.notAFile) || this.coreViewModel.translations.storage.contentEmpty;
      };
      this.deleteSelectedItem = () => {
        const path = StorageModel.stringToPathComponents(
          this.selectedPath.value
        );
        this.lastDeletedItemPath.value = this.selectedPath.value;
        this.coreViewModel.storageModel.removeRecursively(path);
        this.didMakeChanges.value = true;
      };
      this.removeJunk = () => {
        this.coreViewModel.storageModel.removeJunk();
        this.selectedPath.value = PATH_COMPONENT_SEPARATOR;
      };
      this.calculateUsage = () => {
        this.occupiedSpaceMB.value = this.coreViewModel.storageModel.calculateUsage();
        this.maximumSpaceMB.value = this.coreViewModel.storageModel.determineCapacity();
      };
      // view
      this.showStorageModal = () => {
        this.coreViewModel.context = this;
        this.isShowingStorageModal.value = true;
        this.calculateUsage();
      };
      // exit
      this.close = () => {
        this.coreViewModel.closeContext(this.contextId);
      };
      this.handleContextClose = () => {
        if (this.didMakeChanges.value == true) {
          window.location.reload();
          return;
        }
        this.isShowingStorageModal.value = false;
      };
      this.selectedFileName = createProxyState(
        [this.selectedPath],
        () => StorageModel.getFileNameFromString(this.selectedPath.value)
      );
      this.selectedFileContent = createProxyState(
        [this.selectedPath],
        () => this.getSelectedItemContent()
      );
      this.registerKeyStroke("backspace" /* CloseOrCancel */, this.close);
    }
  };

  // src/Model/Global/settingsModel.ts
  var SettingsModel = class _SettingsModel {
    // init
    constructor(storageModel2) {
      this.storageModel = storageModel2;
      // data
      this.username = "";
      this.userid = "";
      this.firstDayOfWeek = "";
      this.language = "";
      this.theme = "";
      // storage
      this.storeSetting = (pathName, value) => {
        const path = StorageModel.getPath(
          "settings" /* SettingsModel */,
          filePaths.settingsModel[pathName]
        );
        this.storageModel.write(path, value);
      };
      this.setId = (newValue) => {
        this.userid = newValue;
        this.storeSetting("userid", newValue);
      };
      this.setName = (newValue) => {
        this.username = newValue;
        this.storeSetting("username", newValue);
      };
      this.setFirstDayOfWeek = (newValue) => {
        this.firstDayOfWeek = newValue;
        this.storeSetting("firstDayOfWeek", newValue);
      };
      this.setLanguage = (newValue) => {
        this.language = newValue;
        this.storeSetting("language", newValue);
      };
      this.setTheme = (newValue) => {
        this.theme = newValue;
        this.storeSetting("theme", newValue);
      };
      // load
      this.readSetting = (pathName) => {
        const path = StorageModel.getPath(
          "settings" /* SettingsModel */,
          filePaths.settingsModel[pathName]
        );
        return this.storageModel.read(path);
      };
      this.loadId = () => {
        const content = this.readSetting("userid");
        const id = content ?? UUID();
        if (content) this.userid = content;
        else this.setId(id);
      };
      this.loadUsername = () => {
        const content = this.readSetting("username");
        this.username = content ?? "";
      };
      this.loadFirstDayofWeek = () => {
        const content = this.readSetting("firstDayOfWeek");
        this.firstDayOfWeek = content ?? "0";
      };
      this.loadLanguage = () => {
        const content = this.readSetting("language");
        this.language = content ?? _SettingsModel.getSystemLanguage();
      };
      this.loadTheme = () => {
        const content = this.readSetting("theme");
        this.theme = content ?? "system" /* System */;
      };
      this.loadId();
      this.loadUsername();
      this.loadFirstDayofWeek();
      this.loadLanguage();
      this.loadTheme();
    }
    static getSystemLanguage() {
      switch (navigator.language.substring(0, 2)) {
        case "de":
          return "de" /* German */;
        case "es":
          return "es" /* Spanish */;
        default:
          return "en" /* English */;
      }
    }
  };
  var Languages = /* @__PURE__ */ ((Languages2) => {
    Languages2["English"] = "en";
    Languages2["German"] = "de";
    Languages2["Spanish"] = "es";
    return Languages2;
  })(Languages || {});

  // src/ViewModel/Global/settingsViewModel.ts
  var SettingsViewModel = class _SettingsViewModel extends Context {
    // init
    constructor(coreViewModel2, settingsModel2) {
      super("settings");
      this.coreViewModel = coreViewModel2;
      this.settingsModel = settingsModel2;
      // state
      this.username = new State("");
      this.usernameInput = new State("");
      this.isShowingSettingsModal = new State(false);
      this.selectedModalPage = new State(void 0);
      this.requiresReload = new State(false);
      this.firstDayOfWeek = new State("0");
      this.language = new State("en" /* English */);
      this.theme = new State("system" /* System */);
      // guards
      this.cannotSetName = createProxyState(
        [this.usernameInput],
        () => this.usernameInput.value == "" || this.usernameInput.value == this.coreViewModel.settingsModel.username
      );
      // methods
      this.setName = (name) => {
        if (typeof name == "string") {
          this.usernameInput.value = name;
        }
        this.coreViewModel.settingsModel.setName(this.usernameInput.value);
        this.username.value = this.coreViewModel.settingsModel.username;
        this.usernameInput.callSubscriptions();
      };
      this.setFirstDayofWeek = () => {
        this.coreViewModel.settingsModel.setFirstDayOfWeek(
          this.firstDayOfWeek.value
        );
      };
      this.showSettingsModal = () => {
        this.coreViewModel.context = this;
        this.isShowingSettingsModal.value = true;
      };
      this.showModalPage = (page) => {
        this.selectedModalPage.value = page;
      };
      // view
      this.applyTheme = () => {
        let theme = this.theme.value;
        if (theme == "system" /* System */)
          theme = _SettingsViewModel.getSystemTheme();
        switch (theme) {
          case "dynamic" /* Dynamic */:
            const scene = this.selectDynamicScene();
            this.setScene(scene);
            break;
          case "dark" /* Dark */:
            this.setScene(DynamicSceneNight);
            break;
          case "black" /* Black */:
            this.setScene(DynamicSceneBlack);
            break;
          default:
            this.setScene(DynamicSceneDay);
        }
      };
      this.selectDynamicScene = () => {
        let hour = (/* @__PURE__ */ new Date()).getHours();
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
      this.setScene = (scene) => {
        document.body.style.setProperty(
          "--backdrop-grass-filter",
          `brightness(${scene.brightness})`
        );
        function setSkyColor(tone, hue, saturation, luma) {
          document.body.style.setProperty(
            `--sky-${tone}`,
            `hsl(${hue}, ${saturation}%, ${luma}%)`
          );
        }
        setSkyColor(1, scene.hue1, scene.saturation, scene.luma);
        setSkyColor(2, scene.hue2, scene.saturation - 10, scene.luma - 10);
        document.body.setAttribute("theme", scene.baseTheme);
      };
      // exit
      this.close = () => {
        this.coreViewModel.closeContext(this.contextId);
      };
      this.handleContextClose = () => {
        this.isShowingSettingsModal.value = false;
        if (this.requiresReload.value == true) {
          window.location.reload();
        }
      };
      this.username.value = coreViewModel2.settingsModel.username;
      this.usernameInput.value = coreViewModel2.settingsModel.username;
      this.firstDayOfWeek.value = coreViewModel2.settingsModel.firstDayOfWeek;
      this.language.value = coreViewModel2.settingsModel.language;
      this.theme.value = coreViewModel2.settingsModel.theme;
      this.firstDayOfWeek.subscribe(this.setFirstDayofWeek);
      this.language.subscribeSilent((newValue) => {
        this.coreViewModel.settingsModel.setLanguage(newValue);
        this.requiresReload.value = true;
      });
      this.theme.subscribeSilent((newValue) => {
        this.coreViewModel.settingsModel.setTheme(newValue);
      });
      this.theme.subscribe(() => {
        this.applyTheme();
      });
      _SettingsViewModel.generateThemeMedia().addEventListener(
        "change",
        () => this.applyTheme()
      );
      const seconds = (/* @__PURE__ */ new Date()).getSeconds();
      const secondsUntilNewMinute = 60 - seconds;
      setTimeout(() => {
        setInterval(this.applyTheme, 1e3 * 60);
      }, secondsUntilNewMinute);
      this.registerKeyStroke("backspace" /* CloseOrCancel */, this.close);
    }
    static generateThemeMedia() {
      return window.matchMedia("(prefers-color-scheme: dark)");
    }
    static getSystemTheme() {
      const media = _SettingsViewModel.generateThemeMedia();
      return media.matches == true ? "dark" /* Dark */ : "light" /* Light */;
    }
  };
  var DynamicSceneNight = {
    hue1: 215,
    hue2: 220,
    saturation: 50,
    luma: 25,
    brightness: 0.4,
    baseTheme: "dark" /* Dark */
  };
  var DynamicSceneSunrise = {
    hue1: 45,
    hue2: 190,
    saturation: 100,
    luma: 50,
    brightness: 1.2,
    baseTheme: "light" /* Light */
  };
  var DynamicSceneDay = {
    hue1: 190,
    hue2: 230,
    saturation: 100,
    luma: 70,
    brightness: 1.1,
    baseTheme: "light" /* Light */
  };
  var DynamicSceneAfternoon = {
    hue1: 220,
    hue2: 250,
    saturation: 100,
    luma: 50,
    brightness: 0.8,
    baseTheme: "light" /* Light */
  };
  var DynamicSceneSunset = {
    hue1: 20,
    hue2: 260,
    saturation: 100,
    luma: 50,
    brightness: 0.4,
    baseTheme: "dark" /* Dark */
  };
  var DynamicSceneBlack = {
    hue1: 0,
    hue2: 0,
    saturation: 0,
    luma: 0,
    brightness: 0,
    baseTheme: "black" /* Black */
  };

  // src/ViewModel/Global/fileTransferViewModel.ts
  var FileTransferViewModel = class extends Context {
    // init
    constructor(coreViewModel2) {
      super("file-transfer");
      this.coreViewModel = coreViewModel2;
      // state
      this.exitReception = void 0;
      this.presentedModal = new State(void 0);
      this.generalFileOptions = new ListState();
      this.chatFileOptions = new ListState();
      this.selectedPaths = new ListState();
      this.transferChannel = new State("");
      this.transferKey = new State("");
      this.receivingTransferChannel = new State("");
      this.receivingTransferKey = new State("");
      this.filePathsSent = new ListState();
      this.filesSentCount = createProxyState(
        [this.filePathsSent],
        () => this.filePathsSent.value.size
      );
      this.filesSentText = createProxyState(
        [this.filesSentCount],
        () => this.coreViewModel.translations.dataTransferModal.filesSentCount(
          this.filesSentCount.value
        )
      );
      this.filePathsReceived = new ListState();
      this.filesReceivedCount = createProxyState(
        [this.filePathsReceived],
        () => this.filePathsReceived.value.size
      );
      this.filesReceivedText = createProxyState(
        [this.filesReceivedCount],
        () => this.coreViewModel.translations.dataTransferModal.filesReceivedCount(
          this.filesReceivedCount.value
        )
      );
      this.exportKey = new State("");
      this.exportKeyConfirmation = new State("");
      this.importedFile = new State(void 0);
      this.importedFileString = new State("");
      this.importKey = new State("");
      this.isImportKeyCorrect = new State(true);
      // guards
      this.hasNoPathsSelected = createProxyState(
        [this.selectedPaths],
        () => this.selectedPaths.value.size == 0
      );
      this.didNotFinishSending = new State(true);
      this.cannotPrepareToReceive = createProxyState(
        [this.receivingTransferChannel, this.receivingTransferKey],
        () => this.receivingTransferChannel.value == "" || this.receivingTransferKey.value == ""
      );
      this.cannotExitReception = createProxyState(
        [this.filePathsReceived],
        () => this.filePathsReceived.value.size > 0
      );
      this.cannotExport = createProxyState(
        [this.exportKey, this.exportKeyConfirmation],
        () => this.exportKey.value == "" || this.exportKey.value != this.exportKeyConfirmation.value
      );
      this.cannotImport = createProxyState(
        [this.importedFile],
        () => this.importedFile.value == void 0
      );
      this.importDecryptSuccessful = createProxyState(
        [this.importKey],
        () => this.importKey.value == ""
      );
      // handlers
      this.handleReceivedFile = (path) => {
        this.filePathsReceived.add(path);
      };
      // methods
      this.getOptions = () => {
        this.generalFileOptions.clear();
        this.chatFileOptions.clear();
        this.selectedPaths.clear();
        this.generalFileOptions.add(
          {
            label: this.coreViewModel.translations.dataTransferModal.connectionData,
            path: StorageModel.getPath(
              "connection" /* ConnectionModel */,
              filePaths.connectionModel.previousAddresses
            )
          },
          {
            label: this.coreViewModel.translations.dataTransferModal.settingsData,
            path: StorageModel.getPath(
              "settings" /* SettingsModel */,
              []
            )
          }
        );
        const chatModels = this.coreViewModel.chatListModel.chatModels;
        for (const chatModel of chatModels) {
          this.chatFileOptions.add({
            label: chatModel.info.name,
            path: chatModel.getBasePath()
          });
        }
      };
      this.getTransferData = () => {
        const transferData = this.coreViewModel.fileTransferModel.generateTransferData();
        this.transferChannel.value = transferData.channel;
        this.transferKey.value = transferData.key;
      };
      this.downloadFile = async () => {
        if (this.cannotExport.value == true) return;
        const date = formatISO(/* @__PURE__ */ new Date());
        const backup = await this.coreViewModel.fileTransferModel.generateBackup(
          this.selectedPaths.value.values(),
          this.exportKey.value
        );
        const anchor = document.createElement("a");
        anchor.href = window.URL.createObjectURL(backup);
        anchor.download = `comms-${date}.bak`;
        anchor.click();
      };
      this.updateImportSelection = () => {
        const input = document.getElementById("file-transfer-input");
        if (!input) return;
        if (!(input instanceof HTMLInputElement)) return;
        if (!input.files) return;
        const file = input.files[0];
        this.importedFile.value = file;
      };
      this.importFile = () => {
        const file = this.importedFile.value;
        if (!file) return;
        const reader = new FileReader();
        reader.readAsText(file, "utf8");
        reader.onload = () => {
          const result = reader.result;
          if (!result) return;
          this.importedFileString.value = result.toString();
          this.showImportDecryptDataModal();
        };
      };
      this.decryptImport = async () => {
        const fileString = this.importedFileString.value;
        const key = this.importKey.value;
        if (!fileString || !key) return;
        this.importDecryptSuccessful.value = true;
        try {
          await this.coreViewModel.fileTransferModel.handleBackupFile(
            fileString,
            key
          );
          window.location.reload();
        } catch (e) {
          console.error(e);
          this.isImportKeyCorrect.value = false;
          this.importDecryptSuccessful.value = false;
        }
      };
      // view
      this.showDirectionSelectionModal = () => {
        this.coreViewModel.context = this;
        this.presentedModal.value = 0 /* DirectionSelection */;
        this.getOptions();
      };
      this.showFileSelectionModal = () => {
        this.presentedModal.value = 1 /* FileSelection */;
      };
      this.showTransferDataModal = () => {
        this.presentedModal.value = 2 /* TransferDataDisplay */;
        this.getTransferData();
        this.coreViewModel.fileTransferModel.prepareToSend();
      };
      this.correctTransferData = () => {
        if (this.exitReception != void 0) {
          this.presentedModal.value = void 0;
          this.exitReception();
          return;
        }
        this.showTransferDataInputModal();
      };
      this.initiateTransfer = () => {
        this.presentedModal.value = 3 /* TransferDisplay */;
        this.didNotFinishSending.value = true;
        this.filePathsSent.clear();
        this.coreViewModel.fileTransferModel.sendFiles(
          this.selectedPaths.value.values(),
          (path) => {
            this.filePathsSent.add(path);
          }
        );
        this.didNotFinishSending.value = false;
      };
      this.showTransferDataInputModal = () => {
        this.presentedModal.value = 4 /* TransferDataInput */;
      };
      this.showExportSelectionModal = () => {
        this.presentedModal.value = 6 /* ExportFileSelection */;
      };
      this.showExportModal = () => {
        this.presentedModal.value = 7 /* Export */;
      };
      this.showImportModal = () => {
        this.presentedModal.value = 8 /* ImportSelection */;
      };
      this.showImportDecryptDataModal = () => {
        this.presentedModal.value = 9 /* ImportDecryptData */;
      };
      this.prepareReceivingData = () => {
        if (this.cannotPrepareToReceive.value == true) return;
        this.presentedModal.value = 5 /* ReceptionDisplay */;
        this.filePathsReceived.clear();
        const transferData = {
          channel: this.receivingTransferChannel.value,
          key: this.receivingTransferKey.value
        };
        this.coreViewModel.fileTransferModel.prepareToReceive(transferData);
      };
      // exit
      this.close = () => {
        this.coreViewModel.closeContext(this.contextId);
      };
      this.handleContextClose = () => {
        this.presentedModal.value = void 0;
      };
      this.coreViewModel.fileTransferModel.fileHandlerManager.setHandler(
        "file-transfer-view-model",
        this.handleReceivedFile
      );
      this.coreViewModel.fileTransferModel.readyToSendHandlerManager.setHandler(
        "file-transfer-view-model",
        () => this.initiateTransfer()
      );
      this.registerKeyStroke("backspace" /* CloseOrCancel */, this.close);
    }
  };

  // src/ViewModel/Global/contactViewModel.ts
  var ContactListViewModel = class {
    // init
    constructor(contactListModel2, settingsViewModel2) {
      this.contactListModel = contactListModel2;
      this.settingsViewModel = settingsViewModel2;
      // state
      this.contacts = /* @__PURE__ */ new Map();
      // main
      this.updateContact = (id, name) => {
        if (id == this.settingsViewModel.settingsModel.userid) {
          this.settingsViewModel.setName(name);
        }
        const match = this.contacts.get(id);
        if (match) {
          match.name.value = name;
          return match;
        }
        const vm = new ContactViewModel(id, name);
        this.contacts.set(id, vm);
        return vm;
      };
      this.handleContact = (contact) => {
        this.updateContact(...contact);
      };
      this.unwrapContact = (id, knownName) => {
        if (this.contacts.has(id)) return this.contacts.get(id);
        return this.updateContact(id, knownName);
      };
      // load
      this.loadData = () => {
        const contacts = this.contactListModel.loadContacts();
        for (const contact of contacts) {
          const vm = new ContactViewModel(...contact);
          this.contacts.set(vm.id, vm);
        }
      };
      this.loadData();
      this.contactListModel.contactHandlerManager.setHandler(
        "contact-list-view-model",
        this.handleContact
      );
    }
  };
  var ContactViewModel = class {
    // init
    constructor(id, name) {
      this.id = id;
      // state
      this.name = new State("");
      this.name.value = name;
    }
  };

  // src/ViewModel/Global/connectionViewModel.ts
  var ConnectionViewModel = class {
    // init
    constructor(coreViewModel2) {
      this.coreViewModel = coreViewModel2;
      // state
      this.serverAddressInput = new State("");
      this.isConnected = new State(false);
      this.isShowingConnectionModal = new State(false);
      this.previousAddresses = new ListState();
      // guards
      this.cannotConnect = createProxyState(
        [this.serverAddressInput, this.isConnected],
        () => this.isConnected.value == true && this.serverAddressInput.value == this.coreViewModel.connectionModel.address || this.serverAddressInput.value == ""
      );
      this.cannotDisonnect = createProxyState(
        [this.isConnected],
        () => this.isConnected.value == false
      );
      this.hasNoPreviousConnections = createProxyState(
        [this.previousAddresses],
        () => this.previousAddresses.value.size == 0
      );
      // handlers
      this.connectionChangeHandler = () => {
        this.isConnected.value = this.coreViewModel.connectionModel.isConnected;
        if (this.coreViewModel.connectionModel.isConnected == false) return;
        if (this.coreViewModel.connectionModel.address == void 0) return;
        this.serverAddressInput.value = this.coreViewModel.connectionModel.address;
        if (!this.previousAddresses.value.has(
          this.coreViewModel.connectionModel.address
        )) {
          this.previousAddresses.add(
            this.coreViewModel.connectionModel.address
          );
        }
        this.hideConnectionModal();
      };
      // methods
      this.connect = () => {
        this.connectToAddress(this.serverAddressInput.value);
      };
      this.connectToAddress = (address) => {
        console.log(address);
        this.coreViewModel.connectionModel.connect(address);
      };
      this.disconnect = () => {
        this.coreViewModel.connectionModel.disconnect();
      };
      this.removePreviousAddress = (address) => {
        this.coreViewModel.connectionModel.removeAddress(address);
        this.updatePreviousAddresses();
        if (this.previousAddresses.value.size > 0) return;
        this.hideConnectionModal();
      };
      // view
      this.showConnectionModal = () => {
        this.isShowingConnectionModal.value = true;
      };
      this.hideConnectionModal = () => {
        this.isShowingConnectionModal.value = false;
      };
      this.updatePreviousAddresses = () => {
        this.previousAddresses.clear();
        this.previousAddresses.add(
          ...this.coreViewModel.connectionModel.addresses
        );
      };
      this.updatePreviousAddresses();
      coreViewModel2.connectionModel.connectionChangeHandlerManager.setHandler(
        "connection-view-model",
        this.connectionChangeHandler
      );
    }
  };

  // src/ViewModel/Pages/taskContainingPageViewModel.ts
  var TaskContainingPageViewModel = class extends Context {
    // init
    constructor(coreViewModel2, chatViewModel, boardsAndTasksModel, contextDebugDescription) {
      super(contextDebugDescription);
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      // state
      this.taskIndexManager = new IndexManager(
        (taskViewModel) => taskViewModel.sortingString
      );
      this.selectedTaskViewModel = new State(void 0);
      this.taskViewModels = new MapState();
      this.taskCategorySuggestions = new ListState();
      this.taskStatusSuggestions = new ListState();
      // methods
      this.createTaskFromBoardId = (boardId) => {
        const taskFileContent = this.boardsAndTasksModel.createTask(boardId);
        const taskViewModel = new TaskViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          taskFileContent
        );
        taskViewModel.open();
        this.updateTaskIndices();
      };
      // view
      this.showTask = (taskFileContent) => {
      };
      this.removeTaskFromView = (taskFileContent) => {
      };
      this.selectTask = (selectedTask) => {
        this.selectedTaskViewModel.value = selectedTask;
      };
      this.closeTask = () => {
        this.selectedTaskViewModel.value = void 0;
      };
      this.updateTaskIndices = () => {
        this.taskIndexManager.update([...this.taskViewModels.value.values()]);
        for (const taskViewModel of this.taskViewModels.value.values()) {
          taskViewModel.updateIndex();
        }
      };
    }
  };

  // src/ViewModel/Pages/calendarPageViewModel.ts
  var CALENDAR_EVENT_BOARD_ID = "events";
  var CalendarPageViewModel = class extends TaskContainingPageViewModel {
    // init
    constructor(coreViewModel2, chatViewModel, calendarModel, boardsAndTasksModel) {
      super(coreViewModel2, chatViewModel, boardsAndTasksModel, "calendar");
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.calendarModel = calendarModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      // paths
      this.getBasePath = () => {
        return [...this.calendarModel.getViewPath()];
      };
      // state
      this.currentTodayDate = void 0;
      this.selectedYear = new State(0);
      this.selectedMonth = new State(0);
      this.selectedDate = new State(0);
      this.monthGrid = new State(void 0);
      this.nextTask = new State(void 0);
      // methods
      this.createEvent = () => {
        const taskFileContent = this.boardsAndTasksModel.createTask(CALENDAR_EVENT_BOARD_ID);
        taskFileContent.date = formatISOFromParts(
          this.selectedYear.value.toString(),
          this.selectedMonth.value.toString(),
          this.selectedDate.value.toString()
        );
        const taskViewModel = new TaskViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          taskFileContent
        );
        taskViewModel.open();
        this.updateTaskIndices();
      };
      this.getEventsForDate = () => {
        const paddedDate = padZero(this.selectedDate.toString(), 2);
        if (this.monthGrid.value == void 0) {
          return void 0;
        }
        return this.monthGrid.value.days[paddedDate];
      };
      // view
      this.getTaskMapState = (taskFileContent) => {
        if (this.monthGrid.value == null) return null;
        const date = isoToDateString(taskFileContent.date ?? "");
        return this.monthGrid.value.days[date];
      };
      this.showTask = (taskFileContent) => {
        const monthString = isoToMonthString(
          taskFileContent.date ?? ""
        );
        if (monthString == void 0 || monthString != this.monthString) {
          this.removeTaskFromView(taskFileContent);
          this.calendarModel.deleteTaskReference(
            this.monthString,
            taskFileContent.fileId
          );
          return;
        }
        const taskViewModel = new TaskViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          taskFileContent
        );
        const mapState = this.getTaskMapState(taskFileContent);
        this.taskViewModels.handleRemoval(taskViewModel, () => {
          mapState?.remove(taskFileContent.fileId);
        });
        this.taskViewModels.remove(taskFileContent.fileId);
        this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
        mapState?.set(taskFileContent.fileId, taskViewModel);
        this.updateTaskIndices();
      };
      this.removeTaskFromView = (taskFileContent) => {
        this.taskViewModels.remove(taskFileContent.fileId);
      };
      this.showToday = () => {
        const today = this.coreViewModel.todayDate.value;
        this.selectedYear.value = today.getFullYear();
        this.selectedMonth.value = today.getMonth() + 1;
        this.selectedDate.value = today.getDate();
      };
      this.showPreviousMonth = () => {
        this.selectedMonth.value -= 1;
        if (this.selectedMonth.value <= 0) {
          this.selectedYear.value -= 1;
          this.selectedMonth.value = 12;
        }
      };
      this.showNextMonth = () => {
        this.selectedMonth.value += 1;
        if (this.selectedMonth.value >= 13) {
          this.selectedYear.value += 1;
          this.selectedMonth.value = 1;
        }
      };
      this.handleDrop = (year, month, date) => {
        const ISOString = formatISOFromParts(year, month, date);
        const draggedObject = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setDate(ISOString);
      };
      this.handleChron = () => {
        this.updateMonthGrid();
        this.updateNextTask();
      };
      this.updateMonthGrid = () => {
        const today = formatISO(this.coreViewModel.todayDate.value);
        if (this.currentTodayDate == today) return;
        this.loadMonthTasks();
        this.currentTodayDate = today;
        this.selectedDate.callSubscriptions();
      };
      this.updateNextTask = () => {
        if (this.selectedDateString != this.currentTodayDate) {
          this.nextTask.value = void 0;
          return;
        }
        const tasks = this.getEventsForDate();
        if (tasks == void 0) return;
        const taskArray = [...tasks.value.values()];
        const sorted = taskArray.sort((a, b) => a.index.value - b.index.value);
        for (const task of sorted) {
          if (task.time.value <= this.coreViewModel.time.value) continue;
          this.nextTask.value = task;
          break;
        }
      };
      // load
      this.loadMonthTasks = () => {
        this.monthGrid.value = this.calendarModel.generateMonthGrid(
          this.coreViewModel,
          this.selectedYear.value,
          this.selectedMonth.value,
          () => new MapState()
        );
        const taskIds = this.calendarModel.listTaskIds(
          this.monthString
        );
        for (const taskId of taskIds) {
          const taskFileContent = this.boardsAndTasksModel.getLatestTaskFileContent(taskId);
          if (taskFileContent == null) continue;
          this.showTask(taskFileContent);
        }
      };
      this.loadData = () => {
      };
      this.calendarModel = calendarModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      this.chatViewModel = chatViewModel;
      bulkSubscribe([this.selectedYear, this.selectedMonth], () => {
        this.loadMonthTasks();
      });
      this.selectedDate.subscribeSilent(() => {
        this.updateNextTask();
      });
      boardsAndTasksModel.taskHandlerManager.setHandler(
        "calendar" + this.chatViewModel.chatModel.id,
        (taskFileContent) => {
          this.showTask(taskFileContent);
        }
      );
      this.coreViewModel.chronHandlerManager.setHandler(
        `calendar-${this.chatViewModel.chatModel.id}`,
        this.handleChron
      );
      this.showToday();
      this.registerKeyStroke("-" /* Reset */, this.showToday);
      this.registerKeyStroke("k", this.showPreviousMonth);
      this.registerKeyStroke("l", this.showNextMonth);
      this.registerKeyStroke("a" /* Create */, this.createEvent);
      this.chatViewModel.registerContext("calendar" /* Calendar */, this);
    }
    // data
    get monthString() {
      return formatMonthStringFromParts(
        this.selectedYear.value.toString(),
        this.selectedMonth.value.toString()
      );
    }
    get selectedDateString() {
      return formatISOFromParts(
        this.selectedYear.value,
        this.selectedMonth.value,
        this.selectedDate.value
      );
    }
  };

  // src/View/viewController.ts
  var Tracker = class {
  };
  var TrackerMap = class {
    constructor() {
      this.trackers = /* @__PURE__ */ new Map();
      this.register = (key) => {
        if (this.trackers.has(key)) {
          return this.trackers.get(key);
        }
        const tracker = new Tracker();
        this.trackers.set(key, tracker);
        return tracker;
      };
      this.setState = (key, stateBuilder) => {
        const tracker = this.register(key);
        if (tracker.state != void 0) {
          return tracker.state;
        } else {
          tracker.state = stateBuilder();
          return tracker.state;
        }
      };
    }
  };
  var ViewController = class {
    static {
      this.chatPages = new Tracker();
    }
    static {
      this.taskPages = new TrackerMap();
    }
    static {
      this.boardPages = new TrackerMap();
    }
    static {
      this.inlineReplies = new TrackerMap();
    }
    static {
      this.scrollToView = (id) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.scrollIntoView();
        element.setAttribute("scrolled", "");
        setTimeout(() => element.removeAttribute("scrolled"), 1e3);
      };
    }
    static {
      this.allowDrop = (event) => {
        event.preventDefault();
      };
    }
    static {
      this.allowDrag = (event) => {
        event.dataTransfer?.setData("text", "");
      };
    }
    static {
      this.reload = () => {
        window.location.reload();
      };
    }
    static {
      this.setFocus = () => {
        const focusedInModal = document.querySelector(
          ".modal[open] #focused"
        );
        if (focusedInModal) return focusedInModal.focus();
        document.getElementById("focused")?.focus();
      };
    }
    static {
      this.setFocusWithDelay = () => {
        setTimeout(this.setFocus, 100);
      };
    }
  };

  // src/Model/Utility/crypto.ts
  var IV_SIZE = 12;
  var ENCRYPTION_ALG = "AES-GCM";
  async function encryptString(plaintext, passphrase) {
    if (!window.crypto.subtle) return plaintext;
    const iv = generateIV();
    const key = await importKey(passphrase, "encrypt");
    const encryptedArray = await encrypt(iv, key, plaintext);
    const encryptionData = {
      iv: uInt8ToArray(iv),
      encryptedArray: uInt8ToArray(encryptedArray)
    };
    return btoa(JSON.stringify(encryptionData));
  }
  async function decryptString(cyphertext, passphrase) {
    try {
      const encrypionData = JSON.parse(atob(cyphertext));
      const iv = arrayToUint8(encrypionData.iv);
      const encryptedArray = arrayToUint8(encrypionData.encryptedArray);
      const key = await importKey(passphrase, "decrypt");
      return await decrypt(iv, key, encryptedArray);
    } catch {
      return cyphertext;
    }
  }
  function encode(string) {
    return new TextEncoder().encode(string);
  }
  function decode(array) {
    return new TextDecoder("utf-8").decode(array);
  }
  async function encrypt(iv, key, message) {
    const arrayBuffer = await window.crypto.subtle.encrypt(
      { name: ENCRYPTION_ALG, iv },
      key,
      encode(message)
    );
    return new Uint8Array(arrayBuffer);
  }
  async function decrypt(iv, key, cyphertext) {
    const arrayBuffer = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALG, iv },
      key,
      cyphertext
    );
    return arrayBufferToString(arrayBuffer);
  }
  async function hash(encoded) {
    return await crypto.subtle.digest("SHA-256", encoded);
  }
  function generateIV() {
    return crypto.getRandomValues(new Uint8Array(IV_SIZE));
  }
  async function importKey(passphrase, purpose) {
    return await crypto.subtle.importKey(
      "raw",
      await hash(encode(passphrase)),
      { name: ENCRYPTION_ALG },
      false,
      [purpose]
    );
  }
  function arrayBufferToString(arrayBuffer) {
    const uInt8Array = new Uint8Array(arrayBuffer);
    return decode(uInt8Array);
  }
  function uInt8ToArray(uInt8Array) {
    return Array.from(uInt8Array);
  }
  function arrayToUint8(array) {
    return new Uint8Array(array);
  }

  // src/colors.ts
  var Colors = /* @__PURE__ */ ((Colors2) => {
    Colors2["Standard"] = "standard";
    Colors2["Coral"] = "coral";
    Colors2["Yellow"] = "yellow";
    Colors2["Green"] = "green";
    Colors2["LightBlue"] = "lightblue";
    Colors2["Blue"] = "blue";
    Colors2["purple"] = "purple";
    return Colors2;
  })(Colors || {});

  // src/Model/Chat/chatModel.ts
  var ChatModel = class _ChatModel {
    // init
    constructor(storageModel2, connectionModel2, settingsModel2, chatListModel2, contactListModel2, chatId) {
      this.storageModel = storageModel2;
      this.connectionModel = connectionModel2;
      this.settingsModel = settingsModel2;
      this.chatListModel = chatListModel2;
      this.contactListModel = contactListModel2;
      // handler managers
      this.chatMessageHandlerManager = new HandlerManager();
      this.reactionHandlerManager = new HandlerManager();
      this.changeHandlerManager = new HandlerManager();
      // paths
      this.getBasePath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.chatBase(this.id)
        );
      };
      this.getInfoPath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.info(this.id)
        );
      };
      this.getColorPath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.color(this.id)
        );
      };
      this.getMessageDirPath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.messages(this.id)
        );
      };
      this.getMessagePath = (id) => {
        return [...this.getMessageDirPath(), id];
      };
      this.getReactionDirPath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.reactions(this.id)
        );
      };
      this.getReactionPath = (id) => {
        return [...this.getReactionDirPath(), id];
      };
      this.getPreviousFilterPath = () => {
        return [
          "chat" /* Chat */,
          ...filePaths.chat.previousFilter(this.id)
        ];
      };
      // handlers
      this.handleMessage = (body) => {
        const chatMessage = parseValidObject(
          body,
          ChatMessageReference
        );
        if (chatMessage == null) return;
        chatMessage.status = "received" /* Received */;
        this.addMessage(chatMessage);
        if (chatMessage.stringifiedFile) return;
        if (chatMessage.senderId == this.settingsModel.userid) return;
        this.setReadStatus(true);
      };
      this.handleReaction = (reaction) => {
        if (!checkMatchesObjectStructure(reaction, ChatMessageReactionReference))
          return;
        const reactionPath = this.getReactionPath(reaction.fileId);
        if (reaction.isDeleting == true) {
          this.storageModel.remove(reactionPath);
        } else {
          this.storageModel.writeStringifiable(reactionPath, reaction);
        }
        this.reactionHandlerManager.trigger(reaction);
      };
      this.handleMessageSent = (chatMessage) => {
        chatMessage.status = "sent" /* Sent */;
        this.addMessage(chatMessage);
      };
      // settings
      this.setName = (name) => {
        this.info.name = name;
        this.storeInfo();
        this.syncInfo();
        this.subscribe();
      };
      this.setSecondaryChannels = (secondaryChannels) => {
        this.info.secondaryChannels = secondaryChannels;
        this.storeInfo();
      };
      this.setEncryptionKey = (key) => {
        this.info.encryptionKey = key;
        this.storeInfo();
      };
      this.setColor = (color) => {
        this.info.color = color;
        this.syncInfo();
        this.storeInfo();
      };
      // messaging
      this.addMessage = async (chatMessage) => {
        await this.decryptMessage(chatMessage);
        this.contactListModel.storeContact(
          chatMessage.senderId,
          chatMessage.senderName
        );
        if (chatMessage.body != "") {
          const messagePath = this.getMessagePath(
            chatMessage.fileId
          );
          this.storageModel.writeStringifiable(messagePath, chatMessage);
          this.chatMessageHandlerManager.trigger(chatMessage);
        }
        this.fileModel.handleStringifiedFileContent(
          chatMessage.stringifiedFile
        );
      };
      this.getSendingData = () => {
        const id = this.settingsModel.userid;
        const senderName = this.settingsModel.username || "?";
        const allChannels = [this.id];
        for (const secondaryChannel of this.info.secondaryChannels) {
          allChannels.push(secondaryChannel);
        }
        const combinedChannel = allChannels.join("/");
        return [id, senderName, combinedChannel];
      };
      this.sendMessage = async (body, inlineReplyId, fileContent) => {
        const [senderId, senderName, combinedChannel] = this.getSendingData();
        const chatMessage = await _ChatModel.createChatMessage(
          combinedChannel,
          senderId,
          senderName,
          this.info.encryptionKey,
          body,
          inlineReplyId,
          fileContent
        );
        this.addMessage(chatMessage);
        this.connectionModel.sendMessageOrStore(chatMessage);
        return chatMessage.fileId;
      };
      this.decryptMessage = async (chatMessage) => {
        const decryptedBody = await decryptString(
          chatMessage.body,
          this.info.encryptionKey
        );
        const decryptedFile = await decryptString(
          chatMessage.stringifiedFile ?? "",
          this.info.encryptionKey
        );
        chatMessage.body = decryptedBody;
        chatMessage.stringifiedFile = decryptedFile;
      };
      this.sendReaction = async (messageId, content, isDeleting = false) => {
        const [senderId, senderName, combinedChannel] = this.getSendingData();
        const reaction = _ChatModel.createMessageReaction(
          messageId,
          senderId,
          senderName,
          content,
          isDeleting
        );
        this.sendMessage("", void 0, reaction);
        this.handleReaction(reaction);
      };
      this.subscribe = () => {
        this.connectionModel.addChannel(this.id);
      };
      this.setReadStatus = (hasUnreadMessages) => {
        this.info.hasUnreadMessages = hasUnreadMessages;
        this.storeInfo();
      };
      // storage
      this.storeInfo = () => {
        this.storageModel.writeStringifiable(this.getInfoPath(), this.info);
      };
      this.syncInfo = () => {
        this.sendMessage("", void 0, this.info);
      };
      this.storeFilter = (filter) => {
        this.storageModel.write(this.getPreviousFilterPath(), filter);
      };
      this.getFilter = () => {
        return this.storageModel.read(this.getPreviousFilterPath()) || "";
      };
      this.delete = () => {
        this.chatListModel.untrackChat(this);
        const dirPath = this.getBasePath();
        this.storageModel.removeRecursively(dirPath);
      };
      // load
      this.loadInfo = () => {
        let info = this.storageModel.readStringifiable(
          this.getInfoPath(),
          ChatInfoReference
        );
        this.info = info || _ChatModel.generateChatInfo("0", "0", "standard" /* Standard */);
        this.storeInfo();
      };
      this.handleInfo = (info) => {
        this.info = info;
        this.changeHandlerManager.trigger(null);
        this.storeInfo();
      };
      this.id = chatId;
      this.loadInfo();
      this.subscribe();
      this.fileModel = new FileModel(
        this.storageModel,
        this.settingsModel,
        this
      );
    }
    /* load function called in constructor */
    get secondaryChannels() {
      return this.info.secondaryChannels.sort(localeCompare);
    }
    get color() {
      const color = this.info.color;
      if ([...Object.values(Colors)].includes(color)) return color;
      return "standard" /* Standard */;
    }
    get messages() {
      const messageIds = this.storageModel.list(
        this.getMessageDirPath()
      );
      if (!Array.isArray(messageIds)) return [];
      const chatMessages = [];
      for (const messageId of messageIds) {
        const messagePath = this.getMessagePath(messageId);
        const chatMessage = this.storageModel.readStringifiable(
          messagePath,
          ChatMessageReference
        );
        if (chatMessage == null) continue;
        chatMessages.push(chatMessage);
      }
      const sorted = chatMessages.sort(
        (a, b) => a.dateSent.localeCompare(b.dateSent)
      );
      return sorted;
    }
    get reactions() {
      const reactionIds = this.storageModel.list(
        this.getReactionDirPath()
      );
      if (!Array.isArray(reactionIds)) return [];
      const reactions = [];
      for (const reactionId of reactionIds) {
        const reactionPath = this.getReactionPath(reactionId);
        const reaction = this.storageModel.readStringifiable(
          reactionPath,
          ChatMessageReactionReference
        );
        if (reaction == null) continue;
        reactions.push(reaction);
      }
      return reactions;
    }
    // utility
    static splitChannel(channelString) {
      return channelString.split("/");
    }
    static {
      this.generateChatInfo = (name, id, color) => {
        const file = FileModel.createFileContent(id, "chat-info");
        return {
          ...file,
          name,
          secondaryChannels: [],
          encryptionKey: "",
          color,
          hasUnreadMessages: false
        };
      };
    }
    static {
      this.createChatMessage = async (channel, senderId, senderName, encryptionKey, body, inlineReplyId, fileContent) => {
        const messageFileContent = FileModel.createFileContent(v4_default(), "message");
        const chatMessage = {
          ...messageFileContent,
          channel,
          senderName,
          senderId,
          body,
          dateSent: createTimestamp(),
          inlineReplyId,
          status: "outbox" /* Outbox */,
          stringifiedFile: ""
        };
        if (fileContent != void 0) {
          const stringifiedFile = stringify(fileContent);
          chatMessage.stringifiedFile = stringifiedFile;
        }
        if (encryptionKey != "") {
          chatMessage.body = await encryptString(
            chatMessage.body,
            encryptionKey
          );
          chatMessage.stringifiedFile = await encryptString(
            chatMessage.stringifiedFile,
            encryptionKey
          );
        }
        return chatMessage;
      };
    }
    static {
      this.createMessageReaction = (messageId, senderId, senderName, content, isDeleting) => {
        const fileContent = FileModel.createFileContent(v4_default(), "reaction");
        const reaction = {
          ...fileContent,
          fileId: _ChatModel.createMessageReactionId(messageId, senderId),
          messageId,
          senderId,
          senderName,
          content,
          isDeleting
        };
        return reaction;
      };
    }
    static {
      this.createMessageReactionId = (messageId, senderId) => {
        return messageId + senderId;
      };
    }
  };
  var ReactionSymbols = /* @__PURE__ */ ((ReactionSymbols2) => {
    ReactionSymbols2["ThumbsUp"] = "\u{1F44D}";
    ReactionSymbols2["Check"] = "\u2705";
    ReactionSymbols2["Stop"] = "\u{1F6D1}";
    ReactionSymbols2["Attention"] = "\u2757\uFE0F";
    ReactionSymbols2["DoubleAttention"] = "\u203C\uFE0F";
    ReactionSymbols2["Question"] = "\u2753";
    return ReactionSymbols2;
  })(ReactionSymbols || {});
  var ChatInfoReference = {
    dataVersion: DATA_VERSION,
    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: "chat-info",
    name: "",
    secondaryChannels: [""],
    encryptionKey: "",
    color: "",
    hasUnreadMessages: true
  };
  var ChatMessageReference = {
    dataVersion: DATA_VERSION,
    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: "message",
    channel: "",
    senderName: "",
    senderId: "",
    body: "",
    dateSent: "",
    status: "",
    stringifiedFile: ""
  };
  var ChatMessageReactionReference = {
    dataVersion: DATA_VERSION,
    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: "reaction",
    messageId: "",
    senderId: "",
    senderName: "",
    content: "",
    isDeleting: false
  };

  // src/Model/Files/fileModel.ts
  var FileModel = class _FileModel {
    // init
    constructor(storageModel2, settingsModel2, chatModel) {
      this.getFileContainerPath = () => {
        return [...this.basePath, "data" /* Data */];
      };
      this.getModelContainerPath = (modelName) => {
        return [...this.basePath, "model" /* Model */, modelName];
      };
      this.getFilePath = (fileId) => {
        return [...this.getFileContainerPath(), fileId];
      };
      this.getFileContentPath = (fileId, fileContentId) => {
        const filePath = this.getFilePath(fileId);
        return [...filePath, fileContentId];
      };
      // handlers
      this.handleStringifiedFileContent = (stringifiedFileContent) => {
        const fileContent = parseValidObject(
          stringifiedFileContent,
          FileContentReference
        );
        if (fileContent == null) return;
        this.handleFileContent(fileContent);
      };
      this.handleFileContent = (fileContent) => {
        console.log(fileContent.type);
        if (fileContent.type == "chat-info") {
          if (checkMatchesObjectStructure(fileContent, ChatInfoReference) == false)
            return;
          this.chatModel.handleInfo(fileContent);
        }
        const didStore = this.storeFileContent(fileContent);
        if (didStore == false) return;
        switch (fileContent.type) {
          case "board-info":
          case "task":
            this.boardsAndTasksModel.handleFileContent(fileContent);
            break;
          case "reaction":
            this.chatModel.handleReaction(fileContent);
            break;
        }
      };
      // methods
      this.addFileContentAndSend = (fileContent) => {
        this.handleFileContent(fileContent);
        this.chatModel.sendMessage("", void 0, fileContent);
      };
      // storage
      this.storeFileContent = (fileContent) => {
        const fileContentPath = this.getFileContentPath(
          fileContent.fileId,
          fileContent.fileContentId
        );
        const existingFileContent = this.storageModel.read(fileContentPath);
        if (existingFileContent != null) return false;
        const stringifiedContent = stringify(fileContent);
        this.storageModel.write(fileContentPath, stringifiedContent);
        return true;
      };
      this.listFileIds = () => {
        return this.storageModel.list(this.basePath);
      };
      this.listFileContentIds = (fileId) => {
        const filePath = this.getFilePath(fileId);
        return this.storageModel.list(filePath);
      };
      this.selectLatestFileContentId = (fileContentIds) => {
        return fileContentIds[fileContentIds.length - 1];
      };
      this.getFileContent = (fileId, fileContentName, reference) => {
        const filePath = this.getFileContentPath(
          fileId,
          fileContentName
        );
        const fileContentOrNull = this.storageModel.readStringifiable(
          filePath,
          reference
        );
        return fileContentOrNull;
      };
      this.getLatestFileContent = (fileId, reference) => {
        const fileContentsIds = this.listFileContentIds(fileId);
        const latestFileContentId = this.selectLatestFileContentId(fileContentsIds);
        if (latestFileContentId == void 0) return null;
        const fileContent = this.getFileContent(
          fileId,
          latestFileContentId,
          reference
        );
        return fileContent;
      };
      this.chatModel = chatModel;
      this.settingsModel = settingsModel2;
      this.storageModel = storageModel2;
      this.boardsAndTasksModel = new BoardsAndTasksModel(
        this.storageModel,
        this.settingsModel,
        chatModel,
        this
      );
    }
    // paths
    get basePath() {
      return StorageModel.getPath(
        "chat" /* Chat */,
        filePaths.chat.files(this.chatModel.id)
      );
    }
    static {
      // utility
      this.generateFileContentId = (creationDate) => {
        return creationDate + v4_default();
      };
    }
    static {
      this.createFileContent = (fileId, type) => {
        const creationDate = createTimestamp();
        const fileContentId = _FileModel.generateFileContentId(creationDate);
        return {
          dataVersion: DATA_VERSION,
          fileId,
          fileContentId,
          creationDate,
          type
        };
      };
    }
  };
  var FileContentReference = {
    dataVersion: DATA_VERSION,
    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: ""
  };

  // src/Model/Files/calendarModel.ts
  var CalendarModel = class {
    // init
    constructor(storageModel2, settingsModel2, fileModel) {
      this.getViewPath = () => {
        return [...this.basePath, "view" /* ModelView */];
      };
      this.getMonthContainerPath = () => {
        return [...this.basePath, "months" /* Months */];
      };
      this.getMonthPath = (monthString) => {
        return [...this.getMonthContainerPath(), monthString];
      };
      // task references
      this.storeTaskReference = (taskFileContent) => {
        if (taskFileContent.date == void 0) return;
        const monthString = isoToMonthString(taskFileContent.date);
        const monthPath = this.getMonthPath(monthString);
        const referencePath = [...monthPath, taskFileContent.fileId];
        this.storageModel.write(referencePath, "");
      };
      this.deleteTaskReference = (monthString, taskId) => {
        const monthPath = this.getMonthPath(monthString);
        const referencePath = [...monthPath, taskId];
        this.storageModel.write(referencePath, "");
      };
      // data
      this.listTaskIds = (monthString) => {
        const monthPath = this.getMonthPath(monthString);
        return this.storageModel.list(monthPath);
      };
      // util
      this.generateMonthGrid = (coreViewModel2, year, month, defaultValueCreator) => {
        const date = coreViewModel2.unwrappedTodayDate;
        const isCurrentMonth = year == date.getFullYear() && month == date.getMonth() + 1;
        date.setDate(1);
        date.setMonth(month - 1);
        date.setFullYear(year);
        const firstWeekdayOfMonth = date.getDay();
        const firstDayOfWeekSetting = parseInt(
          this.settingsModel.firstDayOfWeek
        );
        const offset = firstWeekdayOfMonth < firstDayOfWeekSetting ? 7 - firstDayOfWeekSetting : firstWeekdayOfMonth - firstDayOfWeekSetting;
        date.setMonth(month);
        date.setDate(-1);
        const daysInMonth = date.getDate() + 1;
        const grid = {
          offset,
          firstDayOfWeek: parseInt(this.settingsModel.firstDayOfWeek),
          isCurrentMonth,
          year,
          month,
          days: {}
        };
        for (let i = 0; i < daysInMonth; i++) {
          const paddedDate = padZero((i + 1).toString(), 2);
          grid.days[paddedDate] = defaultValueCreator();
        }
        return grid;
      };
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.fileModel = fileModel;
    }
    // paths
    get basePath() {
      return this.fileModel.getModelContainerPath(
        "calendar" /* ModelCalendar */
      );
    }
  };

  // src/Model/Files/boardsAndTasksModel.ts
  var BoardsAndTasksModel = class _BoardsAndTasksModel {
    // init
    constructor(storageModel2, settingsModel2, chatModel, fileModel) {
      // data
      this.boardHandlerManager = new HandlerManager();
      this.taskHandlerManager = new HandlerManager();
      // paths
      this.getBasePath = () => {
        return this.fileModel.getModelContainerPath("tasks" /* ModelTask */);
      };
      this.getViewPath = () => {
        return [...this.getBasePath(), "view" /* ModelView */];
      };
      this.getBoardFilePath = (boardId) => {
        return [...this.fileModel.getFilePath(boardId)];
      };
      this.getTaskFilePath = (taskId) => {
        return [...this.fileModel.getFilePath(taskId)];
      };
      this.getBoardContainerPath = () => {
        return [...this.getBasePath(), "boards" /* Boards */];
      };
      this.getBoardDirectoryPath = (boardId) => {
        return [...this.getBoardContainerPath(), boardId];
      };
      this.getTaskContainerPath = (boardId) => {
        return [
          ...this.getBoardDirectoryPath(boardId),
          "tasks" /* BoardTasks */
        ];
      };
      this.getTaskReferencePath = (boardId, fileId) => {
        return [...this.getTaskContainerPath(boardId), fileId];
      };
      // handlers
      this.handleFileContent = (fileContent) => {
        if (checkMatchesObjectStructure(
          fileContent,
          BoardInfoFileContentReference
        ) == true) {
          this.handleBoard(fileContent);
        } else if (checkMatchesObjectStructure(
          fileContent,
          TaskFileContentReference
        ) == true) {
          this.handleTask(fileContent);
        }
      };
      this.handleBoard = (boardInfoFileContent) => {
        this.updateBoard(boardInfoFileContent);
      };
      this.handleTask = (taskFileContent) => {
        this.updateTask(taskFileContent);
      };
      // boards
      this.createBoard = (name) => {
        const boardInfoFileContent = _BoardsAndTasksModel.createBoardInfoFileContent(
          v4_default(),
          name,
          "standard" /* Standard */
        );
        return boardInfoFileContent;
      };
      this.updateBoard = (boardInfoFileContent) => {
        this.storeBoard(boardInfoFileContent);
        this.boardHandlerManager.trigger(boardInfoFileContent);
      };
      this.updateBoardAndSend = (boardInfoFileContent) => {
        this.updateBoard(boardInfoFileContent);
        this.chatModel.sendMessage("", void 0, boardInfoFileContent);
      };
      this.storeBoard = (boardInfoFileContent) => {
        this.fileModel.storeFileContent(boardInfoFileContent);
        const boardDirectoryPath = this.getBoardDirectoryPath(
          boardInfoFileContent.fileId
        );
        this.storageModel.write(boardDirectoryPath, "");
      };
      this.deleteBoard = (boardId) => {
        const boardFilePath = this.getBoardFilePath(boardId);
        const boardDirectoryPath = this.getBoardDirectoryPath(boardId);
        this.storageModel.removeRecursively(boardFilePath);
        this.storageModel.removeRecursively(boardDirectoryPath);
      };
      this.listBoardIds = () => {
        const boardContainerPath = this.getBoardContainerPath();
        const boardIds = this.storageModel.list(boardContainerPath);
        return boardIds;
      };
      this.getBoardInfo = (fileId) => {
        const boardInfoFileContentOrNull = this.fileModel.getLatestFileContent(
          fileId,
          BoardInfoFileContentReference
        );
        return boardInfoFileContentOrNull;
      };
      this.getBoardName = (boardId) => {
        const boardInfo = this.getBoardInfo(boardId);
        if (boardInfo == null) return "";
        return boardInfo.name;
      };
      //tasks
      this.createTask = (boardId) => {
        const taskFileContent = _BoardsAndTasksModel.createTaskFileContent(v4_default(), "", boardId);
        return taskFileContent;
      };
      this.updateTask = (taskFileContent) => {
        this.storeTask(taskFileContent);
        this.taskHandlerManager.trigger(taskFileContent);
      };
      this.updateTaskAndSend = (taskFileContent) => {
        this.updateTask(taskFileContent);
        this.chatModel.sendMessage("", void 0, taskFileContent);
      };
      this.storeTask = (taskFileContent) => {
        this.fileModel.storeFileContent(taskFileContent);
        const taskReferencePath = this.getTaskReferencePath(
          taskFileContent.boardId,
          taskFileContent.fileId
        );
        this.storageModel.write(taskReferencePath, "");
        this.calendarModel.storeTaskReference(taskFileContent);
      };
      this.listTaskIds = (boardId) => {
        const taskContainerPath = this.getTaskContainerPath(boardId);
        const fileIds = this.storageModel.list(taskContainerPath);
        return fileIds;
      };
      this.listTaskVersionIds = (taskId) => {
        const versionIds = this.fileModel.listFileContentIds(taskId);
        return versionIds;
      };
      this.getLatestTaskFileContent = (taskId) => {
        const taskFileContentOrNull = this.fileModel.getLatestFileContent(
          taskId,
          TaskFileContentReference
        );
        return taskFileContentOrNull;
      };
      this.getSpecificTaskFileContent = (taskId, versionId) => {
        const taskFileContentOrNull = this.fileModel.getFileContent(
          taskId,
          versionId,
          TaskFileContentReference
        );
        return taskFileContentOrNull;
      };
      this.deleteTask = (boardId, taskId) => {
        const taskFilePath = this.getTaskFilePath(taskId);
        this.storageModel.removeRecursively(taskFilePath);
        this.deleteTaskReference(boardId, taskId);
      };
      this.deleteTaskReference = (boardId, taskId) => {
        const taskReferencePath = this.getTaskReferencePath(
          boardId,
          taskId
        );
        this.storageModel.removeRecursively(taskReferencePath);
      };
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.chatModel = chatModel;
      this.fileModel = fileModel;
      this.calendarModel = new CalendarModel(
        this.storageModel,
        this.settingsModel,
        this.fileModel
      );
    }
    static {
      // utility
      this.createBoardInfoFileContent = (fileId, name, color) => {
        const fileContent = FileModel.createFileContent(fileId, "board-info");
        return {
          ...fileContent,
          name,
          color
        };
      };
    }
    static {
      this.createTaskFileContent = (fileId, name, boardId) => {
        const fileContent = FileModel.createFileContent(
          fileId,
          "task"
        );
        return {
          ...fileContent,
          name,
          boardId
        };
      };
    }
  };
  var BoardInfoFileContentReference = {
    dataVersion: DATA_VERSION,
    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: "board-info",
    name: "",
    color: ""
  };
  var TaskFileContentReference = {
    dataVersion: DATA_VERSION,
    fileId: "string",
    fileContentId: "",
    creationDate: "",
    type: "task",
    name: "",
    boardId: ""
  };

  // src/ViewModel/Pages/taskViewModel.ts
  var TaskViewModel = class extends Context {
    // init
    constructor(coreViewModel2, chatViewModel, boardsAndTasksModel, containingViewModel, task) {
      super("task");
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      this.containingViewModel = containingViewModel;
      this.task = task;
      // paths
      this.getFilePath = () => {
        return this.boardsAndTasksModel.getTaskFilePath(this.task.fileId);
      };
      // state
      this.index = new State(0);
      this.boardId = new State("");
      this.name = new State("");
      this.description = new State("");
      this.category = new State("");
      this.status = new State("");
      this.priority = new State("");
      this.date = new State("");
      this.time = new State("");
      this.isNotNext = new State(true);
      this.selectedVersionId = new State("");
      this.versionIds = new ListState();
      this.isPresentingFullScreenDescription = new State(
        false
      );
      // methods
      this.dragStart = (event) => {
        ViewController.allowDrag(event);
        this.coreViewModel.draggedObject.value = this;
      };
      this.setCategoryAndStatus = (category, status) => {
        if (category != void 0) this.category.value = category;
        if (status != void 0) this.status.value = status;
        this.save();
      };
      this.setBoardId = (boardId) => {
        this.boardId.value = boardId;
        this.save();
      };
      this.setDate = (dateISOString) => {
        this.date.value = dateISOString;
        this.save();
      };
      // view
      this.open = () => {
        this.coreViewModel.context = this;
        this.containingViewModel.selectTask(this);
      };
      this.closeAndDiscard = () => {
        this.close();
        this.loadTaskData();
      };
      this.closeAndSave = () => {
        this.close();
        this.save();
      };
      this.openFullscreenDecription = () => {
        this.isPresentingFullScreenDescription.value = true;
      };
      this.closeFullscreenDecription = () => {
        this.isPresentingFullScreenDescription.value = false;
      };
      this.updateIndex = () => {
        const index = this.containingViewModel.taskIndexManager.getIndex(this);
        this.index.value = index;
      };
      this.updateSuggestions = () => {
        if (this.containingViewModel.taskCategorySuggestions.value.has(
          this.category.value
        ) == false) {
          this.containingViewModel.taskCategorySuggestions.add(
            this.category.value
          );
        }
        if (this.containingViewModel.taskStatusSuggestions.value.has(
          this.status.value
        ) == false) {
          this.containingViewModel.taskStatusSuggestions.add(
            this.status.value
          );
        }
      };
      // settings
      this.save = () => {
        const newTaskFileContent = BoardsAndTasksModel.createTaskFileContent(
          this.task.fileId,
          this.name.value,
          this.task.boardId
        );
        newTaskFileContent.boardId = this.boardId.value;
        newTaskFileContent.description = this.description.value;
        newTaskFileContent.status = this.status.value;
        newTaskFileContent.category = this.category.value;
        newTaskFileContent.priority = this.priority.value;
        newTaskFileContent.date = this.date.value;
        newTaskFileContent.time = this.time.value;
        this.boardsAndTasksModel.updateTaskAndSend(newTaskFileContent);
        this.containingViewModel.showTask(newTaskFileContent);
        this.containingViewModel.updateTaskIndices();
        this.updateSuggestions();
      };
      this.deleteTask = () => {
        this.close();
        this.boardsAndTasksModel.deleteTask(
          this.task.boardId,
          this.task.fileId
        );
        this.containingViewModel.removeTaskFromView(this.task);
      };
      // load
      this.loadVersionIds = () => {
        const versionIds = this.boardsAndTasksModel.listTaskVersionIds(this.task.fileId);
        const sortedVersionIds = versionIds.sort(localeCompare).reverse();
        this.versionIds.clear();
        this.versionIds.add(...sortedVersionIds);
      };
      this.switchVersion = (versionId) => {
        const taskFileContent = this.boardsAndTasksModel.getSpecificTaskFileContent(
          this.task.fileId,
          versionId
        );
        if (taskFileContent == null) return;
        this.task = taskFileContent;
        this.loadTaskData();
      };
      this.loadAllData = () => {
        this.loadTaskData();
        this.loadVersionIds();
        if (this.containingViewModel instanceof CalendarPageViewModel) {
          this.containingViewModel.nextTask.subscribe((nextTask) => {
            this.isNotNext.value = nextTask != this;
          });
        }
      };
      this.loadTaskData = () => {
        this.boardId.value = this.task.boardId;
        this.name.value = this.task.name;
        this.description.value = this.task.description ?? "";
        this.category.value = this.task.category ?? "";
        this.status.value = this.task.status ?? "";
        this.priority.value = this.task.priority ?? "";
        this.date.value = this.task.date ?? "";
        this.time.value = this.task.time ?? "";
        this.updateSuggestions();
      };
      // exit
      this.close = () => {
        this.coreViewModel.closeContext(this.contextId);
      };
      this.handleContextClose = () => {
        this.containingViewModel.closeTask();
      };
      this.loadAllData();
      this.selectedVersionId.subscribeSilent((selectedVersionId) => {
        this.switchVersion(selectedVersionId);
      });
      this.registerKeyStroke("enter" /* Apply */, this.closeAndSave);
      this.registerKeyStroke("backspace" /* CloseOrCancel */, this.closeAndDiscard);
    }
    // util
    get sortingString() {
      const splitDate = this.date.value.split("-");
      const year = padZero(splitDate[0], 4);
      const month = padZero(splitDate[1], 2);
      const date = padZero(splitDate[2], 2);
      const splitTime = this.time.value.split(":");
      const hour = padZero(splitTime[0], 2);
      const minute = padZero(splitTime[1], 2);
      const priorityNumber = parseInt(this.priority.value);
      const invertedPriority = 100 - priorityNumber;
      return year + month + date + hour + minute + invertedPriority + this.name.value;
    }
    static {
      // utility
      this.getStringsForFilter = (taskViewModel) => {
        return [
          taskViewModel.task.name,
          taskViewModel.task.category ?? "",
          taskViewModel.task.status ?? "",
          taskViewModel.task.priority ?? "",
          taskViewModel.task.date ?? "",
          taskViewModel.task.time ?? ""
        ];
      };
    }
  };

  // src/ViewModel/Utility/searchViewModel.ts
  var SearchViewModel = class {
    // init
    constructor(allObjects, matchingObjects, getStringsOfObject, suggestions) {
      this.allObjects = allObjects;
      this.matchingObjects = matchingObjects;
      this.getStringsOfObject = getStringsOfObject;
      this.suggestions = suggestions;
      // state
      this.appliedQuery = new State("");
      this.searchInput = new State("");
      // guards
      this.cannotApplySearch = createProxyState(
        [this.searchInput, this.appliedQuery],
        () => this.searchInput.value == this.appliedQuery.value
      );
      this.cannotClear = createProxyState(
        [this.searchInput],
        () => this.searchInput.value == ""
      );
      this.hasNoSuggestions = createProxyState(
        [this.suggestions],
        () => this.suggestions.value.size == 0
      );
      // methods
      this.search = (searchTerm) => {
        this.searchInput.value = searchTerm;
        this.applySearch();
      };
      this.applySearch = () => {
        this.appliedQuery.value = this.searchInput.value;
        this.matchingObjects.clear();
        for (const object of this.allObjects.value.values()) {
          const doesMatch = this.checkDoesMatchSearch(object);
          if (doesMatch == false) continue;
          this.matchingObjects.add(object);
        }
      };
      this.clear = () => {
        this.searchInput.value = "";
      };
      this.deleteSuggestion = (suggestion) => {
        this.suggestions.remove(suggestion);
      };
      // utility
      this.checkDoesMatchSearch = (object) => {
        return checkDoesObjectMatchSearch(
          this.appliedQuery.value,
          this.getStringsOfObject,
          object
        );
      };
      this.allObjects.handleAddition((newObject) => {
        const doesMatch = this.checkDoesMatchSearch(newObject);
        if (doesMatch == false) {
          this.matchingObjects.remove(newObject);
        } else {
          if (this.matchingObjects.value.has(newObject)) return;
          this.matchingObjects.add(newObject);
          this.allObjects.handleRemoval(newObject, () => {
            this.matchingObjects.remove(newObject);
          });
        }
      });
    }
  };

  // src/ViewModel/Pages/boardViewModel.ts
  var BoardViewModel = class extends TaskContainingPageViewModel {
    // init
    constructor(coreViewModel2, chatViewModel, boardsAndTasksModel, taskPageViewModel, boardInfo) {
      super(coreViewModel2, chatViewModel, boardsAndTasksModel, "board");
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      this.taskPageViewModel = taskPageViewModel;
      this.boardInfo = boardInfo;
      // state
      this.name = new State("");
      this.color = new State("standard" /* Standard */);
      this.index = new State(0);
      this.selectedPage = new State(
        "list" /* List */
      );
      this.isPresentingSettingsModal = new State(false);
      this.isPresentingFilterModal = new State(false);
      this.searchSuggestions = new ListState();
      this.filteredTaskViewModels = new ListState();
      this.pinchToZoomData = new State({
        zoom: 1,
        x: 0,
        y: 0
      });
      // paths
      this.getBasePath = () => {
        return [
          ...this.taskPageViewModel.getBoardViewPath(this.boardInfo.fileId)
        ];
      };
      this.getLastUsedBoardPath = () => {
        return [...this.getBasePath(), "last-used-view" /* LastUsedView */];
      };
      this.getPreviousSearchesPath = () => {
        return [...this.getBasePath(), "previous-searches" /* PreviousSearches */];
      };
      this.getLastSearchPath = () => {
        return [...this.getBasePath(), "last-search" /* LastSearch */];
      };
      // settings
      this.saveSettings = () => {
        const newBoardInfoFileContent = BoardsAndTasksModel.createBoardInfoFileContent(
          this.boardInfo.fileId,
          this.name.value,
          this.color.value
        );
        this.taskPageViewModel.updateBoard(newBoardInfoFileContent);
      };
      this.applyColor = () => {
        this.taskPageViewModel.chatViewModel.setDisplayedColor(
          this.color.value
        );
      };
      this.deleteBoard = () => {
        this.taskPageViewModel.deleteBoard(this.boardInfo);
        this.chatViewModel.taskBoardSuggestions.remove(this.boardInfo.fileId);
        this.close();
      };
      // methods
      this.createTask = () => {
        this.createTaskFromBoardId(this.boardInfo.fileId);
      };
      this.handleDropWithinBoard = (category, status) => {
        const draggedObject = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setCategoryAndStatus(category, status);
      };
      this.handleDropBetweenBoards = () => {
        const draggedObject = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setBoardId(this.boardInfo.fileId);
      };
      // storage
      this.storeLastUsedView = () => {
        const path = this.getLastUsedBoardPath();
        const lastUsedView = this.selectedPage.value;
        this.coreViewModel.storageModel.write(path, lastUsedView);
      };
      this.restoreLastUsedView = () => {
        const path = this.getLastUsedBoardPath();
        const lastUsedView = this.coreViewModel.storageModel.read(path);
        if (lastUsedView == null) return;
        this.selectedPage.value = lastUsedView;
      };
      this.handleNewSearch = (searchTerm) => {
        const suggestionPath = [
          ...this.getPreviousSearchesPath(),
          searchTerm
        ];
        this.coreViewModel.storageModel.write(suggestionPath, "");
        if (!this.searchSuggestions.value.has(searchTerm) && searchTerm != "") {
          this.searchSuggestions.add(searchTerm);
        }
        const lastSearchPath = this.getLastSearchPath();
        this.coreViewModel.storageModel.write(lastSearchPath, searchTerm);
      };
      this.handleSearchRemoved = (searchTerm) => {
        const suggestionPath = [
          ...this.getPreviousSearchesPath(),
          searchTerm
        ];
        this.coreViewModel.storageModel.remove(suggestionPath);
      };
      // view
      this.showTask = (taskFileContent) => {
        if (taskFileContent.boardId != this.boardInfo.fileId) {
          this.boardsAndTasksModel.deleteTaskReference(
            this.boardInfo.fileId,
            taskFileContent.fileId
          );
          this.removeTaskFromView(taskFileContent);
          return;
        }
        const taskViewModel = new TaskViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          taskFileContent
        );
        this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
      };
      this.removeTaskFromView = (taskFileContent) => {
        this.taskViewModels.remove(taskFileContent.fileId);
        this.updateIndex();
      };
      this.select = () => {
        this.taskPageViewModel.selectBoard(this);
      };
      this.close = () => {
        this.taskPageViewModel.closeBoard();
        this.taskPageViewModel.storeLastUsedBoard();
        this.taskViewModels.clear();
      };
      this.showSettings = () => {
        this.isPresentingSettingsModal.value = true;
      };
      this.hideSettings = () => {
        this.saveSettings();
        this.isPresentingSettingsModal.value = false;
      };
      this.showFilterModal = () => {
        this.isPresentingFilterModal.value = true;
      };
      this.hideFilterModal = () => {
        this.isPresentingFilterModal.value = false;
      };
      this.resetFilter = () => {
        this.searchViewModel.search("");
      };
      this.updateIndex = () => {
        const index = this.taskPageViewModel.boardIndexManager.getIndex(this);
        this.index.value = index;
      };
      // load
      this.preloadData = () => {
        this.name.value = this.boardInfo.name;
        this.color.value = this.boardInfo.color;
      };
      this.loadTasks = () => {
        const taskIds = this.boardsAndTasksModel.listTaskIds(
          this.boardInfo.fileId
        );
        for (const taskId of taskIds) {
          if (this.taskViewModels.value.has(taskId)) continue;
          const taskFileContent = this.boardsAndTasksModel.getLatestTaskFileContent(taskId);
          if (taskFileContent == null) continue;
          const taskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent
          );
          this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
        }
        this.updateTaskIndices();
      };
      this.loadSearchSuggestions = () => {
        const dirPath = this.getPreviousSearchesPath();
        const searches = this.coreViewModel.storageModel.list(dirPath);
        this.searchSuggestions.add(...searches.filter((x) => x != ""));
      };
      this.restoreSearch = () => {
        const lastSearchPath = this.getLastSearchPath();
        const lastSearch = this.coreViewModel.storageModel.read(lastSearchPath);
        if (lastSearch != null) {
          this.searchViewModel.search(lastSearch);
        }
      };
      this.loadData = () => {
        this.restoreLastUsedView();
        this.loadTasks();
        this.loadSearchSuggestions();
      };
      // exit
      this.handleContextClose = (fromHistoryEvent) => {
        this.taskPageViewModel.handleBoardClosed(this);
        if (!fromHistoryEvent) return;
        this.taskPageViewModel.storeLastUsedBoard();
      };
      this.preloadData();
      this.isSelected = createProxyState(
        [this.taskPageViewModel.selectedBoardId],
        () => this.taskPageViewModel.selectedBoardId.value == this.boardInfo.fileId
      );
      this.color.subscribe(() => {
        if (this.isSelected.value == false) return;
        if (this.chatViewModel.selectedPage.value != "tasks" /* Tasks */)
          return;
        this.applyColor();
      });
      this.selectedPage.subscribeSilent(() => {
        this.storeLastUsedView();
      });
      boardsAndTasksModel.taskHandlerManager.setHandler(
        this.boardInfo.fileId,
        (taskFileContent) => {
          if (taskFileContent.boardId != this.boardInfo.fileId) return;
          this.showTask(taskFileContent);
          this.updateTaskIndices();
        }
      );
      this.searchViewModel = new SearchViewModel(
        this.taskViewModels,
        this.filteredTaskViewModels,
        TaskViewModel.getStringsForFilter,
        this.searchSuggestions
      );
      this.searchViewModel.appliedQuery.subscribeSilent((newQuery) => {
        this.handleNewSearch(newQuery);
      });
      this.restoreSearch();
      this.searchSuggestions.handleRemovals(this.handleSearchRemoved);
      this.isFilterActive = createProxyState(
        [this.searchViewModel.appliedQuery],
        () => this.searchViewModel.appliedQuery.value != ""
      );
      this.registerKeyStroke("=" /* Filter */, this.showFilterModal);
      this.registerKeyStroke("-" /* Reset */, this.resetFilter);
      this.registerKeyStroke("backspace" /* CloseOrCancel */, this.hideFilterModal);
      this.registerKeyStroke("," /* Settings */, this.showSettings);
      this.registerKeyStroke("enter" /* Apply */, this.hideSettings);
      this.registerKeyStroke("a" /* Create */, this.createTask);
      this.registerKeyStroke(
        "j",
        () => this.selectedPage.value = "list" /* List */
      );
      this.registerKeyStroke(
        "k",
        () => this.selectedPage.value = "kanban" /* Kanban */
      );
      this.registerKeyStroke(
        "l",
        () => this.selectedPage.value = "status-grid" /* StatusGrid */
      );
      this.taskPageViewModel.registerContext(this.boardInfo.fileId, this);
    }
  };

  // src/ViewModel/Pages/taskPageViewModel.ts
  var TaskPageViewModel = class extends ContextHost {
    // init
    constructor(coreViewModel2, chatViewModel, boardsAndTasksModel) {
      super("task-page", coreViewModel2);
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      // data
      this.boardIndexManager = new IndexManager(
        (boardViewModel) => boardViewModel.name.value
      );
      // paths
      this.getBasePath = () => {
        return [...this.boardsAndTasksModel.getViewPath()];
      };
      this.getBoardViewPath = (boardId) => {
        return [...this.getBasePath(), boardId];
      };
      this.getLastUsedBoardPath = () => {
        return [...this.getBasePath(), "last-used-board" /* LastUsedBoard */];
      };
      // state
      this.boardQuery = new State("");
      this.boardViewModels = new MapState();
      this.boardMatches = new ListState();
      this.isShowingBoadList = new State(true);
      this.selectedBoardId = new State(
        void 0
      );
      // guards
      this.cannotCreateBoard = createProxyState(
        [this.boardQuery],
        () => this.boardQuery.value == ""
      );
      // methods
      this.createBoard = () => {
        if (this.cannotCreateBoard.value == true) return;
        const boardInfoFileContent = this.boardsAndTasksModel.createBoard(this.boardQuery.value);
        this.boardQuery.value = "";
        this.showBoardInList(boardInfoFileContent);
        this.boardsAndTasksModel.updateBoardAndSend(boardInfoFileContent);
        this.updateBoardIndices();
      };
      this.updateBoard = (boardInfoFileContent) => {
        this.boardsAndTasksModel.updateBoardAndSend(boardInfoFileContent);
      };
      this.deleteBoard = (boardInfoFileContent) => {
        this.boardsAndTasksModel.deleteBoard(boardInfoFileContent.fileId);
        this.boardViewModels.remove(boardInfoFileContent.fileId);
        this.updateBoardIndices();
      };
      // view
      this.toggleBoardList = () => {
        this.isShowingBoadList.value = !this.isShowingBoadList.value;
      };
      this.showBoardInList = (boardInfo) => {
        const boardViewModel = new BoardViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          boardInfo
        );
        this.boardViewModels.set(boardInfo.fileId, boardViewModel);
        this.chatViewModel.taskBoardSuggestions.set(boardInfo.fileId, [
          boardInfo.fileId,
          this.boardsAndTasksModel.getBoardName(boardInfo.fileId)
        ]);
      };
      this.selectBoard = (boardViewModel) => {
        this.chatViewModel.displayedColor.value = boardViewModel.color.value;
        if (this.selectedBoardId.value == boardViewModel.boardInfo.fileId) {
          this.updateContexts();
          return;
        }
        this.selectedBoardId.value = boardViewModel.boardInfo.fileId;
        this.storeLastUsedBoard();
      };
      this.closeBoard = () => {
        this.closeCurrentContext();
      };
      this.handleBoardClosed = (boardViewModel) => {
        if (boardViewModel.boardInfo.fileId != this.selectedBoardId.value)
          return;
        this.selectedBoardId.value = void 0;
        this.chatViewModel.resetColor();
      };
      this.updateBoardIndices = () => {
        this.boardIndexManager.update([...this.boardViewModels.value.values()]);
        for (const boardViewModel of this.boardViewModels.value.values()) {
          boardViewModel.updateIndex();
        }
      };
      // storage
      this.storeLastUsedBoard = () => {
        const path = this.getLastUsedBoardPath();
        const lastUsedBoardId = this.selectedBoardId.value ?? "";
        this.coreViewModel.storageModel.write(path, lastUsedBoardId);
      };
      this.openLastUsedBoard = () => {
        const path = this.getLastUsedBoardPath();
        const lastUsedBoardId = this.coreViewModel.storageModel.read(path);
        if (lastUsedBoardId == null) return;
        const boardViewModel = this.boardViewModels.value.get(lastUsedBoardId);
        if (boardViewModel == void 0) return;
        this.selectBoard(boardViewModel);
      };
      // load
      this.loadData = () => {
        this.closeCurrentContext();
        const boardIds = this.boardsAndTasksModel.listBoardIds();
        for (const boardId of boardIds) {
          if (this.boardViewModels.value.has(boardId)) continue;
          const boardInfo = this.boardsAndTasksModel.getBoardInfo(boardId);
          if (boardInfo == null) continue;
          this.showBoardInList(boardInfo);
        }
        this.updateBoardIndices();
        this.openLastUsedBoard();
      };
      this.loadData();
      this.chatViewModel = chatViewModel;
      implementFilter(
        this.boardViewModels,
        this.boardMatches,
        this.boardQuery,
        (board) => board.name.value
      );
      this.chatViewModel.registerContext("tasks" /* Tasks */, this);
      this.selectedBoardId.subscribeSilent(this.updateContexts);
      boardsAndTasksModel.boardHandlerManager.setHandler(
        "task-page" + this.chatViewModel.chatModel.id,
        (boardInfoFileContent) => {
          this.showBoardInList(boardInfoFileContent);
          this.updateBoardIndices();
        }
      );
      this.chatViewModel.currentContext.subscribeSilent((context) => {
        if (!this.isOpen) return;
        if (context != this) return;
        this.openLastUsedBoard();
      });
      this.registerKeyStroke("." /* Options */, this.toggleBoardList);
    }
    // context
    get isOpen() {
      return this.chatViewModel.isOpen && this.chatViewModel.selectedPage.value == "tasks" /* Tasks */;
    }
    get contextSelection() {
      return this.selectedBoardId.value;
    }
  };

  // src/ViewModel/Pages/settingsPageViewModel.ts
  var SettingsPageViewModel = class extends Context {
    // init
    constructor(coreViewModel2, chatViewModel) {
      super("settings");
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      // state
      this.name = new State("");
      this.nameInput = new State("");
      this.secondaryChannels = new ListState();
      this.newSecondaryChannelInput = new State("");
      this.encryptionKeyInput = new State("");
      this.shouldShowEncryptionKey = new State(false);
      this.encryptionKeyInputType = createProxyState(
        [this.shouldShowEncryptionKey],
        () => this.shouldShowEncryptionKey.value == true ? "text" : "password"
      );
      this.color = new State("standard" /* Standard */);
      this.appliedColor = new State("standard" /* Standard */);
      // guards
      this.cannotSetPrimaryChannel = createProxyState(
        [this.name, this.nameInput],
        () => this.nameInput.value == "" || this.nameInput.value == this.name.value
      );
      this.cannotSetColor = createProxyState(
        [this.color, this.appliedColor],
        () => this.color.value == this.appliedColor.value
      );
      this.cannotAddSecondaryChannel = createProxyState(
        [this.newSecondaryChannelInput],
        () => this.newSecondaryChannelInput.value == ""
      );
      // methods
      this.setName = () => {
        this.chatViewModel.chatModel.setName(this.nameInput.value);
        this.name.value = this.chatViewModel.chatModel.info.name;
        this.chatViewModel.chatListViewModel.updateIndices();
      };
      this.addSecondaryChannel = () => {
        this.secondaryChannels.add(this.newSecondaryChannelInput.value);
        this.newSecondaryChannelInput.value = "";
        this.storeSecondaryChannels();
        this.loadSecondaryChannels();
      };
      this.removeSecondaryChannel = (secondaryChannel) => {
        this.secondaryChannels.remove(secondaryChannel);
        this.storeSecondaryChannels();
      };
      this.storeSecondaryChannels = () => {
        this.chatViewModel.chatModel.setSecondaryChannels([
          ...this.secondaryChannels.value.values()
        ]);
      };
      this.setEncryptionKey = () => {
        this.chatViewModel.chatModel.setEncryptionKey(
          this.encryptionKeyInput.value
        );
        this.encryptionKeyInput.callSubscriptions();
      };
      this.applyColor = () => {
        this.chatViewModel.setColor(this.color.value);
        this.appliedColor.value = this.color.value;
      };
      this.remove = () => {
        this.chatViewModel.close();
        this.chatViewModel.chatModel.delete();
        this.chatViewModel.chatListViewModel.untrackChat(this.chatViewModel);
      };
      // load
      this.preloadData = () => {
        this.name.value = this.chatViewModel.chatModel.info.name;
        this.color.value = this.chatViewModel.chatModel.color;
        this.appliedColor.value = this.color.value;
      };
      this.updateData = () => {
        this.preloadData();
        this.nameInput.value = this.name.value;
        this.chatViewModel.resetColor();
      };
      this.loadData = () => {
        this.nameInput.value = this.name.value;
        this.loadSecondaryChannels();
        this.encryptionKeyInput.value = this.chatViewModel.chatModel.info.encryptionKey;
      };
      this.loadSecondaryChannels = () => {
        this.secondaryChannels.clear();
        for (const secondaryChannel of this.chatViewModel.chatModel.secondaryChannels) {
          this.secondaryChannels.add(secondaryChannel);
        }
      };
      this.preloadData();
      this.cannotSetEncryptionKey = createProxyState(
        [this.encryptionKeyInput],
        () => this.encryptionKeyInput.value == this.chatViewModel.chatModel.info.encryptionKey
      );
      this.chatViewModel.registerContext("settings" /* Settings */, this);
    }
  };

  // src/ViewModel/Chat/chatMessageViewModel.ts
  var ChatMessageViewModel = class {
    // init
    constructor(coreViewModel2, messagePageViewModel, chatMessage, contact, sentByUser) {
      this.coreViewModel = coreViewModel2;
      this.messagePageViewModel = messagePageViewModel;
      this.contact = contact;
      this.channel = "";
      this.senderId = "";
      this.dateSent = "";
      this.body = new State("");
      this.inlineReply = void 0;
      this.replies = new MapState();
      this.replyCount = createProxyState(
        [this.replies],
        () => this.replies.value.size
      );
      this.status = new State(
        void 0
      );
      this.isHidden = new State(false);
      this.allReactions = new MapState();
      this.userReaction = new State(
        void 0
      );
      this.reactionsThumbsUp = MapState;
      this.reactionsCheck = MapState;
      this.reactionsStop = MapState;
      this.reactionsAttention = MapState;
      this.reactionsDoubleAttention = MapState;
      this.reactionsQuestion = MapState;
      this.generateReactionCountProxyState = (content) => {
        return createProxyState(
          [this.allReactions],
          () => [...this.allReactions.value.values()].filter(
            (x) => x.content == content
          ).length
        );
      };
      this.reactionsThumbsUpCount = this.generateReactionCountProxyState(
        "\u{1F44D}" /* ThumbsUp */
      );
      this.reactionsCheckCount = this.generateReactionCountProxyState(
        "\u2705" /* Check */
      );
      this.reactionsStopCount = this.generateReactionCountProxyState(
        "\u{1F6D1}" /* Stop */
      );
      this.reactionsAttentionCount = this.generateReactionCountProxyState(
        "\u2757\uFE0F" /* Attention */
      );
      this.reactionsDoubleAttentionCount = this.generateReactionCountProxyState(
        "\u203C\uFE0F" /* DoubleAttention */
      );
      this.reactionsQuestionCount = this.generateReactionCountProxyState(
        "\u2753" /* Question */
      );
      // state
      this.isPresentingInfoModal = new State(false);
      // methods
      this.copyMessage = () => {
        navigator.clipboard.writeText(this.body.value);
      };
      this.resendMessage = () => {
        this.messagePageViewModel.sendMessageFromBody(this.body.value);
      };
      this.decryptMessage = () => {
        this.messagePageViewModel.decryptMessage(this);
      };
      this.reply = () => {
        this.messagePageViewModel.setReply(this);
        this.hideInfoModal();
      };
      this.cancelReply = () => {
        if (this.messagePageViewModel.replyingMessage.value != this) return;
        this.messagePageViewModel.setReply(void 0);
      };
      // view
      this.showInfoModal = () => {
        this.isPresentingInfoModal.value = true;
      };
      this.hideInfoModal = () => {
        this.isPresentingInfoModal.value = false;
      };
      this.toggleHiding = () => {
        let hideForReactions = false;
        let hideForReplyView = false;
        const reactionFilter = this.messagePageViewModel.reactionFilter.value;
        if (reactionFilter == void 0) {
          hideForReactions = false;
        } else {
          let count = 0;
          switch (reactionFilter) {
            case "\u{1F44D}" /* ThumbsUp */: {
              count = this.reactionsThumbsUpCount.value;
              break;
            }
            case "\u2705" /* Check */: {
              count = this.reactionsCheckCount.value;
              break;
            }
            case "\u{1F6D1}" /* Stop */: {
              count = this.reactionsStopCount.value;
              break;
            }
            case "\u2757\uFE0F" /* Attention */: {
              count = this.reactionsAttentionCount.value;
              break;
            }
            case "\u203C\uFE0F" /* DoubleAttention */: {
              count = this.reactionsDoubleAttentionCount.value;
              break;
            }
            case "\u2753" /* Question */: {
              count = this.reactionsQuestionCount.value;
              break;
            }
          }
          hideForReactions = count == 0;
        }
        const selectedMessage = this.messagePageViewModel.replyViewSelectedMessage.value;
        if (selectedMessage == void 0) hideForReplyView = false;
        else if (selectedMessage.chatMessage.fileId == this.chatMessage.fileId)
          hideForReplyView = false;
        else if (this.inlineReply != void 0 && selectedMessage.chatMessage.fileId == this.inlineReply.chatMessage.fileId)
          hideForReplyView = false;
        else hideForReplyView = true;
        this.isHidden.value = hideForReactions || hideForReplyView;
      };
      // reactions
      this.handleReaction = (reaction) => {
        if (reaction.isDeleting) {
          this.allReactions.remove(reaction.senderId);
        } else {
          this.allReactions.set(reaction.senderId, reaction);
        }
        if (reaction.senderId != this.coreViewModel.settingsModel.userid)
          return;
        this.userReaction.value = reaction.isDeleting ? void 0 : reaction.content;
      };
      this.sendReaction = (content, isDeleting) => {
        this.messagePageViewModel.sendReaction(
          this.chatMessage.fileId,
          content,
          isDeleting
        );
      };
      // load
      this.loadData = () => {
        this.channel = this.chatMessage.channel;
        this.senderId = this.chatMessage.senderId;
        this.dateSent = new Date(this.chatMessage.dateSent).toLocaleString();
        this.body.value = this.chatMessage.body;
        this.status.value = this.chatMessage.status;
        if (this.chatMessage.inlineReplyId) {
          this.inlineReply = this.messagePageViewModel.chatMessageViewModels.value.get(
            this.chatMessage.inlineReplyId
          );
          this.inlineReply?.replies.set(this.chatMessage.fileId, this);
        }
      };
      this.chatMessage = chatMessage;
      this.sentByUser = sentByUser;
      this.loadData();
      bulkSubscribe(
        [
          this.messagePageViewModel.reactionFilter,
          this.messagePageViewModel.replyViewSelectedMessage,
          this.allReactions
        ],
        this.toggleHiding
      );
      this.toggleHiding();
    }
  };

  // src/ViewModel/Pages/messagePageViewModel.ts
  var MessagePageViewModel = class extends Context {
    // init
    constructor(coreViewModel2, chatViewModel, contactListViewModel2) {
      super("message-page");
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.contactListViewModel = contactListViewModel2;
      // state
      this.chatMessageViewModels = new MapState();
      this.filteredMessageViewModels = new ListState();
      this.replyViewSelectedMessage = new State(void 0);
      this.isReplyViewActive = createProxyState(
        [this.replyViewSelectedMessage],
        () => this.replyViewSelectedMessage.value != void 0
      );
      this.isReplyViewInactive = createProxyState(
        [this.isReplyViewActive],
        () => !this.isReplyViewActive.value
      );
      this.isFilterModalOpen = new State(false);
      this.reactionFilter = new State(void 0);
      this.replyingMessage = new State(
        void 0
      );
      this.composingMessage = new State("");
      this.focusSetter = new State(null);
      // methods
      this.sendMessage = async () => {
        if (this.cannotSendMessage.value == true) return;
        const idPromise = this.sendMessageFromBody(this.composingMessage.value);
        this.composingMessage.value = "";
        const id = await idPromise;
        if (id && this.reactionFilter.value != void 0) {
          this.sendReaction(id, this.reactionFilter.value, false);
        }
      };
      this.sendMessageFromBody = (body) => {
        let replyId = void 0;
        if (this.replyingMessage.value) {
          replyId = this.replyingMessage.value.chatMessage.fileId;
        }
        const id = this.chatViewModel.chatModel.sendMessage(body, replyId);
        if (this.replyViewSelectedMessage.value == void 0)
          this.replyingMessage.value = void 0;
        return id;
      };
      this.decryptMessage = async (messageViewModel) => {
        const chatMessage = messageViewModel.chatMessage;
        await this.chatViewModel.chatModel.decryptMessage(chatMessage);
        this.chatViewModel.chatModel.addMessage(chatMessage);
        messageViewModel.loadData();
      };
      this.sendReaction = (messageId, content, isDeleting) => {
        this.chatViewModel.chatModel.sendReaction(
          messageId,
          content,
          isDeleting
        );
      };
      this.setReply = (chatMessageViewModel, setFocus = true) => {
        this.replyingMessage.value = chatMessageViewModel;
        if (setFocus == false || chatMessageViewModel == void 0) return;
        this.setFocus();
      };
      this.resetReply = (setFocus = true) => {
        this.replyingMessage.value = void 0;
        if (setFocus == false) return;
        this.setFocus();
      };
      // view
      this.showChatMessage = (chatMessage) => {
        const contact = this.contactListViewModel.unwrapContact(
          chatMessage.senderId,
          chatMessage.senderName
        );
        const chatMessageViewModel = new ChatMessageViewModel(
          this.coreViewModel,
          this,
          chatMessage,
          contact,
          chatMessage.senderId == this.chatViewModel.settingsViewModel.settingsModel.userid
        );
        const existingChatMessageViewModel = this.chatMessageViewModels.value.get(chatMessage.fileId);
        if (existingChatMessageViewModel != void 0) {
          existingChatMessageViewModel.body.value = chatMessage.body;
          existingChatMessageViewModel.status.value = chatMessage.status;
        } else {
          this.chatMessageViewModels.set(
            chatMessage.fileId,
            chatMessageViewModel
          );
        }
      };
      this.handleReaction = (reaction) => {
        const messageViewModel = this.chatMessageViewModels.value.get(reaction.messageId);
        if (messageViewModel == void 0) return;
        messageViewModel.handleReaction(reaction);
      };
      this.showFilterModal = () => {
        this.isFilterModalOpen.value = true;
      };
      this.hideFilterModal = () => {
        this.isFilterModalOpen.value = false;
      };
      this.revokeReactionFilter = (persist = true) => {
        this.reactionFilter.value = void 0;
        if (persist) this.chatViewModel.chatModel.storeFilter("");
      };
      this.setReactionFilter = (content) => {
        this.reactionFilter.value = content;
        this.chatViewModel.chatModel.storeFilter(content);
      };
      this.resetFilter = () => {
        this.revokeReactionFilter();
        this.searchViewModel.search("");
      };
      this.setReplyView = (message) => {
        this.replyViewSelectedMessage.value = message;
        this.revokeReactionFilter(false);
        this.setReply(message, false);
      };
      this.resetReplyView = () => {
        this.replyViewSelectedMessage.value = void 0;
        this.resetReply(false);
        this.restoreFilter();
      };
      this.setFocus = () => {
        this.focusSetter.callSubscriptions();
      };
      // load
      this.loadData = () => {
        this.chatMessageViewModels.clear();
        for (const chatMessage of this.chatViewModel.chatModel.messages) {
          this.showChatMessage(chatMessage);
        }
        for (const reaction of this.chatViewModel.chatModel.reactions) {
          this.handleReaction(reaction);
        }
      };
      this.restoreFilter = () => {
        const previousFilter = this.chatViewModel.chatModel.getFilter();
        if (Object.values(ReactionSymbols).includes(previousFilter))
          this.setReactionFilter(previousFilter);
      };
      this.restoreFilter();
      this.cannotSendMessage = createProxyState(
        [
          this.chatViewModel.settingsViewModel.username,
          this.composingMessage
        ],
        () => this.chatViewModel.settingsViewModel.username.value == "" || this.composingMessage.value == ""
      );
      this.searchViewModel = new SearchViewModel(
        this.chatMessageViewModels,
        this.filteredMessageViewModels,
        (chatMessageViewModel) => [chatMessageViewModel.body.value],
        new ListState()
      );
      this.isFilterActive = createProxyState(
        [this.searchViewModel.appliedQuery, this.reactionFilter],
        () => this.searchViewModel.appliedQuery.value != "" || this.reactionFilter.value != void 0
      );
      this.registerKeyStroke("=" /* Filter */, this.showFilterModal);
      this.registerKeyStroke("backspace" /* CloseOrCancel */, () => {
        if (this.isFilterModalOpen.value == true) {
          this.hideFilterModal();
        } else {
          this.replyingMessage.value = void 0;
        }
      });
      this.registerKeyStroke("-" /* Reset */, this.resetFilter);
      this.registerKeyStroke("a" /* Create */, this.setFocus);
      this.chatViewModel.registerContext("messages" /* Messages */, this);
    }
  };

  // src/ViewModel/Chat/chatViewModel.ts
  var ChatViewModel6 = class extends ContextHost {
    // init
    constructor(coreViewModel2, chatModel, settingsViewModel2, notificationViewModel, connectionViewModel2, chatListViewModel2, contactListViewModel2) {
      super("chat", coreViewModel2);
      this.coreViewModel = coreViewModel2;
      this.chatModel = chatModel;
      this.settingsViewModel = settingsViewModel2;
      this.notificationViewModel = notificationViewModel;
      this.connectionViewModel = connectionViewModel2;
      this.chatListViewModel = chatListViewModel2;
      this.contactListViewModel = contactListViewModel2;
      // state
      this.displayedColor = new State("standard" /* Standard */);
      this.selectedPage = new State(
        "messages" /* Messages */
      );
      this.pageContexts = new MapState();
      this.index = new State(0);
      this.hasUnreadMessages = new State(false);
      this.taskBoardSuggestions = new MapState();
      // view
      this.open = () => {
        this.coreViewModel.context = this;
        this.chatListViewModel.openChat(this);
      };
      this.openPage = (page) => {
        this.closeCurrentContext();
        this.selectedPage.value = page;
      };
      this.setColor = (color) => {
        this.setDisplayedColor(color);
        this.chatModel.setColor(color);
      };
      this.setDisplayedColor = (color) => {
        this.displayedColor.value = color;
      };
      this.resetColor = () => {
        this.displayedColor.value = this.settingsPageViewModel.color.value;
      };
      this.updateIndex = () => {
        const index = this.chatListViewModel.chatIndexManager.getIndex(this);
        this.index.value = index;
      };
      // load
      this.loadPageSelection = () => {
        const path = StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.lastUsedPage(this.chatModel.id)
        );
        const lastUsedPage = this.coreViewModel.storageModel.read(path);
        if (lastUsedPage != null) {
          this.openPage(lastUsedPage);
        }
        this.selectedPage.subscribeSilent((newPage) => {
          this.coreViewModel.storageModel.write(path, newPage);
          this.resetColor();
        });
      };
      this.loadInfo = () => {
        this.updateReadStatus();
        this.taskBoardSuggestions.set(CALENDAR_EVENT_BOARD_ID, [
          CALENDAR_EVENT_BOARD_ID,
          this.coreViewModel.translations.chatPage.calendar.eventsBoard
        ]);
      };
      this.updateReadStatus = () => {
        if (this.chatListViewModel.selectedChat.value == this && this.selectedPage.value == "messages" /* Messages */) {
          this.chatModel.setReadStatus(false);
        }
        this.hasUnreadMessages.value = this.chatModel.info.hasUnreadMessages;
      };
      this.setReadStatus = (hasUnreadMessages) => {
        this.chatModel.setReadStatus(hasUnreadMessages);
        this.hasUnreadMessages.value = hasUnreadMessages;
      };
      this.subscribeReadStatus = () => {
        createProxyState(
          [this.selectedPage, this.chatListViewModel.selectedChat],
          () => {
            if (this.chatListViewModel.selectedChat.value != this) return;
            if (this.selectedPage.value != "messages" /* Messages */) return;
            this.setReadStatus(false);
          }
        );
      };
      // exit
      this.close = () => {
        this.coreViewModel.closeContext(this.contextId);
      };
      this.handleContextClose = () => {
        this.chatListViewModel.closeChat();
      };
      this.calendarViewModel = new CalendarPageViewModel(
        coreViewModel2,
        this,
        this.chatModel.fileModel.boardsAndTasksModel.calendarModel,
        this.chatModel.fileModel.boardsAndTasksModel
      );
      this.taskPageViewModel = new TaskPageViewModel(
        this.coreViewModel,
        this,
        this.chatModel.fileModel.boardsAndTasksModel
      );
      this.messagePageViewModel = new MessagePageViewModel(
        this.coreViewModel,
        this,
        this.contactListViewModel
      );
      this.settingsPageViewModel = new SettingsPageViewModel(
        this.coreViewModel,
        this
      );
      chatModel.chatMessageHandlerManager.setHandler(
        this.chatModel.id,
        (chatMessage) => {
          this.messagePageViewModel.showChatMessage(chatMessage);
          this.updateReadStatus();
          this.notificationViewModel.showNotification(chatMessage);
        }
      );
      chatModel.reactionHandlerManager.setHandler(
        this.chatModel.id,
        (reaction) => {
          this.messagePageViewModel.handleReaction(reaction);
        }
      );
      chatModel.changeHandlerManager.setHandler(
        this.chatModel.id,
        this.settingsPageViewModel.updateData
      );
      this.loadPageSelection();
      this.resetColor();
      this.loadInfo();
      this.subscribeReadStatus();
      this.registerKeyStroke(" " /* Home */, this.close);
      this.registerKeyStroke(
        "u",
        () => this.openPage("messages" /* Messages */)
      );
      this.registerKeyStroke("i", () => this.openPage("tasks" /* Tasks */));
      this.registerKeyStroke(
        "o",
        () => this.openPage("calendar" /* Calendar */)
      );
      this.registerKeyStroke(
        "," /* Settings */,
        () => this.openPage("settings" /* Settings */)
      );
      this.chatListViewModel.selectedChat.subscribeSilent(
        this.updateContexts
      );
      this.selectedPage.subscribeSilent(this.updateContexts);
    }
    // context
    get isOpen() {
      return this.chatListViewModel.selectedChat.value == this;
    }
    get contextSelection() {
      return this.selectedPage.value;
    }
  };

  // src/ViewModel/Global/notificationViewModel.ts
  var NotificationViewModel = class {
    // init
    constructor(chatListViewModel2, settingsViewModel2) {
      this.chatListViewModel = chatListViewModel2;
      this.settingsViewModel = settingsViewModel2;
      // data
      this.seenMessageIds = /* @__PURE__ */ new Set();
      this.messagesInMarquee = [];
      this.marquee = new State(void 0);
      this.currentIndex = 0;
      this.interval = void 0;
      // main
      this.showNotification = (message) => {
        if (this.seenMessageIds.has(message.fileId)) return;
        if (this.chatListViewModel.selectedChat.value == void 0) return;
        if (message.senderId == this.settingsViewModel.settingsModel.userid) return;
        const notification = this.createNotification(message);
        const currentChat = this.chatListViewModel.selectedChat.value.chatModel.id;
        const currentPage = this.chatListViewModel.selectedChat.value.selectedPage.value;
        if (notification.fullChannel == currentChat && currentPage == "messages" /* Messages */)
          return;
        this.messagesInMarquee.push(notification);
        this.startLoop();
      };
      this.openNotification = () => {
        const notification = this.marquee.value;
        if (notification == void 0) return;
        const chat = [
          ...this.chatListViewModel.chatViewModels.value.values()
        ].find((chat2) => chat2.chatModel.id == notification.fullChannel);
        if (!chat) return;
        chat.open();
        chat.openPage("messages" /* Messages */);
      };
      // loop
      this.loop = () => {
        if (this.messagesInMarquee.length == 0) {
          this.marquee.value = void 0;
          return this.stopLoop();
        }
        const notification = this.messagesInMarquee.shift();
        if (!notification) return;
        this.seenMessageIds.delete(notification.messageId);
        this.marquee.value = notification;
      };
      this.startLoop = () => {
        if (this.interval != void 0) return;
        this.loop();
        this.interval = setInterval(() => {
          this.loop();
        }, 5e3);
      };
      this.stopLoop = () => {
        clearInterval(this.interval);
        this.interval = void 0;
      };
      this.skipLoop = () => {
        this.stopLoop();
        this.startLoop();
      };
    }
    // util
    createNotification(message) {
      const fullChannel = ChatModel.splitChannel(message.channel)[0];
      const chat = this.chatListViewModel.getDisplayName(fullChannel);
      return {
        messageId: message.fileId,
        chat,
        fullChannel,
        sender: message.senderName,
        body: message.body
      };
    }
  };

  // src/ViewModel/Chat/chatListViewModel.ts
  var ChatListViewModel = class {
    // init
    constructor(coreViewModel2, settingsViewModel2, connectionViewModel2, contactListViewModel2) {
      this.coreViewModel = coreViewModel2;
      this.settingsViewModel = settingsViewModel2;
      this.connectionViewModel = connectionViewModel2;
      this.contactListViewModel = contactListViewModel2;
      // data
      this.chatIndexManager = new IndexManager(
        (chatViewModel) => chatViewModel.settingsPageViewModel.name.value
      );
      // state
      this.newChatPrimaryChannel = new State("");
      this.chatViewModels = new ListState();
      this.selectedChat = new State(
        void 0
      );
      // guards
      this.cannotCreateChat = createProxyState(
        [this.newChatPrimaryChannel],
        () => this.newChatPrimaryChannel.value == ""
      );
      // methods
      this.createChat = () => {
        const chatModel = this.coreViewModel.chatListModel.createChat(
          this.newChatPrimaryChannel.value
        );
        this.newChatPrimaryChannel.value = "";
        const chatViewModel = this.createChatViewModel(chatModel);
        this.trackChat(chatViewModel);
        this.updateIndices();
      };
      this.trackChat = (chatViewModel) => {
        this.chatViewModels.add(chatViewModel);
      };
      this.untrackChat = (chatViewModel) => {
        this.coreViewModel.chatListModel.untrackChat(chatViewModel.chatModel);
        this.chatViewModels.remove(chatViewModel);
      };
      this.createChatViewModel = (chatModel) => {
        return new ChatViewModel6(
          this.coreViewModel,
          chatModel,
          this.settingsViewModel,
          this.notificationViewModel,
          this.connectionViewModel,
          this,
          this.contactListViewModel
        );
      };
      this.updateIndices = () => {
        this.chatIndexManager.update([...this.chatViewModels.value.values()]);
        for (const chatViewModel of this.chatViewModels.value) {
          chatViewModel.updateIndex();
        }
      };
      // view
      this.openChat = (chatViewModel) => {
        this.selectedChat.value = chatViewModel;
        this.notificationViewModel.skipLoop();
      };
      this.closeChat = () => {
        this.selectedChat.value = void 0;
      };
      // load
      this.loadChats = () => {
        this.chatViewModels.clear();
        for (const chatModel of this.coreViewModel.chatListModel.chatModels.values()) {
          const chatViewModel = this.createChatViewModel(chatModel);
          this.trackChat(chatViewModel);
        }
        this.updateIndices();
      };
      // utility
      this.getDisplayName = (fullChannel) => {
        for (const vm of this.chatViewModels.value) {
          const fullReference = vm.chatModel.id;
          if (fullReference == fullChannel) return vm.chatModel.info.name;
        }
        return fullChannel;
      };
      this.notificationViewModel = new NotificationViewModel(this, this.settingsViewModel);
      this.loadChats();
    }
  };

  // src/View/Components/option.tsx
  function Option(text, value, selectedOnCreate) {
    return /* @__PURE__ */ createElement("option", { value, "toggle:selected": selectedOnCreate }, text);
  }
  var StringToOption = (string) => {
    return Option(string, string, false);
  };
  var VersionIdToOption = (versionId) => {
    const [date, rest] = versionId.split("T");
    const [time] = rest.split(".");
    const readableName = `${date} ${time}`;
    return Option(readableName, versionId, false);
  };

  // src/View/Components/homePageButton.tsx
  function HomePageButton(action, label, icon) {
    return /* @__PURE__ */ createElement("button", { class: "tile flex-no", "on:click": action }, /* @__PURE__ */ createElement("span", { class: "icon" }, icon), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, label)));
  }

  // src/View/Components/chatEntry.tsx
  function ChatEntry(chatViewModel) {
    const view = /* @__PURE__ */ createElement(
      "button",
      {
        class: "tile colored-tile chat-entry animate-highlight",
        "set:color": chatViewModel.settingsPageViewModel.color,
        style: "height: 8rem",
        "on:click": chatViewModel.open,
        "toggle:highlight": chatViewModel.hasUnreadMessages
      },
      /* @__PURE__ */ createElement(
        "span",
        {
          class: "shadow",
          "subscribe:innerText": chatViewModel.settingsPageViewModel.name
        }
      ),
      /* @__PURE__ */ createElement(
        "h2",
        {
          "subscribe:innerText": chatViewModel.settingsPageViewModel.name
        }
      )
    );
    chatViewModel.index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }
  var ChatViewModelToChatEntry = (chatViewModel) => {
    return ChatEntry(chatViewModel);
  };

  // src/View/homePage.tsx
  function HomePage(coreViewModel2, storageViewModel2, settingsViewModel2, connectionViewModel2, fileTransferViewModel2, chatListViewModel2) {
    const overviewSection = /* @__PURE__ */ createElement("div", { id: "overview-section" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.homePage.overviewHeadline), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "cell_tower"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.homePage.serverAddress), /* @__PURE__ */ createElement(
      "input",
      {
        list: "previous-connection-list",
        placeholder: coreViewModel2.translations.homePage.serverAddressPlaceholder,
        "bind:value": connectionViewModel2.serverAddressInput,
        "on:enter": connectionViewModel2.connect
      }
    ), /* @__PURE__ */ createElement(
      "datalist",
      {
        hidden: true,
        id: "previous-connection-list",
        "children:append": [
          connectionViewModel2.previousAddresses,
          StringToOption
        ]
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "danger flex justify-center",
        "aria-label": coreViewModel2.translations.homePage.disconnectAudioLabel,
        "on:click": connectionViewModel2.disconnect,
        "toggle:disabled": connectionViewModel2.cannotDisonnect
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "link_off")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex justify-center",
        "aria-label": coreViewModel2.translations.homePage.manageConnectionsAudioLabel,
        "on:click": connectionViewModel2.showConnectionModal,
        "toggle:disabled": connectionViewModel2.hasNoPreviousConnections
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "history")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex justify-center",
        "aria-label": coreViewModel2.translations.homePage.connectAudioLabel,
        "on:click": connectionViewModel2.connect,
        "toggle:disabled": connectionViewModel2.cannotConnect
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "link")
    )), /* @__PURE__ */ createElement("hr", null), HomePageButton(
      settingsViewModel2.showSettingsModal,
      coreViewModel2.translations.homePage.settingsButton,
      "settings"
    ), HomePageButton(
      fileTransferViewModel2.showDirectionSelectionModal,
      coreViewModel2.translations.homePage.transferDataButton,
      "sync_alt"
    ), HomePageButton(
      storageViewModel2.showStorageModal,
      coreViewModel2.translations.homePage.manageStorageButton,
      "hard_drive"
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "on:click": coreViewModel2.update,
        "toggle:hidden": coreViewModel2.noUpdateAvailable
      },
      /* @__PURE__ */ createElement("span", { "subscribe:innerText": coreViewModel2.updateText }),
      /* @__PURE__ */ createElement("span", { class: "icon" }, "update")
    ), /* @__PURE__ */ createElement("div", { class: "mobile-only" }, /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end" }, /* @__PURE__ */ createElement("button", { class: "ghost width-50", "on:click": scrollToChat }, coreViewModel2.translations.homePage.scrollToChatButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")))));
    const chatSection = /* @__PURE__ */ createElement("div", { id: "chat-section" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.homePage.chatsHeadline), /* @__PURE__ */ createElement("div", { class: "flex-row width-input" }, /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: coreViewModel2.translations.homePage.addChatPlaceholder,
        "aria-label": coreViewModel2.translations.homePage.addChatAudioLabel,
        "bind:value": chatListViewModel2.newChatPrimaryChannel,
        "on:enter": chatListViewModel2.createChat
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "aria-label": coreViewModel2.translations.homePage.addChatButton,
        "on:click": chatListViewModel2.createChat,
        "toggle:disabled": chatListViewModel2.cannotCreateChat
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    )), /* @__PURE__ */ createElement(
      "div",
      {
        id: "chat-grid",
        "children:append": [
          chatListViewModel2.chatViewModels,
          ChatViewModelToChatEntry
        ]
      }
    ));
    function scrollToChat() {
      chatSection.scrollIntoView();
    }
    return /* @__PURE__ */ createElement("article", { id: "home-page" }, /* @__PURE__ */ createElement("div", null, overviewSection, chatSection));
  }

  // src/View/Components/ribbonButton.tsx
  function RibbonButton(label, icon, isSelected, select, isHighlighted = new State(false)) {
    return /* @__PURE__ */ createElement(
      "button",
      {
        class: "ribbon-button animate-highlight",
        "aria-label": label,
        "toggle:selected": isSelected,
        "toggle:highlight": isHighlighted,
        "on:click": select
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, icon)
    );
  }

  // src/View/Components/chatViewToggleButton.tsx
  function ChatViewToggleButton(label, icon, page, chatViewModel) {
    function select() {
      chatViewModel.openPage(page);
    }
    const isSelected = createProxyState(
      [chatViewModel.selectedPage],
      () => chatViewModel.selectedPage.value == page
    );
    const isHighlighted = new State(false);
    if (page == "messages" /* Messages */) {
      chatViewModel.hasUnreadMessages.subscribe(
        (hasUnreadMessages) => isHighlighted.value = hasUnreadMessages
      );
    }
    return RibbonButton(label, icon, isSelected, select, isHighlighted);
  }

  // src/View/Components/taskEntry.tsx
  function TaskEntry(taskViewModel) {
    const details = {
      description: taskViewModel.description.value || "---",
      priority_high: taskViewModel.priority.value || "---",
      category: taskViewModel.category.value || "---",
      clock_loader_40: taskViewModel.status.value || "---",
      calendar_month: taskViewModel.date.value || "---",
      schedule: taskViewModel.time.value || "---"
    };
    const className = createProxyState(
      [taskViewModel.isNotNext],
      () => `${taskViewModel.isNotNext.value ? "standard" : "primary"} tile flex-no`
    );
    const view = /* @__PURE__ */ createElement(
      "button",
      {
        draggable: "true",
        "set:class": className,
        style: "user-select: none; -webkit-user-select: none",
        "on:click": taskViewModel.open,
        "on:dragstart": taskViewModel.dragStart
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary", "toggle:hidden": taskViewModel.isNotNext }, taskViewModel.coreViewModel.translations.chatPage.calendar.eventNext, /* @__PURE__ */ createElement("hr", null)), /* @__PURE__ */ createElement(
        "b",
        {
          class: "ellipsis",
          "subscribe:innerText": taskViewModel.name
        }
      ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement(
        "div",
        {
          class: "grid secondary",
          style: "grid-template-columns: repeat(2, 1fr); column-gap: 1rem;  row-gap: .5rem"
        },
        ...Object.entries(details).map((entry) => /* @__PURE__ */ createElement(
          "span",
          {
            class: "flex-row align-center width-100 flex-no clip",
            style: "gap: 1rem"
          },
          /* @__PURE__ */ createElement("span", { class: "icon", style: "font-size: 1.1rem" }, entry[0]),
          /* @__PURE__ */ createElement("span", { class: "ellipsis" }, entry[1])
        ))
      ))
    );
    taskViewModel.index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }
  var TaskViewModelToEntry = (taskViewModel) => {
    return TaskEntry(taskViewModel);
  };

  // src/View/Components/propertyValueList.tsx
  function PropertyValueList(propertyKey, stringEntryObjectConverter, objects, viewBuilder) {
    const propertyValues = new ListState();
    const sortedPropertyValues = createSortedPropertyValueState(propertyValues);
    objects.subscribe(() => {
      collectPropertyValuesToState(
        propertyKey,
        stringEntryObjectConverter,
        objects,
        propertyValues
      );
    });
    return viewBuilder(propertyValues, sortedPropertyValues);
  }
  function collectPropertyValuesToState(propertyKey, stringEntryObjectConverter, objects, propertyValues) {
    const values = collectObjectValuesForKey(
      propertyKey,
      stringEntryObjectConverter,
      [...objects.value.values()]
    );
    for (const existingValue of values) {
      if (propertyValues.value.has(existingValue)) continue;
      propertyValues.add(existingValue);
    }
    for (const displayedValue of propertyValues.value.values()) {
      if (values.includes(displayedValue)) continue;
      propertyValues.remove(displayedValue);
    }
  }
  function createSortedPropertyValueState(propertyValues) {
    return createProxyState(
      [propertyValues],
      () => [...propertyValues.value.values()].sort(localeCompare)
    );
  }
  function createPropertyValueIndexState(sortedKeys, key) {
    return createProxyState(
      [sortedKeys],
      () => sortedKeys.value.indexOf(key)
    );
  }

  // src/View/Components/filteredList.tsx
  function FilteredList(reference, stringEntryObjectConverter, objects, viewBuilder) {
    const matchingObjects = new ListState();
    objects.handleAddition((newObject) => {
      const doesMatch = checkDoesObjectMatchReference(
        reference,
        stringEntryObjectConverter(newObject),
        true
      );
      if (doesMatch == false) return;
      matchingObjects.add(newObject);
      objects.handleRemoval(newObject, () => {
        matchingObjects.remove(newObject);
      });
    });
    return viewBuilder(matchingObjects);
  }

  // src/ViewModel/Utility/taskPropertyBulkChangeViewModel.ts
  var TaskPropertyBulkChangeViewModel = class {
    // init
    constructor(taskViewModels, valueSetter, initialValue) {
      // state
      this.inputValue = new State("");
      // methods
      this.set = () => {
        if (this.cannotSet.value == true) return;
        this.taskViewModels.value.forEach((taskViewModel) => {
          this.setValue(this.inputValue.value, taskViewModel);
        });
      };
      this.taskViewModels = taskViewModels;
      this.inputValue.value = initialValue;
      this.setValue = valueSetter;
      this.cannotSet = createProxyState(
        [this.inputValue],
        () => this.inputValue.value == "" || this.inputValue.value == initialValue
      );
    }
  };
  var TaskCategoryBulkChangeViewModel = class extends TaskPropertyBulkChangeViewModel {
    constructor(taskViewModels, initialValue) {
      super(
        taskViewModels,
        (newCategory, taskViewModel) => {
          taskViewModel.category.value = newCategory;
          taskViewModel.save();
        },
        initialValue
      );
    }
  };
  var TaskStatusBulkChangeViewModel = class extends TaskPropertyBulkChangeViewModel {
    constructor(taskViewModels, initialValue) {
      super(
        taskViewModels,
        (newStatus, taskViewModel) => {
          taskViewModel.status.value = newStatus;
          taskViewModel.save();
        },
        initialValue
      );
    }
  };

  // src/View/ChatPages/boardStatusGridPage.tsx
  function BoardStatusGridPage(coreViewModel2, boardViewModel) {
    const statuses = new ListState();
    const sortedStatuses = createSortedPropertyValueState(statuses);
    boardViewModel.filteredTaskViewModels.subscribe(() => {
      collectPropertyValuesToState(
        "status",
        (taskViewModel) => taskViewModel.task,
        boardViewModel.filteredTaskViewModels,
        statuses
      );
    });
    const statusNameCellConverter = (statusName) => {
      const index = createPropertyValueIndexState(sortedStatuses, statusName);
      return StatusNameCell(coreViewModel2, statusName, index, boardViewModel);
    };
    return /* @__PURE__ */ createElement("div", { class: "status-page-content zoom" }, /* @__PURE__ */ createElement(
      "div",
      {
        class: "status-name-row",
        "children:append": [statuses, statusNameCellConverter]
      }
    ), PropertyValueList(
      "category",
      (taskViewModel) => taskViewModel.task,
      boardViewModel.filteredTaskViewModels,
      (categories, sortedCategories) => {
        const categoryRowConverter = (categoryName) => {
          const index = createPropertyValueIndexState(
            sortedCategories,
            categoryName
          );
          return CategoryRow(
            coreViewModel2,
            categoryName,
            index,
            statuses,
            sortedStatuses,
            boardViewModel
          );
        };
        return /* @__PURE__ */ createElement(
          "div",
          {
            class: "status-grid-wrapper",
            "children:append": [categories, categoryRowConverter]
          }
        );
      }
    ));
  }
  function StatusNameCell(coreViewModel2, statusName, index, boardViewModel) {
    const taskViewModelsWithMatchingStatus = new ListState();
    boardViewModel.filteredTaskViewModels.handleAddition(
      (taskViewModel) => {
        const doesMatchStatus = taskViewModel.task.status == statusName;
        if (doesMatchStatus == false) return;
        taskViewModelsWithMatchingStatus.add(taskViewModel);
        boardViewModel.filteredTaskViewModels.handleRemoval(
          taskViewModel,
          () => {
            taskViewModelsWithMatchingStatus.remove(taskViewModel);
          }
        );
      }
    );
    const viewModel = new TaskStatusBulkChangeViewModel(
      taskViewModelsWithMatchingStatus,
      statusName
    );
    const view = /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement("div", { class: "property-input-wrapper" }, /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: coreViewModel2.translations.chatPage.task.renameStatusInputPlaceholder,
        "bind:value": viewModel.inputValue,
        "on:enter": viewModel.set
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "on:click": viewModel.set,
        "toggle:disabled": viewModel.cannotSet
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )));
    index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }
  function CategoryRow(coreViewModel2, categoryName, index, allStatuses, sortedStatuses, boardViewModel) {
    return FilteredList(
      { category: categoryName },
      (taskViewModel) => taskViewModel.task,
      boardViewModel.filteredTaskViewModels,
      (taskViewModels) => {
        const statusNameConverter = (statusName) => {
          const index2 = createPropertyValueIndexState(
            sortedStatuses,
            statusName
          );
          return StatusColumn(
            categoryName,
            statusName,
            index2,
            boardViewModel,
            taskViewModels
          );
        };
        const viewModel = new TaskCategoryBulkChangeViewModel(
          taskViewModels,
          categoryName
        );
        const view = /* @__PURE__ */ createElement("div", { class: "flex-row flex-no large-gap" }, /* @__PURE__ */ createElement("div", { class: "property-input-wrapper allow-drag-move" }, /* @__PURE__ */ createElement(
          "input",
          {
            placeholder: coreViewModel2.translations.chatPage.task.renameCategoryInputPlaceholder,
            "bind:value": viewModel.inputValue,
            "on:enter": viewModel.set
          }
        ), /* @__PURE__ */ createElement(
          "button",
          {
            class: "primary",
            "on:click": viewModel.set,
            "toggle:disabled": viewModel.cannotSet
          },
          /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
        )), /* @__PURE__ */ createElement(
          "div",
          {
            class: "flex-row large-gap padding-right",
            "children:append": [allStatuses, statusNameConverter]
          }
        ));
        index.subscribe((newIndex) => {
          view.style.order = newIndex;
        });
        return view;
      }
    );
  }
  function StatusColumn(categoryName, statusName, index, boardViewModel, taskViewModelsWithMatchingCategory) {
    const taskViewModels = new ListState();
    taskViewModelsWithMatchingCategory.handleAddition((taskViewModel) => {
      const doesMatchStatus = taskViewModel.status.value == statusName;
      if (doesMatchStatus == false) return;
      taskViewModels.add(taskViewModel);
      taskViewModelsWithMatchingCategory.handleRemoval(taskViewModel, () => {
        taskViewModels.remove(taskViewModel);
      });
    });
    function drop() {
      boardViewModel.handleDropWithinBoard(categoryName, statusName);
    }
    const view = /* @__PURE__ */ createElement(
      "div",
      {
        class: "status-column gap allow-drag-move",
        "on:dragover": ViewController.allowDrop,
        "on:drop": drop,
        "children:append": [taskViewModels, TaskViewModelToEntry]
      }
    );
    index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }

  // src/View/ChatPages/boardKanbanPage.tsx
  function BoardKanbanPage(coreViewModel2, boardViewModel) {
    return PropertyValueList(
      "category",
      (taskViewModel) => taskViewModel.task,
      boardViewModel.filteredTaskViewModels,
      (categories, sortedCategories) => {
        const categoryNameConverter = (categoryName) => {
          const index = createPropertyValueIndexState(
            sortedCategories,
            categoryName
          );
          return Column(
            coreViewModel2,
            categoryName,
            index,
            boardViewModel
          );
        };
        return /* @__PURE__ */ createElement(
          "div",
          {
            class: "kanban-board-wrapper zoom allow-drag-move",
            "children:append": [categories, categoryNameConverter]
          }
        );
      }
    );
  }
  function Column(coreViewModel2, categoryName, index, boardViewModel) {
    return FilteredList(
      { category: categoryName },
      (taskViewModel) => taskViewModel.task,
      boardViewModel.filteredTaskViewModels,
      (taskViewModels) => {
        const viewModel = new TaskCategoryBulkChangeViewModel(
          taskViewModels,
          categoryName
        );
        function drop() {
          boardViewModel.handleDropWithinBoard(categoryName);
        }
        const view = /* @__PURE__ */ createElement(
          "div",
          {
            class: "flex-column flex-no",
            "on:dragover": ViewController.allowDrop,
            "on:drop": drop
          },
          /* @__PURE__ */ createElement("div", { class: "flex-row width-input" }, /* @__PURE__ */ createElement(
            "input",
            {
              placeholder: coreViewModel2.translations.chatPage.task.renameCategoryInputPlaceholder,
              "bind:value": viewModel.inputValue,
              "on:enter": viewModel.set
            }
          ), /* @__PURE__ */ createElement(
            "button",
            {
              class: "primary",
              "on:click": viewModel.set,
              "toggle:disabled": viewModel.cannotSet
            },
            /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
          )),
          /* @__PURE__ */ createElement("hr", null),
          /* @__PURE__ */ createElement(
            "div",
            {
              class: "kanban-column",
              "children:append": [taskViewModels, TaskViewModelToEntry]
            }
          )
        );
        index.subscribe((newIndex) => {
          view.style.order = newIndex;
        });
        return view;
      }
    );
  }

  // src/View/Components/dangerousActionButton.tsx
  function DangerousActionButton(coreViewModel2, label, icon, action) {
    const isActionRequested = new State(false);
    const cannotConfirm = createProxyState(
      [isActionRequested],
      () => isActionRequested.value == false
    );
    function requestAction() {
      isActionRequested.value = true;
    }
    function abort() {
      isActionRequested.value = false;
    }
    return /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement("button", { class: "flex", "on:click": abort, "toggle:hidden": cannotConfirm }, coreViewModel2.translations.general.abortButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "undo")), /* @__PURE__ */ createElement(
      "button",
      {
        class: "danger flex",
        "on:click": requestAction,
        "toggle:hidden": isActionRequested
      },
      label,
      /* @__PURE__ */ createElement("span", { class: "icon" }, icon)
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "danger flex",
        "on:click": action,
        "toggle:hidden": cannotConfirm
      },
      coreViewModel2.translations.general.confirmButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "warning")
    ));
  }

  // src/View/Modals/taskSettingsModal.tsx
  function TaskSettingsModal(coreViewModel2, taskViewModel) {
    const categorySuggestionId = v4_default();
    const statusSuggestionId = v4_default();
    const BoardOptionConverter = (entry) => {
      const isSelected = entry[0] == taskViewModel.task.boardId;
      return Option(entry[1], entry[0], isSelected);
    };
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal task-settings",
        open: true,
        "toggle:full-description": taskViewModel.isPresentingFullScreenDescription
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", { id: "standard-main" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.chatPage.task.taskSettingsHeadline), /* @__PURE__ */ createElement("div", { class: "column-wrapper" }, /* @__PURE__ */ createElement("div", { class: "flex-column" }, /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "label"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskNameLabel), /* @__PURE__ */ createElement(
        "input",
        {
          "bind:value": taskViewModel.name
        }
      ))), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "category"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskBoardLabel), /* @__PURE__ */ createElement(
        "select",
        {
          "bind:value": taskViewModel.boardId,
          "children:append": [
            taskViewModel.chatViewModel.taskBoardSuggestions,
            BoardOptionConverter
          ]
        }
      ), /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_drop_down"))), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "description"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskDescriptionLabel), /* @__PURE__ */ createElement(
        "textarea",
        {
          rows: "10",
          "bind:value": taskViewModel.description
        }
      ))), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "width-50",
          "on:click": taskViewModel.openFullscreenDecription
        },
        coreViewModel2.translations.general.fullscreenButton,
        /* @__PURE__ */ createElement("span", { class: "icon" }, "fullscreen")
      ))), /* @__PURE__ */ createElement("hr", { class: "mobile-only" }), /* @__PURE__ */ createElement("div", { class: "flex-column" }, /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "category"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskCategoryLabel), /* @__PURE__ */ createElement(
        "input",
        {
          "bind:value": taskViewModel.category,
          list: categorySuggestionId
        }
      ))), /* @__PURE__ */ createElement(
        "datalist",
        {
          hidden: true,
          id: categorySuggestionId,
          "children:append": [
            taskViewModel.containingViewModel.taskCategorySuggestions,
            StringToOption
          ]
        }
      ), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "clock_loader_40"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskStatusLabel), /* @__PURE__ */ createElement(
        "input",
        {
          "bind:value": taskViewModel.status,
          list: statusSuggestionId
        }
      ))), /* @__PURE__ */ createElement(
        "datalist",
        {
          hidden: true,
          id: statusSuggestionId,
          "children:append": [
            taskViewModel.containingViewModel.taskStatusSuggestions,
            StringToOption
          ]
        }
      ), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "priority_high"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskPriorityLabel), /* @__PURE__ */ createElement(
        "input",
        {
          type: "number",
          "bind:value": taskViewModel.priority
        }
      ))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "calendar_month"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskDateLabel), /* @__PURE__ */ createElement(
        "input",
        {
          type: "date",
          "bind:value": taskViewModel.date
        }
      ))), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "schedule"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskTimeLabel), /* @__PURE__ */ createElement(
        "input",
        {
          type: "time",
          "bind:value": taskViewModel.time
        }
      ))))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "history"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.general.fileVersionLabel), /* @__PURE__ */ createElement(
        "select",
        {
          "bind:value": taskViewModel.selectedVersionId,
          "children:append": [
            taskViewModel.versionIds,
            VersionIdToOption
          ]
        }
      ), /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_drop_down"))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "width-input" }, DangerousActionButton(
        coreViewModel2,
        coreViewModel2.translations.chatPage.task.deleteTaskButton,
        "delete_forever",
        taskViewModel.deleteTask
      ))), /* @__PURE__ */ createElement("main", { id: "fullscreen-main" }, /* @__PURE__ */ createElement(
        "textarea",
        {
          style: "height: 100%; width: 100%; max-width: unset",
          "bind:value": taskViewModel.description
        }
      )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100", id: "fullscreen-exit" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "flex",
          "on:click": taskViewModel.closeFullscreenDecription
        },
        coreViewModel2.translations.general.exitButton,
        /* @__PURE__ */ createElement("span", { class: "icon" }, "fullscreen_exit")
      )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100", id: "controls" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "flex",
          "on:click": taskViewModel.closeAndDiscard
        },
        coreViewModel2.translations.general.closeButton
      ), /* @__PURE__ */ createElement(
        "button",
        {
          class: "flex primary",
          "on:click": taskViewModel.closeAndSave
        },
        coreViewModel2.translations.general.saveButton,
        /* @__PURE__ */ createElement("span", { class: "icon" }, "save")
      )))
    );
  }

  // src/View/Components/deletableListItem.tsx
  function DeletableListItem(coreViewModel2, text, primaryButton, ondelete) {
    return /* @__PURE__ */ createElement("div", { class: "tile flex-row justify-apart align-center padding-0" }, /* @__PURE__ */ createElement("span", { class: "padding-h ellipsis" }, text), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end" }, primaryButton, /* @__PURE__ */ createElement(
      "button",
      {
        class: "danger",
        "aria-label": coreViewModel2.translations.general.deleteItemButtonAudioLabel,
        "on:click": ondelete
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "delete")
    )));
  }

  // src/View/Modals/searchModal.tsx
  function SearchModal(coreViewModel2, searchViewModel, headline, isOpen) {
    function close() {
      isOpen.value = false;
    }
    const suggestionId = v4_default();
    isOpen.subscribe((isOpen2) => {
      if (!isOpen2) return;
      ViewController.setFocusWithDelay();
    });
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isOpen, extended: true }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, headline), /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement(
      "input",
      {
        id: "focused",
        style: "max-width: unset",
        placeholder: coreViewModel2.translations.general.searchLabel,
        "bind:value": searchViewModel.searchInput,
        "on:enter": searchViewModel.applySearch,
        list: suggestionId
      }
    ), /* @__PURE__ */ createElement(
      "datalist",
      {
        hidden: true,
        id: suggestionId,
        "children:append": [
          searchViewModel.suggestions,
          StringToOption
        ]
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "standard",
        "aria-label": coreViewModel2.translations.general.searchButtonClearAudioLabel,
        "on:click": searchViewModel.clear,
        "toggle:disabled": searchViewModel.cannotClear
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "close")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "aria-label": coreViewModel2.translations.general.searchButtonAudioLabel,
        "on:click": searchViewModel.applySearch,
        "toggle:disabled": searchViewModel.cannotApplySearch
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "search")
    )), /* @__PURE__ */ createElement("div", { "toggle:hidden": searchViewModel.hasNoSuggestions }, /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.general.searchSuggestionsLabel), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap",
        "children:append": [
          searchViewModel.suggestions,
          (suggestion) => SuggestionView(
            suggestion,
            searchViewModel,
            coreViewModel2
          )
        ]
      }
    ))), /* @__PURE__ */ createElement("button", { "on:click": close }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close"))));
  }
  function SuggestionView(suggestion, searchViewModel, coreViewModel2) {
    const isApplied = createProxyState(
      [searchViewModel.appliedQuery],
      () => searchViewModel.appliedQuery.value == suggestion
    );
    function deleteSuggestion() {
      searchViewModel.deleteSuggestion(suggestion);
    }
    function applySuggestion() {
      searchViewModel.search(suggestion);
    }
    return DeletableListItem(
      coreViewModel2,
      suggestion,
      /* @__PURE__ */ createElement(
        "button",
        {
          class: "primary",
          "aria-label": coreViewModel2.translations.general.applyButton,
          "on:click": applySuggestion,
          "toggle:disabled": isApplied
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
      ),
      deleteSuggestion
    );
  }

  // src/View/Components/colorPicker.tsx
  function ColorPicker(selectedColor) {
    return /* @__PURE__ */ createElement("div", { class: "flex-row gap width-input" }, ...Object.values(Colors).map((color) => {
      const isSelected = createProxyState(
        [selectedColor],
        () => selectedColor.value == color
      );
      function setColor() {
        selectedColor.value = color;
      }
      return /* @__PURE__ */ createElement(
        "button",
        {
          color,
          class: "fill-color width-100 flex",
          style: "height: 2rem",
          "toggle:selected": isSelected,
          "on:click": setColor
        }
      );
    }));
  }

  // src/View/Modals/boardSettingsModal.tsx
  function BoardSettingsModal(coreViewModel2, boardViewModel) {
    boardViewModel.isPresentingSettingsModal.subscribe(
      ViewController.setFocusWithDelay
    );
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": boardViewModel.isPresentingSettingsModal
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.chatPage.task.boardSettingsHeadline), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "label"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.boardNameInputLabel), /* @__PURE__ */ createElement(
        "input",
        {
          id: "focused",
          "on:enter": boardViewModel.saveSettings,
          "bind:value": boardViewModel.name
        }
      ))), /* @__PURE__ */ createElement("hr", null), ColorPicker(boardViewModel.color), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "width-input" }, DangerousActionButton(
        coreViewModel2,
        coreViewModel2.translations.chatPage.task.deleteBoardButton,
        "delete_forever",
        boardViewModel.deleteBoard
      ))), /* @__PURE__ */ createElement("button", { "on:click": boardViewModel.hideSettings }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close")))
    );
  }

  // src/View/Components/boardViewToggleButton.tsx
  function BoardViewToggleButton(label, icon, page, boardViewModel) {
    function select() {
      boardViewModel.selectedPage.value = page;
    }
    const isSelected = createProxyState(
      [boardViewModel.selectedPage],
      () => boardViewModel.selectedPage.value == page
    );
    return RibbonButton(label, icon, isSelected, select);
  }

  // src/View/ChatPages/boardPage.tsx
  function BoardPage(coreViewModel2, boardViewModel) {
    boardViewModel.loadData();
    const persistenceId = boardViewModel.boardInfo.fileId;
    const pages = ViewController.boardPages.setState(
      persistenceId,
      () => createProxyState([boardViewModel.selectedPage], () => {
        switch (boardViewModel.selectedPage.value) {
          case "kanban" /* Kanban */: {
            return BoardKanbanPage(coreViewModel2, boardViewModel);
          }
          case "status-grid" /* StatusGrid */: {
            return BoardStatusGridPage(coreViewModel2, boardViewModel);
          }
          default: {
            return /* @__PURE__ */ createElement(
              "div",
              {
                class: "task-grid",
                "children:append": [
                  boardViewModel.filteredTaskViewModels,
                  TaskViewModelToEntry
                ]
              }
            );
          }
        }
      })
    );
    const wrapper = /* @__PURE__ */ createElement(
      "div",
      {
        class: "content main-content allow-drag-move",
        "children:set": pages
      }
    );
    implementPinchZoom(wrapper, boardViewModel.pinchToZoomData);
    const taskSettingsModal = createProxyState(
      [boardViewModel.selectedTaskViewModel],
      () => {
        if (boardViewModel.selectedTaskViewModel.value == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          ViewController.setFocusWithDelay();
          return TaskSettingsModal(
            coreViewModel2,
            boardViewModel.selectedTaskViewModel.value
          );
        }
      }
    );
    return /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost board-close-button",
        "aria-label": coreViewModel2.translations.chatPage.task.closeBoardButtonAudioLabel,
        "on:click": boardViewModel.close
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_back")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost board-toggle-button inset-outline",
        "aria-label": coreViewModel2.translations.chatPage.task.toggleBoardButtonAudioLabel,
        "on:click": boardViewModel.taskPageViewModel.toggleBoardList,
        "toggle:selected": boardViewModel.taskPageViewModel.isShowingBoadList
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "dock_to_right")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.task.boardSettingsHeadline,
        "on:click": boardViewModel.showSettings
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "settings")
    )), /* @__PURE__ */ createElement("span", { class: "scroll-h ribbon" }, BoardViewToggleButton(
      coreViewModel2.translations.chatPage.task.listViewButtonAudioLabel,
      "view_list",
      "list" /* List */,
      boardViewModel
    ), BoardViewToggleButton(
      coreViewModel2.translations.chatPage.task.kanbanViewButtonAudioLabel,
      "view_kanban",
      "kanban" /* Kanban */,
      boardViewModel
    ), BoardViewToggleButton(
      coreViewModel2.translations.chatPage.task.statusViewButtonAudioLabel,
      "grid_view",
      "status-grid" /* StatusGrid */,
      boardViewModel
    )), /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost inset-outline",
        "aria-label": coreViewModel2.translations.chatPage.task.filterTasksButtonAudioLabel,
        "on:click": boardViewModel.showFilterModal,
        "toggle:selected": boardViewModel.isFilterActive
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "filter_alt")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.task.createTaskButtonAudioLabel,
        "on:click": boardViewModel.createTask
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    ))), wrapper, BoardSettingsModal(coreViewModel2, boardViewModel), SearchModal(
      coreViewModel2,
      boardViewModel.searchViewModel,
      coreViewModel2.translations.chatPage.task.filterTasksHeadline,
      boardViewModel.isPresentingFilterModal
    ), /* @__PURE__ */ createElement("div", { "children:set": taskSettingsModal }));
  }

  // src/View/Components/placeholderView.tsx
  function PlaceholderView(text) {
    return /* @__PURE__ */ createElement("div", { class: "width-100 height-100 flex-column justify-center align-center" }, /* @__PURE__ */ createElement("span", { class: "secondary slide-up" }, text));
  }

  // src/View/Components/newItemEntry.tsx
  function NewItemEntry(coreViewModel2, query, fn) {
    const isHidden = createProxyState([query], () => query.value == "");
    const label = createProxyState(
      [query],
      () => coreViewModel2.translations.general.createLabel(query.value)
    );
    return /* @__PURE__ */ createElement(
      "button",
      {
        class: "standard slide-up",
        "toggle:hidden": isHidden,
        "on:click": fn
      },
      /* @__PURE__ */ createElement("span", { "subscribe:innerText": label }),
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    );
  }

  // src/View/Components/boardEntry.tsx
  function BoardEntry(boardViewModel) {
    const view = /* @__PURE__ */ createElement(
      "button",
      {
        "set:color": boardViewModel.color,
        class: "tile colored-tile slide-up",
        "toggle:selected": boardViewModel.isSelected,
        "on:click": boardViewModel.select,
        "on:dragover": ViewController.allowDrop,
        "on:drop": boardViewModel.handleDropBetweenBoards
      },
      /* @__PURE__ */ createElement(
        "span",
        {
          class: "shadow",
          "subscribe:innerText": boardViewModel.name
        }
      ),
      /* @__PURE__ */ createElement("b", { "subscribe:innerText": boardViewModel.name })
    );
    boardViewModel.index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }
  var BoardViewModelToEntry = (boardViewModel) => {
    return BoardEntry(boardViewModel);
  };

  // src/View/ChatPages/taskPage.tsx
  function TaskPage(coreViewModel2, taskPageViewModel) {
    taskPageViewModel.loadData();
    const isShowingBoard = createProxyState(
      [taskPageViewModel.selectedBoardId],
      () => taskPageViewModel.selectedBoardId.value != void 0
    );
    const persistenceId = taskPageViewModel.chatViewModel.chatModel.id;
    const pages = ViewController.taskPages.setState(
      persistenceId,
      () => createProxyState([taskPageViewModel.selectedBoardId], () => {
        const selectedBoardId = taskPageViewModel.selectedBoardId.value;
        if (selectedBoardId == void 0) {
          return PlaceholderView(
            coreViewModel2.translations.chatPage.task.noBoardSelected
          );
        }
        const selectedBoard = taskPageViewModel.boardViewModels.value.get(selectedBoardId);
        if (selectedBoard == void 0) {
          return /* @__PURE__ */ createElement("div", { class: "pane align-center justify-center" }, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.chatPage.task.boardNotFound));
        }
        return BoardPage(coreViewModel2, selectedBoard);
      })
    );
    return /* @__PURE__ */ createElement(
      "div",
      {
        id: "task-page",
        "toggle:isshowingboard": isShowingBoard,
        "set:showingboardlist": taskPageViewModel.isShowingBoadList
      },
      /* @__PURE__ */ createElement(
        "div",
        {
          id: "board-list",
          class: "pane-wrapper side background",
          "set:color": taskPageViewModel.chatViewModel.displayedColor
        },
        /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("div", { class: "flex-row width-input" }, /* @__PURE__ */ createElement(
          "input",
          {
            class: "no-outline",
            "bind:value": taskPageViewModel.boardQuery,
            "on:enter": taskPageViewModel.createBoard,
            placeholder: coreViewModel2.translations.general.filterOrCreateLabel
          }
        ))), /* @__PURE__ */ createElement("div", { class: "content gap" }, NewItemEntry(
          coreViewModel2,
          taskPageViewModel.boardQuery,
          taskPageViewModel.createBoard
        ), /* @__PURE__ */ createElement(
          "div",
          {
            class: "grid gap",
            style: "grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))",
            "children:append": [
              taskPageViewModel.boardMatches,
              BoardViewModelToEntry
            ]
          }
        )))
      ),
      /* @__PURE__ */ createElement(
        "div",
        {
          id: "board-content",
          class: "pane-wrapper",
          "children:set": pages
        }
      )
    );
  }

  // src/View/ChatPages/settingsPage.tsx
  function SettingsPage(coreViewModel2, settingsPageViewModel) {
    settingsPageViewModel.loadData();
    const secondaryChannelConverter = (secondaryChannel) => {
      return DeletableListItem(
        coreViewModel2,
        secondaryChannel,
        /* @__PURE__ */ createElement("span", null),
        () => {
          settingsPageViewModel.removeSecondaryChannel(secondaryChannel);
        }
      );
    };
    return /* @__PURE__ */ createElement("div", { id: "settings-page" }, /* @__PURE__ */ createElement("div", { class: "pane-wrapper" }, /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("span", { class: "title" }, coreViewModel2.translations.chatPage.settings.settingsHeadline)), /* @__PURE__ */ createElement("div", { class: "content" }, /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "forum"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.settings.nameLabel), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": settingsPageViewModel.nameInput,
        "on:enter": settingsPageViewModel.setName
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end width-input" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-50",
        "aria-label": coreViewModel2.translations.chatPage.settings.setNameButtonAudioLabel,
        "on:click": settingsPageViewModel.setName,
        "toggle:disabled": settingsPageViewModel.cannotSetPrimaryChannel
      },
      coreViewModel2.translations.general.setButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-row width-input margin-bottom" }, /* @__PURE__ */ createElement(
      "input",
      {
        "aria-label": coreViewModel2.translations.chatPage.settings.newSecondaryChannelAudioLabel,
        placeholder: coreViewModel2.translations.chatPage.settings.newSecondaryChannelPlaceholder,
        "bind:value": settingsPageViewModel.newSecondaryChannelInput,
        "on:enter": settingsPageViewModel.addSecondaryChannel
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "aria-label": coreViewModel2.translations.chatPage.settings.addSecondaryChannelButtonAudioLabel,
        "on:click": settingsPageViewModel.addSecondaryChannel,
        "toggle:disabled": settingsPageViewModel.cannotAddSecondaryChannel
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    )), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap width-input",
        "children:append": [
          settingsPageViewModel.secondaryChannels,
          secondaryChannelConverter
        ]
      }
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.settings.encryptionKeyLabel), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": settingsPageViewModel.encryptionKeyInput,
        "on:enter": settingsPageViewModel.setEncryptionKey,
        "set:type": settingsPageViewModel.encryptionKeyInputType
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end width-input" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-50",
        "aria-label": coreViewModel2.translations.chatPage.settings.setEncryptionKeyButtonAudioLabel,
        "on:click": settingsPageViewModel.setEncryptionKey,
        "toggle:disabled": settingsPageViewModel.cannotSetEncryptionKey
      },
      coreViewModel2.translations.general.setButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )), /* @__PURE__ */ createElement("label", { class: "inline" }, /* @__PURE__ */ createElement(
      "input",
      {
        type: "checkbox",
        "bind:checked": settingsPageViewModel.shouldShowEncryptionKey
      }
    ), coreViewModel2.translations.chatPage.settings.showEncryptionKey), /* @__PURE__ */ createElement("hr", null), ColorPicker(settingsPageViewModel.color), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end width-input" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-50",
        "aria-label": coreViewModel2.translations.chatPage.settings.setColorButtonAudioLabel,
        "on:click": settingsPageViewModel.applyColor,
        "toggle:disabled": settingsPageViewModel.cannotSetColor
      },
      coreViewModel2.translations.general.setButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "width-input" }, DangerousActionButton(
      coreViewModel2,
      coreViewModel2.translations.chatPage.settings.deleteChatButton,
      "chat_error",
      settingsPageViewModel.remove
    ))))));
  }

  // src/View/Components/messageReactionFilterButton.tsx
  function MessageReactionFilterButton(messagePageViewModel, content) {
    const select = () => {
      messagePageViewModel.setReactionFilter(content);
    };
    const isSelected = createProxyState(
      [messagePageViewModel.reactionFilter],
      () => messagePageViewModel.reactionFilter.value == content
    );
    return /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex justify-center",
        "on:click": select,
        "toggle:selected": isSelected
      },
      content
    );
  }

  // src/View/Modals/messageFilterModal.tsx
  function MessageFilterModal(coreViewModel2, messagePageViewModel, converter) {
    const noFilter = createProxyState(
      [messagePageViewModel.reactionFilter],
      () => messagePageViewModel.reactionFilter.value == void 0
    );
    messagePageViewModel.isFilterModalOpen.subscribe((isOpen) => {
      if (isOpen == false) return;
      ViewController.setFocusWithDelay();
    });
    createProxyState([messagePageViewModel.isFilterModalOpen], () => {
      if (messagePageViewModel.isFilterModalOpen.value == false) return;
      ViewController.setFocusWithDelay();
    });
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": messagePageViewModel.isFilterModalOpen }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.chatPage.message.messageFilterHeadline), /* @__PURE__ */ createElement("div", { class: "flex-row width-input" }, /* @__PURE__ */ createElement(
      "input",
      {
        id: "focused",
        placeholder: coreViewModel2.translations.general.searchLabel,
        "bind:value": messagePageViewModel.searchViewModel.searchInput,
        "on:enter": messagePageViewModel.searchViewModel.applySearch
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "aria-label": coreViewModel2.translations.general.searchButtonAudioLabel,
        "on:click": messagePageViewModel.searchViewModel.applySearch,
        "toggle:disabled": messagePageViewModel.searchViewModel.cannotApplySearch
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "search")
    )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.chatPage.message.messageFilterReactionsHadline), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, /* @__PURE__ */ createElement(
      "button",
      {
        "toggle:selected": noFilter,
        "on:click": messagePageViewModel.revokeReactionFilter
      },
      coreViewModel2.translations.chatPage.message.messageFilterAllReactionsButton
    ), /* @__PURE__ */ createElement("div", { class: "grid gap message-reaction-filter" }, MessageReactionFilterButton(
      messagePageViewModel,
      "\u{1F44D}" /* ThumbsUp */
    ), MessageReactionFilterButton(
      messagePageViewModel,
      "\u2705" /* Check */
    ), MessageReactionFilterButton(
      messagePageViewModel,
      "\u{1F6D1}" /* Stop */
    ), MessageReactionFilterButton(
      messagePageViewModel,
      "\u2757\uFE0F" /* Attention */
    ), MessageReactionFilterButton(
      messagePageViewModel,
      "\u203C\uFE0F" /* DoubleAttention */
    ), MessageReactionFilterButton(
      messagePageViewModel,
      "\u2753" /* Question */
    )))), /* @__PURE__ */ createElement("button", { "on:click": messagePageViewModel.hideFilterModal }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close"))));
  }

  // src/View/Components/replyPreview.tsx
  function ReplyPreview(coreViewModel2, chatMessageViewModel) {
    return /* @__PURE__ */ createElement("div", { class: "reply-preview" }, /* @__PURE__ */ createElement("div", { class: "surface blur" }, /* @__PURE__ */ createElement(
      "span",
      {
        class: "secondary",
        "subscribe:innerText": chatMessageViewModel.contact.name
      }
    ), /* @__PURE__ */ createElement(
      "b",
      {
        class: "ellipsis",
        "subscribe:innerText": chatMessageViewModel.body
      }
    )), /* @__PURE__ */ createElement(
      "button",
      {
        class: "standard square blur",
        "on:click": chatMessageViewModel.cancelReply,
        "aria-label": coreViewModel2.translations.chatPage.message.cancelReplyAudioLabel
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "close")
    ));
  }

  // src/View/Components/replyLink.tsx
  function ReplyLink(coreViewModel2, chatMessageViewModel) {
    const isHidden = createProxyState(
      [chatMessageViewModel.replyCount],
      () => chatMessageViewModel.replyCount.value == 0
    );
    function select() {
      chatMessageViewModel.messagePageViewModel.setReplyView(
        chatMessageViewModel
      );
    }
    return /* @__PURE__ */ createElement("div", { class: "reply-link", "toggle:hidden": isHidden, "on:click": select }, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.message.replyPrefixLabel), /* @__PURE__ */ createElement(
      "b",
      {
        class: "ellipsis",
        "subscribe:innerText": chatMessageViewModel.replyCount
      }
    ));
  }

  // src/View/Components/messageReactionButton.tsx
  function MessageReactionButton(coreViewModel2, chatMessageViewModel, content) {
    let audioLabel;
    let count;
    let isActive = createProxyState(
      [chatMessageViewModel.userReaction],
      () => chatMessageViewModel.userReaction.value == content
    );
    function sendReaction() {
      chatMessageViewModel.sendReaction(content, isActive.value);
    }
    switch (content) {
      case "\u{1F44D}" /* ThumbsUp */: {
        audioLabel = coreViewModel2.translations.chatPage.message.thumbsUpReaction;
        count = chatMessageViewModel.reactionsThumbsUpCount;
        break;
      }
      case "\u2705" /* Check */: {
        audioLabel = coreViewModel2.translations.chatPage.message.checkReaction;
        count = chatMessageViewModel.reactionsCheckCount;
        break;
      }
      case "\u{1F6D1}" /* Stop */: {
        audioLabel = coreViewModel2.translations.chatPage.message.stopReaction;
        count = chatMessageViewModel.reactionsStopCount;
        break;
      }
      case "\u2757\uFE0F" /* Attention */: {
        audioLabel = coreViewModel2.translations.chatPage.message.attentionReaction;
        count = chatMessageViewModel.reactionsAttentionCount;
        break;
      }
      case "\u203C\uFE0F" /* DoubleAttention */: {
        audioLabel = coreViewModel2.translations.chatPage.message.doubleAttentionReaction;
        count = chatMessageViewModel.reactionsDoubleAttentionCount;
        break;
      }
      case "\u2753" /* Question */: {
        audioLabel = coreViewModel2.translations.chatPage.message.questionReaction;
        count = chatMessageViewModel.reactionsQuestionCount;
        break;
      }
    }
    return /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": sendReaction,
        "aria-label": audioLabel,
        "toggle:selected": isActive,
        "set:count": count
      },
      content,
      /* @__PURE__ */ createElement("span", { "subscribe:innerText": count })
    );
  }

  // src/View/Components/messageReactionButtonRow.tsx
  function MessageReactionButtonRow(coreViewModel2, chatMessageViewModel) {
    return /* @__PURE__ */ createElement("div", { class: "grid gap width-100 message-reaction-row" }, MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u{1F44D}" /* ThumbsUp */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u2705" /* Check */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u{1F6D1}" /* Stop */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u2757\uFE0F" /* Attention */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u203C\uFE0F" /* DoubleAttention */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u2753" /* Question */
    ));
  }

  // src/View/Components/inlineReply.tsx
  function InlineReply(chatMessageViewModel) {
    const reply = chatMessageViewModel.inlineReply;
    if (reply == void 0) return /* @__PURE__ */ createElement("div", null);
    const scroll = () => {
      ViewController.scrollToView(reply.chatMessage.fileId);
    };
    return /* @__PURE__ */ createElement("div", { class: "inline-reply", "on:click": scroll }, /* @__PURE__ */ createElement("span", { "subscribe:innerText": reply.contact.name }), /* @__PURE__ */ createElement("b", { class: "ellipsis", "subscribe:innerText": reply.body }));
  }

  // src/View/Components/messageReactionEntry.tsx
  function MessageReactionEntry(reaction) {
    return /* @__PURE__ */ createElement("div", { class: "tile flex-row" }, /* @__PURE__ */ createElement("span", { class: "flex width-100" }, reaction.senderName), /* @__PURE__ */ createElement("span", null, reaction.content));
  }

  // src/View/Components/infoTile.tsx
  function InfoTile(icon, label, content) {
    let contentState;
    if (typeof content == "string") {
      contentState = new State(content);
    } else {
      contentState = content;
    }
    return /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, icon), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, label), /* @__PURE__ */ createElement("b", { class: "break-word", "subscribe:innerText": contentState })));
  }

  // src/View/Modals/chatMessageInfoModal.tsx
  function ChatMessageInfoModal(coreViewModel2, chatMessageViewModel) {
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": chatMessageViewModel.isPresentingInfoModal
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.chatPage.message.messageInfoHeadline), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, InfoTile(
        "account_circle",
        coreViewModel2.translations.chatPage.message.sentBy,
        chatMessageViewModel.senderId
      ), InfoTile(
        "schedule",
        coreViewModel2.translations.chatPage.message.timeSent,
        chatMessageViewModel.dateSent
      ), InfoTile(
        "forum",
        coreViewModel2.translations.chatPage.message.channel,
        chatMessageViewModel.channel
      ), InfoTile(
        "description",
        coreViewModel2.translations.chatPage.message.messageContent,
        chatMessageViewModel.body
      )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, /* @__PURE__ */ createElement("button", { "on:click": chatMessageViewModel.copyMessage }, coreViewModel2.translations.chatPage.message.copyMessageButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "content_copy")), /* @__PURE__ */ createElement("button", { "on:click": chatMessageViewModel.resendMessage }, coreViewModel2.translations.chatPage.message.resendMessageButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "redo")), /* @__PURE__ */ createElement("button", { "on:click": chatMessageViewModel.decryptMessage }, coreViewModel2.translations.chatPage.message.decryptMessageButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "key")), /* @__PURE__ */ createElement(
        "button",
        {
          "on:click": chatMessageViewModel.reply,
          "toggle:disabled": chatMessageViewModel.messagePageViewModel.isReplyViewActive
        },
        coreViewModel2.translations.chatPage.message.replyToMessageButton,
        /* @__PURE__ */ createElement("span", { class: "icon" }, "reply")
      )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, MessageReactionButtonRow(
        coreViewModel2,
        chatMessageViewModel
      ), /* @__PURE__ */ createElement(
        "div",
        {
          class: "flex-column gap",
          "children:append": [
            chatMessageViewModel.allReactions,
            MessageReactionEntry
          ]
        }
      ))), /* @__PURE__ */ createElement("button", { "on:click": chatMessageViewModel.hideInfoModal }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close")))
    );
  }

  // src/View/Components/chatMessage.tsx
  function ChatMessage4(coreViewModel2, chatMessageViewModel) {
    const statusIcon = createProxyState(
      [chatMessageViewModel.status],
      () => {
        switch (chatMessageViewModel.status.value) {
          case "outbox" /* Outbox */:
            return "hourglass_top";
          case "sent" /* Sent */:
            return "check";
          case "received" /* Received */:
            return "done_all";
          default:
            return "warning";
        }
      }
    );
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "message-bubble",
        id: chatMessageViewModel.chatMessage.fileId,
        "toggle:sentbyuser": chatMessageViewModel.sentByUser,
        "toggle:hidden": chatMessageViewModel.isHidden
      },
      InlineReply(chatMessageViewModel),
      /* @__PURE__ */ createElement("div", { class: "main tile" }, /* @__PURE__ */ createElement("div", { class: "text-container" }, /* @__PURE__ */ createElement(
        "span",
        {
          class: "sender-name ellipsis",
          "subscribe:innerText": chatMessageViewModel.contact.name
        }
      ), /* @__PURE__ */ createElement(
        "span",
        {
          class: "body",
          "subscribe:innerText": chatMessageViewModel.body
        }
      ), /* @__PURE__ */ createElement("span", { class: "timestamp ellipsis" }, /* @__PURE__ */ createElement(
        "span",
        {
          class: "icon",
          "subscribe:innerText": statusIcon
        }
      ), chatMessageViewModel.dateSent)), /* @__PURE__ */ createElement("div", { class: "button-container" }, /* @__PURE__ */ createElement(
        "button",
        {
          "on:click": chatMessageViewModel.showInfoModal,
          "aria-label": coreViewModel2.translations.chatPage.message.showMessageInfoButtonAudioLabel
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "info")
      ), /* @__PURE__ */ createElement(
        "button",
        {
          class: "reply-button",
          "on:click": chatMessageViewModel.reply,
          "aria-label": coreViewModel2.translations.chatPage.message.replyToMessageButton,
          "toggle:hidden": chatMessageViewModel.messagePageViewModel.isReplyViewActive
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "reply")
      ))),
      MessageReactionButtonRow(coreViewModel2, chatMessageViewModel),
      ReplyLink(coreViewModel2, chatMessageViewModel),
      ChatMessageInfoModal(coreViewModel2, chatMessageViewModel)
    );
  }

  // src/View/ChatPages/messagePage.tsx
  function MessagePage(coreViewModel2, messagePageViewModel) {
    messagePageViewModel.loadData();
    const ChatMessageViewModelToView = (chatMessageViewModel) => {
      return ChatMessage4(coreViewModel2, chatMessageViewModel);
    };
    const messageContainer = /* @__PURE__ */ createElement(
      "div",
      {
        id: "message-container",
        "children:append": [
          messagePageViewModel.filteredMessageViewModels,
          ChatMessageViewModelToView
        ]
      }
    );
    const persistenceId = messagePageViewModel.chatViewModel.chatModel.id;
    const replyPreview = ViewController.inlineReplies.setState(
      persistenceId,
      () => createProxyState(
        [messagePageViewModel.replyingMessage],
        () => {
          if (messagePageViewModel.replyingMessage.value == void 0)
            return /* @__PURE__ */ createElement("div", null);
          return ReplyPreview(
            coreViewModel2,
            messagePageViewModel.replyingMessage.value
          );
        }
      )
    );
    function scrollDown(hard = false) {
      if (hard) {
        messageContainer.setAttribute("scroll-hard", "");
      }
      messageContainer.scrollTop = messageContainer.scrollHeight;
      messageContainer.removeAttribute("scroll-hard");
    }
    function scrollDownIfApplicable() {
      const scrollFromBottom = messageContainer.scrollHeight - (messageContainer.scrollTop + messageContainer.offsetHeight);
      if (scrollFromBottom > 400) return;
      scrollDown();
    }
    messagePageViewModel.filteredMessageViewModels.subscribeSilent(
      scrollDownIfApplicable
    );
    bulkSubscribe(
      [
        messagePageViewModel.reactionFilter,
        messagePageViewModel.searchViewModel.appliedQuery
      ],
      scrollDown
    );
    messagePageViewModel.replyViewSelectedMessage.subscribeSilent(
      (selectedMessage) => {
        if (selectedMessage != void 0) return;
        setTimeout(scrollDown, 100);
      }
    );
    setTimeout(() => scrollDown(true), 100);
    messagePageViewModel.focusSetter.subscribeSilent(() => {
      ViewController.setFocusWithDelay();
    });
    const isInReplyView = createProxyState(
      [messagePageViewModel.replyViewSelectedMessage],
      () => messagePageViewModel.replyViewSelectedMessage.value != void 0
    );
    const title = createProxyState(
      [messagePageViewModel.isReplyViewActive],
      () => messagePageViewModel.isReplyViewActive.value ? coreViewModel2.translations.chatPage.message.replyHeaderLabel(
        messagePageViewModel.replyViewSelectedMessage.value.body.value
      ) : coreViewModel2.translations.chatPage.message.messagesHeadline
    );
    return /* @__PURE__ */ createElement("div", { id: "message-page", "toggle:reply-view": isInReplyView }, /* @__PURE__ */ createElement("div", { class: "pane-wrapper" }, /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "on:click": messagePageViewModel.resetReplyView,
        "toggle:hidden": messagePageViewModel.isReplyViewInactive
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_back")
    ), /* @__PURE__ */ createElement(
      "span",
      {
        class: "title ellipsis width-100 flex",
        "subscribe:innerText": title
      }
    ), /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost inset-outline",
        "on:click": messagePageViewModel.showFilterModal,
        "aria-label": coreViewModel2.translations.chatPage.message.filterMessagesButtonAudioLabel,
        "toggle:selected": messagePageViewModel.isFilterActive
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "filter_alt")
    ))), /* @__PURE__ */ createElement("div", { class: "content" }, messageContainer, /* @__PURE__ */ createElement("div", { id: "composer" }, /* @__PURE__ */ createElement("div", { class: "content-width-constraint" }, /* @__PURE__ */ createElement(
      "div",
      {
        class: "reply-preview-wrapper",
        "children:set": replyPreview
      }
    ), /* @__PURE__ */ createElement("div", { class: "input-width-constraint" }, /* @__PURE__ */ createElement(
      "input",
      {
        id: "focused",
        class: "blur",
        "bind:value": messagePageViewModel.composingMessage,
        "on:enter": messagePageViewModel.sendMessage,
        placeholder: coreViewModel2.translations.chatPage.message.composerInputPlaceholder
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary blur",
        "aria-label": coreViewModel2.translations.chatPage.message.sendMessageButtonAudioLabel,
        "on:click": messagePageViewModel.sendMessage,
        "toggle:disabled": messagePageViewModel.cannotSendMessage
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "send")
    ))))))), MessageFilterModal(
      coreViewModel2,
      messagePageViewModel,
      ChatMessageViewModelToView
    ));
  }

  // src/View/Components/monthGrid.tsx
  function MonthGrid(coreViewModel2, monthGrid, selectedDate, handleDrop) {
    const dayLabels = [];
    let currentWeekday = monthGrid.firstDayOfWeek;
    while (dayLabels.length < 7) {
      dayLabels.push(
        /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.regional.weekdays.abbreviated[currentWeekday])
      );
      currentWeekday++;
      if (currentWeekday == 7) currentWeekday = 0;
    }
    const offsetElements = [];
    for (let i = 0; i < monthGrid.offset; i++) {
      offsetElements.push(/* @__PURE__ */ createElement("div", null));
    }
    const converter = (taskViewModel) => {
      const view = /* @__PURE__ */ createElement("span", { class: "ellipsis secondary" }, taskViewModel.task.name);
      taskViewModel.index.subscribe((newIndex) => {
        view.style.order = newIndex;
      });
      return view;
    };
    return /* @__PURE__ */ createElement("div", { class: "month-grid-wrapper" }, /* @__PURE__ */ createElement("div", { class: "day-labels" }, ...dayLabels), /* @__PURE__ */ createElement("div", { class: "month-grid" }, ...offsetElements, ...Object.entries(monthGrid.days).sort((a, b) => localeCompare(a[0], b[0])).map((entry) => {
      const [date, mapState] = entry;
      const isSelected = createProxyState(
        [selectedDate],
        () => selectedDate.value == parseInt(date)
      );
      const isToday = createProxyState(
        [coreViewModel2.todayDate],
        () => {
          return monthGrid.isCurrentMonth == true && date == coreViewModel2.unwrappedTodayDate.getDate().toString().padStart(2, "0");
        }
      );
      const eventCount = createProxyState(
        [mapState],
        () => mapState.value.size
      );
      const hasEvents = createProxyState(
        [eventCount],
        () => eventCount.value != 0
      );
      function select() {
        selectedDate.value = parseInt(date);
      }
      function drop() {
        handleDrop(date);
      }
      return /* @__PURE__ */ createElement(
        "button",
        {
          class: "tile",
          "on:click": select,
          "toggle:selected": isSelected,
          "toggle:today": isToday,
          "on:dragover": ViewController.allowDrop,
          "on:drop": drop
        },
        /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, date), /* @__PURE__ */ createElement(
          "span",
          {
            class: "event-count",
            "toggle:has-events": hasEvents,
            "subscribe:innerText": eventCount
          }
        ), /* @__PURE__ */ createElement(
          "div",
          {
            class: "event-list",
            "children:append": [mapState, converter]
          }
        ))
      );
    })));
  }

  // src/View/ChatPages/calendarPage.tsx
  function CalendarPage(coreViewModel2, calendarPageViewModel) {
    calendarPageViewModel.loadData();
    const mainContent = createProxyState(
      [calendarPageViewModel.monthGrid],
      () => {
        const monthGrid = calendarPageViewModel.monthGrid.value;
        if (monthGrid == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          let drop = function(date) {
            calendarPageViewModel.handleDrop(
              monthGrid.year.toString(),
              monthGrid.month.toString(),
              date
            );
          };
          return MonthGrid(
            coreViewModel2,
            monthGrid,
            calendarPageViewModel.selectedDate,
            drop
          );
        }
      }
    );
    const sidePaneContentWrapper = createProxyState(
      [
        calendarPageViewModel.selectedYear,
        calendarPageViewModel.selectedMonth,
        calendarPageViewModel.selectedDate
      ],
      () => {
        const listState = calendarPageViewModel.getEventsForDate();
        if (listState == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          const sidePaneContent = createProxyState(
            [listState],
            () => {
              if (listState.value.size == 0) {
                return PlaceholderView(
                  coreViewModel2.translations.chatPage.calendar.noEvents
                );
              } else {
                return /* @__PURE__ */ createElement(
                  "div",
                  {
                    class: "flex-column gap slide-up padding-bottom",
                    "children:append": [
                      listState,
                      TaskViewModelToEntry
                    ]
                  }
                );
              }
            }
          );
          return /* @__PURE__ */ createElement(
            "div",
            {
              class: "width-100 height-100",
              "children:set": sidePaneContent
            }
          );
        }
      }
    );
    const taskSettingsModal = createProxyState(
      [calendarPageViewModel.selectedTaskViewModel],
      () => {
        if (calendarPageViewModel.selectedTaskViewModel.value == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          ViewController.setFocusWithDelay();
          return TaskSettingsModal(
            coreViewModel2,
            calendarPageViewModel.selectedTaskViewModel.value
          );
        }
      }
    );
    return /* @__PURE__ */ createElement("div", { id: "calendar-page" }, /* @__PURE__ */ createElement("div", { class: "pane-wrapper grid-pane-wrapper" }, /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.calendar.todayButtonAudioLabel,
        "on:click": calendarPageViewModel.showToday
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "today")
    )), /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.calendar.previousMonthButtonAudioLabel,
        "on:click": calendarPageViewModel.showPreviousMonth
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_back")
    ), /* @__PURE__ */ createElement("span", { class: "input-wrapper" }, /* @__PURE__ */ createElement(
      "input",
      {
        class: "year-input",
        type: "number",
        "aria-label": coreViewModel2.translations.chatPage.calendar.yearInputAudioLabel,
        placeholder: coreViewModel2.translations.chatPage.calendar.yearInputPlaceholder,
        "bind:value": calendarPageViewModel.selectedYear
      }
    ), /* @__PURE__ */ createElement(
      "input",
      {
        class: "month-input",
        type: "number",
        "aria-label": coreViewModel2.translations.chatPage.calendar.monthInputAudioLabel,
        placeholder: coreViewModel2.translations.chatPage.calendar.monthInputPlaceholder,
        "bind:value": calendarPageViewModel.selectedMonth
      }
    )), /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.calendar.nextMonthButtonAudioLabel,
        "on:click": calendarPageViewModel.showNextMonth
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    )), /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.task.createTaskButtonAudioLabel,
        "on:click": calendarPageViewModel.createEvent
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    ))), /* @__PURE__ */ createElement(
      "div",
      {
        class: "content padding-0",
        "children:set": mainContent
      }
    ))), /* @__PURE__ */ createElement(
      "div",
      {
        class: "pane-wrapper side background",
        "set:color": calendarPageViewModel.chatViewModel.displayedColor
      },
      /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement(
        "div",
        {
          class: "content",
          "children:set": sidePaneContentWrapper
        }
      ))
    ), /* @__PURE__ */ createElement("div", { "children:set": taskSettingsModal }));
  }

  // src/View/chatPage.tsx
  function ChatPage(coreViewModel2, chatViewModel) {
    ViewController.chatPages.state = createProxyState(
      [chatViewModel.selectedPage],
      () => {
        switch (chatViewModel.selectedPage.value) {
          case "settings" /* Settings */: {
            return SettingsPage(
              coreViewModel2,
              chatViewModel.settingsPageViewModel
            );
          }
          case "tasks" /* Tasks */: {
            return TaskPage(
              coreViewModel2,
              chatViewModel.taskPageViewModel
            );
          }
          case "calendar" /* Calendar */: {
            return CalendarPage(
              coreViewModel2,
              chatViewModel.calendarViewModel
            );
          }
          default: {
            return MessagePage(
              coreViewModel2,
              chatViewModel.messagePageViewModel
            );
          }
        }
      }
    );
    const marqueeContent = createProxyState(
      [chatViewModel.notificationViewModel.marquee],
      () => {
        const value = chatViewModel.notificationViewModel.marquee.value;
        if (value == void 0) return /* @__PURE__ */ createElement("span", null);
        return /* @__PURE__ */ createElement(
          "span",
          {
            "on:click": chatViewModel.notificationViewModel.openNotification
          },
          /* @__PURE__ */ createElement("b", null, value.sender),
          /* @__PURE__ */ createElement("span", { class: "secondary" }, value.chat, ": "),
          /* @__PURE__ */ createElement("span", null, value.body)
        );
      }
    );
    return /* @__PURE__ */ createElement(
      "article",
      {
        id: "chat-page",
        "set:color": chatViewModel.displayedColor,
        class: "subtle-background"
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { id: "ribbon" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "ghost",
          id: "close-button",
          "aria-label": coreViewModel2.translations.chatPage.closeChatAudioLabe,
          "on:click": chatViewModel.close
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "close")
      ), /* @__PURE__ */ createElement(
        "button",
        {
          class: "danger",
          "aria-label": coreViewModel2.translations.general.restoreConnection,
          "on:click": chatViewModel.connectionViewModel.showConnectionModal,
          "toggle:hidden": chatViewModel.connectionViewModel.isConnected,
          "toggle:disabled": chatViewModel.connectionViewModel.hasNoPreviousConnections
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "signal_disconnected")
      ), /* @__PURE__ */ createElement("span", { class: "marquee", "children:set": marqueeContent }), /* @__PURE__ */ createElement("span", { class: "navigation-buttons" }, ChatViewToggleButton(
        coreViewModel2.translations.chatPage.pages.calendar,
        "calendar_month",
        "calendar" /* Calendar */,
        chatViewModel
      ), ChatViewToggleButton(
        coreViewModel2.translations.chatPage.pages.tasks,
        "task_alt",
        "tasks" /* Tasks */,
        chatViewModel
      ), ChatViewToggleButton(
        coreViewModel2.translations.chatPage.pages.messages,
        "forum",
        "messages" /* Messages */,
        chatViewModel
      ), ChatViewToggleButton(
        coreViewModel2.translations.chatPage.pages.settings,
        "settings",
        "settings" /* Settings */,
        chatViewModel
      ))), /* @__PURE__ */ createElement(
        "div",
        {
          id: "main",
          "children:set": ViewController.chatPages.state
        }
      ))
    );
  }

  // src/View/chatPageWrapper.tsx
  function ChatPageWrapper(coreViewModel2, chatListViewModel2) {
    const chatPageContent = createProxyState(
      [chatListViewModel2.selectedChat],
      () => {
        if (chatListViewModel2.selectedChat.value == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          return ChatPage(
            coreViewModel2,
            chatListViewModel2.selectedChat.value
          );
        }
      }
    );
    return /* @__PURE__ */ createElement("div", { id: "chat-page-wrapper", "children:set": chatPageContent });
  }

  // src/View/Modals/splitModal.tsx
  function SplitModal(coreViewModel2, leftView, rightView, extendedStyle = false, navigationState) {
    function closePage() {
      if (!navigationState) return;
      navigationState.value = void 0;
    }
    const hasPageOpen = new State(false);
    navigationState?.subscribe(
      (newValue) => hasPageOpen.value = newValue != void 0
    );
    const view = /* @__PURE__ */ createElement(
      "div",
      {
        class: "split-modal",
        "toggle:extended": extendedStyle,
        "toggle:navigation": navigationState != void 0,
        "toggle:page-open": hasPageOpen
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "scroll-area", "children:set": leftView })),
      /* @__PURE__ */ createElement("div", { class: "scroll-area slide-up" }, /* @__PURE__ */ createElement(
        "div",
        {
          class: "flex-row width-100 mobile-only",
          "toggle:hidden": navigationState == void 0
        },
        /* @__PURE__ */ createElement(
          "button",
          {
            class: "ghost square",
            "aria-label": coreViewModel2.translations.general.backButton,
            "on:click": closePage
          },
          /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_back")
        )
      ), /* @__PURE__ */ createElement("div", { "children:set": rightView }))
    );
    return view;
  }

  // src/View/Components/usageBar.tsx
  function UsageBar(label, valueLabel, value, maximum) {
    const style = createProxyState(
      [value, maximum],
      () => `width: ${100 * (value.value / maximum.value)}%`
    );
    return /* @__PURE__ */ createElement("div", { class: "surface flex-column padding gap" }, /* @__PURE__ */ createElement("b", null, label), /* @__PURE__ */ createElement("div", { class: "width-100 surface-alt", style: "height: 18px" }, /* @__PURE__ */ createElement(
      "div",
      {
        class: "height-100 background-primary",
        "set:style": style
      }
    )), /* @__PURE__ */ createElement("span", { class: "secondary", "subscribe:innerText": valueLabel }));
  }

  // src/View/Components/directoryItemList.tsx
  function DirectoryItemList(storageViewModel2, pathString = PATH_COMPONENT_SEPARATOR) {
    const StringToDirectoryItemList = (pathString2) => DirectoryItemList(storageViewModel2, pathString2);
    const path = StorageModel.stringToPathComponents(pathString);
    const fileName = StorageModel.getFileName(path);
    const items = new ListState();
    const style = `text-indent: ${path.length}rem`;
    function loadItems() {
      items.clear();
      const directoryItems = storageViewModel2.coreViewModel.storageModel.list(path);
      for (const directoryItem of directoryItems) {
        const itemPath = [...path, directoryItem];
        const pathString2 = StorageModel.pathComponentsToString(...itemPath);
        items.add(pathString2);
      }
    }
    function select() {
      storageViewModel2.selectedPath.value = pathString;
    }
    storageViewModel2.lastDeletedItemPath.subscribe((lastDeletedItemPath) => {
      if (!items.value.has(lastDeletedItemPath)) return;
      select();
      setTimeout(() => loadItems(), 50);
    });
    const isSelected = createProxyState(
      [storageViewModel2.selectedPath],
      () => storageViewModel2.selectedPath.value == pathString
    );
    isSelected.subscribe(() => {
      if (isSelected.value == false) return;
      loadItems();
    });
    return /* @__PURE__ */ createElement("div", { class: "flex-column" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-100 flex-1 clip",
        "toggle:selected": isSelected,
        "on:click": select
      },
      /* @__PURE__ */ createElement("span", { class: "ellipsis width-100 flex-1", style }, fileName)
    ), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column",
        "children:append": [items, StringToDirectoryItemList]
      }
    ));
  }

  // src/View/Modals/storageModal.tsx
  function StorageModal(coreViewModel2, storageViewModel2) {
    const usageValueLabel = createProxyState(
      [storageViewModel2.occupiedSpaceMB, storageViewModel2.maximumSpaceMB],
      () => coreViewModel2.translations.storage.usageVauleLabel(
        storageViewModel2.occupiedSpaceMB.value,
        storageViewModel2.maximumSpaceMB.value
      )
    );
    const detailView = createProxyState(
      [storageViewModel2.selectedPath],
      () => {
        if (storageViewModel2.selectedPath.value == PATH_COMPONENT_SEPARATOR)
          return /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.storage.noItemSelected), /* @__PURE__ */ createElement("hr", null), UsageBar(
            coreViewModel2.translations.storage.usageLabel,
            usageValueLabel,
            storageViewModel2.occupiedSpaceMB,
            storageViewModel2.maximumSpaceMB
          ), /* @__PURE__ */ createElement("hr", null), DangerousActionButton(
            coreViewModel2,
            coreViewModel2.translations.storage.removeJunkButton,
            "delete_forever",
            storageViewModel2.removeJunk
          ));
        return /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, /* @__PURE__ */ createElement("div", { class: "tile flex-no" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.storage.path), /* @__PURE__ */ createElement(
          "span",
          {
            class: "break-all",
            "subscribe:innerText": storageViewModel2.selectedPath
          }
        ))), /* @__PURE__ */ createElement("div", { class: "tile flex-no" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.storage.content), /* @__PURE__ */ createElement(
          "code",
          {
            "subscribe:innerText": storageViewModel2.selectedFileContent
          }
        ))), DangerousActionButton(
          coreViewModel2,
          coreViewModel2.translations.storage.deleteItem,
          "delete_forever",
          storageViewModel2.deleteSelectedItem
        ));
      }
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": storageViewModel2.isShowingStorageModal }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", { class: "padding-0" }, SplitModal(
      coreViewModel2,
      new State(DirectoryItemList(storageViewModel2)),
      detailView,
      true
    )), /* @__PURE__ */ createElement("button", { "on:click": storageViewModel2.close }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close"))));
  }

  // src/View/Components/optionButton.tsx
  function OptionButton(text, value, selection) {
    function select() {
      selection.value = value;
    }
    const isSelected = createProxyState(
      [selection],
      () => selection.value == value
    );
    return /* @__PURE__ */ createElement("button", { class: "standard", "toggle:selected": isSelected, "on:click": select }, text);
  }

  // src/View/Components/optionButtonList.tsx
  function OptionButtonList(options, selection) {
    function OptionToView(option) {
      const [text, value] = option;
      return OptionButton(text, value, selection);
    }
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap",
        "children:append": [options, OptionToView]
      }
    );
  }

  // src/View/Components/navigationButton.tsx
  function NavigationButton(coreViewModel2, label, navigationState, page, arrowMobileOnly) {
    const isSelected = createProxyState(
      [navigationState],
      () => navigationState.value == page
    );
    function open() {
      navigationState.value = page;
    }
    const iconClass = `icon ${arrowMobileOnly == true ? "mobile-only" : ""}`;
    return /* @__PURE__ */ createElement("button", { "toggle:selected": isSelected, "on:click": open }, label, /* @__PURE__ */ createElement("span", { class: iconClass }, "arrow_forward"));
  }

  // src/View/Modals/settingsModal.tsx
  function SettingsModal(coreViewModel2, settingsViewModel2) {
    const detailView = createProxyState(
      [settingsViewModel2.selectedModalPage],
      () => {
        switch (settingsViewModel2.selectedModalPage.value) {
          case void 0: {
            return PlaceholderView(
              coreViewModel2.translations.general.noPageSelected
            );
          }
          case 0 /* Appearance */:
            return SettingsAppearancePane(
              coreViewModel2,
              settingsViewModel2
            );
          case 1 /* Account */:
            return SettingsAccountPane(
              coreViewModel2,
              settingsViewModel2
            );
          case 2 /* Regional */:
            return SettingsRegionalPane(
              coreViewModel2,
              settingsViewModel2
            );
          case 3 /* Info */:
            return SettingsInfoPane(coreViewModel2, settingsViewModel2);
        }
      }
    );
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": settingsViewModel2.isShowingSettingsModal
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", { class: "padding-0" }, SplitModal(
        coreViewModel2,
        new State(
          SettingsLeftPane(coreViewModel2, settingsViewModel2)
        ),
        detailView,
        true,
        settingsViewModel2.selectedModalPage
      )), /* @__PURE__ */ createElement("button", { "on:click": settingsViewModel2.close }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close")))
    );
  }
  function SettingsLeftPane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "flex-column gap slide-up" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.homePage.settingsButton), SettingsPaneButton(
      coreViewModel2,
      settingsViewModel2,
      0 /* Appearance */,
      coreViewModel2.translations.settings.pages.appearance
    ), SettingsPaneButton(
      coreViewModel2,
      settingsViewModel2,
      1 /* Account */,
      coreViewModel2.translations.settings.pages.account
    ), SettingsPaneButton(
      coreViewModel2,
      settingsViewModel2,
      2 /* Regional */,
      coreViewModel2.translations.settings.pages.regional
    ), SettingsPaneButton(
      coreViewModel2,
      settingsViewModel2,
      3 /* Info */,
      coreViewModel2.translations.settings.pages.info
    ));
  }
  function SettingsPaneButton(coreViewModel2, settingsViewModel2, page, label) {
    return NavigationButton(
      coreViewModel2,
      label,
      settingsViewModel2.selectedModalPage,
      page,
      true
    );
  }
  function SettingsInfoPane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "slide-up" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.homePage.appName), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, InfoTile(
      "build",
      coreViewModel2.translations.settings.about.version,
      settingsViewModel2.coreViewModel.version
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "on:click": coreViewModel2.update,
        "toggle:hidden": coreViewModel2.noUpdateAvailable
      },
      /* @__PURE__ */ createElement("span", { "subscribe:innerText": coreViewModel2.updateText }),
      /* @__PURE__ */ createElement("span", { class: "icon" }, "update")
    ), /* @__PURE__ */ createElement("button", { class: "standard", "on:click": coreViewModel2.checkUpdates }, coreViewModel2.translations.settings.about.checkUpdatesButton)));
  }
  function SettingsRegionalPane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "slide-up" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.settings.pages.regional), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.settings.regional.language), OptionButtonList(
      new ListState(
        Object.values(Languages).map((x) => [languageNames[x], x])
      ),
      settingsViewModel2.language
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.settings.regional.firstDayOfWeekLabel), OptionButtonList(
      new ListState(
        coreViewModel2.translations.regional.weekdays.full.map(
          (x, i) => [x, i.toString()]
        )
      ),
      settingsViewModel2.firstDayOfWeek
    ));
  }
  function SettingsAccountPane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "slide-up" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.settings.pages.account), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "account_circle"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.settings.account.yourNameLabel), /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: coreViewModel2.translations.settings.account.yourNamePlaceholder,
        "bind:value": settingsViewModel2.usernameInput,
        "on:enter": settingsViewModel2.setName
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end width-input" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-50",
        "on:click": settingsViewModel2.setName,
        "toggle:disabled": settingsViewModel2.cannotSetName,
        "aria-label": coreViewModel2.translations.settings.account.setNameButtonAudioLabel
      },
      coreViewModel2.translations.general.setButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )));
  }
  function SettingsAppearancePane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "slide-up" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.settings.pages.appearance), /* @__PURE__ */ createElement("hr", null), OptionButtonList(
      new ListState([
        [
          coreViewModel2.translations.settings.themes.dynamic,
          "dynamic" /* Dynamic */
        ],
        [
          coreViewModel2.translations.settings.themes.system,
          "system" /* System */
        ],
        [
          coreViewModel2.translations.settings.themes.dark,
          "dark" /* Dark */
        ],
        [
          coreViewModel2.translations.settings.themes.light,
          "light" /* Light */
        ],
        [
          coreViewModel2.translations.settings.themes.black,
          "black" /* Black */
        ]
      ]),
      settingsViewModel2.theme
    ));
  }

  // src/View/Components/textSpan.tsx
  var StringToTextSpan = (string) => {
    return /* @__PURE__ */ createElement("span", { class: "ellipsis" }, string);
  };

  // src/View/Modals/dataTransferModal.tsx
  function DataTransferModalWrapper(coreViewModel2, connectionViewModel2, fileTransferViewModel2) {
    return /* @__PURE__ */ createElement("div", null, DirectionSelectionModal(
      coreViewModel2,
      connectionViewModel2,
      fileTransferViewModel2
    ), FileSelectionModal(coreViewModel2, fileTransferViewModel2), TransferDataDisplayModal(coreViewModel2, fileTransferViewModel2), TransferDisplayModal(coreViewModel2, fileTransferViewModel2), TransferDataInputModal(coreViewModel2, fileTransferViewModel2), DataReceptionModal(coreViewModel2, fileTransferViewModel2), ExportFileSelectionModal(coreViewModel2, fileTransferViewModel2), ExportModal(coreViewModel2, fileTransferViewModel2), ImportModal(coreViewModel2, fileTransferViewModel2), ImportDecryptionDataModal(coreViewModel2, fileTransferViewModel2));
  }
  function OptionEntry(fileOption, fileTransferViewModel2) {
    const isSelected = new State(false);
    if (fileTransferViewModel2.selectedPaths.value.has(fileOption.path)) {
      isSelected.value = true;
    }
    isSelected.subscribeSilent((isSelected2) => {
      if (isSelected2 == true) {
        fileTransferViewModel2.selectedPaths.add(fileOption.path);
      } else {
        fileTransferViewModel2.selectedPaths.remove(fileOption.path);
      }
    });
    function toggle() {
      isSelected.value = !isSelected.value;
    }
    return /* @__PURE__ */ createElement("button", { class: "tile", "toggle:selected": isSelected, "on:click": toggle }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", { class: "ellipsis" }, fileOption.label), /* @__PURE__ */ createElement("span", { class: "secondary ellipsis" }, StorageModel.pathComponentsToString(...fileOption.path))));
  }
  function DirectionSelectionModal(coreViewModel2, connectionViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 0 /* DirectionSelection */
    );
    const isDisconnected = createProxyState(
      [connectionViewModel2.isConnected],
      () => connectionViewModel2.isConnected.value == false
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.transferDataHeadline), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "tile",
        "toggle:disabled": isDisconnected,
        "on:click": fileTransferViewModel2.showFileSelectionModal
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "share_windows"),
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.dataTransferModal.fromThisDeviceButton)),
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "tile",
        "toggle:disabled": isDisconnected,
        "on:click": fileTransferViewModel2.showTransferDataInputModal
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "cloud_download"),
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.dataTransferModal.toThisDeviceButton)),
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement(
      "button",
      {
        class: "tile",
        "on:click": fileTransferViewModel2.showExportSelectionModal
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "file_save"),
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.dataTransferModal.exportButton)),
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "tile",
        "on:click": fileTransferViewModel2.showImportModal
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "upload_file"),
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.dataTransferModal.importButton)),
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ))), /* @__PURE__ */ createElement("button", { "on:click": fileTransferViewModel2.close }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close"))));
  }
  function FileSelectionModal(coreViewModel2, fileTransferViewModel2) {
    const OptionConverter = (fileOption) => {
      return OptionEntry(fileOption, fileTransferViewModel2);
    };
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 1 /* FileSelection */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.sendHeadline), /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.selectionDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.dataTransferModal.generalHeadline), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap content-margin-bottom",
        "children:append": [
          fileTransferViewModel2.generalFileOptions,
          OptionConverter
        ]
      }
    ), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.dataTransferModal.chatsHeadline), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap",
        "children:append": [
          fileTransferViewModel2.chatFileOptions,
          OptionConverter
        ]
      }
    )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showDirectionSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex",
        "on:click": fileTransferViewModel2.showTransferDataModal,
        "toggle:disabled": fileTransferViewModel2.hasNoPathsSelected
      },
      coreViewModel2.translations.general.continueButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ))));
  }
  function TransferDataDisplayModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 2 /* TransferDataDisplay */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.sendHeadline), /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.dataEntryDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "forum"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferChannelHeadline), /* @__PURE__ */ createElement(
      "b",
      {
        "subscribe:innerText": fileTransferViewModel2.transferChannel
      }
    ))), /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferKeyHeadline), /* @__PURE__ */ createElement(
      "b",
      {
        "subscribe:innerText": fileTransferViewModel2.transferKey
      }
    ))))), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showFileSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement("button", { disabled: true, class: "flex" }, coreViewModel2.translations.general.waitingLabel))));
  }
  function TransferDisplayModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 3 /* TransferDisplay */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.transferDataHeadline), /* @__PURE__ */ createElement(
      "p",
      {
        class: "secondary",
        "subscribe:innerText": fileTransferViewModel2.filesSentText
      }
    ), /* @__PURE__ */ createElement(
      "p",
      {
        class: "secondary",
        "toggle:hidden": fileTransferViewModel2.didNotFinishSending
      },
      coreViewModel2.translations.dataTransferModal.allFilesSent
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "forum"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferChannelHeadline), /* @__PURE__ */ createElement(
      "b",
      {
        "subscribe:innerText": fileTransferViewModel2.transferChannel
      }
    ))), /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferKeyHeadline), /* @__PURE__ */ createElement(
      "b",
      {
        "subscribe:innerText": fileTransferViewModel2.transferKey
      }
    )))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement(
      "div",
      {
        class: "tile flex-column align-start",
        "children:append": [
          fileTransferViewModel2.filePathsSent,
          StringToTextSpan
        ]
      }
    )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.initiateTransfer
      },
      coreViewModel2.translations.dataTransferModal.sendAgainButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "restart_alt")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.close,
        "toggle:disabled": fileTransferViewModel2.didNotFinishSending
      },
      coreViewModel2.translations.general.closeButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "close")
    ))));
  }
  function TransferDataInputModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 4 /* TransferDataInput */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.receiveHeadline), /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.dataEntryInputDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "forum"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferChannelHeadline), /* @__PURE__ */ createElement(
      "input",
      {
        type: "number",
        "on:enter": fileTransferViewModel2.prepareReceivingData,
        "bind:value": fileTransferViewModel2.receivingTransferChannel
      }
    ))), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferKeyHeadline), /* @__PURE__ */ createElement(
      "input",
      {
        type: "number",
        "on:enter": fileTransferViewModel2.prepareReceivingData,
        "bind:value": fileTransferViewModel2.receivingTransferKey
      }
    ))))), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showDirectionSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex",
        "on:click": fileTransferViewModel2.prepareReceivingData,
        "toggle:disabled": fileTransferViewModel2.cannotPrepareToReceive
      },
      coreViewModel2.translations.general.continueButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ))));
  }
  function DataReceptionModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 5 /* ReceptionDisplay */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.receiveHeadline), /* @__PURE__ */ createElement(
      "p",
      {
        class: "secondary",
        "subscribe:innerText": fileTransferViewModel2.filesReceivedText
      }
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement(
      "div",
      {
        class: "tile flex-column align-start",
        "children:append": [
          fileTransferViewModel2.filePathsReceived,
          StringToTextSpan
        ]
      }
    )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.correctTransferData,
        "toggle:disabled": fileTransferViewModel2.cannotExitReception
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement("button", { class: "flex", "on:click": ViewController.reload }, coreViewModel2.translations.general.reloadAppButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "refresh")))));
  }
  function ExportFileSelectionModal(coreViewModel2, fileTransferViewModel2) {
    const OptionConverter = (fileOption) => {
      return OptionEntry(fileOption, fileTransferViewModel2);
    };
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 6 /* ExportFileSelection */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.exportHeadline), /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.exportSelectionDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.dataTransferModal.generalHeadline), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap content-margin-bottom",
        "children:append": [
          fileTransferViewModel2.generalFileOptions,
          OptionConverter
        ]
      }
    ), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.dataTransferModal.chatsHeadline), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap",
        "children:append": [
          fileTransferViewModel2.chatFileOptions,
          OptionConverter
        ]
      }
    )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showDirectionSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex",
        "on:click": fileTransferViewModel2.showExportModal,
        "toggle:disabled": fileTransferViewModel2.hasNoPathsSelected
      },
      coreViewModel2.translations.general.continueButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ))));
  }
  function ExportModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 7 /* Export */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.exportHeadline), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.exportKey), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": fileTransferViewModel2.exportKey,
        "on:enter": fileTransferViewModel2.downloadFile,
        type: "password"
      }
    ))), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "check_circle"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.exportKeyConfirmation), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": fileTransferViewModel2.exportKeyConfirmation,
        "on:enter": fileTransferViewModel2.downloadFile,
        type: "password"
      }
    ))))), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showExportSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex",
        "on:click": fileTransferViewModel2.downloadFile,
        "toggle:disabled": fileTransferViewModel2.cannotExport
      },
      coreViewModel2.translations.dataTransferModal.downloadFileButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "download")
    ))));
  }
  function ImportModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 8 /* ImportSelection */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.importHeadline), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement(
      "input",
      {
        id: "file-transfer-input",
        type: "file",
        "on:change": fileTransferViewModel2.updateImportSelection
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showDirectionSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex",
        "on:click": fileTransferViewModel2.importFile,
        "toggle:disabled": fileTransferViewModel2.cannotImport
      },
      coreViewModel2.translations.dataTransferModal.importFileButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ))));
  }
  function ImportDecryptionDataModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 9 /* ImportDecryptData */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.importHeadline), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.exportKey), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": fileTransferViewModel2.importKey,
        "on:enter": fileTransferViewModel2.decryptImport,
        type: "password"
      }
    )))), /* @__PURE__ */ createElement(
      "p",
      {
        class: "error",
        "toggle:hidden": fileTransferViewModel2.isImportKeyCorrect
      },
      coreViewModel2.translations.dataTransferModal.incorrectPassphraseError
    )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showImportModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex",
        "on:click": fileTransferViewModel2.decryptImport,
        "toggle:disabled": fileTransferViewModel2.importDecryptSuccessful
      },
      coreViewModel2.translations.dataTransferModal.decryptImportButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ))));
  }

  // src/View/Modals/connectionModal.tsx
  function ConnectionModal(coreViewModel2, connectionViewModel2) {
    const previousAddressConverter = (address) => {
      function connnect() {
        connectionViewModel2.connectToAddress(address);
      }
      const cannotConnect = createProxyState(
        [connectionViewModel2.isConnected],
        () => connectionViewModel2.isConnected.value == true && connectionViewModel2.coreViewModel.connectionModel.address == address
      );
      return DeletableListItem(
        coreViewModel2,
        address,
        /* @__PURE__ */ createElement(
          "button",
          {
            class: "primary",
            "on:click": connnect,
            "toggle:disabled": cannotConnect,
            "aria-label": coreViewModel2.translations.connectionModal.connectButtonAudioLabel
          },
          /* @__PURE__ */ createElement("span", { class: "icon" }, "link")
        ),
        () => {
          connectionViewModel2.removePreviousAddress(address);
        }
      );
    };
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": connectionViewModel2.isShowingConnectionModal
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.connectionModal.connectionModalHeadline), /* @__PURE__ */ createElement(
        "div",
        {
          class: "flex-column gap",
          "children:append": [
            connectionViewModel2.previousAddresses,
            previousAddressConverter
          ]
        }
      )), /* @__PURE__ */ createElement("button", { "on:click": connectionViewModel2.hideConnectionModal }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close")))
    );
  }

  // src/Model/Global/fileTransferModel.ts
  var FileTransferModel = class _FileTransferModel {
    // init
    constructor(storageModel2, connectionModel2) {
      this.direction = 0 /* Send */;
      // handler managers
      this.fileHandlerManager = new HandlerManager();
      this.readyToSendHandlerManager = new HandlerManager();
      // general
      this.generateTransferData = () => {
        const transferData = {
          channel: generateRandomToken(4),
          key: generateRandomToken(6)
        };
        this.transferData = transferData;
        return transferData;
      };
      this.prepareToSend = () => {
        if (!this.transferData) return;
        this.direction = 0 /* Send */;
        this.connectionModel.addChannel(this.transferData.channel);
      };
      this.prepareToReceive = (transferData) => {
        this.direction = 1 /* Receive */;
        this.connectionModel.addChannel(transferData.channel);
        this.transferData = transferData;
        this.connectionModel.sendPlainMessage(
          transferData.channel,
          _FileTransferModel.READY_MESSAGE
        );
      };
      // handlers
      this.handleMessage = (data) => {
        if (this.transferData == void 0) return;
        if (data.messageChannel != this.transferData.channel) return;
        if (data.messageBody == _FileTransferModel.READY_MESSAGE && this.direction == 0 /* Send */) {
          this.readyToSendHandlerManager.trigger(true);
        }
        if (this.transferData == void 0) return;
        if (data.messageBody == void 0) return;
        this.handleTransferredFile(data.messageBody);
      };
      this.handleTransferredFile = async (encryptedFileData) => {
        if (this.transferData == void 0) return;
        const decrypted = await decryptString(
          encryptedFileData,
          this.transferData.key
        );
        this.handleDecryptedFile(decrypted);
      };
      this.handleBackupFile = async (encryptedBackup, passphrase) => {
        const decrypted = await decryptString(
          encryptedBackup,
          passphrase
        );
        const parsed = parse(decrypted);
        if (!Array.isArray(parsed)) {
          console.error("Canceling backup - not an array", decrypted);
          throw "no array";
        }
        for (const file of parsed) {
          this.handleDecryptedFile(file);
        }
      };
      this.handleDecryptedFile = (data) => {
        const parsed = parse(data);
        const isFileData = checkMatchesObjectStructure(
          parsed,
          FileDataReference
        );
        if (isFileData == false) throw "not file data";
        const fileData = parsed;
        this.storageModel.write(fileData.path, fileData.body);
        const pathString = StorageModel.pathComponentsToString(
          ...fileData.path
        );
        this.fileHandlerManager.trigger(pathString);
      };
      // sending
      this.sendFiles = (directoryPaths, fileCallback) => {
        for (const directoryPath of directoryPaths) {
          this.storageModel.recurse(directoryPath, (filePath) => {
            const stringifiedFileData = this.prepareFileForSending(filePath);
            this.sendFile(stringifiedFileData);
            const pathString = StorageModel.pathComponentsToString(
              ...filePath
            );
            fileCallback(pathString);
          });
        }
      };
      this.generateBackup = async (directoryPaths, passphrase) => {
        const files = [];
        for (const directoryPath of directoryPaths) {
          this.storageModel.recurse(directoryPath, (filePath) => {
            const stringifiedFileData = this.prepareFileForSending(filePath);
            files.push(stringifiedFileData);
          });
        }
        const rawBackup = stringify(files);
        console.log(rawBackup);
        const encrypted = await encryptString(rawBackup, passphrase);
        const blob = new Blob([encrypted], { type: "text/plain" });
        return blob;
      };
      this.prepareFileForSending = (filePath) => {
        const fileContent = this.storageModel.read(filePath);
        if (fileContent == null) return "";
        const fileData = {
          path: filePath,
          body: fileContent
        };
        return stringify(fileData);
      };
      this.sendFile = async (stringifiedFileData) => {
        if (!this.transferData) return;
        const encryptedFileData = await encryptString(
          stringifiedFileData,
          this.transferData.key
        );
        this.connectionModel.sendPlainMessage(
          this.transferData.channel,
          encryptedFileData
        );
      };
      this.storageModel = storageModel2;
      this.connectionModel = connectionModel2;
      this.connectionModel.messageHandlerManager.setHandler(
        "file-transfer",
        this.handleMessage
      );
    }
    static {
      this.READY_MESSAGE = "ready";
    }
  };
  var FileDataReference = {
    path: [""],
    body: ""
  };

  // src/Model/Global/contactListModel.ts
  var ContactListModel = class {
    constructor(storageModel2, settingsModel2) {
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.contactHandlerManager = new HandlerManager();
      this.getContactPath = (contactId) => {
        return StorageModel.getPath("contacts" /* ContactsModel */, [
          contactId
        ]);
      };
      this.loadContacts = () => {
        const contactIds = this.storageModel.list([
          "contacts" /* ContactsModel */
        ]);
        const contacts = contactIds.map((id) => [
          id,
          this.storageModel.read(this.getContactPath(id)) ?? "?"
        ]);
        contacts.push([this.settingsModel.userid, this.settingsModel.username]);
        return contacts;
      };
      this.storeContact = (id, name) => {
        this.contactHandlerManager.trigger([id, name]);
        if (id == this.settingsModel.userid) return;
        const path = this.getContactPath(id);
        this.storageModel.write(path, name);
      };
    }
  };

  // node_modules/udn-frontend/index.ts
  var UDNFrontend = class {
    ws;
    // HANDLERS
    connectionHandler = () => {
    };
    disconnectionHandler = () => {
    };
    messageHandler = (data) => {
    };
    mailboxHandler = (mailboxId) => {
    };
    mailboxConnectionHandler = (mailboxId) => {
    };
    mailboxDeleteHandler = (mailboxId) => {
    };
    // INIT
    set onconnect(handler) {
      this.connectionHandler = handler;
    }
    set ondisconnect(handler) {
      this.disconnectionHandler = handler;
    }
    set onmessage(handler) {
      this.messageHandler = handler;
    }
    set onmailboxcreate(handler) {
      this.mailboxHandler = handler;
    }
    set onmailboxconnect(handler) {
      this.mailboxConnectionHandler = handler;
    }
    set onmailboxdelete(handler) {
      this.mailboxDeleteHandler = handler;
    }
    // UTILITY METHODS
    send(messageObject) {
      if (this.ws == void 0) return false;
      if (this.ws.readyState != 1) return false;
      const messageString = JSON.stringify(messageObject);
      this.ws.send(messageString);
      return true;
    }
    // PUBLIC METHODS
    // connection
    connect(address) {
      try {
        this.disconnect();
        this.ws = new WebSocket(address);
        this.ws.addEventListener("open", this.connectionHandler);
        this.ws.addEventListener("close", this.disconnectionHandler);
        this.ws.addEventListener("message", (message) => {
          const dataString = message.data.toString();
          const data = JSON.parse(dataString);
          if (data.assignedMailboxId) {
            return this.mailboxHandler(data.assignedMailboxId);
          } else if (data.connectedMailboxId) {
            return this.mailboxConnectionHandler(data.connectedMailboxId);
          } else if (data.deletedMailbox) {
            return this.mailboxDeleteHandler(data.deletedMailbox);
          } else {
            this.send({ uuid: data.uuid, confirmingMessageReceived: true });
            this.messageHandler(data);
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
    disconnect() {
      this.ws?.close();
    }
    // message
    sendMessage(channel, body) {
      const messageObject = {
        messageChannel: channel,
        messageBody: body
      };
      return this.send(messageObject);
    }
    // subscription
    subscribe(channel) {
      const messageObject = {
        subscribeChannel: channel
      };
      return this.send(messageObject);
    }
    unsubscribe(channel) {
      const messageObject = {
        unsubscribeChannel: channel
      };
      return this.send(messageObject);
    }
    // mailbox
    requestMailbox() {
      const messageObject = {
        requestingMailboxSetup: true
      };
      return this.send(messageObject);
    }
    connectMailbox(mailboxId) {
      const messageObject = {
        requestedMailbox: mailboxId
      };
      return this.send(messageObject);
    }
    deleteMailbox(mailboxId) {
      const messageObject = {
        deletingMailbox: mailboxId
      };
      return this.send(messageObject);
    }
  };

  // src/Model/Global/connectionModel.ts
  var ConnectionModel = class {
    // init
    constructor(storageModel2) {
      // config
      this.reconnectInterval = void 0;
      this.shouldAttemptReconnect = false;
      // handler managers
      this.connectionChangeHandlerManager = new HandlerManager();
      this.messageHandlerManager = new HandlerManager();
      this.messageSentHandlerManager = new HandlerManager();
      this.channelsToSubscribe = /* @__PURE__ */ new Set();
      // handlers
      this.handleMessage = (data) => {
        this.messageHandlerManager.trigger(data);
      };
      this.handleConnectionChange = () => {
        console.log("connection status:", this.isConnected, this.address);
        this.connectionChangeHandlerManager.trigger();
        if (this.address == void 0) return;
        this.storeAddress(this.address);
        this.sendSubscriptionRequest();
        this.sendMessagesInOutbox();
      };
      // connection
      this.connect = (address) => {
        console.log("connecting...", address);
        this.shouldAttemptReconnect = true;
        this.udn.connect(address);
      };
      this.disconnect = () => {
        this.shouldAttemptReconnect = false;
        this.udn.disconnect();
        const reconnectAddressPath = StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.reconnectAddress
        );
        this.storageModel.remove(reconnectAddressPath);
      };
      this.reconnect = () => {
        const reconnectAddressPath = this.getReconnectAddressPath();
        const reconnectAddress = this.storageModel.read(reconnectAddressPath);
        if (reconnectAddress == null) return;
        console.log("reconnecting...");
        this.connect(reconnectAddress);
      };
      // mailbox
      this.getMailboxPath = (address) => {
        const mailboxDirPath = StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.mailboxes
        );
        const mailboxFilePath = [...mailboxDirPath, address];
        return mailboxFilePath;
      };
      this.requestNewMailbox = () => {
        console.log("requesting new mailbox");
        this.udn.requestMailbox();
      };
      this.connectMailbox = () => {
        if (this.address == void 0) return;
        const mailboxId = this.storageModel.read(
          this.getMailboxPath(this.address)
        );
        console.log("connecting mailbox", mailboxId);
        if (mailboxId == null) return this.requestNewMailbox();
        this.udn.connectMailbox(mailboxId);
      };
      this.storeMailbox = (mailboxId) => {
        if (this.address == void 0) return;
        this.storageModel.write(this.getMailboxPath(this.address), mailboxId);
      };
      // subscription
      this.addChannel = (channel) => {
        this.channelsToSubscribe.add(channel);
        this.sendSubscriptionRequest();
      };
      this.sendSubscriptionRequest = () => {
        if (this.isConnected == false) return;
        for (const channel of this.channelsToSubscribe) {
          this.udn.subscribe(channel);
        }
        this.connectMailbox();
      };
      // outbox
      this.getOutboxPath = () => {
        return StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.outbox
        );
      };
      this.getOutboxMessags = () => {
        const outboxPath = this.getOutboxPath();
        const messageIds = this.storageModel.list(outboxPath);
        let chatMessages = [];
        for (const messageId of messageIds) {
          const chatMessage = this.storageModel.readStringifiable(
            [...outboxPath, messageId],
            ChatMessageReference
          );
          if (chatMessage == null) continue;
          chatMessages.push(chatMessage);
        }
        return chatMessages;
      };
      this.addToOutbox = (chatMessage) => {
        const messagePath = [
          ...this.getOutboxPath(),
          chatMessage.fileId
        ];
        this.storageModel.writeStringifiable(messagePath, chatMessage);
      };
      this.removeFromOutbox = (chatMessage) => {
        const messagePath = [
          ...this.getOutboxPath(),
          chatMessage.fileId
        ];
        this.storageModel.remove(messagePath);
      };
      this.sendMessagesInOutbox = () => {
        const messages = this.getOutboxMessags();
        for (const message of messages) {
          const isSent = this.tryToSendMessage(message);
          if (isSent == false) return;
          this.removeFromOutbox(message);
        }
      };
      // messaging
      this.sendMessageOrStore = (chatMessage) => {
        const isSent = this.tryToSendMessage(chatMessage);
        if (isSent == true) return;
        this.addToOutbox(chatMessage);
      };
      this.tryToSendMessage = (chatMessage) => {
        const stringifiedBody = stringify(chatMessage);
        const isSent = this.sendPlainMessage(
          chatMessage.channel,
          stringifiedBody
        );
        if (isSent) this.messageSentHandlerManager.trigger(chatMessage);
        return isSent;
      };
      this.sendPlainMessage = (channel, body) => {
        return this.udn.sendMessage(channel, body);
      };
      // storage
      this.getPreviousAddressPath = () => {
        return StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.previousAddresses
        );
      };
      this.getAddressPath = (address) => {
        const dirPath = this.getPreviousAddressPath();
        return [...dirPath, address];
      };
      this.getReconnectAddressPath = () => {
        return StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.reconnectAddress
        );
      };
      this.storeAddress = (address) => {
        const addressPath = this.getAddressPath(address);
        this.storageModel.write(addressPath, "");
        const reconnectAddressPath = this.getReconnectAddressPath();
        this.storageModel.write(reconnectAddressPath, address);
      };
      this.removeAddress = (address) => {
        const addressPath = this.getAddressPath(address);
        this.storageModel.remove(addressPath);
      };
      this.udn = new UDNFrontend();
      this.storageModel = storageModel2;
      this.udn.onmessage = (data) => {
        this.handleMessage(data);
      };
      this.udn.onconnect = () => {
        this.handleConnectionChange();
      };
      this.udn.ondisconnect = () => {
        this.handleConnectionChange();
      };
      this.udn.onmailboxcreate = (mailboxId) => {
        console.log("created mailbox", mailboxId);
        this.storeMailbox(mailboxId);
        this.connectMailbox();
      };
      this.udn.onmailboxdelete = (mailboxId) => {
        console.log(`mailbox ${mailboxId} deleted`);
        this.requestNewMailbox();
      };
      this.udn.onmailboxconnect = (mailboxId) => {
        console.log(`using mailbox ${mailboxId}`);
      };
      setInterval(() => {
        if (this.isConnected == true) return;
        if (this.shouldAttemptReconnect == false) return;
        this.reconnect();
      }, 5e3);
      this.reconnect();
    }
    // data
    get isConnected() {
      return this.udn.ws != void 0 && this.udn.ws.readyState == 1;
    }
    get address() {
      return this.udn.ws?.url;
    }
    get addresses() {
      const dirPath = this.getPreviousAddressPath();
      return this.storageModel.list(dirPath);
    }
  };

  // src/Model/Chat/chatListModel.ts
  var ChatListModel = class {
    // init
    constructor(storageModel2, settingsModel2, connectionModel2, contactListModel2) {
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.connectionModel = connectionModel2;
      this.contactListModel = contactListModel2;
      // data
      this.chatModels = /* @__PURE__ */ new Set();
      // chat handling
      this.addChatModel = (chatModel) => {
        this.chatModels.add(chatModel);
      };
      this.createChat = (primaryChannel) => {
        const id = v4_default();
        const chatModel = new ChatModel(
          this.storageModel,
          this.connectionModel,
          this.settingsModel,
          this,
          this.contactListModel,
          id
        );
        chatModel.setName(primaryChannel);
        this.addChatModel(chatModel);
        return chatModel;
      };
      this.untrackChat = (chat) => {
        this.chatModels.delete(chat);
      };
      // message handlers
      this.messageHandler = (data) => {
        const channel = data.messageChannel;
        const body = data.messageBody;
        if (channel == void 0) return;
        if (body == void 0) return;
        this.routeMessageToCorrectChatModel(
          channel,
          (chatModel) => chatModel.handleMessage(body)
        );
      };
      this.messageSentHandler = (chatMessage) => {
        const channel = chatMessage.channel;
        this.routeMessageToCorrectChatModel(
          channel,
          (chatModel) => chatModel.handleMessageSent(chatMessage)
        );
      };
      // util
      this.routeMessageToCorrectChatModel = (channel, fn) => {
        const allChannels = channel.split("/");
        for (const chatModel of this.chatModels) {
          for (const channel2 of allChannels) {
            if (channel2 != chatModel.id) continue;
            fn(chatModel);
            break;
          }
        }
      };
      // load
      this.loadChats = () => {
        const chatDir = StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.base
        );
        const chatIds = this.storageModel.list(chatDir);
        for (const chatId of chatIds) {
          const chatModel = new ChatModel(
            this.storageModel,
            this.connectionModel,
            this.settingsModel,
            this,
            this.contactListModel,
            chatId
          );
          this.addChatModel(chatModel);
        }
      };
      this.loadChats();
      this.connectionModel.messageHandlerManager.setHandler(
        "chat-list",
        this.messageHandler
      );
      this.connectionModel.messageSentHandlerManager.setHandler(
        "chat-list",
        this.messageSentHandler
      );
    }
  };

  // src/ViewModel/Global/onboardingViewModel.ts
  var OnboardingViewModel = class {
    // init
    constructor(connectionViewmodel, fileTransferViewModel2, settingsViewModel2) {
      this.connectionViewmodel = connectionViewmodel;
      this.fileTransferViewModel = fileTransferViewModel2;
      this.settingsViewModel = settingsViewModel2;
      // state
      this.presentedModal = new State(void 0);
      // guards
      this.cannotTransfer = createProxyState([this.connectionViewmodel.isConnected], () => !this.connectionViewmodel.isConnected.value);
      // navigation 
      this.open = () => {
        this.presentedModal.value = 0 /* Connection */;
      };
      this.showTransferOption = () => {
        this.presentedModal.value = 1 /* TransferOrNew */;
      };
      this.setupNew = () => {
        this.presentedModal.value = 2 /* Name */;
      };
      this.showTransferData = () => {
        this.presentedModal.value = 3 /* Transfer */;
      };
      // methods
      this.transferData = () => {
        this.fileTransferViewModel.exitReception = () => this.showTransferData();
        this.fileTransferViewModel.prepareReceivingData();
        this.presentedModal.value = void 0;
      };
      this.finish = () => {
        this.settingsViewModel.setName();
        this.presentedModal.value = void 0;
      };
      if (this.settingsViewModel.settingsModel.username == "") this.open();
    }
  };

  // src/View/Modals/onboardingModal.tsx
  function OnboardingModalWrapper(coreViewModel2, onboardingViewModel2) {
    return /* @__PURE__ */ createElement("div", null, ConnectionModal2(coreViewModel2, onboardingViewModel2), TransferModal(coreViewModel2, onboardingViewModel2), NameModal(coreViewModel2, onboardingViewModel2), TransferDataModal(coreViewModel2, onboardingViewModel2));
  }
  function ConnectionModal2(coreViewModel2, onboardingViewModel2) {
    const isPresented = createProxyState(
      [onboardingViewModel2.presentedModal],
      () => onboardingViewModel2.presentedModal.value == 0 /* Connection */
    );
    const connectionViewModel2 = onboardingViewModel2.connectionViewmodel;
    const nextButton = createProxyState([connectionViewModel2.isConnected], () => coreViewModel2.translations.onboarding.connectionNextButton(connectionViewModel2.isConnected.value));
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": isPresented
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.onboarding.connectionHeadline), /* @__PURE__ */ createElement("p", { class: "secondary width-input" }, coreViewModel2.translations.onboarding.connectionDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "cell_tower"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.homePage.serverAddress), /* @__PURE__ */ createElement(
        "input",
        {
          placeholder: coreViewModel2.translations.homePage.serverAddressPlaceholder,
          "bind:value": connectionViewModel2.serverAddressInput,
          "on:enter": connectionViewModel2.connect
        }
      ))), /* @__PURE__ */ createElement("div", { class: "flex-row width-input justify-end" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "standard width-50",
          "on:click": connectionViewModel2.connect,
          "toggle:disabled": connectionViewModel2.cannotConnect
        },
        coreViewModel2.translations.onboarding.connectButton
      ))), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "primary width-50",
          "on:click": onboardingViewModel2.showTransferOption
        },
        /* @__PURE__ */ createElement(
          "span",
          {
            "subscribe:innerText": nextButton
          }
        ),
        /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
      )))
    );
  }
  function TransferModal(coreViewModel2, onboardingViewModel2) {
    const isPresented = createProxyState(
      [onboardingViewModel2.presentedModal],
      () => onboardingViewModel2.presentedModal.value == 1 /* TransferOrNew */
    );
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": isPresented
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.onboarding.transferOptionsHeadline), /* @__PURE__ */ createElement("p", { class: "secondary width-input" }, coreViewModel2.translations.onboarding.transferOptionsDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "tile",
          "on:click": onboardingViewModel2.showTransferData,
          "toggle:disabled": onboardingViewModel2.cannotTransfer
        },
        /* @__PURE__ */ createElement("div", null, coreViewModel2.translations.onboarding.transferOptionTransfer),
        /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
      ), /* @__PURE__ */ createElement(
        "button",
        {
          class: "tile",
          "on:click": onboardingViewModel2.setupNew
        },
        /* @__PURE__ */ createElement("div", null, coreViewModel2.translations.onboarding.transferOptionNew),
        /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
      ))), /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "standard width-50",
          "on:click": onboardingViewModel2.open
        },
        coreViewModel2.translations.general.backButton
      )))
    );
  }
  function NameModal(coreViewModel2, onboardingViewModel2) {
    const isPresented = createProxyState(
      [onboardingViewModel2.presentedModal],
      () => onboardingViewModel2.presentedModal.value == 2 /* Name */
    );
    const settingsViewModel2 = onboardingViewModel2.settingsViewModel;
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": isPresented
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.onboarding.nameHeadline), /* @__PURE__ */ createElement("p", { class: "secondary width-input" }, coreViewModel2.translations.onboarding.nameDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "account_circle"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.settings.account.yourNameLabel), /* @__PURE__ */ createElement(
        "input",
        {
          placeholder: coreViewModel2.translations.settings.account.yourNamePlaceholder,
          "bind:value": settingsViewModel2.usernameInput
        }
      )))), /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "standard width-50",
          "on:click": onboardingViewModel2.showTransferOption
        },
        coreViewModel2.translations.general.backButton
      ), /* @__PURE__ */ createElement(
        "button",
        {
          class: "primary width-50",
          "on:click": onboardingViewModel2.finish
        },
        coreViewModel2.translations.general.setButton,
        /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
      )))
    );
  }
  function TransferDataModal(coreViewModel2, onboardingViewModel2) {
    const isPresented = createProxyState(
      [onboardingViewModel2.presentedModal],
      () => onboardingViewModel2.presentedModal.value == 3 /* Transfer */
    );
    const fileTransferViewModel2 = onboardingViewModel2.fileTransferViewModel;
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": isPresented
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.onboarding.transferHeadline), /* @__PURE__ */ createElement("p", { class: "secondary width-input" }, coreViewModel2.translations.onboarding.transferDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "forum"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferChannelHeadline), /* @__PURE__ */ createElement(
        "input",
        {
          type: "number",
          "on:enter": fileTransferViewModel2.prepareReceivingData,
          "bind:value": fileTransferViewModel2.receivingTransferChannel
        }
      ))), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferKeyHeadline), /* @__PURE__ */ createElement(
        "input",
        {
          type: "number",
          "on:enter": fileTransferViewModel2.prepareReceivingData,
          "bind:value": fileTransferViewModel2.receivingTransferKey
        }
      ))))), /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "standard width-50",
          "on:click": onboardingViewModel2.showTransferOption,
          "toggle:disabled": fileTransferViewModel2.cannotExitReception
        },
        coreViewModel2.translations.general.backButton
      ), /* @__PURE__ */ createElement(
        "button",
        {
          class: "primary width-50",
          "on:click": onboardingViewModel2.transferData
        },
        coreViewModel2.translations.onboarding.transferButton,
        /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
      )))
    );
  }

  // src/index.tsx
  var storageModel = new StorageModel();
  var settingsModel = new SettingsModel(storageModel);
  var contactListModel = new ContactListModel(storageModel, settingsModel);
  var connectionModel = new ConnectionModel(storageModel);
  var chatListModel = new ChatListModel(
    storageModel,
    settingsModel,
    connectionModel,
    contactListModel
  );
  var fileTransferModel = new FileTransferModel(storageModel, connectionModel);
  var coreViewModel = new CoreViewModel(
    storageModel,
    settingsModel,
    connectionModel,
    chatListModel,
    fileTransferModel
  );
  var storageViewModel = new StorageViewModel(coreViewModel);
  var settingsViewModel = new SettingsViewModel(coreViewModel, settingsModel);
  var contactListViewModel = new ContactListViewModel(
    contactListModel,
    settingsViewModel
  );
  var connectionViewModel = new ConnectionViewModel(coreViewModel);
  var chatListViewModel = new ChatListViewModel(
    coreViewModel,
    settingsViewModel,
    connectionViewModel,
    contactListViewModel
  );
  var fileTransferViewModel = new FileTransferViewModel(coreViewModel);
  var onboardingViewModel = new OnboardingViewModel(connectionViewModel, fileTransferViewModel, settingsViewModel);
  var homeViewModel = new HomeViewModel(
    coreViewModel,
    settingsViewModel,
    fileTransferViewModel,
    storageViewModel,
    connectionViewModel
  );
  chatListViewModel.selectedChat.subscribe(() => {
    document.body.toggleAttribute(
      "showing-chat",
      chatListViewModel.selectedChat.value != void 0
    );
  });
  document.body.append(
    /* @__PURE__ */ createElement("div", { id: "background-wrapper" }, /* @__PURE__ */ createElement("div", { id: "sky" }), /* @__PURE__ */ createElement("div", { id: "grass-1" }), /* @__PURE__ */ createElement("div", { id: "grass-2" }))
  );
  document.querySelector("main").append(
    HomePage(
      coreViewModel,
      storageViewModel,
      settingsViewModel,
      connectionViewModel,
      fileTransferViewModel,
      chatListViewModel
    ),
    ChatPageWrapper(coreViewModel, chatListViewModel),
    OnboardingModalWrapper(coreViewModel, onboardingViewModel),
    ConnectionModal(coreViewModel, connectionViewModel),
    DataTransferModalWrapper(
      coreViewModel,
      connectionViewModel,
      fileTransferViewModel
    ),
    StorageModal(coreViewModel, storageViewModel),
    SettingsModal(coreViewModel, settingsViewModel)
  );
})();
