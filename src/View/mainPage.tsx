import * as React from "../react";
import CoreViewModel from "../ViewModel/Global/coreViewModel";

export function MainPage(coreViewModel: CoreViewModel) {
    return (
        <article id="home-page">
            <header>
                <span>{coreViewModel.translations.homePage.appName}</span>
            </header>
            <div></div>
        </article>
    );
}
