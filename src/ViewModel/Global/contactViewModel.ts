import ContactListModel from "../../Model/Global/contactListModel";
import * as React from "../../react";
import SettingsViewModel from "./settingsViewModel";

export default class ContactListViewModel {
    // state
    contacts: Map<string, ContactViewModel> = new Map();

    // main
    updateContact = (id: string, name: string): ContactViewModel => {
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
    }

    handleContact = (contact: [string, string]): void => {
	this.updateContact(...contact);
    }

    unwrapContact = (id: string, knownName: string): ContactViewModel => {
	if (this.contacts.has(id))
	    return this.contacts.get(id)!
	return this.updateContact(id, knownName);
    }

    // load
    loadData = (): void => {
	const contacts: [string, string][] = this.contactListModel.loadContacts();
	for (const contact of contacts) {
	    const vm = new ContactViewModel(...contact);
	    this.contacts.set(vm.id, vm);
	}
    }
    
    // init
    constructor(public contactListModel: ContactListModel, public settingsViewModel: SettingsViewModel) {
	this.loadData();
	this.contactListModel.contactHandlerManager.setHandler("contact-list-view-model", this.handleContact);
    }
}

export class ContactViewModel {
    // state
    name: React.State<string> = new React.State("");

    // init
    constructor(public id: string, name: string) {
	this.name.value = name;
    }
}
