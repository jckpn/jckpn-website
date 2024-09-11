$(function() {
    var unsavedChanges = false;

    // on editor load: load cached contents if any
    let cachedContents = window.localStorage.getItem('cachedContents');
    if (cachedContents != null) {
        try {
            let contentsJsonRaw = JSON.parse(cachedContents);
            window.quillEditor.setContents(contentsJsonRaw);
        } catch (e) {
            console.log('Error loading cached contents');
            console.log(e);
        }
    }

    window.quillEditor.on('text-change', function(delta, oldDelta, source) {
        if (window.quillEditor.getLength() <= 2) return;
        if ($('.ql-editor a').length > 0) return; // don't cache suggestion
        
        unsavedChanges = true;
        let contentsJsonRaw = window.quillEditor.getContents();
        let contentsJsonStr = JSON.stringify(contentsJsonRaw);
        window.localStorage.setItem('cachedContents', contentsJsonStr);
    });

    $('.file-menu-option-new').on('click', async (e) => {
        const allowAction = await askUnsavedChanges();
        if (!allowAction) return;

        window.localStorage.setItem('cachedContents', '');
        window.location.reload();
    });

    $('.file-menu-option-import').on('click', async (e) => {
        const allowAction = await askUnsavedChanges();
        if (!allowAction) return;
        
        // open file dialog to select json file
        let uAnchorElem = document.createElement('input');
        uAnchorElem.type = 'file';
        uAnchorElem.accept = 'application/json';

        uAnchorElem.onchange = function(e) {
            try {
                let file = e.target.files[0];
                let reader = new FileReader();
                reader.readAsText(file,'UTF-8');
                reader.onload = function(readerEvent) {
                    withLoadingScreen(() => {
                        let contentsJsonRaw = JSON.parse(readerEvent.target.result);
                        window.quillEditor.setContents(contentsJsonRaw);
                    }, 'Loading File');
                }
            } catch (e) {
                console.log('Error loading file');
            }
        }

        uAnchorElem.click();

        closeMenuBanner();
    });

    $('.file-menu-option-export').on('click', (e) => {
        withLoadingScreen(() => {
            // unsavedChanges = false;
            // actually, we don't know if user goes through with download
            // and safer to just prompt that they're happy to clear doc
            
            // export quill contents to json
            let quillJson = window.quillEditor.getContents();

            // download json file with file save dialog
            let dataStr = "data:text/json;charset=utf-8,"
                + encodeURIComponent(JSON.stringify(quillJson));
            let dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href",     dataStr     );
            dlAnchorElem.setAttribute("download", "export.json");

            dlAnchorElem.click();

            closeMenuBanner();
        }, 'Exporting File');
    });

    $('.option-about').on('click', async (e) => {
        const allowAction = await askUnsavedChanges();
        if (!allowAction) return;

        showAbout();
        closeMenuBanner();
    });

    function showAbout() {
        withLoadingScreen(() => {
            let aboutJson = JSON.parse(
                `{"ops":[{"insert":"About"},{"attributes":{"header":3},"insert":"\\n"},{"insert":"This project started to help me write lecture notes, but turns out it also works great for stories, articles, essays, poetry, and other written work.\\nI'm aware there are still a few bugs and missing features. I'm doing my best to address them as quickly as possible, but can't promise consistent updates as my degree takes priority.\\nHow to Use"},{"attributes":{"header":3},"insert":"\\n"},{"insert":"Just start typing and GPTyper offers suggestions. You can add them by clicking or hitting Tab.\\nWhat are Tokens?"},{"attributes":{"header":3},"insert":"\\n"},{"insert":"There are costs to running a web app like this, and as such, there's a limit to the suggestions each user gets. If you find it useful, you can get more tokens to keep using it.\\nFeedback"},{"attributes":{"header":3},"insert":"\\n"},{"insert":"Constructive feedback is always appreciated and will help me prioritise development. My contact is linked in the footer. Thanks!\\n — Jack P.\\n\\n"}]}`
            );
            window.quillEditor.setContents(aboutJson);
        }, 'Loading File');
    }

    function withLoadingScreen(fn, text) {
        $('.loading-overlay').addClass('loading-overlay-active');
        $('.loading-text').html(text);
        setTimeout(() => { fn(); }, 160);
        setTimeout(() => { $('.loading-overlay').removeClass('loading-overlay-active'); }, 320);
        setTimeout(() => { $('.loading-text').html('Loading Editor'); }, 640);
    }

    async function askUnsavedChanges() {
        let allowAction = true;

        if (unsavedChanges) {
            allowAction = confirm("This will clear your current document. Are you sure?");
        }
        
        return allowAction;
    }
});