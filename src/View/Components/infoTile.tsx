import * as React from "../../react";

export function InfoTile(
    icon: string,
    label: string,
    content: string | React.State<string>,
) {
    let contentState: React.State<string>;
    if (typeof content == "string") {
        contentState = new React.State(content);
    } else {
        contentState = content;
    }

    return (
        <div class="tile">
            <span class="icon">{icon}</span>
            <div>
                <span>{label}</span>
                <b class="break-word" subscribe:innerText={contentState}></b>
            </div>
        </div>
    );
}
