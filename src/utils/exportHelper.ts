export function exportToCSV(subscriptions: any[]) {
  if (!subscriptions || subscriptions.length === 0) {
    alert("No subscription data found to export!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Name,Category,Price,Billing Cycle,Renewal Date\r\n";

  subscriptions.forEach(sub => {
    let row = `"${sub.name}","${sub.category}","${sub.price}","${sub.billingCycle}","${sub.renewalDate}"`;
    csvContent += row + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_subscriptions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}