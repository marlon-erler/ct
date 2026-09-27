import ContactListModel from "../../Model/Global/contactListModel";
import * as React from "../../react";

export default class ContactListViewModel {
    // state
    contacts: React.MapState<ContactViewModel> = new React.MapState();

    // main
    updateContact = (id: string, name: string): void => {
	if (this.contacts.value.has(id)) {
	    this.contacts.value.get(id)!.name.value = name;
	    return;
	}
	const vm = new ContactViewModel(id, name);
	this.contacts.set(id, vm);
	this.contactListModel.storeContact(id, name);
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
    constructor(public contactListModel: ContactListModel) {
	this.loadData();
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
