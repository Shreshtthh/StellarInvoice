import { Layout, Text, Card, Badge, Loader } from "@stellar/design-system";
import { useInvoices } from "../hooks/useInvoices";
import { useWallet } from "../hooks/useWallet";
import { 
  stroopsToNumber, 
  calculateAPR, 
  calculateDaysUntilDue,
  formatCurrency 
} from "../utils/roi-calculator";

// CSV Export Function
const exportToCSV = (invoices: any[]) => {
  const headers = ['Invoice ID', 'Status', 'Purchase Price ($)', 'Face Value ($)', 'Expected Profit ($)', 'APR (%)', 'Days to Maturity', 'Memo'];
  
  const rows = invoices.map(inv => {
    const faceAmount = stroopsToNumber(inv.face_amount);
    const purchasePrice = inv.discount_amount ? stroopsToNumber(inv.discount_amount) : faceAmount;
    const profit = faceAmount - purchasePrice;
    const daysLeft = calculateDaysUntilDue(inv.due_timestamp);
    const apr = calculateAPR(faceAmount, purchasePrice, daysLeft);
    
    const statusMap: Record<number, string> = {
      2: 'Owned',
      3: 'Settled',
      4: 'Defaulted'
    };
    
    return [
      inv.id?.toString() || 'N/A',
      statusMap[inv.status] || 'Unknown',
      purchasePrice.toFixed(2),
      faceAmount.toFixed(2),
      profit.toFixed(2),
      apr.toFixed(1),
      daysLeft,
      `"${(inv.memo || 'No description').replace(/"/g, '""')}"`
    ].join(',');
  });
  
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stellar-invoice-portfolio-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const InvoiceCard = ({ invoice }: { invoice: any }) => {
  const faceAmount = stroopsToNumber(invoice.face_amount);
  const purchasePrice = invoice.discount_amount 
    ? stroopsToNumber(invoice.discount_amount)
    : faceAmount;
  const daysLeft = calculateDaysUntilDue(invoice.due_timestamp);
  const profit = faceAmount - purchasePrice;
  const apr = calculateAPR(faceAmount, purchasePrice, daysLeft);

  const getStatusBadge = () => {
    switch (invoice.status) {
      case 2: return <Badge variant="success">Owned</Badge>;
      case 3: return <Badge variant="secondary">Settled</Badge>;
      case 4: return <Badge variant="error">Defaulted</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <Text as="h3" size="md">Invoice #{invoice.id?.toString() || "N/A"}</Text>
          {getStatusBadge()}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <Text as="p" size="sm" style={{ color: "#666", marginBottom: "8px" }}>
            {invoice.memo || "No description"}
          </Text>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <Text as="p" size="xs" style={{ color: "#888", marginBottom: "4px" }}>
              Purchase Price
            </Text>
            <Text as="p" size="md" style={{ fontWeight: "bold" }}>
              {formatCurrency(invoice.discount_amount || invoice.face_amount)}
            </Text>
          </div>

          <div>
            <Text as="p" size="xs" style={{ color: "#888", marginBottom: "4px" }}>
              Face Value
            </Text>
            <Text as="p" size="md" style={{ fontWeight: "bold", color: "#00a86b" }}>
              {formatCurrency(invoice.face_amount)}
            </Text>
          </div>

          <div>
            <Text as="p" size="xs" style={{ color: "#888", marginBottom: "4px" }}>
              Expected Profit
            </Text>
            <Text as="p" size="md" style={{ fontWeight: "bold", color: "#00a86b" }}>
              +${profit.toFixed(2)} ({apr.toFixed(1)}% APR)
            </Text>
          </div>

          <div>
            <Text as="p" size="xs" style={{ color: "#888", marginBottom: "4px" }}>
              Days to Maturity
            </Text>
            <Text as="p" size="md" style={{ fontWeight: "bold" }}>
              {daysLeft} days
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Portfolio = () => {
  const { address } = useWallet();
  const { useAllInvoices } = useInvoices();
  const { data: allInvoices, isLoading, error } = useAllInvoices();

  // Filter for invoices owned by current user
  const myInvoices = (allInvoices || []).filter((inv) => {
    return inv.owner === address || inv.buyer === address;
  });

  const stats = {
    totalInvested: myInvoices.reduce((sum, inv) => {
      const purchasePrice = inv.discount_amount 
        ? stroopsToNumber(inv.discount_amount)
        : stroopsToNumber(inv.face_amount);
      return sum + purchasePrice;
    }, 0),
    expectedReturn: myInvoices.reduce((sum, inv) => {
      return sum + stroopsToNumber(inv.face_amount);
    }, 0),
    totalProfit: myInvoices.reduce((sum, inv) => {
      const faceAmount = stroopsToNumber(inv.face_amount);
      const purchasePrice = inv.discount_amount 
        ? stroopsToNumber(inv.discount_amount)
        : faceAmount;
      return sum + (faceAmount - purchasePrice);
    }, 0),
  };

  return (
    <Layout.Content>
      <Layout.Inset>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <Text as="h1" size="xl">
              My Portfolio
            </Text>
            <Text as="p" size="md" style={{ color: "#666" }}>
              {myInvoices.length} invoice{myInvoices.length !== 1 ? 's' : ''} owned
            </Text>
          </div>
          {address && myInvoices.length > 0 && (
            <button
              onClick={() => exportToCSV(myInvoices)}
              style={{
                padding: "12px 24px",
                backgroundColor: "#5B4AE2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(91, 74, 226, 0.2)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#4A3BC8";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(91, 74, 226, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#5B4AE2";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(91, 74, 226, 0.2)";
              }}
            >
              📥 Export to CSV
            </button>
          )}
        </div>

        {!address && (
          <Card>
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Text as="p" size="md" style={{ color: "#888" }}>
                Connect your wallet to view your portfolio
              </Text>
            </div>
          </Card>
        )}

        {address && (
          <>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "16px",
              marginBottom: "32px" 
            }}>
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text as="p" size="xs" style={{ color: "#888", marginBottom: "8px" }}>
                    Total Invested
                  </Text>
                  <Text as="p" size="lg" style={{ fontWeight: "bold" }}>
                    ${stats.totalInvested.toFixed(2)}
                  </Text>
                </div>
              </Card>

              <Card>
                <div style={{ padding: "20px" }}>
                  <Text as="p" size="xs" style={{ color: "#888", marginBottom: "8px" }}>
                    Expected Return
                  </Text>
                  <Text as="p" size="lg" style={{ fontWeight: "bold", color: "#00a86b" }}>
                    ${stats.expectedReturn.toFixed(2)}
                  </Text>
                </div>
              </Card>

              <Card>
                <div style={{ padding: "20px" }}>
                  <Text as="p" size="xs" style={{ color: "#888", marginBottom: "8px" }}>
                    Total Profit
                  </Text>
                  <Text as="p" size="lg" style={{ fontWeight: "bold", color: "#00a86b" }}>
                    +${stats.totalProfit.toFixed(2)}
                  </Text>
                </div>
              </Card>
            </div>

            {isLoading && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Loader />
                <Text as="p" size="md" style={{ marginTop: "16px" }}>
                  Loading portfolio...
                </Text>
              </div>
            )}

            {error && (
              <Card>
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <Text as="p" size="md" style={{ color: "#f00" }}>
                    Error loading portfolio: {String(error)}
                  </Text>
                </div>
              </Card>
            )}

            {!isLoading && !error && myInvoices.length === 0 && (
              <Card>
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <Text as="p" size="md" style={{ color: "#888", marginBottom: "16px" }}>
                    You don't own any invoices yet.
                  </Text>
                  <Text as="p" size="sm" style={{ color: "#666" }}>
                    Visit the Marketplace to purchase invoices!
                  </Text>
                </div>
              </Card>
            )}

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
              gap: "24px" 
            }}>
              {myInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id?.toString()} invoice={invoice} />
              ))}
            </div>
          </>
        )}
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Portfolio;
