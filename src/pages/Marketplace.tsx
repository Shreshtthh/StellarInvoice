import { useState } from "react";
import { Layout, Text, Card, Button, Badge, Loader } from "@stellar/design-system";
import { useInvoices } from "../hooks/useInvoices";
import { useWallet } from "../hooks/useWallet";
import { 
  stroopsToNumber, 
  calculateAPR, 
  calculateDaysUntilDue,
  formatCurrency 
} from "../utils/roi-calculator";

const InvoiceCard = ({ invoice, onBuy }: { invoice: any; onBuy: (id: bigint, asset: string) => void }) => {
  const faceAmount = stroopsToNumber(invoice.face_amount);
  const discountAmount = invoice.discount_amount 
    ? stroopsToNumber(invoice.discount_amount)
    : faceAmount;
  const daysLeft = calculateDaysUntilDue(invoice.due_timestamp);
  const apr = calculateAPR(faceAmount, discountAmount, daysLeft);
  const profit = faceAmount - discountAmount;

  return (
    <Card>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <Text as="h3" size="md">Invoice #{invoice.id?.toString() || "N/A"}</Text>
          <Badge variant="success">{`${apr.toFixed(1)}% APR`}</Badge>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <Text as="p" size="sm" style={{ color: "#666", marginBottom: "8px" }}>
            {invoice.memo || "No description"}
          </Text>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <Text as="p" size="xs" style={{ color: "#888", marginBottom: "4px" }}>
              Face Value
            </Text>
            <Text as="p" size="md" style={{ fontWeight: "bold" }}>
              {formatCurrency(invoice.face_amount)}
            </Text>
          </div>

          <div>
            <Text as="p" size="xs" style={{ color: "#888", marginBottom: "4px" }}>
              Buy Price
            </Text>
            <Text as="p" size="md" style={{ fontWeight: "bold", color: "#00a86b" }}>
              {formatCurrency(invoice.discount_amount || invoice.face_amount)}
            </Text>
          </div>

          <div>
            <Text as="p" size="xs" style={{ color: "#888", marginBottom: "4px" }}>
              Potential Profit
            </Text>
            <Text as="p" size="md" style={{ fontWeight: "bold", color: "#00a86b" }}>
              +${profit.toFixed(2)}
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

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <Badge variant="secondary">
            {`${((faceAmount - discountAmount) / faceAmount * 100).toFixed(2)}% discount`}
          </Badge>
          <Badge variant="success">Listed</Badge>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => onBuy(invoice.id, invoice.asset)}
          style={{ width: "100%" }}
        >
          Buy Now
        </Button>
      </div>
    </Card>
  );
};

const Marketplace = () => {
  const { address } = useWallet();
  const { useMarketplaceInvoices, buyInvoice } = useInvoices();
  const { data: invoices, isLoading, error, refetch } = useMarketplaceInvoices();
  const [filter, setFilter] = useState<"all" | "high-apr" | "short-term">("all");

  const handleBuy = async (invoiceId: bigint, assetContract: string) => {
    if (!address) {
      alert("Connect your wallet first!");
      return;
    }

    try {
      await buyInvoice.mutateAsync({ invoiceId, assetContract });
    } catch (error) {
      console.error("Buy failed:", error);
    }
  };

  const filteredInvoices = (invoices || []).filter((inv) => {
    if (filter === "high-apr") {
      const faceAmount = stroopsToNumber(inv.face_amount);
      const discountAmount = inv.discount_amount ? stroopsToNumber(inv.discount_amount) : faceAmount;
      const daysLeft = calculateDaysUntilDue(inv.due_timestamp);
      const apr = calculateAPR(faceAmount, discountAmount, daysLeft);
      return apr > 30;
    }
    if (filter === "short-term") {
      const daysLeft = calculateDaysUntilDue(inv.due_timestamp);
      return daysLeft < 40;
    }
    return true;
  });

  console.log("Marketplace render:", { 
    invoicesCount: invoices?.length, 
    isLoading, 
    error,
    invoices 
  });

  return (
    <Layout.Content>
      <Layout.Inset>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <Text as="h1" size="xl">
              Invoice Marketplace
            </Text>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => {
                console.log("🔄 Manual refresh triggered");
                refetch();
              }}
            >
              🔄 Refresh
            </Button>
          </div>
          <Text as="p" size="md" style={{ color: "#666" }}>
            Browse live invoices from Futurenet ({invoices?.length || 0} found)
          </Text>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          <Button
            size="sm"
            variant={filter === "all" ? "primary" : "secondary"}
            onClick={() => setFilter("all")}
          >
            All Invoices
          </Button>
          <Button
            size="sm"
            variant={filter === "high-apr" ? "primary" : "secondary"}
            onClick={() => setFilter("high-apr")}
          >
            High APR (&gt;30%)
          </Button>
          <Button
            size="sm"
            variant={filter === "short-term" ? "primary" : "secondary"}
            onClick={() => setFilter("short-term")}
          >
            Short Term (&lt;40 days)
          </Button>
        </div>

        {isLoading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader />
            <Text as="p" size="md" style={{ marginTop: "16px" }}>
              Loading invoices from Futurenet...
            </Text>
          </div>
        )}

        {error && (
          <Card>
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Text as="p" size="md" style={{ color: "#f00" }}>
                Error loading invoices: {String(error)}
              </Text>
              <Button 
                size="sm" 
                variant="primary" 
                onClick={() => refetch()}
                style={{ marginTop: "16px" }}
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && !error && filteredInvoices.length === 0 && (
          <Card>
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Text as="p" size="md" style={{ color: "#888", marginBottom: "16px" }}>
                No listed invoices found. 
              </Text>
              <Text as="p" size="sm" style={{ color: "#666" }}>
                Total invoices queried: {invoices?.length || 0}<br/>
                Create and list one in the Create page!
              </Text>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => refetch()}
                style={{ marginTop: "16px" }}
              >
                🔄 Refresh Now
              </Button>
            </div>
          </Card>
        )}

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
          gap: "24px" 
        }}>
          {filteredInvoices.map((invoice) => (
            <InvoiceCard 
              key={invoice.id?.toString()} 
              invoice={invoice} 
              onBuy={handleBuy}
            />
          ))}
        </div>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Marketplace;
