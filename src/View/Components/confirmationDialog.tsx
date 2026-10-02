import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function ConfirmationDialog(
    coreViewModel: CoreViewModel,
    buttonLabel: string,
    icon: string,
    headline: string,
    description: string,
    action: () => void,
) {
    const isModalOpen = new React.State(false);

    function openModal() {
        isModalOpen.value = true;
    }
    function closeModal() {
        isModalOpen.value = false;
    }

    return (
        <div>
            <button class="danger width-100" on:click={openModal}>
                <span>{buttonLabel}</span>
                <span class="icon">{icon}</span>
            </button>

            <div class="modal" toggle:open={isModalOpen}>
                <div>
                    <main>
                        <h2>{headline}</h2>
                        <p class="secondary">{description}</p>
                    </main>
                    <div class="flex-row">
                        <button class="standard width-50" on:click={closeModal}>
                            {coreViewModel.translations.general.cancelButton}
                        </button>
                        <button class="danger width-50" on:click={action}>
                            <span>{buttonLabel}</span>
                            <span class="icon">{icon}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
