import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function NewItemEntry(coreViewModel: CoreViewModel, query: React.State<string>, fn: ()=>void) {
    const isHidden = React.createProxyState([query],()=>query.value == "");
    const label = React.createProxyState([query],()=>coreViewModel.translations.general.createLabel(query.value));

    return <button
	class="standard slide-up"
	toggle:hidden={isHidden}
	on:click={fn}
    >
	<span subscribe:innerText={label}></span>
	<span class="icon">add</span>
    </button>
}
