let sellersData = [];

document.getElementById("Submit").onclick = function () {
    let sellerName = document.getElementById("SellerName").value;
    let buyerName = document.getElementById("BuyerName").value;
    let itemName = document.getElementById("ItemName").value;
    let Weight = Number(document.getElementById("Weigh").value);
    let Price = Number(document.getElementById("Pric").value);
    let Extra_Kat = Number(document.getElementById("Extra_Kat").value);

    calculateSale(sellerName, buyerName, itemName, Weight, Price, Extra_Kat);
};

document.getElementById("GetBill").onclick = function () {
    let buyerName = document.getElementById("BuyerName").value;
    generateBill(buyerName);
};

function calculateSale(sellerName, buyerName, itemName, Weight, Price, Extra_Kat) {
    let Kat = 0;
    let Net_Weight = 0;
    let Bill = 0;

    let roundedWeight = Math.floor(Weight);
    if (Weight - roundedWeight >= 0.875) {
        roundedWeight += 1;
    }

    let pro = roundedWeight * 2;

    if (pro % 5 !== 0) {
        do {
            pro++;
        } while (pro % 5 !== 0);
    }

    if (Extra_Kat === 0 || Extra_Kat === undefined) {
        Kat = pro / 40;
    } else {
        Kat = (pro / 40) + Extra_Kat;
    }

    Net_Weight = Weight - Kat;
    Bill = Net_Weight * Price;
    Bill = Math.round(Bill);

    // Check if the entry already exists
    if (!isDuplicateEntry(sellerName, buyerName)) {
        // Add the calculated values to the sellersData array
        addSaleData(sellerName, {
            buyerName: buyerName,
            itemName: itemName,
            Weight: Weight,
            Kat: Kat,
            Net_Weight: Net_Weight,
            Price: Price,
            Bill: Bill
        });

        // Display all results for the current sale
        displayAllSaleResults();
    } else {
        // Ask for confirmation before adding duplicate entry
        if (confirm("This entry already exists. Do you want to add it again?")) {
            addSaleData(sellerName, {
                buyerName: buyerName,
                itemName: itemName,
                Weight: Weight,
                Kat: Kat,
                Net_Weight: Net_Weight,
                Price: Price,
                Bill: Bill
            });

            // Display all results for the current sale
            displayAllSaleResults();
        }
    }
}

function addSaleData(sellerName, saleData) {
    let seller = sellersData.find(seller => seller.name === sellerName);

    if (!seller) {
        seller = {
            name: sellerName,
            sales: []
        };
        sellersData.push(seller);
    }

    seller.sales.push(saleData);
}

function isDuplicateEntry(sellerName, buyerName) {
    let seller = sellersData.find(seller => seller.name === sellerName);

    if (seller) {
        return seller.sales.some(sale => sale.buyerName === buyerName);
    }

    return false;
}

function displayAllSaleResults() {
    let resultsContainer = document.getElementById("resultsContainer");

    if (!resultsContainer) {
        console.error("Results container not found in HTML. Make sure you have an element with id 'resultsContainer'.");
        return;
    }

    // Clear previous entries
    resultsContainer.innerHTML = "";

    sellersData.forEach(function (seller) {
        // Create a parent box for each seller
        let sellerBox = document.createElement("div");
        sellerBox.classList.add("seller-box");
        sellerBox.innerHTML = `<h2>${seller.name}</h2>`;
        resultsContainer.appendChild(sellerBox);

        // Create a table for the seller's sales
        let table = document.createElement("table");
        table.cellSpacing = "0";
        table.style.textAlign = "center";
        table.style.width = "100%";
        table.style.border = "1px solid black";
        table.style.borderCollapse = "collapse";

        // Add table heading
        let tableHeading = document.createElement("tr");
        tableHeading.style.border = "1px solid black";
        tableHeading.innerHTML = `
            <th style="border:1px solid black">خریدار</th>
            <th style="border:1px solid black">قل رقم</th>
            <th style="border:1px solid black">قیمت فی من</th>
            <th style="border:1px solid black">صافی وزن</th>
            <th style="border:1px solid black">کاٹ</th>
            <th style="border:1px solid black">وزن</th>
            <th style="border:1px solid black">قسم مال</th>
            <th style="border:1px solid black">عملیات</th> <!-- Added a new column for operations -->
        `;
        table.appendChild(tableHeading);

        seller.sales.forEach(function (sale, index) {
            // Create a row for each sale entry
            let entryRow = document.createElement("tr");
            entryRow.style.border = "1px solid black";
            entryRow.innerHTML = `
                <td style="border:1px solid black">${sale.buyerName}</td>
                <td style="border:1px solid black">Rs ${sale.Bill.toFixed(2)}</td>
                <td style="border:1px solid black">Rs ${sale.Price.toFixed(2)}</td>
                <td style="border:1px solid black">${sale.Net_Weight.toFixed(2)} من</td>
                <td style="border:1px solid black">${sale.Kat.toFixed(2)} من</td>
                <td style="border:1px solid black">${sale.Weight} من</td>
                <td style="border:1px solid black">${sale.itemName}</td>
                <td style="border:1px solid black"><button style="width:80%" onclick="removeSale('${seller.name}', ${index})">Remove</button></td> <!-- Button to remove the sale -->
            `;
            table.appendChild(entryRow);
        });

        // Append the table to the seller's box
        sellerBox.appendChild(table);
    });
}

// Function to remove a sale
function removeSale(sellerName, index) {
    // Remove the sale at the specified index
    sellersData.find(seller => seller.name === sellerName).sales.splice(index, 1);
    
    // Update the displayed results
    displayAllSaleResults();
}

function generateBill() {
    let billWindow = window.open("", "_blank");
    billWindow.document.write("<html><head><title>All Buyers' Bills</title>");
    billWindow.document.write('<link rel="stylesheet" type="text/css" href="styles.css"></head><body>');

    let buyers = {};

    sellersData.forEach(function (seller) {
        seller.sales.forEach(function (sale) {
            let buyerName = sale.buyerName;

            if (!buyers[buyerName]) {
                buyers[buyerName] = {
                    sales: [],
                    totalBill: 0,
                    totalWeight: 0
                };
            }

            buyers[buyerName].sales.push(sale);
            buyers[buyerName].totalBill += sale.Bill;
            buyers[buyerName].totalWeight += sale.Weight;
        });
    });

    // Define a variable to store the original total bill
    let originalTotalBill = {};

    for (let buyerName in buyers) {
        let buyer = buyers[buyerName];

        // Create a div for each buyer
        let date;
        date = Date();
        billWindow.document.write(`<div class="buyer-section">`);
        billWindow.document.write(`<h1 style="margin:10px;text-align:center;">احمد کمیشن شاپ</h1>`);
        billWindow.document.write(`<h2 style="text-align:center;"><p style="font-size: 14px;font-weight: 300;background-color: white;border: transparent; width: 19%;margin: auto;border-radius: 16px;">آڑھت لکڑ منڈی لیاقت پور</p></h2>`);    
        billWindow.document.write(`<h2 style="text-align:center;"><p style="display:inline;float:left;font-size:16px;font-weight:300;margin:10px 0 10px 13px">${date.substring(4, 15)}</p>${buyerName}</h2>`);

        // Create a table for the buyer's sales
        billWindow.document.write(`
            <div class="entry-box table-entry" >
                <table cellspacing="0" style="text-align:center;width:100%;border:1px solid black; border-collapse: collapse">
                    <tr style="border:1px solid black">  
                        <th style="border:1px solid black">قل رقم</th>
                        <th style="border:1px solid black">قیمت فی من</th>
                        <th style="border:1px solid black">صافی وزن</th>
                        <th style="border:1px solid black">کاٹ</th>
                        <th style="border:1px solid black">وزن</th>
                        <th style="border:1px solid black">قسم مال</th>
                    </tr>
        `);

        // Add rows for each sale of the current buyer
        buyer.sales.forEach(function (sale) {
            billWindow.document.write(`
                <tr style="border:1px solid black">
                <td style="border:1px solid black">Rs ${sale.Bill.toFixed(2)}</td>
                <td style="border:1px solid black">Rs ${sale.Price.toFixed(2)}</td>
                <td style="border:1px solid black">${sale.Net_Weight.toFixed(2)} من</td>
                <td style="border:1px solid black">${sale.Kat.toFixed(2)} من</td>
                <td style="border:1px solid black">${sale.Weight} من</td>
                    <td style="border:1px solid black">${sale.itemName}</td>
                </tr>
            `);
        });

        // Add a row for rent input
        billWindow.document.write(`
            <tr style="border:1px solid black">
                <td colspan="" style="width:21%;text-align:left;border:1px solid black">
                    <input style="background: transparent;text-align:center;font-size:16px;border:transparent;width:100%" type="number" id="additionalAmount_${buyerName}" placeholder="Enter rent amount" onchange="updateTotalBill('${buyerName}')">
                </td>
                <td colspan="1" style="text-align:left;border:1px solid black">
                   <b> :کرایہ </b>
                </td>
                <td></td>     <td></td>                
                <td colspan="1" style="border:1px solid black">
                    Rs <span id="totalWeight">${buyer.totalWeight}</span>
                </td>
                <td colspan="6" style="text-align:left;border:1px solid black">
                   <b> :قل وزن </b>
                </td>
            </tr>
        `);

        // Add a row for the total bill
        billWindow.document.write(`
            <tr style="border:1px solid black">
                <td colspan="1" style="border:1px solid black">
                    Rs <span id="totalBill_${buyerName}">${buyer.totalBill.toFixed(2)}</span>
                </td>
                <td colspan="6" style="text-align:left;border:1px solid black">
                   <b> :قل رقم </b>
                </td>
            </tr>
        `);

        // Store the original total bill
        originalTotalBill[buyerName] = buyer.totalBill;

        // Close the buyer's div and add a page break after each buyer
        billWindow.document.write(`</table></div>`);
        billWindow.document.write("<div style='page-break-after: always;'></div>");
    }

    // Define the updateTotalBill function in the billWindow context
    billWindow.updateTotalBill = function (buyerName) {
        let additionalAmountInput = billWindow.document.getElementById(`additionalAmount_${buyerName}`);
        let totalBillSpan = billWindow.document.getElementById(`totalBill_${buyerName}`);
        let additionalAmount = parseFloat(additionalAmountInput.value) || 0;

        // Use the original total bill without additional additions
        let currentTotalBill = parseFloat(originalTotalBill[buyerName]);
        let newTotalBill = currentTotalBill + additionalAmount;

        totalBillSpan.innerText = newTotalBill.toFixed(2);
    };

    billWindow.document.write("</body></html>");
    billWindow.document.close();
}
document.getElementById("GetBJ").onclick = function () {
    // Call the function to generate tables for each supplier on a single page
    generateAllSupplierTablesOnSinglePage();
};

// New function to generate tables for each supplier on a single page
function generateAllSupplierTablesOnSinglePage() {
    // Open a single window to display all supplier tables
    let billWindow = window.open("", "_blank");
    billWindow.document.write("<html><head><title>All Suppliers' Bills</title>");
    billWindow.document.write('<link rel="stylesheet" type="text/css" href="styles.css"></head><body>');

    // Iterate through each seller and generate a table for each
    sellersData.forEach(function (seller) {
        generateSupplierTableOnSinglePage(billWindow, seller.name);
    });

    billWindow.document.write("</body></html>");
    billWindow.document.close();
}
// New function to generate a table for a specific supplier
function generateSupplierTableOnSinglePage(billWindow, sellerName) {
    function updateTotalExpenses(sellerName) {
        let paledariAmount = parseFloat(document.getElementById(`paledari_${sellerName}`).value);
        let mocheAmount = parseFloat(document.getElementById(`moche_${sellerName}`).value) ;
        let totalExpenses = (paledariAmount + mocheAmount + 20).toFixed(2);
        document.getElementById(`totalExpenses_${sellerName}`).innerText = totalExpenses;
    
        // Update BJ amount
        let totalBill = parseFloat(document.getElementById(`totalBill_${sellerName}`).innerText);
        let commissionAmount = (totalBill * 0.06);
        let bjAmount = (totalBill - commissionAmount - totalExpenses).toFixed(2);
        document.getElementById(`totalBJ_${sellerName}`).innerText = bjAmount;
    }
    
    let seller = sellersData.find(seller => seller.name === sellerName);

    if (!seller) {
        console.error(`Seller with name ${sellerName} not found.`);
        billWindow.document.write("<p>Error: Seller not found</p>");
        return;
    }

    // Create a div for the supplier
    let date = new Date();
    billWindow.document.write(`<div class="buyer-section">`);
    billWindow.document.write(`<h1 style="margin:10px;text-align:center;">احمد کمیشن شاپ</h1>`);
    billWindow.document.write(`<h2 style="text-align:center;"><p style="font-size: 14px;font-weight: 300;background-color: black;color:white;border: transparent; width: 19%;margin: auto;border-radius: 16px;">آڑھت لکڑ منڈی لیاقت پور</p></h2>`);
    billWindow.document.write(`<h2 style="text-align:center;"><p style="display:inline;float:left;font-size:16px;font-weight:300;margin:10px 0 10px 13px">${date.toDateString()}</p>${seller.name}</h2>`);

    // Create a table for the supplier's sales
    billWindow.document.write(`
        <div class="entry-box table-entry" >
            <table cellspacing="0" style="text-align:center;width:100%;border:1px solid black; border-collapse: collapse">
                <tr style="border:1px solid black">  
                    <th style="border:1px solid black">قل رقم</th>
                    <th style="border:1px solid black">قیمت فی من</th>
                    <th style="border:1px solid black">صافی وزن</th>
                    <th style="border:1px solid black">کاٹ</th>
                    <th style="border:1px solid black">وزن</th>
                    <th style="border:1px solid black">قسم مال</th>
                </tr>
    `);

    // Add rows for each sale of the current supplier
    seller.sales.forEach(function (sale, index) {
        billWindow.document.write(`
            <tr style="border:1px solid black">
                <td style="border:1px solid black">Rs ${sale.Bill.toFixed(2)}</td>
                <td style="border:1px solid black">Rs ${sale.Price.toFixed(2)}</td>
                <td style="border:1px solid black">${sale.Net_Weight.toFixed(2)} من</td>
                <td style="border:1px solid black">${sale.Kat.toFixed(2)} من</td>
                <td style="border:1px solid black">${sale.Weight} من</td>
                <td style="border:1px solid black">${sale.itemName}</td>
            </tr>
        `);

        // Add empty rows if total bill is not in the ninth row
        if (index <= 7) {
            for (let i = index + 1; i <= 8; i++) {
                billWindow.document.write("<tr style='border:1px solid black'></tr>");
            }
        }
    });

    // Add total bill and commission after eight rows
    let totalBill = seller.sales.reduce((acc, sale) => acc + sale.Bill, 0).toFixed(2);
    let commissionAmount = (totalBill * 0.06).toFixed(0);

    // Add empty rows if less than eight
    for (let i = seller.sales.length; i < 8; i++) {
        billWindow.document.write(`
        <tr style="border:1px solid black">
            <td colspan="1" style="border:1px solid black">&nbsp;</td>
            <td colspan="1" style="border:1px solid black">&nbsp;</td>
            <td colspan="1" style="border:1px solid black">&nbsp;</td>
            <td colspan="1" style="border:1px solid black">&nbsp;</td>
            <td colspan="1" style="border:1px solid black">&nbsp;</td>
            <td colspan="1" style="border:1px solid black">&nbsp;</td>
        </tr>
    `);
    }
    let totalWeightS = seller.sales.reduce((acc, sale) => acc + sale.Weight, 0).toFixed(2);

    // Add total weight row
    billWindow.document.write(`
        <tr style="border:1px solid black">
        <td colspan="1" style="border:1px solid black"></td>
        <td colspan="1" style="border:1px solid black"></td>
        <td colspan="1" style="border:1px solid black"></td>
        <td colspan="1" style="border:1px solid black"></td>
            <td colspan="1" style="border:1px solid black">
                <b> ${totalWeightS} من </b>
            </td>
            <td colspan="1" style="border:1px solid black">
            <b>:قل وزن</b>
       </td>
        </tr>
    `);
    // Add commission row
    billWindow.document.write(`
        <tr style="border:1px solid black">
            <td id="totalBill_${sellerName}" colspan="1" style="border:1px solid black"><b>${totalBill}</b></td>
            <td colspan="1" style="border:1px solid black"><b>:قل رقم </b></td>
            <td colspan="2" style="border:1px solid black"></td>
            <td colspan="1" style="border:1px solid black">
            <span><b>${commissionAmount}</b></span>
            </td>
            <td colspan="1" style="border:1px solid black">
                <b> :کمیشن </b>
            </td>
        </tr>
    `);

    // Add تولائ row
    billWindow.document.write(`
        <tr style="border:1px solid black">
        <td id="totalBill_${sellerName}" colspan="1" style="border:1px solid black"><b>-<span id="totalExpenses_${sellerName}">0.00</span></b></td>
        <td colspan="1" style="border:1px solid black"><b>:قل خرچہ </b></td>
        <td colspan="2" style="border:1px solid black"></td>
            <td colspan="1" style="border:1px solid black">
            <span><b>${(seller.sales.length + 1) * 20}</b></span>
            </td>
            <td colspan="1" style="border:1px solid black">
                <b> :تولائ</b>
            </td>
        </tr>
    `);

    // Add پلے داری row
    billWindow.document.write(`
        <tr style="border:1px solid black">
            <td colspan="4" style="border:1px solid black"></td>
            <td colspan="1" style="border:1px solid black">
            <span><b><input style="border:transparent;background-color: transparent;font-size:16px;font-weight:700; text-align:unset; width:80px;height:18px; margin:0px;" type="number" id="paledari_${sellerName}" oninput="updateTotalExpenses('${sellerName}')"></b></span>
            </td>
            <td colspan="1" style="border:1px solid black">
                <b> :پلے داری</b>
            </td>
        </tr>
    `);

    // Add منشیانہ row
    billWindow.document.write(`
        <tr style="border:1px solid black">
            <td colspan="4" style="border:1px solid black"></td>
            <td colspan="1" style="border:1px solid black">
            <span><b>20</b></span>
            </td>
            <td colspan="1" style="border:1px solid black">
                <b> :منشیانہ</b>
            </td>
        </tr>
    `);

    // Add موچھے row
    billWindow.document.write(`
        <tr style="border:1px solid black">
            <td colspan="4" style="border:1px solid black"></td>
            <td colspan="1" style="border:1px solid black">
            <span><b><input style="border:transparent;background-color: transparent;font-size:16px;font-weight:700; width:80px;text-align:unset ; height:18px;margin:0px;" type="number" id="moche_${sellerName}" oninput="updateTotalExpenses('${sellerName}')"></b></span>
            </td>
            <td colspan="1" style="border:1px solid black">
                <b> :مو چھے</b>
            </td>
        </tr>
    `);

    // Add BJ row
    billWindow.document.write(`
        <tr style="border:1px solid black">
            <td colspan="1" style="border:1px solid black">
            <b> <span id="totalBJ_${sellerName}">${(parseFloat(totalBill) - parseFloat(commissionAmount)).toFixed(0)}</span></b>
            </td>
            <td colspan="3" style="border:1px solid black;text-align:left">
                <b> :بی جے </b>
            </td>
        </tr>
    `);

    // Close the supplier's div
    billWindow.document.write(`</table></div>`);
    billWindow.document.write(`<script>
    function updateTotalExpenses(sellerName) {
        let paledariAmount = parseFloat(document.getElementById('paledari_' + sellerName).value) || 0;
        let mocheAmount = parseFloat(document.getElementById('moche_' + sellerName).value) || 0;

        // Include commission amount in total expenses
        let commissionAmount = (parseFloat(document.getElementById('totalBill_' + sellerName).innerText) * 0.06);
        let totalExpenses = (paledariAmount + mocheAmount +${(seller.sales.length + 1) * 20}+ commissionAmount + 20).toFixed(0);

        document.getElementById('totalExpenses_' + sellerName).innerText = totalExpenses;

        // Update BJ amount
        let totalBill = parseFloat(document.getElementById('totalBill_' + sellerName).innerText);
        let bjAmount = (totalBill - parseFloat(totalExpenses)).toFixed(0);
        document.getElementById('totalBJ_' + sellerName).innerText = bjAmount;
    }
</script>`);


billWindow.document.write(`</table></div>`);
billWindow.document.write("<div style='pae-break-after: always;'></div>");
}



