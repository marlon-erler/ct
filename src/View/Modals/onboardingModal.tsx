import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import OnboardingViewModel, {OnboardingModals} from "../../ViewModel/Global/onboardingViewModel";

// MAIN
export function OnboardingModalWrapper(coreViewModel: CoreViewModel, onboardingViewModel: OnboardingViewModel) {
    return <div>
	{ConnectionModal(coreViewModel, onboardingViewModel)}
    {TransferModal(coreViewModel, onboardingViewModel)}
    {NameModal(coreViewModel, onboardingViewModel)}
</div>
}

function ConnectionModal(coreViewModel: CoreViewModel, onboardingViewModel: OnboardingViewModel) {
    const isPresented = React.createProxyState(
	[onboardingViewModel.presentedModal],
	() =>
	onboardingViewModel.presentedModal.value ==
	OnboardingModals.Connection
    );

    const connectionViewModel = onboardingViewModel.connectionViewmodel;

    const nextButton = React.createProxyState([connectionViewModel.isConnected], ()=>coreViewModel.translations.onboarding.connectionNextButton(connectionViewModel.isConnected.value));

    return <div
	class="modal"
	toggle:open={isPresented}
    >
	<div>
	    <main>
		<h2>{coreViewModel.translations.onboarding.connectionHeadline}</h2>
		<p class="secondary width-input">{coreViewModel.translations.onboarding.connectionDescription}</p>

		<hr></hr>

		<label class="tile flex-no">
		    <span class="icon">cell_tower</span>
		    <div>
			<span>
			    {coreViewModel.translations.homePage.serverAddress}
			</span>
			<input
			    placeholder={
				coreViewModel.translations.homePage
				.serverAddressPlaceholder
			    }
			    bind:value={connectionViewModel.serverAddressInput}
			    on:enter={connectionViewModel.connect}
			></input>
		    </div>
		</label>
		<div class="flex-row width-input justify-end">
		    <button
			class="standard width-50"
			on:click={connectionViewModel.connect}
			toggle:disabled={connectionViewModel.cannotConnect}
		    >
			{coreViewModel.translations.onboarding.connectButton}
		    </button>
		</div>
	    </main>
	    <div class="flex-row justify-end">
		<button
		    class="primary width-50"
		    on:click={onboardingViewModel.showTransferOption}
		>
		    <span
			subscribe:innerText={nextButton}
		    ></span>
		    <span class="icon">
			arrow_forward
		    </span>
		</button>
	    </div>
	</div>
    </div>
}

function TransferModal(coreViewModel: CoreViewModel, onboardingViewModel: OnboardingViewModel) {
    const isPresented = React.createProxyState(
	[onboardingViewModel.presentedModal],
	() =>
	onboardingViewModel.presentedModal.value ==
	OnboardingModals.TransferOrNew
    );

    return <div
	class="modal"
	toggle:open={isPresented}
    >
	<div>
	    <main>
		<h2>{coreViewModel.translations.onboarding.transferHeadline}</h2>
		<p class="secondary width-input">{coreViewModel.translations.onboarding.transferDescription}</p>

		<hr></hr>

		<div class="flex-column gap">
		    <button
			class="tile"
			on:click={onboardingViewModel.transferData}
			toggle:disabled={onboardingViewModel.cannotTransfer}
		    >
			<div>
			    {coreViewModel.translations.onboarding.transferOptionTransfer}
			</div>
			<span class="icon">
			    arrow_forward
			</span>
		    </button>
		    <button
			class="tile"
			on:click={onboardingViewModel.setupNew}
		    >
			<div>
			    {coreViewModel.translations.onboarding.transferOptionNew}
			</div>
			<span class="icon">
			    arrow_forward
			</span>
		    </button>
		</div>
	    </main>
	    <div class="flex-row">
		<button
		    class="standard width-50"
		    on:click={onboardingViewModel.open}
		>
		    {coreViewModel.translations.general.backButton}
		</button>
	    </div>
	</div>
    </div>
}

function NameModal(coreViewModel: CoreViewModel, onboardingViewModel: OnboardingViewModel) {
    const isPresented = React.createProxyState(
	[onboardingViewModel.presentedModal],
	() =>
	onboardingViewModel.presentedModal.value ==
	OnboardingModals.Name
    );

    const settingsViewModel = onboardingViewModel.settingsViewModel;

    return <div
	class="modal"
	toggle:open={isPresented}
    >
	<div>
	    <main>
		<h2>{coreViewModel.translations.onboarding.nameHeadline}</h2>
		<p class="secondary width-input">{coreViewModel.translations.onboarding.nameDescription}</p>

		<hr></hr>

		<label class="tile flex-no">
		    <span class="icon">account_circle</span>
		    <div>
			<span>
			    {
				coreViewModel.translations.settings.account
				.yourNameLabel
			    }
			</span>
			<input
			    placeholder={
				coreViewModel.translations.settings.account
				.yourNamePlaceholder
			    }
			    bind:value={settingsViewModel.usernameInput}
			></input>
		    </div>
		</label>
	    </main>
	    <div class="flex-row">
		<button
		    class="standard width-50"
		    on:click={onboardingViewModel.showTransferOption}
		>
		    {coreViewModel.translations.general.backButton}
		</button>
		<button
		    class="primary width-50"
		    on:click={onboardingViewModel.finish}
		>
		    {coreViewModel.translations.general.setButton}
		    <span class="icon">
			arrow_forward
		    </span>
		</button>
	    </div>
	</div>
    </div>
}
