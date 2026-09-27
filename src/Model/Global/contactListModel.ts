import {HandlerManager} from "../Utility/utility";
import StorageModel, {StorageModelSubPaths} from "./storageModel";

export default class ContactListModel {
    contactHandlerManager = new HandlerManager<[string, string]>();

    private getContactPath = (contactId: string): string[] => {
	return StorageModel.getPath(StorageModelSubPaths.ContactsModel, [contactId]);
    }

    loadContacts = (): [string, string][] => {
	const contactIds: string[] = this.storageModel.list([StorageModelSubPaths.ContactsModel]);
	const contacts: [string, string][] = contactIds.map(id => [id, this.storageModel.read(this.getContactPath(id)) ?? "?"]);
	return contacts;
    }

    storeContact = (id: string, name: string) => {
	const path = this.getContactPath(id);
	this.storageModel.write(path, name)
	this.contactHandlerManager.trigger([id, name]);
    }

    constructor(public storageModel: StorageModel) {}
}
