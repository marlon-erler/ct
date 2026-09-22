import { SplitModal } from "./splitModal";
import { DirectoryItemList } from "../Components/directoryItemList";
import { DangerousActionButton } from "../Components/dangerousActionButton";
import * as React from "../../react";
import StorageViewModel from "../../ViewModel/Global/storageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import { PATH_COMPONENT_SEPARATOR } from "../../Model/Global/storageModel";

export function StorageModal(
    coreViewModel: CoreViewModel,
    storageViewModel: StorageViewModel,
) {
    const detailView = React.createProxyState(
        [storageViewModel.selectedPath],
        () => {
            if (storageViewModel.selectedPath.value == PATH_COMPONENT_SEPARATOR)
                return (
                    <div>
                        <span class="secondary">
                            {coreViewModel.translations.storage.noItemSelected}
                        </span>

                        <hr></hr>

                        {DangerousActionButton(
                            coreViewModel,
                            coreViewModel.translations.storage.removeJunkButton,
                            "delete_forever",
                            storageViewModel.removeJunk,
                        )}
                    </div>
                );

            return (
                <div class="flex-column gap">
                    <div class="tile flex-no">
                        <div>
                            <b>{coreViewModel.translations.storage.path}</b>
                            <span
                                class="break-all"
                                subscribe:innerText={
                                    storageViewModel.selectedPath
                                }
                            ></span>
                        </div>
                    </div>
                    <div class="tile flex-no">
                        <div>
                            <b>{coreViewModel.translations.storage.content}</b>
                            <code
                                subscribe:innerText={
                                    storageViewModel.selectedFileContent
                                }
                            ></code>
                        </div>
                    </div>

                    {DangerousActionButton(
                        coreViewModel,
                        coreViewModel.translations.storage.deleteItem,
                        "delete_forever",
                        storageViewModel.deleteSelectedItem,
                    )}
                </div>
            );
        },
    );
    return (
        <div class="modal" toggle:open={storageViewModel.isShowingStorageModal}>
            <div>
                <main class="padding-0">
                    {SplitModal(
                        coreViewModel,
                        new React.State(DirectoryItemList(storageViewModel)),
                        detailView,
                        true,
                    )}
                </main>
                <button on:click={storageViewModel.close}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
