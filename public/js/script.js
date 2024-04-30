document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('customerForm');
    const searchButton = document.getElementById('searchButton');
    const searchTaxNumber = document.getElementById('searchTaxNumber');
    const openModalBtn = document.getElementById('openModalBtn');
    const modal = document.getElementById('myModal');
    const span = document.getElementsByClassName('close')[0];

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        handleSubmit();
    });

    searchTaxNumber.addEventListener('input', function() {
        const taxNumber = searchTaxNumber.value;
        const customerTableHeaders = document.querySelectorAll('#customerList th');
        const customerTableDataCells = document.querySelectorAll('#customerList tbody td');
        
        if (taxNumber.length >= 1) {
            customerTableHeaders.forEach(header => {
                header.classList.remove('hidden'); 
            });
            customerTableDataCells.forEach(cell => {
                cell.classList.remove('hidden'); 
            });
            searchCustomersByTaxNumber(taxNumber);
        } else {
            customerTableHeaders.forEach(header => {
                header.classList.add('hidden'); 
            });
            customerTableDataCells.forEach(cell => {
                cell.classList.add('hidden'); 
            });
            clearCustomerTable();
        }
    });

    searchButton.addEventListener('click', function() {
        const taxNumber = searchTaxNumber.value;
        searchCustomersByTaxNumber(taxNumber);
    });

    

    // Enter tuşunu dinle
    searchTaxNumber.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const taxNumber = searchTaxNumber.value;
            searchCustomersByTaxNumber(taxNumber);
        }
    });

    searchTaxNumber.addEventListener('keydown', function(event) {
        if (event.key === 'Delete') {
            searchTaxNumber.value = '';
            const taxNumber = searchTaxNumber.value;
            searchCustomersByTaxNumber(taxNumber);
        }
    });

    openModalBtn.onclick = function () {
        modal.style.display = "block";
        searchTaxNumber.focus();
    }

    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

        // Modalı kapatmak için ESC tuşunu dinle
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                modal.style.display = "none";
            }
        });

    const phoneInput = form.elements['phone'];
    phoneInput.addEventListener('input', function() {
        const phoneValue = phoneInput.value;
        const phoneValid = isValidPhoneNumber(phoneValue);
        if (phoneValue.length > 10) {
            phoneInput.value = phoneValue.slice(0, 10);
        } 
        
    });

    function isValidPhoneNumber(number) {
        return /^\d{10}$/.test(number);
    }
    // Greek Tax Registration Number Validation (AFM)
    function validateAFM(afm) {
        if (!afm.match(/^\d{9}$/) || afm == '000000000') {
            return false;
        }

        var m = 1, sum = 0;
        for (var i = 7; i >= 0; i--) {
            m *= 2;
            sum += afm.charAt(i) * m;
        }

        return sum % 11 % 10 == afm.charAt(8);
    }

    function searchCustomersByTaxNumber(taxNumber) {
        fetch(`/api/customers/${taxNumber}`)
            .then(response => response.json())
            .then(data => {
                populateCustomerTable(data.data); 
            })
            .catch(error => {
                console.error('Hata:', error);
            });
    }

    function populateCustomerTable(customers) {
        const tbody = document.querySelector('#customerTable tbody');
        tbody.innerHTML = '';

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.firstName}</td>
                <td>${customer.lastName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.taxNumber}</td>
                <td>${customer.identityNumber}</td>
                <td>${customer.iban}</td>
                <td>${customer.motherName}</td>
                <td>${customer.fatherName}</td>
                <td>${new Date(customer.birthdate).toLocaleDateString()}</td>
                <td>${customer.address}</td>
                <td>${customer.prefecture}</td>
                <td>${customer.city}</td>
                <td>${customer.postalCode}</td>
            `;
            tbody.appendChild(row);
        });
    }

    

    function clearCustomerTable() {
        const tbody = document.querySelector('#customerTable tbody');
        tbody.innerHTML = '';
    }

    function handleSubmit() {
        const taxNumber = form.elements['taxNumber'].value;
        const isValid = validateAFM(taxNumber);
         
        if (!isValid) {
            alert('Εισαγάγετε έναν έγκυρο φορολογικό αριθμό.');
            return;
        }

        const firstName = form.elements['firstName'].value;
        const lastName = form.elements['lastName'].value;
        const email = form.elements['email'].value;
        const phone = form.elements['phone'].value;
        const identityNumber = form.elements['identityNumber'].value;
        const iban = form.elements['iban'].value;
        const motherName = form.elements['motherName'].value;
        const fatherName = form.elements['fatherName'].value;
        const birthdate = form.elements['birthdate'].value;
        const address = form.elements['address'].value;
        const prefecture = form.elements['prefecture'].value;
        const city = form.elements['city'].value;
        const postalCode = form.elements['postalCode'].value;

        const formData = { 
            firstName,
            lastName,
            email,
            phone,
            taxNumber,
            identityNumber,
            iban,
            motherName,
            fatherName,
            birthdate,
            address,
            prefecture,
            city,
            postalCode
        };

        fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                if (data.exists) {
                    alert('Αυτός ο ΑΦΜ χρησιμοποιείται ήδη. Εισαγάγετε έναν άλλο φορολογικό αριθμό.');
                } else {
                    alert('Ο πελάτης προστέθηκε με επιτυχία.');
                    form.reset();
                }
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        });
    }
});
//////yeni
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/customers')
        .then(response => response.json())
        .then(data => {
            populateCustomerTable(data.data); 
        })
        .catch(error => {
            console.error('Hata:', error);
        });

    function populateCustomerTable(customers) {
        const tbody = document.querySelector('#customerTable tbody');
        tbody.innerHTML = '';

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.firstName}</td>
                <td>${customer.lastName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.taxNumber}</td>
                <td>${customer.identityNumber}</td>
                <td>${customer.iban}</td>
                <td>${customer.motherName}</td>
                <td>${customer.fatherName}</td>
                <td>${new Date(customer.birthdate).toLocaleDateString()}</td>
                <td>${customer.address}</td>
                <td>${customer.prefecture}</td>
                <td>${customer.city}</td>
                <td>${customer.postalCode}</td>
            `;
            tbody.appendChild(row);
        });
    }
});
