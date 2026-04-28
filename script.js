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
            this.totalPages = Math.ceil(this.filteredAnimals.length / this.itemsPerPage);
            console.log(this.animals.length + ' animali caricati!');
        } catch (error) {
            console.error('Errore:', error);
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
                <div class="animal-card-name">${animal.name}</div>
            </div>
        `).join('');
    }
    
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (this.totalPages <= 1) {
            pagination.innerHTML = '<span class="page-info">Pagina 1 di 1</span>';
            return;
        }
        pagination.innerHTML = `
            <button class="page-button" onclick="euroDex.changePage(-1)" ${this.currentPage === 1 ? 'disabled' : ''}>← Prec</button>
            <span class="page-info">Pagina ${this.currentPage} di ${this.totalPages}</span>
            <button class="page-button" onclick="euroDex.changePage(1)" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Succ →</button>
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
        const animal = this.selectedAnimal;
        
        document.getElementById('detailNumber').textContent = 'N° ' + String(animal.id).padStart(3, '0');
        document.getElementById('detailName').textContent = animal.name;
        document.getElementById('detailClass').textContent = animal.class || '---';
        document.getElementById('detailHabitat').textContent = animal.habitat || '---';
        
        document.getElementById('sizeBar').style.width = Math.min(100, (animal.size / 300) * 100) + '%';
        document.getElementById('sizeValue').textContent = (animal.size || '?') + ' cm';
        document.getElementById('weightBar').style.width = Math.min(100, (animal.weight / 500) * 100) + '%';
        document.getElementById('weightValue').textContent = (animal.weight || '?') + ' kg';
        document.getElementById('lifespanBar').style.width = Math.min(100, (animal.lifespan / 40) * 100) + '%';
        document.getElementById('lifespanValue').textContent = (animal.lifespan || '?') + ' anni';
        
        const populationMap = {'Abbondante': 100, 'Comune': 75, 'Stabile': 50, 'In declino': 25, 'Rara': 10};
        document.getElementById('populationBar').style.width = (populationMap[animal.population] || 50) + '%';
        document.getElementById('populationValue').textContent = animal.population || '---';
        
        document.getElementById('detailDescription').innerHTML = `
            <p><strong>Nome scientifico:</strong> ${animal.scientificName || '---'}</p>
            <p>${animal.description || 'Nessuna descrizione disponibile.'}</p>
        `;
        document.getElementById('detailImage').src = animal.image || '';
        
        this.updateMap(animal.distribution || []);
        this.switchTab('diet');
    }
    
    updateMap(distribution) {
        // Resetta tutti i paesi
        document.querySelectorAll('.country').forEach(country => {
            country.classList.remove('highlighted');
        });
        
        // Se non ci sono dati, evidenzia qualche paese a caso per testing
        if (!distribution || distribution.length === 0) {
            distribution = ['it', 'fr', 'de'];
        }
        
        // Evidenzia i paesi nella mappa
        document.querySelectorAll('.country').forEach(country => {
            const countryCodes = country.dataset.country.split(',');
            const isPresent = distribution.some(d => countryCodes.includes(d));
            if (isPresent) {
                country.classList.add('highlighted');
            }
        });
    }
    
    switchTab(tab) {
        if (!this.selectedAnimal) return;
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.querySelector('[data-tab="' + tab + '"]');
        if (activeTab) activeTab.classList.add('active');
        
        const animal = this.selectedAnimal;
        const content = document.getElementById('tabContent');
        
        if (tab === 'diet') {
            content.innerHTML = '<p><strong>Dieta:</strong> ' + (animal.diet || '---') + '</p>';
        } else if (tab === 'behavior') {
            content.innerHTML = '<p><strong>Comportamento:</strong> ' + (animal.behavior || '---') + '</p>';
        } else if (tab === 'conservation') {
            content.innerHTML = '<p><strong>Stato:</strong> ' + (animal.conservation || 'LC') + '</p><p><strong>Popolazione:</strong> ' + (animal.population || '---') + '</p>';
        }
    }
}

let euroDex;
document.addEventListener('DOMContentLoaded', function() {
    euroDex = new EuroDex();
});
