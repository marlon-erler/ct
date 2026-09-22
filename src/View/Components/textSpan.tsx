import * as React from "../../react";

export const StringToTextSpan: React.StateItemConverter<string> = (
    string: string,
) => {
    return <span class="ellipsis">{string}</span>;
};
