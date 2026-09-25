const englishTranslations = {
    updater: {
	migrated: "Migrated",
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
	createLabel: (query: string) => `Create "${query}"`,

	reloadAppButton: "Reload App",

	fileVersionLabel: "Version",
	searchLabel: "Search",
	searchSuggestionsLabel: "Recent searches",
	waitingLabel: "Waiting...",

	restoreConnection: "Restore connection",

	noPageSelected: "No page selected",
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
		"Saturday",
	    ],
	    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	},
    },

    homePage: {
	appName: "Comms",

	///

	overviewHeadline: "Overview",

	serverAddress: "Server address",
	serverAddressPlaceholder: "wss://192.168.0.69:3000",
	connectAudioLabel: "connect to server",
	disconnectAudioLabel: "disconnect from server",
	manageConnectionsAudioLabel: "manage connections",

	yourNameLabel: "Your name",
	yourNamePlaceholder: "Jane Doe",
	setNameButtonAudioLabel: "set name",

	settingsButton: "Settings",
	manageStorageButton: "Manage storage",
	transferDataButton: "Transfer or export data",

	updateButton: (version: string) => `Update to ${version}`,

	scrollToChatButton: "Chats",

	///

	backToOverviewAudioLabel: "go back to overview",
	chatsHeadline: "Chats",

	addChatAudioLabel: "name of new chat",
	addChatPlaceholder: "Add chat",
	addChatButton: "Add chat",
    },

    settings: {
	pages: {
	    appearance: "Appearance",
	    regional: "Language & Region",
	    info: "About Comms",
	},
	themes: {
	    dynamic: "Dynamic",
	    dark: "Dark",
	    light: "Light",
	    system: "Device theme",
	    black: "Black",
	},

	version: "Version",
	language: "Language",

	firstDayOfWeekLabel: "First day of week",

	checkUpdatesButton: "Check for updates",
    },

    connectionModal: {
	connectionModalHeadline: "Manage Connections",

	///

	connectButtonAudioLabel: "connect",
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
	dataEntryInputDescription:
	"Enter the data displayed on the other device.",

	///

	fromThisDeviceButton: "Send to other device",
	toThisDeviceButton: "Send to this device",
	exportButton: "Export to file",
	importButton: "Import from file",

	///

	generalHeadline: "General",

	connectionData: "Connection Data",
	settingsData: "Settings Data",

	chatsHeadline: "Chats",

	///

	transferChannelHeadline: "Transfer Chanel",
	transferKeyHeadline: "Transfer Encryption Key",

	sendButton: "Send",
	sendAgainButton: "Send again",

	///

	filesSentCount: (count: number) => `Files sent: ${count}.`,
	allFilesSent: "Done.",

	filesReceivedCount: (count: number) => `Files processed: ${count}.`,

	//

	exportKey: "Encryption key",
	exportKeyConfirmation: "Confirm",
	downloadFileButton: "Download",
	importFileButton: "Import",
	decryptImportButton: "Decrypt",
	incorrectPassphraseError: "The encryption key is incorrect",
    },

    storage: {
	noItemSelected: "No item selected",
	notAFile: "(not a file)",
	contentEmpty: "(empty)",

	usageLabel: "Usage",
	usageVauleLabel: (used: number, max: number) => `${used} of ${max} MB`,

	path: "Path",
	content: "Content",

	deleteItem: "Delete item",

	removeJunkButton: "Delete junk files",
    },

    chatPage: {
	closeChatAudioLabe: "close chat",
	chatSettingsAudioLabel: "chat settings",

	pages: {
	    settings: "Settings",
	    messages: "Messages",
	    tasks: "Tasks",
	    calendar: "Calendar",
	},

	settings: {
	    settingsHeadline: "Settings",

	    primaryChannelLabel: "Primary channel",
	    setPrimaryChannelButtonAudioLabel: "set primary channel",

	    namespaceLabel: "Namespace",
	    namespacePlaceholder: "No namespace",
	    setNamespaceButtonAudioLabel: "set namespace",

	    newSecondaryChannelPlaceholder: "Add secondary channel",
	    newSecondaryChannelAudioLabel: "name of new secondary channel",
	    addSecondaryChannelButtonAudioLabel: "add secondary channel",

	    encryptionKeyLabel: "Encryption key",
	    setEncryptionKeyButtonAudioLabel: "set encryption key",
	    showEncryptionKey: "Show encryption key",

	    deleteChatButton: "Delete entire chat",
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
	    replyHeaderLabel: (message: string) => `Replies to "${message}"`,
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
	    renameStatusInputPlaceholder: "Rename status",
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
	},
    },
};

export const allTranslations: {
    [language: string]: typeof englishTranslations;
} = {
    en: englishTranslations,

    de: {
	updater: {
	    migrated: "Migriert",
	},

	general: {
	    deleteItemButtonAudioLabel: "element löschen",
	    searchButtonAudioLabel: "suchen",
	    searchButtonClearAudioLabel: "suche zurücksetzen",

	    abortButton: "Abbrechen",
	    applyButton: "Anwenden",
	    backButton: "Zurück",
	    cancelButton: "Abbrechen",
	    continueButton: "Weiter",
	    confirmButton: "Bestätigen",
	    closeButton: "Schließen",
	    deleteButton: "Löschen",
	    exitButton: "Schließen",
	    fullscreenButton: "Vollbild",
	    refreshButton: "Aktualisieren",
	    saveButton: "Speichern",
	    setButton: "OK",

	    filterOrCreateLabel: "Suchen oder erstellen",
	    createLabel: (query: string) => `"${query}" erstellen`,

	    reloadAppButton: "Neu laden",

	    fileVersionLabel: "Version",
	    searchLabel: "Suche",
	    searchSuggestionsLabel: "Vorherige Suchen",
	    waitingLabel: "Warten...",

	    restoreConnection: "Verbindung wiederherstellen",

	    noPageSelected: "Keine Seite ausgewählt",
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
		    "Samstag",
		],
		abbreviated: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
	    },
	},

	homePage: {
	    appName: "Comms",

	    overviewHeadline: "Übersicht",

	    serverAddress: "Serveradresse",
	    serverAddressPlaceholder: "wss://192.168.0.69:3000",
	    connectAudioLabel: "mit Server verbinden",
	    disconnectAudioLabel: "vom Server trennen",
	    manageConnectionsAudioLabel: "Verbindungen verwalten",

	    yourNameLabel: "Dein Name",
	    yourNamePlaceholder: "Max Mustermann",
	    setNameButtonAudioLabel: "Name speichern",

	    settingsButton: "Einstellungen",
	    manageStorageButton: "Daten verwalten",
	    transferDataButton: "Daten übertragen",

	    updateButton: (version: string) => `Aktualisieren: ${version}`,

	    scrollToChatButton: "Chats",

	    backToOverviewAudioLabel: "zurück zur übersicht",
	    chatsHeadline: "Chats",

	    addChatAudioLabel: "Name des neuen Chats",
	    addChatPlaceholder: "Chat hinzufügen",
	    addChatButton: "Chat hinzufügen",
	},

	settings: {
	    pages: {
		appearance: "Erscheinungsbild",
		regional: "Sprache & Region",
		info: "Über Comms",
	    },
	    themes: {
		dynamic: "Dynamisch",
		dark: "Dunkel",
		light: "Hell",
		system: "Geräteeinstellung",
		black: "Schwarz",
	    },

	    version: "Version",
	    language: "Sprache",

	    firstDayOfWeekLabel: "Erster Wochentag",

	    checkUpdatesButton: "Nach updates suchen",
	},

	connectionModal: {
	    connectionModalHeadline: "Verbindungen verwalten",

	    connectButtonAudioLabel: "verbinden",
	},

	dataTransferModal: {
	    transferDataHeadline: "Datenübertragung",
	    sendHeadline: "An anderes Gerät senden",
	    receiveHeadline: "An dieses Gerät senden",
	    exportHeadline: "Daten exportieren",
	    importHeadline: "Daten importieren",
	    selectionDescription:
	    "Wähle die Daten aus, die du übertragen möchtest.",
	    exportSelectionDescription:
	    "Wähle die Daten aus, die du exportieren möchtest.",
	    dataEntryDescription:
	    "Gib diese Informationen auf dem anderen Gerät ein.",
	    dataEntryInputDescription:
	    "Gib die auf dem anderen Gerät angezeigten Informationen ein.",

	    fromThisDeviceButton: "An anderes Gerät senden",
	    toThisDeviceButton: "An dieses Gerät senden",
	    exportButton: "Als Datei exportieren",
	    importButton: "Aus Datei importieren",

	    generalHeadline: "Allgemein",

	    connectionData: "Verbindungsdaten",
	    settingsData: "Einstellungen",

	    chatsHeadline: "Chats",

	    transferChannelHeadline: "Übertragungskanal",
	    transferKeyHeadline: "Schlüssel",

	    sendButton: "Senden",
	    sendAgainButton: "Erneut senden",

	    filesSentCount: (count) => `Dateien gesendet: ${count}.`,
	    allFilesSent: "Fertig.",

	    filesReceivedCount: (count) => `Dateien empfangen: ${count}.`,

	    exportKey: "Schlüssel",
	    exportKeyConfirmation: "Schlüssel bestätigen",
	    downloadFileButton: "Herunterladen",
	    importFileButton: "Importieren",
	    decryptImportButton: "Entschlüsseln",
	    incorrectPassphraseError: "Der Schlüssel ist nicht korrekt",
	},

	storage: {
	    noItemSelected: "Kein Element ausgewählt",
	    notAFile: "(keine Datei)",
	    contentEmpty: "(leer)",

	    usageLabel: "Speicher",
	    usageVauleLabel: (used: number, max: number) => `${used} von ${max} MB belegt`,

	    path: "Pfad",
	    content: "Inhalt",

	    deleteItem: "Element löschen",

	    removeJunkButton: "Datenmüll löschen",
	},

	chatPage: {
	    closeChatAudioLabe: "Chat schließen",
	    chatSettingsAudioLabel: "Chateinstellungen",

	    pages: {
		settings: "Einstellungen",
		messages: "Nachrichten",
		tasks: "Aufgaben",
		calendar: "Kalender",
	    },

	    settings: {
		settingsHeadline: "Einstellungen",

		primaryChannelLabel: "Hauptkanal",
		setPrimaryChannelButtonAudioLabel: "Hauptkanal festlegen",

		namespaceLabel: "Namensraum",
		namespacePlaceholder: "Ohne Namensraum",
		setNamespaceButtonAudioLabel: "Namensraum festlegen",

		newSecondaryChannelPlaceholder: "Sekundären Kanal hinzufügen",
		newSecondaryChannelAudioLabel:
		"Name des neuen sekundären Kanals",
		addSecondaryChannelButtonAudioLabel:
		"Sekundären Kanal hinzufügen",

		encryptionKeyLabel: "Schlüssel",
		setEncryptionKeyButtonAudioLabel: "Schlüssel festlegen",
		showEncryptionKey: "Schlüssel anzeigen",

		deleteChatButton: "Gesamten Chat löschen",
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
		decryptMessageButton: "Nachricht entschlüsseln",
		replyToMessageButton: "Auf Nachricht antworten",
		deleteMessageButton: "Nachricht löschen",

		//

		thumbsUpReaction: "Reaktion: Daumen hoch",
		checkReaction: "Reaktion: Haken",
		stopReaction: "Reaktion: Stopp",
		attentionReaction: "Reaktion: Ausrufezeichen",
		doubleAttentionReaction: "Reaktion: doppeltes Ausrufezeichen",
		questionReaction: "Reaktion: Fragezeichen",

		replyPrefixLabel: "Antworten: ",
		replyHeaderLabel: (message: string) => `Antworten an "${message}"`,
	    },

	    task: {
		noBoardSelected: "Kein Board ausgewählt",
		boardNotFound: "Board nicht gefunden",

		closeBoardButtonAudioLabel: "board schließen",
		toggleBoardButtonAudioLabel: "board-liste ein/ausblenden",
		showBoardSettingsButtonAudioLabel:
		"Board-Einstellungen anzeigen",

		listViewButtonAudioLabel: "Listenansicht",
		kanbanViewButtonAudioLabel: "Kanban-Ansicht",
		statusViewButtonAudioLabel: "Statusrasteransicht",

		filterTasksButtonAudioLabel: "Aufgaben filtern",
		createTaskButtonAudioLabel: "Neue Aufgabe erstellen",

		boardSettingsHeadline: "Board-Einstellungen",
		boardNameInputLabel: "Boardname",
		deleteBoardButton: "Board und alle Aufgaben löschen",

		taskSettingsHeadline: "Aufgabe bearbeiten",

		taskNameLabel: "Titel",
		taskBoardLabel: "Board",

		taskCategoryLabel: "Kategorie",
		taskStatusLabel: "Status",
		taskPriorityLabel: "Priorität",

		taskDescriptionLabel: "Beschreibung",

		taskDateLabel: "Datum",
		taskTimeLabel: "Uhrzeit",

		deleteTaskButton: "Aufgabe löschen",

		filterTasksHeadline: "Aufgaben filtern",

		renameCategoryInputPlaceholder: "Kategorie umbenennen",
		renameStatusInputPlaceholder: "Status umbenennen",
	    },

	    calendar: {
		eventsBoard: "Ereignisse",

		///

		todayButtonAudioLabel: "gehe zu heute",

		previousMonthButtonAudioLabel: "vorheriger monat",
		nextMonthButtonAudioLabel: "nächster monat",

		yearInputAudioLabel: "Jahr",
		monthInputAudioLabel: "Monat",

		yearInputPlaceholder: "2000",
		monthInputPlaceholder: "01",

		searchEventsHeadline: "Ereignisse suchen",

		events: "Ereignisse",
		noEvents: "Keine Ereignisse",
	    },
	},
    },
    es: {
	updater: {
	    migrated: "Migrado",
	},

	general: {
	    deleteItemButtonAudioLabel: "eliminar elemento",
	    searchButtonAudioLabel: "buscar",
	    searchButtonClearAudioLabel: "borrar büsqueda",

	    abortButton: "Abortar",
	    applyButton: "Guardar",
	    backButton: "Atrás",
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
	    createLabel: (query: string) => `Crear "${query}"`,

	    reloadAppButton: "Recargar app",

	    fileVersionLabel: "Versión",
	    searchLabel: "Buscar",
	    searchSuggestionsLabel: "Búsquedas anteriores",
	    waitingLabel: "Esperando...",

	    restoreConnection: "Conectar de nuevo",

	    noPageSelected: "No página seleccionada",
	},

	regional: {
	    weekdays: {
		full: [
		    "Domingo",
		    "Lunes",
		    "Martes",
		    "Miércoles",
		    "Jueves",
		    "Viernes",
		    "Sábado",
		],
		abbreviated: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
	    },
	},

	homePage: {
	    appName: "Comms",

	    overviewHeadline: "Resumen",

	    serverAddress: "Dirección del servidor",
	    serverAddressPlaceholder: "wss://192.168.0.69:3000",
	    connectAudioLabel: "conectar al servidor",
	    disconnectAudioLabel: "desconectar del servidor",
	    manageConnectionsAudioLabel: "gestionar conexiones",

	    yourNameLabel: "Tu nombre",
	    yourNamePlaceholder: "Juan Pérez",
	    setNameButtonAudioLabel: "establecer nombre",

	    settingsButton: "Ajustes",
	    manageStorageButton: "Gestionar almacenamiento",
	    transferDataButton: "Enviar o exportar archivos",

	    updateButton: (version: string) => `Actualizar a ${version}`,

	    scrollToChatButton: "Chats",

	    backToOverviewAudioLabel: "volver al resumen",
	    chatsHeadline: "Chats",

	    addChatAudioLabel: "nombre del nuevo chat",
	    addChatPlaceholder: "Añadir chat",
	    addChatButton: "Añadir chat",
	},

	settings: {
	    pages: {
		appearance: "Aspecto",
		regional: "Idioma y Región",
		info: "Sobre Comms",
	    },
	    themes: {
		dynamic: "Dinámico",
		dark: "Oscuro",
		light: "Claro",
		system: "Según dispositivo",
		black: "Negro",
	    },

	    version: "Versión",
	    language: "Idioma",

	    firstDayOfWeekLabel: "Primer día de la semana",

	    checkUpdatesButton: "Buscar actualizaciones",
	},
	connectionModal: {
	    connectionModalHeadline: "Gestionar Conexiones",

	    connectButtonAudioLabel: "conectar",
	},

	dataTransferModal: {
	    transferDataHeadline: "Transferencia de datos",
	    sendHeadline: "Enviar a otro dispositivo",
	    receiveHeadline: "Enviar a este dispositivo",
	    exportHeadline: "Exportar archivo",
	    importHeadline: "Importar archivo",
	    selectionDescription:
	    "Selecciona los datos que quieres transferir.",
	    exportSelectionDescription:
	    "Selecciona los datos que quieres exportar.",
	    dataEntryDescription:
	    "Introduce estos datos en el otro dispositivo.",
	    dataEntryInputDescription:
	    "Introduce los datos mostrados en el otro dispositivo.",

	    fromThisDeviceButton: "Enviar a otro dispositivo",
	    toThisDeviceButton: "Enviar a este dispositivo",
	    exportButton: "Exportar archivo",
	    importButton: "Importar archivo",

	    generalHeadline: "General",

	    connectionData: "Datos de Conexión",
	    settingsData: "Datos de Configuración",

	    chatsHeadline: "Chats",

	    transferChannelHeadline: "Canal de Transferencia",
	    transferKeyHeadline: "Clave de encriptación de transferencia",

	    sendButton: "Enviar",
	    sendAgainButton: "Enviar otra vez",

	    filesSentCount: (count) => `Archivos enviados: ${count}.`,
	    allFilesSent: "Hecho.",

	    filesReceivedCount: (count) => `Archivos recibidos: ${count}.`,

	    exportKey: "Clave de encriptación",
	    exportKeyConfirmation: "Confirmar clave",
	    downloadFileButton: "Descargar",
	    importFileButton: "Importar",
	    decryptImportButton: "Descifrar",
	    incorrectPassphraseError: "La clave no es correcta",
	},

	storage: {
	    noItemSelected: "Ningún elemento seleccionado",
	    notAFile: "(no es un archivo)",
	    contentEmpty: "(vacío)",

	    usageLabel: "Almacenamiento",
	    usageVauleLabel: (used: number, max: number) => `${used} de ${max} MB en uso`,

	    path: "Ruta",
	    content: "Contenido",

	    deleteItem: "Eliminar elemento",

	    removeJunkButton: "Eliminar archivos basura",
	},

	chatPage: {
	    closeChatAudioLabe: "cerrar chat",
	    chatSettingsAudioLabel: "configuración del chat",

	    pages: {
		settings: "Configuración",
		messages: "Mensajes",
		tasks: "Tareas",
		calendar: "Calendario",
	    },

	    settings: {
		settingsHeadline: "Configuración",

		primaryChannelLabel: "Canal principal",
		setPrimaryChannelButtonAudioLabel: "establecer canal principal",

		namespaceLabel: "Espacio de nombres",
		namespacePlaceholder: "Sin espacio de nombres",
		setNamespaceButtonAudioLabel: "establecer espacio de nombres",

		newSecondaryChannelPlaceholder: "Añadir canal secundario",
		newSecondaryChannelAudioLabel:
		"nombre del nuevo canal secundario",
		addSecondaryChannelButtonAudioLabel: "añadir canal secundario",

		encryptionKeyLabel: "Clave de encriptación",
		setEncryptionKeyButtonAudioLabel:
		"establecer clave de encriptación",
		showEncryptionKey: "Mostrar clave de encriptación",

		deleteChatButton: "Eliminar todo el chat",
	    },

	    message: {
		messagesHeadline: "Mensajes",

		messageFilterHeadline: "Filtrar mensajes",
		messageFilterReactionsHadline: "Reacciones",
		messageFilterAllReactionsButton: "Mostrar todas",

		composerInputPlaceholder: "Escribe un mensaje...",
		sendMessageButtonAudioLabel: "enviar mensaje",
		filterMessagesButtonAudioLabel: "filtrar mensajes",

		showMessageInfoButtonAudioLabel:
		"mostrar información del mensaje",
		messageInfoHeadline: "Información del Mensaje",
		cancelReplyAudioLabel: "abortar la respuesta",

		sentBy: "Enviado por",
		timeSent: "Hora de envío",
		channel: "Canal",
		messageContent: "Contenido del mensaje",

		copyMessageButton: "Copiar mensaje",
		resendMessageButton: "Reenviar mensaje",
		decryptMessageButton: "Desencriptar mensaje",
		replyToMessageButton: "Responder al mensaje",
		deleteMessageButton: "Eliminar mensaje",

		//

		thumbsUpReaction: "Reacción: pulgar hacia arriba",
		checkReaction: "Reacción: marca de verificación",
		stopReaction: "Reacción: signo de parada",
		attentionReaction: "Reaccion: signo de atención",
		doubleAttentionReaction: "Reaccion: signo de atención doble",
		questionReaction: "Reaccion: signo de interrogación",

		replyPrefixLabel: "Respuestas: ",
		replyHeaderLabel: (message: string) => `Respuestas a "${message}"`,
	    },

	    task: {
		noBoardSelected: "Ningún tablero seleccionado",
		boardNotFound: "Tablero no encontrado",

		closeBoardButtonAudioLabel: "cerrar tablero",
		toggleBoardButtonAudioLabel:
		"mostrar o ocultar lista de tableros",
		showBoardSettingsButtonAudioLabel:
		"mostrar configuración del tablero",

		listViewButtonAudioLabel: "vista de lista",
		kanbanViewButtonAudioLabel: "vista kanban",
		statusViewButtonAudioLabel: "vista de cuadrícula de estado",

		filterTasksButtonAudioLabel: "filtrar tareas",
		createTaskButtonAudioLabel: "crear nueva tarea",

		boardSettingsHeadline: "Configuración del Tablero",
		boardNameInputLabel: "Nombre del tablero",
		deleteBoardButton: "Eliminar tablero y todas las tareas",

		taskSettingsHeadline: "Editar Tarea",

		taskNameLabel: "Título",
		taskBoardLabel: "Tablero",

		taskCategoryLabel: "Categoría",
		taskStatusLabel: "Estado",
		taskPriorityLabel: "Prioridad",

		taskDescriptionLabel: "Descripción",

		taskDateLabel: "Fecha",
		taskTimeLabel: "Hora",

		deleteTaskButton: "Eliminar tarea",

		filterTasksHeadline: "Filtrar Tareas",

		renameCategoryInputPlaceholder: "Renombrar categoría",
		renameStatusInputPlaceholder: "Renombrar estado",
	    },

	    calendar: {
		eventsBoard: "Eventos",

		///

		todayButtonAudioLabel: "ir a hoy",

		previousMonthButtonAudioLabel: "mes anterior",
		nextMonthButtonAudioLabel: "mes siguiente",

		yearInputAudioLabel: "año",
		monthInputAudioLabel: "mes",

		yearInputPlaceholder: "2000",
		monthInputPlaceholder: "01",

		searchEventsHeadline: "Buscar Eventos",

		events: "Eventos",
		noEvents: "No hay eventos",
	    },
	},
    },
};

export const languageNames = {
    en: "English",
    de: "Deutsch",
    es: "Español",
};

export type Translations = typeof englishTranslations;
