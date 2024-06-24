$(document).ready(function() {
    let originalData = [];
    let currentPage = 1;
    let itemsPerPage = 10;

    fetch('/load_csv')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                originalData = data.data;
                createCards(data.columns, data.data);
                populateFilterOptions(data.columns, data.data);
                updatePagination(data.data.length);
            }
        })
        .catch(error => {
            console.error('Error loading CSV:', error);
            alert('Error loading CSV. Check console for details.');
        });

    function createCards(columns, data) {
        let cardsContainer = $('#cardsContainer');
        cardsContainer.empty();

        let start = (currentPage - 1) * itemsPerPage;
        let end = start + itemsPerPage;
        let paginatedData = data.slice(start, end);

        paginatedData.forEach((row, index) => {
            let card = `
                <div class="col-sm-6 col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${row['clean_name']}</h5>
                            <p class="card-text"><strong>Campaign:</strong> ${row['Campaign']}</p>
                            <p class="card-text"><strong>Big-Category:</strong> ${row['Big-Category']}</p>
                            <button class="btn btn-primary learn-more" data-index="${index + start}">Learn More</button>
                        </div>
                    </div>
                </div>
            `;
            cardsContainer.append(card);
        });

        $('.learn-more').on('click', function() {
            let index = $(this).data('index');
            let row = originalData[index];
            showModal(row);
        });
    }

    function populateFilterOptions(columns, data) {
        let filterContainer = $('#filterContainer');
        filterContainer.empty();

        ['Main Headquarters', 'Campaign', 'Sub-Category', 'Big-Category'].forEach(column => {
            if (columns.includes(column)) {
                let options = [...new Set(data.map(row => row[column]))].sort();
                let select = `
                    <div class="form-group col-md-3">
                        <label for="${column}Filter">${column}</label>
                        <select class="form-control filter-select" id="${column}Filter" data-column="${column}">
                            <option value="">All</option>
                            ${options.map(option => `<option value="${option}">${option}</option>`).join('')}
                        </select>
                    </div>
                `;
                filterContainer.append(select);
            }
        });

        $('.filter-select').on('change', function() {
            applyFilters();
        });

        $('#searchInput').on('input', function() {
            applyFilters();
        });

        $('#resetFilters').on('click', function() {
            $('.filter-select').val('');
            applyFilters();
        });

        $('#resetSearch').on('click', function() {
            $('#searchInput').val('');
            applyFilters();
        });

        $('#itemsPerPage').on('change', function() {
            itemsPerPage = parseInt($(this).val());
            currentPage = 1;
            applyFilters();
        });
    }

    function applyFilters() {
        let filteredData = originalData;

        $('.filter-select').each(function() {
            let column = $(this).data('column');
            let value = $(this).val();

            if (value) {
                filteredData = filteredData.filter(row => row[column] === value);
            }
        });

        let searchValue = $('#searchInput').val().toLowerCase();
        if (searchValue) {
            filteredData = filteredData.filter(row =>
                row['clean_name'].toLowerCase().includes(searchValue) ||
                row['Description'].toLowerCase().includes(searchValue) ||
                row['Involvement'].toLowerCase().includes(searchValue)
            );
        }

        updatePagination(filteredData.length);
        createCards(Object.keys(originalData[0]), filteredData);
    }

    function updatePagination(totalItems) {
        let paginationContainer = $('#pagination');
        paginationContainer.empty();
        let totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) return;

        let prevPage = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        let firstPage = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="First" data-page="1">
                    <span aria-hidden="true">&laquo;&laquo;</span>
                </a>
            </li>
        `;
        let nextPage = `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
        let lastPage = `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Last" data-page="${totalPages}">
                    <span aria-hidden="true">&raquo;&raquo;</span>
                </a>
            </li>
        `;

        let maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        startPage = Math.max(1, endPage - maxPagesToShow + 1);

        let pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => `
            <li class="page-item ${currentPage === i + startPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i + startPage}">${i + startPage}</a>
            </li>
        `).join('');

        let pageInput = `
            <li class="page-item">
                <input type="number" class="form-control" id="pageInput" placeholder="Go to" min="1" max="${totalPages}">
            </li>
        `;

        paginationContainer.append(firstPage + prevPage + pages + nextPage + lastPage + pageInput);

        paginationContainer.on('click', '.page-link', function(e) {
            e.preventDefault();
            let newPage = parseInt($(this).data('page'));
            if (!isNaN(newPage)) {
                currentPage = newPage;
                applyFilters();
                window.history.pushState({ page: currentPage }, '', `?page=${currentPage}`);
            }
        });

        $('#pageInput').on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                let newPage = parseInt($(this).val());
                if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
                    currentPage = newPage;
                    applyFilters();
                    window.history.pushState({ page: currentPage }, '', `?page=${currentPage}`);
                }
                $(this).val('');
            }
        });

        $('#totalPages').text(`${totalPages} pages`);
    }

    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            currentPage = event.state.page;
            applyFilters();
        }
    });

    function showModal(row) {
        let modalBody = $('#modalBody');
        modalBody.empty();

        for (let key in row) {
            if (row.hasOwnProperty(key)) {
                modalBody.append(`<p><strong>${key}:</strong> ${row[key]}</p>`);
            }
        }

        $('#infoModal').modal('show');
    }
});
