import { Layout, Text, Button, Card } from "@stellar/design-system";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout.Content>
      <Layout.Inset>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Text as="h1" size="xl" style={{ marginBottom: "16px" }}>
            Turn Invoices into Instant Cash
          </Text>
          <Text as="p" size="lg" style={{ color: "#888", marginBottom: "40px" }}>
            Invoice financing powered by Stellar blockchain
          </Text>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "24px",
            maxWidth: "1000px",
            margin: "0 auto 40px"
          }}>
            <Card>
              <div style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
                <Text as="h3" size="md" style={{ marginBottom: "8px" }}>
                  Create Invoice
                </Text>
                <Text as="p" size="sm" style={{ color: "#888" }}>
                  Tokenize your receivables as NFTs on Stellar
                </Text>
              </div>
            </Card>

            <Card>
              <div style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>💰</div>
                <Text as="h3" size="md" style={{ marginBottom: "8px" }}>
                  Get Instant Liquidity
                </Text>
                <Text as="p" size="sm" style={{ color: "#888" }}>
                  Sell at discount, receive cash in seconds
                </Text>
              </div>
            </Card>

            <Card>
              <div style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📈</div>
                <Text as="h3" size="md" style={{ marginBottom: "8px" }}>
                  Investors Earn
                </Text>
                <Text as="p" size="sm" style={{ color: "#888" }}>
                  Buy invoices, earn when debtors repay
                </Text>
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Button 
              size="md" 
              variant="primary"
              onClick={() => navigate("/issuer")}
            >
              Create Invoice
            </Button>
            <Button 
              size="md" 
              variant="secondary"
              onClick={() => navigate("/marketplace")}
            >
              Browse Marketplace
            </Button>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #333", paddingTop: "40px", marginTop: "60px" }}>
          <Text as="h2" size="lg" style={{ marginBottom: "16px" }}>
            How It Works
          </Text>
          
          <div style={{ display: "grid", gap: "16px" }}>
            <Card>
              <div style={{ padding: "20px" }}>
                <Text as="p" size="md">
                  <strong>1. Businesses</strong> create invoices and list them at a discount (e.g., sell $1,000 invoice for $975)
                </Text>
              </div>
            </Card>
            
            <Card>
              <div style={{ padding: "20px" }}>
                <Text as="p" size="md">
                  <strong>2. Investors</strong> browse marketplace and buy invoices, getting instant ownership via NFT
                </Text>
              </div>
            </Card>
            
            <Card>
              <div style={{ padding: "20px" }}>
                <Text as="p" size="md">
                  <strong>3. Debtors</strong> repay full amount when due, and funds automatically go to NFT holder
                </Text>
              </div>
            </Card>
          </div>
        </div>

        <div style={{ marginTop: "60px", padding: "40px", background: "#1a1a1a", borderRadius: "12px", textAlign: "center" }}>
          <Text as="h2" size="lg" style={{ marginBottom: "16px" }}>
            Built with Scaffold Stellar
          </Text>
          <Text as="p" size="md" style={{ color: "#888", marginBottom: "24px" }}>
            This dApp demonstrates Soroban smart contracts, TypeScript client generation,
            and Stellar Wallet Kit integration
          </Text>
          <Button 
            size="md" 
            variant="tertiary"
            onClick={() => navigate("/debug")}
          >
            Open Contract Debugger
          </Button>
        </div>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Home;
