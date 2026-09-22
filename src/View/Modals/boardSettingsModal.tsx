import * as React from "../../react";
import { ViewController } from "../viewController";
import { DangerousActionButton } from "../Components/dangerousActionButton";
import { ColorPicker } from "../Components/colorPicker";
import BoardViewModel from "../../ViewModel/Pages/boardViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function BoardSettingsModal(
    coreViewModel: CoreViewModel,
    boardViewModel: BoardViewModel,
) {
    boardViewModel.isPresentingSettingsModal.subscribe(
        ViewController.setFocusWithDelay,
    );

    return (
        <div
            class="modal"
            toggle:open={boardViewModel.isPresentingSettingsModal}
        >
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.chatPage.task
                                .boardSettingsHeadline
                        }
                    </h2>

                    <label class="tile flex-no">
                        <span class="icon">label</span>
                        <div>
                            <span>
                                {
                                    coreViewModel.translations.chatPage.task
                                        .boardNameInputLabel
                                }
                            </span>
                            <input
                                id="focused"
                                on:enter={boardViewModel.saveSettings}
                                bind:value={boardViewModel.name}
                            ></input>
                        </div>
                    </label>

                    <hr></hr>

                    {ColorPicker(boardViewModel.color)}

                    <hr></hr>

                    <div class="width-input">
                        {DangerousActionButton(
                            coreViewModel,
                            coreViewModel.translations.chatPage.task
                                .deleteBoardButton,
                            "delete_forever",
                            boardViewModel.deleteBoard,
                        )}
                    </div>
                </main>
                <button on:click={boardViewModel.hideSettings}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
