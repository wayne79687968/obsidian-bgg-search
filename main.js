const { Plugin, Modal, TFile } = require('obsidian');

class BGGPlugin extends Plugin {
    async onload() {
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
    }
}

class BGGSearchModal extends Modal {
    constructor(app) {
        super(app);
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
        console.log(details);
        this.close();
    }
}

module.exports = BGGPlugin;