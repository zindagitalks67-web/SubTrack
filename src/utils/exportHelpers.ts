import { Subscription } from '@/types';

// 1. Export CSV
export const exportToCSV = (subscriptions: Subscription[], filename = 'subtrack-subscriptions.csv') => {
  if (!subscriptions || subscriptions.length === 0) return;

  const headers = ['Name', 'Category', 'Cost', 'Billing Cycle', 'Next Renewal', 'Shared'];

  const rows = subscriptions.map((sub: any) => [
    `"${(sub.name || '').replace(/"/g, '""')}"`,
    `"${sub.category || ''}"`,
    sub.cost ?? sub.price ?? sub.amount ?? 0,
    sub.billingCycle || '',
    sub.nextRenewalDate || '',
    sub.shared || sub.isShared ? 'Yes' : 'No',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 2. Export PDF / Printable Summary
export const exportToPDF = (subscriptions: Subscription[], currencySymbol = '₹') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalMonthly = subscriptions.reduce((acc: number, sub: any) => {
    const val = Number(sub.cost ?? sub.price ?? sub.amount) || 0;
    return acc + val;
  }, 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SubTrack Subscription Report</title>
      <style>
        body { font-family: sans-serif; padding: 20px; color: #1e293b; }
        h1 { color: #4f46e5; margin-bottom: 4px; }
        p { color: #64748b; font-size: 14px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .card { background: #f8fafc; padding: 12px 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
        th { background: #f1f5f9; text-transform: uppercase; font-size: 11px; color: #475569; }
      </style>
    </head>
    <body>
      <h1>SubTrack Report</h1>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
      
      <div class="summary">
        <div class="card">
          <strong>Total Subscriptions:</strong> ${subscriptions.length}
        </div>
        <div class="card">
          <strong>Total Monthly Cost:</strong> ${currencySymbol}${totalMonthly.toFixed(2)}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Cycle</th>
            <th>Next Renewal</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          ${subscriptions
            .map(
              (s: any) => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td>${s.category}</td>
              <td>${s.billingCycle}</td>
              <td>${s.nextRenewalDate}</td>
              <td>${currencySymbol}${s.cost ?? s.price ?? s.amount ?? 0}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};