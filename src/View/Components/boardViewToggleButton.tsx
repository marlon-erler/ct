import { RibbonButton } from "./ribbonButton";
import * as React from "../../react";
import BoardViewModel, {
    BoardPageTypes,
} from "../../ViewModel/Pages/boardViewModel";

export function BoardViewToggleButton(
    label: string,
    icon: string,
    page: BoardPageTypes,
    boardViewModel: BoardViewModel,
    key: string,
) {
    function select() {
	boardViewModel.selectedPage.value = page;
	boardViewModel.resetPinchZoom();
    }

    const isSelected = React.createProxyState(
        [boardViewModel.selectedPage],
        () => boardViewModel.selectedPage.value == page,
    );

    return RibbonButton(label, icon, isSelected, select, undefined, key);
}
