import { v4 } from "uuid";
import * as React from "bloatless-react";
import {
    Entry,
    Option,
    StringToOption,
    VersionIdToOption,
} from "../Components/option";
import { DangerousActionButton } from "../Components/dangerousActionButton";
import TaskViewModel from "../../ViewModel/Pages/taskViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function TaskSettingsModal(
    coreViewModel: CoreViewModel,
    taskViewModel: TaskViewModel,
) {
    const categorySuggestionId = v4();
    const statusSuggestionId = v4();

    const BoardOptionConverter: React.StateItemConverter<Entry> = (
	entry: Entry,
    ) => {
	const isSelected = entry[0] == taskViewModel.task.boardId;
	return Option(entry[1], entry[0], isSelected);
    };

    return (
	<div class="modal task-settings" open toggle:full-description={taskViewModel.isPresentingFullScreenDescription}>
	    <div>
		<main id="standard-main">
		    <h2>
			{
			    coreViewModel.translations.chatPage.task
			    .taskSettingsHeadline
			}
		    </h2>

		    <div class="column-wrapper">
			<div class="flex-column">
			    <label class="tile flex-no">
				<span class="icon">label</span>
				<div>
				    <span>
					{
					    coreViewModel.translations.chatPage.task
					    .taskNameLabel
					}
				    </span>
				    <input
					bind:value={taskViewModel.name}
					id="focused"
				    ></input>
				</div>
			    </label>

			    <label class="tile flex-no">
				<span class="icon">category</span>
				<div>
				    <span>
					{
					    coreViewModel.translations.chatPage.task
					    .taskBoardLabel
					}
				    </span>
				    <select
					bind:value={taskViewModel.boardId}
					children:append={[
					    taskViewModel.chatViewModel
					    .taskBoardSuggestions,
					    BoardOptionConverter,
					]}
				    ></select>
				    <span class="icon">arrow_drop_down</span>
				</div>
			    </label>

			    <label class="tile flex-no">
				<span class="icon">description</span>
				<div>
				    <span>
					{
					    coreViewModel.translations.chatPage.task
					    .taskDescriptionLabel
					}
				    </span>
				    <textarea
					rows="10"
					bind:value={taskViewModel.description}
				    ></textarea>
				</div>
			    </label>
			    <div class="flex-row justify-end">
				<button
				    class="width-50"
				    on:click={taskViewModel.openFullscreenDecription}
				>
				    {
					coreViewModel.translations.chatPage.task.taskDescriptionExpandButton
				    }

				    <span class="icon">fullscreen</span>
				</button>
			    </div>
			</div>

			<hr class="mobile-only"></hr>

			<div class="flex-column">
			    <label class="tile flex-no">
				<span class="icon">category</span>
				<div>
				    <span>
					{
					    coreViewModel.translations.chatPage.task
					    .taskCategoryLabel
					}
				    </span>
				    <input
					bind:value={taskViewModel.category}
					list={categorySuggestionId}
				    ></input>
				</div>
			    </label>
			    <datalist
				hidden
				id={categorySuggestionId}
				children:append={[
				    taskViewModel.containingViewModel.taskCategorySuggestions,
				    StringToOption,
				]}
			    ></datalist>

			<label class="tile flex-no">
			    <span class="icon">clock_loader_40</span>
			    <div>
				<span>
				    {
					coreViewModel.translations.chatPage.task
					.taskStatusLabel
				    }
				</span>
				<input
				    bind:value={taskViewModel.status}
				    list={statusSuggestionId}
				></input>
			    </div>
			</label>
			<datalist
			    hidden
			    id={statusSuggestionId}
			    children:append={[
				taskViewModel.containingViewModel.taskStatusSuggestions,
				StringToOption,
			    ]}
			></datalist>

		    <label class="tile flex-no">
			<span class="icon">priority_high</span>
			<div>
			    <span>
				{
				    coreViewModel.translations.chatPage.task
				    .taskPriorityLabel
				}
			    </span>
			    <input
				type="number"
				bind:value={taskViewModel.priority}
			    ></input>
			</div>
		    </label>

		    <hr></hr>

		    <label class="tile flex-no">
			<span class="icon">calendar_month</span>
			<div>
			    <span>
				{
				    coreViewModel.translations.chatPage.task
				    .taskDateLabel
				}
			    </span>
			    <input
				type="date"
				bind:value={taskViewModel.date}
			    ></input>
			</div>
		    </label>

		    <label class="tile flex-no">
			<span class="icon">schedule</span>
			<div>
			    <span>
				{
				    coreViewModel.translations.chatPage.task
				    .taskTimeLabel
				}
			    </span>
			    <input
				type="time"
				bind:value={taskViewModel.time}
			    ></input>
			</div>
		    </label>
		</div>
	    </div>

	    <hr></hr>

	    <label class="tile flex-no">
		<span class="icon">history</span>
		<div>
		    <span>
			{
			    coreViewModel.translations.general
			    .fileVersionLabel
			}
		    </span>
		    <select
			bind:value={taskViewModel.selectedVersionId}
			children:append={[
			    taskViewModel.versionIds,
			    VersionIdToOption,
			]}
		    ></select>
		    <span class="icon">arrow_drop_down</span>
		</div>
	    </label>

	    <hr></hr>

	    <div class="width-input">
		{DangerousActionButton(
		    coreViewModel,
		    coreViewModel.translations.chatPage.task
		    .deleteTaskButton,
		    "delete_forever",
		    taskViewModel.deleteTask,
		)}
	    </div>
	</main>
	<main id="fullscreen-main">
	    <textarea
		style="height: 100%; width: 100%; max-width: unset"
		bind:value={taskViewModel.description}
	    ></textarea>
	</main>
	<div 
	    class="flex-row width-100"
	    id="fullscreen-exit"
	>
	<button
	    class="flex"
	    on:click={taskViewModel.closeFullscreenDecription}
	>
	    {coreViewModel.translations.general.exitButton}
	    <span class="icon">fullscreen_exit</span>
	</button>
    </div>
	<div 
	    class="flex-row width-100"
	    id="controls"
	>
	    <button
		class="flex"
		on:click={taskViewModel.closeAndDiscard}
	    >
		{coreViewModel.translations.general.closeButton}
	    </button>
	    <button
		class="flex primary"
		on:click={taskViewModel.closeAndSave}
	    >
		{coreViewModel.translations.general.saveButton}
		<span class="icon">save</span>
	    </button>
	</div>
    </div>
</div>
);
}
