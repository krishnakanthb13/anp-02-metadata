(() => {
    var Meta_1 = {
        insertText: {
            // Function to insert text based on user inputs
            "Name_Tag": async function (app) {
                try {
                    // Prompting the user to enter filter criteria
                    const result = await app.prompt("Enter your filter criteria (Anyone or Both [Name_Tag]!)", {
                        inputs: [
                            // Tag selection input
                            {
                                label: "Select Tags to filter (Max 10)", type: "tags", limit: 10, placeholder: "Enter tag/'s' (Max 10)"
                            },
                            // Name filter input
                            {
                                label: "Type Partial or Full name of the Note", type: "string", placeholder: "Enter Partial or Full name"
                            },
                            // Sort by note name option
                            {
                                label: "Sort by Note Name", type: "select", options: [
                                    { label: "None (Default)", value: "" },
                                    { label: "Ascending (ASC)", value: "asc" },
                                    { label: "Descending (DESC)", value: "desc" }
                                ]
                            },
                            // Sort by tags option
                            {
                                label: "Sort by Tags", type: "select", options: [
                                    { label: "None (Default)", value: "" },
                                    { label: "Ascending (ASC)", value: "asc" },
                                    { label: "Descending (DESC)", value: "desc" }
                                ]
                            },
                            // Alphabetically sort tags within a note
                            {
                                label: "Sort tags alphabetically (within a Note!)", type: "checkbox"
                            },
                            // Insert / Export options
                            {
                                label: "Insert / Export Options (Mandatory)", type: "select", options: [
                                    { label: "Insert into current note", value: "current_note" },
                                    { label: "Insert into new note", value: "new_note" },
                                    { label: "Download as markdown", value: "download_md" },
                                    { label: "Download as CSV", value: "download_csv" },
                                    { label: "Download as TXT", value: "download_txt" }
                                ]
                            },
                            // Format selection option
                            {
                                label: "Select Report Type (Mandatory)", type: "select", options: [
                                    { label: "Note Name & Tags (Table)", value: "both_table" }, // Method 1
                                    { label: "Note Names Only", value: "names_only" }, // Method 1
                                    { label: "Note Tags Only", value: "tags_only" }, // Method 1
                                    { label: "Untitled Notes (Table)", value: "empty_names_only" }, // Method 1
                                    { label: "Untagged Notes (Table)", value: "empty_tags_only" }, // Method 1
                                    { label: "Undocumented Notes (w/Hidden-task/s)", value: "empty_content_only" }, // Method 2
                                    { label: "Published Notes (Table)", value: "published_only" }, // Method 1
                                    { label: "Archived - Grouped-folders", value: "archived" }, // Method 3
                                    { label: "Vault Notes - Grouped-folders", value: "vault" }, // Method 3
                                    { label: "Deleted Notes - Grouped-folders", value: "deleted" }, // Method 3
                                    { label: "Active plugin notes - Grouped-folders", value: "plugin" }, // Method 3
                                    { label: "Task Lists - Notes-having-tasks", value: "taskLists" }, // Method 3
                                    { label: "Un-tagged - Notes-untagged", value: "untagged" }, // Method 3
                                    { label: "Created by me - Shared-notes", value: "created" }, // Method 3
                                    { label: "Shared publicly - Shared-notes", value: "public" }, // Method 3
                                    { label: "Shared notes - Shared-notes", value: "shared" }, // Method 3
                                    { label: "Notes shared with me  - Shared-notes", value: "shareReceived" }, // Method 3
                                    { label: "Notes not created by me - Shared-notes", value: "notCreated" }, // Method 3
                                    { label: "Notes I shared with others - Shared-notes", value: "shareSent" }, // Method 3
                                    { label: "This week - Created-date", value: "thisWeek" }, // Method 3
                                    { label: "Today - Created-date", value: "today" }, // Method 3
                                    { label: "Notes Saving - Low-level-queries", value: "saving" }, // Method 3
                                    { label: "Notes Downloading - Low-level-queries", value: "stale" }, // Method 3
                                    { label: "Notes Indexing - Low-level-queries", value: "indexing" }, // Method 3
                                    { label: "Raw data", value: "raw_data" } // Method 1
                                ]
                            }
                        ]
                    });

                    // Assert the result is an array
                    // expect(result).toBeInstanceOf(Array);
                    // console.log("Prompt result:", result);
                    // If the result is falsy, the user has canceled the operation
                    if (!result) {
                        app.alert("Operation has been cancelled. Tata! Bye Bye! Cya!");
                        return;
                    }
                    // Destructuring user inputs
                    const [tagNames, nameFilter, sortOption, sortTagOption, sortTags, insertOption, insertFormat] = result;
                    // Ensure at least one of the required variables is selected
                    if (!tagNames && !nameFilter && !sortOption && !sortTagOption && !sortTags) {
                        app.alert("Note: At least one of Optional Items (tagNames, nameFilter, sortOption, sortTagOption, or sortTags) must be selected");
                        return;
                    }
                    // console.log("Destructured inputs:", {tagNames, nameFilter, sortOption, sortTagOption, sortTags, insertOption, insertFormat });
                    // Ensure both insertOption and insertFormat are selected
                    if (!insertOption || !insertFormat) {
                        app.alert("Note: Both insertOption and insertFormat (Mandatory Fields) must be selected");
                        return;
                    }
                    app.alert("Working on it... This may take a few minutes for large notebooks. The app might seem unresponsive but we're working on it.");
                    // To avoid multiple repetition in for condition
                    const insertFormatz = insertFormat;
                    // console.log("insertFormatz:", insertFormatz);
                    // Split tags into an array
                    const tagsArray = tagNames ? tagNames.split(',').map(tag => tag.trim()) : [];
                    let results = new Set();
                    let publicResults = [];
                    // To handle different Methods differently
                    // Method 1
                    if (insertFormatz === "both_table" || insertFormatz === "names_only" || insertFormatz === "tags_only" || insertFormatz === "published_only" || insertFormatz === "raw_data" || insertFormatz === "empty_names_only" || insertFormatz === "empty_tags_only") {
                        let notes = [];
                        // Filter notes based on tags
                        if (tagsArray.length > 0) {
                            for (let tag of tagsArray) {
                                let taggedNotes = await app.filterNotes({
                                    tag, group: "^vault", query: nameFilter
                                });
                                notes = notes.concat(taggedNotes);
                            }
                        }
                        else {
                            notes = await app.filterNotes({ group: "^vault", query: nameFilter });
                        }
                        // console.log("Filtered notes:", notes);
                        // Remove duplicate notes
                        notes = notes.filter((note, index, self) => index === self.findIndex((n) => n.uuid === note.uuid));
                        // Assign default name to notes with null or empty name
                        notes = notes.map(note => {
                            if (!note.name) {
                                note.name = "Untitled Note"; // Assign a default name for empty notes
                            }
                            return note;
                        });
                        // console.log("Notes after removing duplicates:", notes);

                        // Sort the final list of results based on the selected tag sorting option
                        if (sortTagOption === "asc") {
                            notes.sort((a, b) => a.tags.join(", ").localeCompare(b.tags.join(", ")));
                        }
                        else if (sortTagOption === "desc") {
                            notes.sort((a, b) => b.tags.join(", ").localeCompare(a.tags.join(", ")));
                        }
                        // Further filter notes by name if a name filter is provided (Handled in the Query)
                        // if (nameFilter) {
                        // notes = notes.filter(note => note.name.includes(nameFilter));
                        // }
                        // if (nameFilter) {
                        // Convert the filter term to lowercase
                        // const lowerCaseFilter = nameFilter.toLowerCase();

                        // Filter notes with case-insensitive comparison
                        // notes = notes.filter(note => 
                        // note.name && note.name.toLowerCase().includes(lowerCaseFilter)
                        // );
                        // }
                        // Sort notes by name based on the user's selection
                        if (sortOption === "asc") {
                            notes.sort((a, b) => a.name.localeCompare(b.name));
                        }
                        else if (sortOption === "desc") {
                            notes.sort((a, b) => b.name.localeCompare(a.name));
                        }
                        // console.log("Sorted notes:", notes);
                        // Fetch tags for each note and generate results
                        const self = this;
                        for (let note of notes) {
                            let tags = note.tags;
                            // Sort tags within the note if the checkbox is checked
                            if (sortTags) {
                                tags.sort((a, b) => a.localeCompare(b));
                            }
                            let noteLink = self._createMDLinkFromNoteHandle(note);
                            let tagString = tags.join(", ");
                            if (insertFormat === "both_table") {
                                results.add(`| ${noteLink} | ${tagString} |`);
                            }
                            else if (insertFormat === "names_only") {
                                results.add(noteLink);
                            }
                            else if (insertFormat === "tags_only") {
                                tags.forEach(tag => results.add(tag));
                                results = new Set([...results].filter(tag => tag != null).sort((a, b) => a.localeCompare(b)));
                                // tags.filter(tag => tag != null).sort((a, b) => a.localeCompare(b)).forEach(tag => results.add(tag));
                            }
                            else if (insertFormat === "published_only") {
                                const publicURL = await app.getNotePublicURL({
                                    uuid: note.uuid
                                });
                                if (publicURL) {
                                    publicResults.push(`| [${note.name}](https://www.amplenote.com/notes/${note.uuid}) | [${publicURL}](${publicURL}) |`);
                                }
                            }
                            else if (insertFormat === "raw_data") {
                                results.add(`${note.name} | ${note.uuid} | ${tagString}`);
                                // This is an another optional way to get the raw data!
                                //} else if (insertFormat === "raw_data") {
                                //results.add(`Note Name: ${note.name}`);
                                //results.add(`UUID: ${note.uuid}`);
                                //results.add(`Tags: ${tagString}`);
                            }
                            else if (insertFormat === "empty_names_only") {
                                // Filter and include notes with the name "Default Note Name (Empty)"
                                if (note.name === "Untitled Note") {
                                    results.add(`| ${noteLink} | ${tagString} |`);
                                }
                            }
                            else if (insertFormat === "empty_tags_only") {
                                // If the tags are empty or null, add the note to results
                                if (!tagString) {
                                    results.add(`| ${noteLink} | ${tagString} |`);
                                }
                            }
                        }
                        // console.log("Sorted notes:", notes);
                    } // Method 1 Close
                    // Method 2 - To handle Empty content Separately
                    else if (insertFormatz === "empty_content_only") {
                        // Filter notes based on empty notes + tags	
                        let notesEmptyNames = new Set();
                        let notesE = tagsArray.length > 0 ? (await Promise.all(tagsArray.map(tag => app.filterNotes({
                            tag, group: "^vault", query: nameFilter
                        })))).flat() : await app.filterNotes({
                            group: "^vault", query: nameFilter
                        });
                        //notesE.sort((a, b) => a.name.localeCompare(b.name));
                        if (nameFilter) { const lowerCaseFilter = nameFilter.toLowerCase(); notesE = notesE.filter(note => note.name && note.name.toLowerCase().includes(lowerCaseFilter)); }
                        notesE.sort((a, b) => {
                            const nameA = a.name || ""; // Use an empty string if a.name is null or undefined
                            const nameB = b.name || ""; // Use an empty string if b.name is null or undefined

                            return nameA.localeCompare(nameB);
                        });
                        for (const noteHandle of notesE) {
                            let noteContent;
                            try {
                                noteContent = await app.getNoteContent(noteHandle);
                                if (noteContent.includes("# Hidden tasks")) continue;
                                noteContent = noteContent.slice(0, noteContent.indexOf('# Completed tasks<!-- {"omit":true} -->'));
                                if (noteContent.trim() === "" || !noteContent.match(/[^\s\\]/mg)) {
                                    notesEmptyNames.add(`- [${noteHandle.name || "Untitled Note"}](https://www.amplenote.com/notes/${noteHandle.uuid})`);
                                }
                            }
                            catch (err) {
                                if (err instanceof TypeError) {
                                    continue;
                                }
                            }
                        }

                        results = new Set(notesEmptyNames);
                        // console.log("Sorted notesE:", notesE);
                        // console.log("Empty Notes Names", notesEmptyNames);
                    } // Method 2 Close
                    // Method 3 - To handle Groups Separately
                    else {
                        // Filter notes based on Groups + tags
                        let notesGroupNames = new Set();
                        let notesGroup = insertFormat;
                        // Filter notes based on empty notes + tags
                        let notesG = tagsArray.length > 0 ? (await Promise.all(tagsArray.map(tag => app.filterNotes({
                            tag, group: notesGroup, query: nameFilter
                        })))).flat() : await app.filterNotes({
                            group: notesGroup, query: nameFilter
                        });
                        //notesG.sort((a, b) => a.name.localeCompare(b.name));
                        if (nameFilter) { const lowerCaseFilter = nameFilter.toLowerCase(); notesG = notesG.filter(note => note.name && note.name.toLowerCase().includes(lowerCaseFilter)); }
                        notesG.sort((a, b) => {
                            const nameA = a.name || ""; // Use an empty string if a.name is null or undefined
                            const nameB = b.name || ""; // Use an empty string if b.name is null or undefined

                            return nameA.localeCompare(nameB);
                        });
                        for (const noteHandleG of notesG) {
                            notesGroupNames.add(`- [${noteHandleG.name || "Untitled Note"}](https://www.amplenote.com/notes/${noteHandleG.uuid})`);
                            // It takes longer than usual time.
                            // if (insertFormatz === "public") {
                            // const publicURL = await app.getNotePublicURL({ uuid: noteHandleG.uuid });
                            // notesGroupNames.add(`- [${noteHandleG.name || "Untitled Note"}](https://www.amplenote.com/notes/${noteHandleG.uuid}), [${publicURL}](${publicURL})`);
                            // } else {
                            // notesGroupNames.add(`- [${noteHandleG.name || "Untitled Note"}](https://www.amplenote.com/notes/${noteHandleG.uuid})`);
                            // }
                        }

                        results = new Set(notesGroupNames);
                        // console.log("Sorted notesG:", notesG);
                        // console.log("Sorted notesGroupNames:", notesGroupNames);
                    } // Method 3 Close
                    // Assert results is an array
                    // expect(results).toBeInstanceOf(Array);
                    // console.log("Generated results:", results);
                    results = Array.from(results);
                    // console.log("Generated results Array:", results);
                    // Generate the final text, CSV, and TXT content
                    let resultText;
                    let resultCSV;
                    if (insertFormat === "both_table" || insertFormat === "empty_names_only" || insertFormat === "empty_tags_only") {
                        resultText = "| Note Name | Tags |\n|---|---|\n" + results.join("\n");
                        resultCSV = "Note Name,Tags\n" + results.map(row => {
                            let parts = row.split('|').map(s => s.trim());
                            let name = parts[1];
                            let tags = parts[2];
                            return `"${name.replace(/"/g, '""')}","${tags.replace(/"/g, '""')}`;
                        }).join("\n");
                    }
                    else if (insertFormat === "published_only") {
                        resultText = "| Notes | Public URL |\n|---|---|\n" + publicResults.join("\n");
                        resultCSV = "Notes,Public URL\n" + publicResults.map(row => {
                            let parts = row.split('|').map(s => s.trim());
                            let name = parts[1];
                            let url = parts[2];
                            return `"${name.replace(/"/g, '""')}", "${url.replace(/"/g, '""')}"`;
                        }).join("\n");
                    }
                    else if (insertFormat === "raw_data") {
                        resultText = results.join("\n");
                        resultCSV = results.map(item => `"${item.replace(/"/g, '""')}"`).join("\n");
                    }
                    else {
                        resultText = results.join("\n");
                        resultCSV = results.map(item => `"${item.replace(/"/g, '""')}"`).join("\n");
                    }
                    // Assert resultText and resultCSV are strings
                    // expect(typeof resultText).toBe('string');
                    // console.log("Result text content:", resultText);
                    // expect(typeof resultCSV).toBe('string');
                    // console.log("Result CSV content:", resultCSV);
                    // Generate the filename based on the current date and time
                    const now = new Date();
                    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
                    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');
                    const filename = `Metadata_1.0_Report_${YYMMDD}_${HHMMSS}`;
                    // Bring in count of records, for reference and additional feature
                    let lineCount = insertOption === "download_csv" ? resultCSV.split('\n').length : resultText.split('\n').length;
                    lineCount = insertFormat === "both_table" || insertFormat === "empty_names_only" || insertFormat === "empty_tags_only" || insertFormat === "published_only" ? lineCount - 2 : lineCount;
                    // const lineCountC = resultCSV.split('\n').length;
                    // Generate the summary of input selections
                    const inputSummary = `
### Input Selections:
- Number of notes: ${lineCount || "None"}
- Tags to filter: ${tagNames || "None"}
- Note name filter: ${nameFilter || "None"}
- Sort by name: ${sortOption || "None"}
- Sort tags by name: ${sortTagOption || "None"}
- Sort tags alphabetically within a Note: ${sortTags ? "Yes" : "No"}
- Insert option: ${insertOption}
- Format to insert: ${insertFormat}
- Filename: ${filename}
`;
                    // Append the summary to the result text
                    resultText += `\n\n${inputSummary}`;
                    resultCSV += `\n\n${inputSummary.replace(/[\n]/g, "")}`;
                    // Assert inputSummary is a string
                    // expect(typeof inputSummary).toBe('string');
                    // console.log("Input summary:", inputSummary);
                    // Perform actions based on the insert option
                    if (insertOption === "current_note") {
                        await app.context.replaceSelection(resultText);
                        // console.log("Inserted text into current note.");
                    }
                    else if (insertOption === "new_note") {
                        let noteUUID = await app.createNote(`${filename}`, ["-reports/-metadata-reports"]);
                        await app.insertContent({
                            uuid: noteUUID
                        }, resultText);
                        // console.log("Inserted text into new note with UUID:", noteUUID);
                    }
                    else if (insertOption === "download_md") {
                        let blob = new Blob([resultText], {
                            type: "text/markdown;charset=utf-8"
                        });
                        let link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `${filename}.md`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        // console.log("Downloaded Markdown file:", `${filename}.md`);
                    }
                    else if (insertOption === "download_csv") {
                        let blob = new Blob([resultCSV], {
                            type: "text/csv;charset=utf-8"
                        });
                        let link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `${filename}.csv`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        // console.log("Downloaded CSV file:", `${filename}.csv`);
                        // console.log("Downloaded CSV file:", `${resultCSV}`);
                    }
                    else if (insertOption === "download_txt") {
                        let blob = new Blob([resultText], {
                            type: "text/plain;charset=utf-8"
                        });
                        let link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `${filename}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        // console.log("Downloaded TXT file:", `${filename}.txt`);
                        // console.log("Downloaded CSV file:", `${resultText}`);
                    }
                    app.alert("Results Generated and Pasted/Downloaded Successfully!");
                }
                catch (error) {
                    app.alert(String(error));
                }
            }
        },
        // Function to create Markdown link from note handle
        _createMDLinkFromNoteHandle(noteHandle) {
            // expect(noteHandle).toBeDefined();
            // expect(noteHandle).toHaveProperty('name');
            // expect(noteHandle).toHaveProperty('uuid');
            // console.log("Creating Markdown link for note:", noteHandle);
            return `[${noteHandle.name}](https://www.amplenote.com/notes/${noteHandle.uuid})`;
        },
    };
    // Assert that Meta_1 is an object
    // expect(typeof Meta_1).toBe('object');
    // console.log("Meta_1 object definition:", Meta_1);
    var plugin_default = Meta_1;
    return Meta_1;
})()