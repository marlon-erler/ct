import StorageModel, { StorageModelSubPaths } from "./storageModel";
import SettingsModel from "./settingsModel";
import { HandlerManager } from "../Utility/utility";

export default class ContactListModel {
    contactHandlerManager = new HandlerManager<[string, string]>();

    private getContactPath = (contactId: string): string[] => {
        return StorageModel.getPath(StorageModelSubPaths.ContactsModel, [
            contactId,
        ]);
    };

    loadContacts = (): [string, string][] => {
        const contactIds: string[] = this.storageModel.list([
            StorageModelSubPaths.ContactsModel,
        ]);
        const contacts: [string, string][] = contactIds.map((id) => [
            id,
            this.storageModel.read(this.getContactPath(id)) ?? "?",
        ]);
        contacts.push([this.settingsModel.userid, this.settingsModel.username]);
        return contacts;
    };

    storeContact = (id: string, name: string) => {
        this.contactHandlerManager.trigger([id, name]);

        if (id == this.settingsModel.userid) return;
        const path = this.getContactPath(id);
        this.storageModel.write(path, name);
    };

    constructor(
        public storageModel: StorageModel,
        public settingsModel: SettingsModel,
    ) {}
}
