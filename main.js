const { Plugin, Modal, TFile, PluginSettingTab, Setting } = require('obsidian');

class BGGPlugin extends Plugin {
    settings = {};

    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: 'search-bgg',
            name: 'Search BoardGameGeek',
            checkCallback: (checking) => {
                if (checking) {
                    return true;
                }

                new BGGSearchModal(this.app, this.settings).open();
                return true;
            },
        });

        this.addSettingTab(new BGGSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, await this.loadData());
        if (!this.settings) {
            this.settings = {
                notePath: ''
            };
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class BGGSearchModal extends Modal {
    notePath;

    constructor(app, settings) {
        super(app);
        this.notePath = settings.notePath;
    }

    onOpen() {
        let { contentEl } = this;
        let searchInput = contentEl.createEl('input', { type: 'text' });
        let resultsContainer = contentEl.createEl('div');

        searchInput.addEventListener('keydown', async(e) => {
            if (e.key === 'Enter') {
                // Clear the results container
                resultsContainer.empty();

                let query = e.target.value;
                let results = await this.searchBGG(query);

                this.displayResults(results);

                // Prevent the modal from closing
                e.preventDefault();
            }
        });
    }

    async searchBGG(query) {
        let response = await fetch(`https://www.boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`);
        let data = await response.text();
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data, "text/xml");
        let items = Array.from(xmlDoc.getElementsByTagName('item')).slice(0, 10);
        return items.map(item => ({
            id: item.getAttribute('id'),
            name: item.getElementsByTagName('name')[0].getAttribute('value')
        }));
    }

    displayResults(results) {
        // Display each result
        results.forEach((result) => {
            let resultEl = this.contentEl.createEl('div');
            resultEl.createEl('button', { text: result.name }).addEventListener('click', () => this.displayGameDetails(result.id));
        });
    }

    async displayGameDetails(id) {
        let response = await fetch(`https://www.boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1&comments=1`);
        let data = await response.text();
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data, "text/xml");
        let item = xmlDoc.getElementsByTagName('item')[0];

        // Extract game details
        let details = {
            title: item.getElementsByTagName('name')[0].getAttribute('value'),
            yearpublished: item.getElementsByTagName('yearpublished')[0].getAttribute('value'),
            image: item.getElementsByTagName('image')[0].textContent,
            minplayers: item.getElementsByTagName('minplayers')[0].getAttribute('value'),
            maxplayers: item.getElementsByTagName('maxplayers')[0].getAttribute('value'),
            minplaytime: item.getElementsByTagName('minplaytime')[0].getAttribute('value'),
            maxplaytime: item.getElementsByTagName('maxplaytime')[0].getAttribute('value'),
            playingtime: item.getElementsByTagName('playingtime')[0].getAttribute('value'),
            designers: Array.from(item.querySelectorAll('link[type="boardgamedesigner"]')).map(link => '"' + link.getAttribute('value') + '"').join(', ') ?? '',
            artists: Array.from(item.querySelectorAll('link[type="boardgameartist"]')).map(link => '"' + link.getAttribute('value') + '"').join(', ') ?? '',
            rank: item.getElementsByTagName('rank')[0].getAttribute('value'),
            weight: item.getElementsByTagName('averageweight')[0].getAttribute('value'),
            score: item.getElementsByTagName('average')[0].getAttribute('value'),
            comments: Array.from(item.getElementsByTagName('comment')).slice(0, 50).map(el => `> [!score]+ ( ${el.getAttribute('rating')} )\n> ${el.getAttribute('value')}\n`).join('\n')
        };

        const sanitized_name = details.title.replace(/[\\/*"<>:|?]/g, '')
        const noteContent = `\-\-\-\nobsidianUIMode: preview\n\-\-\-\n>[!bgg]+ [${details.title}](https://boardgamegeek.com/boardgame/${id})\n>>[!multi-column|left|2]\n>>![test|250](${details.image})\n>>\n>>>[!data]+ Data\n>>>- Year Published: ${details.yearpublished}\n>>>- Players: ${details.minplayers} ~ ${details.maxplayers}\n>>>- Play Time: ${details.minplaytime} ~ ${details.maxplaytime} min\n>>>- Rank: ${details.rank}\n>>>- Weight (0~5): ${details.weight}\n>>>- Score (1~10): ${details.score}\n>>>- Designers: ${details.designers}\n>>>- Artists: ${details.artists}\n\n${details.comments}`

        // Get the notePath from the plugin settings
        let notePath = this.notePath + '/' + sanitized_name + '.md';

        // Create a new note in the specified notePath
        let note = this.app.vault.getAbstractFileByPath(notePath);

        if (note instanceof TFile) {
            // If the note already exists, update it
            await this.app.vault.modify(note, noteContent);
        } else {
            // If the note doesn't exist, create it
            note = await this.app.vault.create(notePath, noteContent);
        }

        // Open the new file
        await this.app.workspace.getLeaf().openFile(note);

        this.close();
    }
}

class BGGSettingTab extends PluginSettingTab {
    plugin;

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        let { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('notePath')
            .setDesc('Enter the notePath where the game details will be saved.')
            .addText(text => text
                .setPlaceholder('Enter notePath')
                .setValue(this.plugin.settings.notePath || '')
                .onChange(async(value) => {
                    this.plugin.settings.notePath = value;
                    await this.plugin.saveSettings();
                }));
    }
}

module.exports = BGGPlugin;