class EuroDex {
    constructor() {
        this.animals = [];
        this.filteredAnimals = [];
        this.selectedAnimal = null;
        this.currentPage = 1;
        this.itemsPerPage = 30;
        this.totalPages = 1;
        this.init();
    }
    
    async init() {
        await this.loadAnimals();
        this.setupEventListeners();
        this.renderAnimalGrid();
        this.renderPagination();
    }
    
    async loadAnimals() {
        try {
            const response = await fetch('data/animals.json');
            const data = await response.json();
            this.animals = data.animals;
            this.filteredAnimals = [...this.animals];
            this.totalPages = Math.ceil(this.filteredAnimals.length / this.itemsPerPage) || 1;
        } catch (error) {
            console.error('Errore:', error);
            this.animals = [];
            this.filteredAnimals = [];
            this.totalPages = 1;
        }
    }
    
    setupEventListeners() {
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
        document.getElementById('habitatFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('classFilter').addEventListener('change', () => this.applyFilters());
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }
    
    applyFilters() {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const habitatFilter = document.getElementById('habitatFilter').value;
        const classFilter = document.getElementById('classFilter').value;
        
        this.filteredAnimals = this.animals.filter(animal => {
            const matchesSearch = animal.name.toLowerCase().includes(searchQuery);
            const matchesHabitat = habitatFilter === 'all' || animal.habitat === habitatFilter;
            const matchesClass = classFilter === 'all' || animal.class === classFilter;
            return matchesSearch && matchesHabitat && matchesClass;
        });
        
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredAnimals.length / this.itemsPerPage) || 1;
        this.renderAnimalGrid();
        this.renderPagination();
    }
    
    renderAnimalGrid() {
        const grid = document.getElementById('animalGrid');
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageAnimals = this.filteredAnimals.slice(start, end);
        
        grid.innerHTML = pageAnimals.map(animal => `
            <div class="animal-card ${this.selectedAnimal && this.selectedAnimal.id === animal.id ? 'selected' : ''}" 
                 onclick="euroDex.selectAnimal(${animal.id})">
                <img src="${animal.image}" alt="${animal.name}" class="animal-card-image" onerror="this.style.display='none'">
                <div class="animal-card-number">N° ${String(animal.id).padStart(3, '0')}</div>
                <div class="animal-card-name">${animal.name.substring(0,10)}</div>
            </div>
        `).join('');
    }
    
    renderPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = `
            <button class="page-button" onclick="euroDex.changePage(-1)" ${this.currentPage === 1 ? 'disabled' : ''}>←</button>
            <span class="page-info">${this.currentPage}/${this.totalPages}</span>
            <button class="page-button" onclick="euroDex.changePage(1)" ${this.currentPage === this.totalPages ? 'disabled' : ''}>→</button>
        `;
    }
    
    changePage(delta) {
        this.currentPage = Math.max(1, Math.min(this.totalPages, this.currentPage + delta));
        this.renderAnimalGrid();
        this.renderPagination();
    }
    
    selectAnimal(id) {
        this.selectedAnimal = this.animals.find(a => a.id === id);
        this.renderAnimalGrid();
        this.showAnimalDetail();
    }
    
    showAnimalDetail() {
        if (!this.selectedAnimal) return;
        const a = this.selectedAnimal;
        
        document.getElementById('detailNumber').textContent = 'N° ' + String(a.id).padStart(3, '0');
        document.getElementById('detailName').textContent = a.name;
        document.getElementById('detailClass').textContent = a.class || '---';
        document.getElementById('detailHabitat').textContent = a.habitat || '---';
        document.getElementById('sizeBar').style.width = Math.min(100, (a.size / 300) * 100) + '%';
        document.getElementById('sizeValue').textContent = (a.size || '?') + ' cm';
        document.getElementById('weightBar').style.width = Math.min(100, (a.weight / 500) * 100) + '%';
        document.getElementById('weightValue').textContent = (a.weight || '?') + ' kg';
        document.getElementById('lifespanBar').style.width = Math.min(100, (a.lifespan / 40) * 100) + '%';
        document.getElementById('lifespanValue').textContent = (a.lifespan || '?') + ' anni';
        document.getElementById('populationBar').style.width = ({'Abbondante':100,'Comune':75,'Stabile':50,'In declino':25,'Rara':10}[a.population] || 50) + '%';
        document.getElementById('populationValue').textContent = a.population || '---';
        document.getElementById('detailDescription').innerHTML = '<p><b>' + (a.scientificName || '') + '</b></p><p>' + (a.description || '') + '</p>';
        document.getElementById('detailImage').src = a.image || '';
        this.switchTab('diet');
    }
    
    updateMap(distribution) {
        // Funzione semplificata
    }
    
    switchTab(tab) {
        if (!this.selectedAnimal) return;
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.querySelector('[data-tab="' + tab + '"]');
        if (activeTab) activeTab.classList.add('active');
        
        const a = this.selectedAnimal;
        const content = document.getElementById('tabContent');
        if (tab === 'diet') content.innerHTML = '<p><b>Dieta:</b> ' + (a.diet || '---') + '</p>';
        else if (tab === 'behavior') content.innerHTML = '<p><b>Comportamento:</b> ' + (a.behavior || '---') + '</p>';
        else if (tab === 'conservation') content.innerHTML = '<p><b>Stato:</b> ' + (a.conservation || 'LC') + '</p>';
    }
}

let euroDex;
document.addEventListener('DOMContentLoaded', function() {
    euroDex = new EuroDex();
});
