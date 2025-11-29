let records = JSON.parse(localStorage.getItem('records')) || [];

const form = document.getElementById('entryForm');
const vehicleNumberInput = document.getElementById('vehicleNumber');
const driverNameInput = document.getElementById('driverName');
const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');
const fuelUsedInput = document.getElementById('fuelUsed');
const fuelPriceInput = document.getElementById('fuelPrice');
const distanceInput = document.getElementById('distance');
const refillsInput = document.getElementById('refills');
const consumptionRateInput = document.getElementById('consumptionRate');
const tableBody = document.getElementById('tableBody');
const emptyMessage = document.getElementById('emptyMessage');
const successMessage = document.querySelector('.success-message');

const printBtn = document.getElementById('printBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    addRecord();
});

function addRecord() {
    const consumptionRate = parseFloat(consumptionRateInput.value);
    const fuelPrice = parseFloat(fuelPriceInput.value);
    const fuelUsed = parseFloat(fuelUsedInput.value);
    const distance = parseFloat(distanceInput.value);
    const refills = parseInt(refillsInput.value);

    const expectedConsumption = distance / consumptionRate;
    const stolenLiters = fuelUsed - expectedConsumption;
    const stolenMoney = stolenLiters * fuelPrice;

    const record = {
        id: Date.now(),
        vehicleNumber: vehicleNumberInput.value,
        driverName: driverNameInput.value,
        dateFrom: dateFromInput.value,
        dateTo: dateToInput.value,
        fuelUsed: fuelUsed,
        distance: distance,
        refills: refills,
        expectedConsumption: expectedConsumption,
        stolenLiters: stolenLiters,
        stolenMoney: stolenMoney,
        fuelPrice: fuelPrice
    };

    records.push(record);
    saveRecords();
    renderTable();
    updateStatistics();
    form.reset();
    showSuccessMessage();
    
    const today = new Date().toISOString().split('T')[0];
    dateFromInput.value = today;
    dateToInput.value = today;
}

function saveRecords() {
    localStorage.setItem('records', JSON.stringify(records));
}

function deleteRecord(id) {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        records = records.filter(r => r.id !== id);
        saveRecords();
        renderTable();
        updateStatistics();
    }
}

function formatDateRange(dateFrom, dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const fromStr = from.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const toStr = to.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return `${fromStr} إلى ${toStr}`;
}

function renderTable() {
    if (records.length === 0) {
        tableBody.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    tableBody.innerHTML = records.map((record, index) => `
        <tr>
            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
            <td style="text-align: center; font-weight: 600;">${record.vehicleNumber}</td>
            <td style="text-align: center;">${record.driverName}</td>
            <td style="text-align: center; font-size: 0.9rem;">${formatDateRange(record.dateFrom, record.dateTo)}</td>
            <td style="text-align: center; font-weight: 500;">${record.fuelUsed.toFixed(2)}</td>
            <td style="text-align: center;">${record.distance.toFixed(2)}</td>
            <td style="text-align: center; font-weight: 600;">${record.refills}</td>
            <td style="text-align: center;">${record.expectedConsumption.toFixed(2)}</td>
            <td class="theft-highlight" style="text-align: center;">${record.stolenLiters.toFixed(2)}</td>
            <td class="theft-highlight" style="text-align: center;">${record.stolenMoney.toFixed(2)} ج</td>
            <td class="no-print" style="text-align: center;">
                <span class="delete-btn" onclick="deleteRecord(${record.id})" title="حذف السجل">
                    <i class="bi bi-trash"></i>
                </span>
            </td>
        </tr>
    `).join('');
}

function updateStatistics() {
    const totalRecords = records.length;
    const totalStolenLiters = records.reduce((sum, r) => sum + (r.stolenLiters > 0 ? r.stolenLiters : 0), 0);
    const totalStolenMoney = records.reduce((sum, r) => sum + (r.stolenMoney > 0 ? r.stolenMoney : 0), 0);
    const uniqueDrivers = new Set(records.map(r => r.driverName)).size;

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('totalStolenLiters').textContent = totalStolenLiters.toFixed(2);
    document.getElementById('totalStolenMoney').textContent = totalStolenMoney.toFixed(2) + ' ج';
    document.getElementById('totalDrivers').textContent = uniqueDrivers;

    const topThief = getTopThief();
    if (topThief) {
        document.getElementById('topThiefName').textContent = topThief.name;
        document.getElementById('topThiefAmount').textContent = topThief.amount.toFixed(2) + ' ج';
    } else {
        document.getElementById('topThiefName').textContent = '-';
        document.getElementById('topThiefAmount').textContent = '0 ج';
    }
}

function getTopThief() {
    if (records.length === 0) return null;

    const driverThefts = {};
    records.forEach(record => {
        if (record.stolenMoney > 0) {
            if (!driverThefts[record.driverName]) {
                driverThefts[record.driverName] = 0;
            }
            driverThefts[record.driverName] += record.stolenMoney;
        }
    });

    let topDriver = null;
    let maxTheft = 0;
    for (const [driver, theft] of Object.entries(driverThefts)) {
        if (theft > maxTheft) {
            maxTheft = theft;
            topDriver = driver;
        }
    }

    return topDriver ? { name: topDriver, amount: maxTheft } : null;
}

function showSuccessMessage() {
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function generatePdfContent() {
    const totalStolenLiters = records.reduce((sum, r) => sum + (r.stolenLiters > 0 ? r.stolenLiters : 0), 0);
    const totalStolenMoney = records.reduce((sum, r) => sum + (r.stolenMoney > 0 ? r.stolenMoney : 0), 0);
    const totalFuelUsed = records.reduce((sum, r) => sum + r.fuelUsed, 0);
    const totalDistance = records.reduce((sum, r) => sum + r.distance, 0);
    const totalRefills = records.reduce((sum, r) => sum + r.refills, 0);
    const totalExpectedConsumption = records.reduce((sum, r) => sum + r.expectedConsumption, 0);

    let html = `
        <div style="direction: rtl; font-family: Arial, sans-serif; padding: 2px;">
            <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 10px; margin-bottom: 8px; color: white;">
                <h1 style="margin: 0; font-size: 18px; font-weight: bold;">📋 تقرير كشف اهدار البنزين - مصنع البهنساوي</h1>
                <p style="margin: 3px 0 0 0; font-size: 11px;">📅 ${new Date().toLocaleDateString('ar-EG', {year: 'numeric', month: 'long', day: 'numeric'})} | ⛽ معدل الاستهلاك: ${consumptionRateInput.value} كم/لتر</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">#</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">العربية</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">السائق</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">المدة</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">الإجمالي(لتر)</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">المسافة(كم)</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">التفويلات</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">المتوقع</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">المهدر(لتر)</th>
                        <th style="padding: 5px; text-align: center; border: 1px solid #555; font-weight: bold;">القيمة</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map((record, index) => `
                        <tr style="border-bottom: 1px solid #ddd; ${index % 2 === 0 ? 'background-color: #fafafa;' : 'background-color: white;'}">
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 11px;">${index + 1}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; font-size: 11px;">${record.vehicleNumber}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; font-size: 11px;">${record.driverName}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; font-size: 10px;">${formatDateRange(record.dateFrom, record.dateTo)}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; font-weight: 600; font-size: 11px;">${record.fuelUsed.toFixed(2)}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; font-size: 11px;">${record.distance.toFixed(2)}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; font-weight: 600; font-size: 11px;">${record.refills}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; font-size: 11px;">${record.expectedConsumption.toFixed(2)}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; background-color: #ffebee; font-weight: bold; color: #c62828; font-size: 11px;">${record.stolenLiters.toFixed(2)}</td>
                            <td style="padding: 5px; text-align: center; border: 1px solid #ddd; background-color: #ffcdd2; font-weight: bold; color: #b71c1c; font-size: 11px;">${record.stolenMoney.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #f5e6ff 100%); border: 2px solid #667eea; font-weight: bold;">
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px; background-color: #667eea; color: white;">الإجمالي</td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px;"></td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px;"></td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px;"></td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px; color: #667eea;">${totalFuelUsed.toFixed(2)}</td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px; color: #667eea;">${totalDistance.toFixed(2)}</td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px; color: #667eea;">${totalRefills}</td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px; color: #667eea;">${totalExpectedConsumption.toFixed(2)}</td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px; background-color: #ffebee; color: #c62828;">${totalStolenLiters.toFixed(2)}</td>
                        <td style="padding: 5px; text-align: center; border: 1px solid #555; font-size: 11px; background-color: #ffcdd2; color: #b71c1c;">${totalStolenMoney.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 8px; background-color: #f9f9f9; padding: 8px; border-radius: 4px; border-top: 2px solid #667eea; text-align: center; font-size: 10px;">
                <p style="color: #333; margin: 2px 0; font-weight: bold;">✓ تحت إشراف: احمد عصام</p>
                <p style="color: #999; margin: 1px 0;">تم إنشاء التقرير في: ${new Date().toLocaleTimeString('ar-EG')}</p>
            </div>
        </div>
    `;

    return html;
}

function exportToPDF() {
    if (records.length === 0) {
        alert('لا توجد سجلات لتنزيلها');
        return;
    }

    const element = document.createElement('div');
    element.innerHTML = generatePdfContent();
    element.style.width = '210mm';
    element.style.padding = '10mm';
    element.style.boxSizing = 'border-box';
    element.style.backgroundColor = '#ffffff';
    document.body.appendChild(element);

    setTimeout(() => {
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 1000
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`تقرير_سرقة_البنزين_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.pdf`);
            document.body.removeChild(element);
        }).catch(err => {
            console.error('Error generating PDF:', err);
            alert('حدث خطأ في تنزيل PDF');
            document.body.removeChild(element);
        });
    }, 100);
}

function exportToExcel() {
    if (records.length === 0) {
        alert('لا توجد سجلات لتنزيلها');
        return;
    }

    const data = [
        ['تقرير كشف سرقة البنزين - مصنع البهنساوي'],
        [''],
        ['معدل الاستهلاك المتوقع:', consumptionRateInput.value, 'كيلومتر / لتر'],
        ['تاريخ التقرير:', new Date().toLocaleDateString('ar-EG')],
        [''],
        ['#', 'رقم العربية', 'اسم السائق', 'المدة', 'الليترات الإجمالي', 'المسافة (كم)', 'عدد التفويلات', 'الليترات المتوقعة', 'الليترات المسروقة', 'قيمة السرقة (جنيه)']
    ];

    records.forEach((record, index) => {
        data.push([
            index + 1,
            record.vehicleNumber,
            record.driverName,
            formatDateRange(record.dateFrom, record.dateTo),
            record.fuelUsed.toFixed(2),
            record.distance.toFixed(2),
            record.refills,
            record.expectedConsumption.toFixed(2),
            record.stolenLiters.toFixed(2),
            record.stolenMoney.toFixed(2)
        ]);
    });

    const totalStolenLiters = records.reduce((sum, r) => sum + (r.stolenLiters > 0 ? r.stolenLiters : 0), 0);
    const totalStolenMoney = records.reduce((sum, r) => sum + (r.stolenMoney > 0 ? r.stolenMoney : 0), 0);

    data.push([]);
    data.push(['الملخص الإجمالي:']);
    data.push(['إجمالي عدد السجلات:', records.length]);
    data.push(['إجمالي الليترات المسروقة:', totalStolenLiters.toFixed(2)]);
    data.push(['إجمالي قيمة السرقة (جنيه):', totalStolenMoney.toFixed(2)]);
    data.push(['عدد السائقين:', new Set(records.map(r => r.driverName)).size]);
    data.push(['']);
    data.push(['تحت إشراف: احمد عصام']);

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!colWidths'] = [5, 15, 18, 25, 18, 15, 15, 18, 18, 20];

    for (let i = 0; i < data.length; i++) {
        const cellRef = 'A' + (i + 1);
        if (data[i][0] === '#') {
            for (let j = 0; j < data[i].length; j++) {
                const colRef = String.fromCharCode(65 + j) + (i + 1);
                ws[colRef].s = { 
                    fill: { fgColor: { rgb: 'FF667EEA' } },
                    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'السجلات');

    const fileName = `تقرير_سرقة_البنزين_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

function printReport() {
    if (records.length === 0) {
        alert('لا توجد سجلات لطباعتها');
        return;
    }

    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير سرقة البنزين</title>
            <style>
                * { font-family: Arial, sans-serif; }
                body { padding: 20px; direction: rtl; background: white; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { padding: 10px; text-align: center; border: 1px solid #555; font-weight: bold; font-size: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                td { padding: 10px; text-align: center; border: 1px solid #ddd; font-size: 12px; }
                tr:nth-child(even) { background-color: #fafafa; }
                .theft-liters { background-color: #ffebee; font-weight: bold; color: #c62828; }
                .theft-money { background-color: #ffcdd2; font-weight: bold; color: #b71c1c; }
                .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; margin-bottom: 30px; border-radius: 10px; color: white; }
                .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
                .header h2 { margin: 15px 0 0 0; font-size: 24px; font-weight: 600; opacity: 0.95; }
                .info-box { background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #667eea; }
                .info-box p { font-size: 13px; color: #555; margin: 8px 0; }
                .summary-section { background: linear-gradient(135deg, #f0f4ff 0%, #f5e6ff 100%); padding: 20px; border-radius: 10px; margin-bottom: 30px; border-right: 5px solid #667eea; }
                .summary-section h4 { color: #667eea; margin-top: 0; font-size: 14px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                .summary-table { width: 100%; margin-top: 10px; }
                .summary-table td { padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right; }
                .footer-section { margin-top: 40px; background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-top: 3px solid #667eea; text-align: center; }
                .footer-section p { font-size: 11px; color: #666; margin: 5px 0; }
                @media print { body { padding: 0; } .header { page-break-after: avoid; } }
            </style>
        </head>
        <body>
            ${generatePdfContent()}
            <script>
                window.onload = function() { setTimeout(() => window.print(), 500); };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

printBtn.addEventListener('click', printReport);
exportPdfBtn.addEventListener('click', exportToPDF);
exportExcelBtn.addEventListener('click', exportToExcel);

renderTable();
updateStatistics();

const today = new Date().toISOString().split('T')[0];
dateFromInput.value = today;
dateToInput.value = today;
