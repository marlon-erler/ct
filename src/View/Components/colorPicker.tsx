import * as React from "../../react";
import { Colors } from "../../colors";

export function ColorPicker(selectedColor: React.State<Colors>) {
    return (
        <div class="flex-row gap width-input">
            {...Object.values(Colors).map((color) => {
                const isSelected = React.createProxyState(
                    [selectedColor],
                    () => selectedColor.value == color,
                );

                function setColor() {
                    selectedColor.value = color;
                }

                return (
                    <button
                        color={color}
                        class="fill-color width-100 flex"
                        style="height: 2rem"
                        toggle:selected={isSelected}
                        on:click={setColor}
                    ></button>
                );
            })}
        </div>
    );
}
