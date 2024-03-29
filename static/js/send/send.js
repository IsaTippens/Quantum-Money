
let serials = [];

$(document).ready(function () {
    let user = fetchUserFromCache();
    sendClickLogic();
    let balance = GetBalance(user.email);
    $('#total').append(balance);
    let wallet = GetWallet(user.email);
    GenerateWalletView(wallet);
});

function GetWalletOld(email) {

    $.ajax({
        url: '/cgi-bin/wallet.py',
        type: 'POST',
        data: JSON.stringify({ 'email': email }),
        error: function (xhr, status, error) {
            // Handle the error if the AJAX request fails
            alert('Error: ' + error);
        },
        success: function (data) {
            if (data['error']) {
                console.log({ data });
            }
            let banknotes = data['serials'];
            $('#total').append(banknotes.length);
            for (let i = 0; i < banknotes.length; i++) {
                let serial = banknotes[i];
                const banknote = `
                    <div class="card mb-2" style="width: 18rem;" id="banknote" data-serial="${serial}">
                        <div class="card-body">
                            <h3 class="card-title">R 1</h3>
                            <p class="card-text" >Serial Number: ${serial}</p>
                        </div>
                    </div>
                `;
                $('#wallet').append(banknote);
            }
            $('#banknote').click(function () {
                $(this).toggleClass('selected');

                var serialNumber = $(this).data('serial');
                var index = serials.indexOf(serialNumber);

                if (index === -1) {
                    serials.push(serialNumber);
                } else {
                    serials.splice(index, 1);
                }
                updateSelectedSerial();
            });
        }
    })
}

function sendClickLogic() {

    $('#sendButton').click(function () {
        let user = fetchUserFromCache();
        let email = user.email;
        let client = $('#client').val();
        if (client == null || client == "") {
            alert("You must enter a receiver's email");
            return;
        }

        if (selected.length == 0) {
            alert("You must select at least one banknote");
            return;
        }
        
        let selected_serials = [];
        for (let i = 0; i < selected.length; i++) {
            selected_serials.push(selected[i].serial);
        }
    
        $.ajax({
            url: '/cgi-bin/transfer/transfer.py',
            type: 'POST',
            data: JSON.stringify({'serials': selected_serials, 'email': email, 'receiver': client}),
            error: function (xhr, status, error) {
                // Handle the error if the AJAX request fails
                alert('Error: ' + error);
            },
            success: function (data) {
                console.log(data)
                if (data['error']) {
                    alert(data['error'])
                    return;
                }
                if (data['success'])
                {
                    alert(data['msg']);
                    clearSelected();
                    clearWalletFromCache();
                    window.location.href = '/send.html';
                    return;
                }
                alert('Something went wrong');
                
            }
        });
    });
}

function insertSerial(serial) {
    serials.push(serial);
}

function removeSerial(serial) {
    serials.reduce((acc, val) => {
        if (val != serial) {
            acc.push(val);
        }
        return acc;
    }, []);
}

function updateSelectedSerial() {
    totalSelected = serials.length;
    if (totalSelected == 0) {
        $('#selected-amount').html('<h2>No banknotes selected<h2>');
        $('#selected-serials').html('');
    }
    else {
        $('#selected-amount').html(`<h2>Selected Amount: R ${totalSelected}<h2>`);
        // in selected-serials, show a list of all the selected serials
        $('#selected-serials').html('');
        for (let i = 0; i < serials.length; i++) {
            $('#selected-serials').append(`<li>${serials[i]}</li>`);
        }

    }

}