import { useState } from "react";
import { Layout, Text, Input, Button, Card } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { useInvoices } from "../hooks/useInvoices";
import { useNotification } from "../hooks/useNotification";
import { numberToStroops, calculateDiscountAmount } from "../utils/roi-calculator";

// XLM Native Asset Contract on Futurenet
const XLM_ASSET_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

const IssuerDashboard = () => {
  const { address } = useWallet();
  const { createInvoice, listInvoice } = useInvoices();
  const { addNotification } = useNotification();

  const [faceAmount, setFaceAmount] = useState("");
  const [daysUntilDue, setDaysUntilDue] = useState("30");
  const [targetAPR, setTargetAPR] = useState("35");
  const [memo, setMemo] = useState("");
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const suggestedDiscount = faceAmount && daysUntilDue && targetAPR
    ? calculateDiscountAmount(Number(faceAmount), Number(targetAPR), Number(daysUntilDue))
    : 0;

  const handleCreate = async () => {
    if (!address) {
      addNotification("Connect your wallet first", "error");
      return;
    }

    try {
      const dueTimestamp = BigInt(Math.floor(Date.now() / 1000) + Number(daysUntilDue) * 86400);
      
      const result = await createInvoice.mutateAsync({
        faceAmount: numberToStroops(Number(faceAmount)),
        asset: XLM_ASSET_CONTRACT, // Use XLM asset contract
        dueTimestamp,
        memo: memo || `Invoice for $${faceAmount}`,
      });

      // Extract invoice ID from SentTransaction -> assembled.result.value
      let invoiceId: string;
      
      if (result && typeof result === 'object') {
        const assembled = (result as any).assembled;
        if (assembled && assembled.result) {
          const okResult = assembled.result;
          if (okResult && typeof okResult === 'object' && 'value' in okResult) {
            invoiceId = String(okResult.value);
          } else {
            invoiceId = String(okResult);
          }
        } else {
          throw new Error("Could not find result in transaction");
        }
      } else {
        throw new Error("Invalid result structure");
      }
      
      console.log("Extracted invoice ID:", invoiceId);
      setLastCreatedId(invoiceId);
      addNotification(`Invoice #${invoiceId} created! Now list it for sale.`, "success");
    } catch (error) {
      console.error("Create error:", error);
      addNotification(
        error instanceof Error ? error.message : "Failed to create invoice",
        "error"
      );
    }
  };

  const handleList = async () => {
    if (!address) {
      addNotification("Connect your wallet first", "error");
      return;
    }

    if (!lastCreatedId) {
      addNotification("Create an invoice first", "error");
      return;
    }

    if (!suggestedDiscount) {
      addNotification("Enter face amount and APR first", "error");
      return;
    }

    try {
      await listInvoice.mutateAsync({
        invoiceId: BigInt(lastCreatedId),
        discountAmount: numberToStroops(suggestedDiscount),
      });

      // Reset form after listing
      setFaceAmount("");
      setMemo("");
      setLastCreatedId(null);
    } catch (error) {
      console.error("List error:", error);
      addNotification(
        error instanceof Error ? error.message : "Failed to list invoice",
        "error"
      );
    }
  };

  return (
    <Layout.Content>
      <Layout.Inset>
        <Text as="h1" size="xl" style={{ marginBottom: "24px" }}>
          Create & List Invoice
        </Text>

        <Card>
          <div style={{ padding: "24px" }}>
            <div style={{ display: "grid", gap: "16px", maxWidth: "500px" }}>
              <Input
                id="face-amount"
                fieldSize="md"
                label="Face Amount (USD)"
                type="number"
                value={faceAmount}
                onChange={(e) => setFaceAmount(e.target.value)}
                placeholder="1000"
              />

              <Input
                id="days-due"
                fieldSize="md"
                label="Days Until Due"
                type="number"
                value={daysUntilDue}
                onChange={(e) => setDaysUntilDue(e.target.value)}
                placeholder="30"
              />

              <Input
                id="target-apr"
                fieldSize="md"
                label="Target APR (%)"
                type="number"
                value={targetAPR}
                onChange={(e) => setTargetAPR(e.target.value)}
                placeholder="35"
              />

              <Input
                id="memo"
                fieldSize="md"
                label="Description"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Web design services for Acme Corp"
              />

              {suggestedDiscount > 0 && (
                <Card>
                  <div style={{ padding: "16px", background: "#f8f9fa" }}>
                    <Text as="p" size="sm" style={{ marginBottom: "8px" }}>
                      Suggested Listing Price:
                    </Text>
                    <Text as="p" size="lg" style={{ fontWeight: "bold", color: "#00a86b" }}>
                      ${suggestedDiscount.toFixed(2)}
                    </Text>
                    <Text as="p" size="sm" style={{ color: "#666", marginTop: "4px" }}>
                      Discount: {((Number(faceAmount) - suggestedDiscount) / Number(faceAmount) * 100).toFixed(2)}%
                    </Text>
                    <Text as="p" size="sm" style={{ color: "#666", marginTop: "4px" }}>
                      APR: {targetAPR}%
                    </Text>
                  </div>
                </Card>
              )}

              {lastCreatedId && (
                <Card>
                  <div style={{ padding: "16px", background: "#e3f2fd" }}>
                    <Text as="p" size="sm" style={{ fontWeight: "bold", marginBottom: "4px" }}>
                      ✅ Invoice #{lastCreatedId} created!
                    </Text>
                    <Text as="p" size="xs" style={{ color: "#666" }}>
                      Click "List for Sale" to make it available in the marketplace
                    </Text>
                  </div>
                </Card>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleCreate}
                  disabled={!faceAmount || !daysUntilDue || createInvoice.isPending || !!lastCreatedId}
                >
                  {createInvoice.isPending ? "Creating..." : "1. Create Invoice"}
                </Button>

                <Button
                  size="md"
                  variant="secondary"
                  onClick={handleList}
                  disabled={!lastCreatedId || listInvoice.isPending}
                >
                  {listInvoice.isPending ? "Listing..." : "2. List for Sale"}
                </Button>
              </div>

              <Text as="p" size="xs" style={{ color: "#666", fontStyle: "italic" }}>
                💡 Workflow: Create invoice → List it with your target APR → Buyers see it in Marketplace
              </Text>
              
              <Text as="p" size="xs" style={{ color: "#888", fontStyle: "italic", marginTop: "8px" }}>
                💳 Asset: XLM (Native Token)
              </Text>
            </div>
          </div>
        </Card>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default IssuerDashboard;
