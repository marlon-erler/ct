import { ViewController } from "../viewController";
import * as React from "../../react";
import BoardViewModel from "../../ViewModel/Pages/boardViewModel";

export function BoardEntry(boardViewModel: BoardViewModel) {
    const view = (
        <button
            set:color={boardViewModel.color}
            class="tile colored-tile slide-up"
            toggle:selected={boardViewModel.isSelected}
            on:click={boardViewModel.select}
            on:dragover={ViewController.allowDrop}
            on:drop={boardViewModel.handleDropBetweenBoards}
        >
            <span
                class="shadow"
                subscribe:innerText={boardViewModel.name}
            ></span>
            <b subscribe:innerText={boardViewModel.name}></b>
        </button>
    );

    boardViewModel.index.subscribe((newIndex) => {
        view.style.order = newIndex;
    });

    return view;
}

export const BoardViewModelToEntry: React.StateItemConverter<BoardViewModel> = (
    boardViewModel: BoardViewModel,
) => {
    return BoardEntry(boardViewModel);
};
