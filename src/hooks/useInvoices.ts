import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import invoiceClient from "../contracts/invoice_registry";
import { useWallet } from "./useWallet";
import { useNotification } from "./useNotification";
import { InvoiceData, InvoiceStatus } from "../types/invoice";

export const useInvoices = () => {
  const { address, signTransaction } = useWallet();
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  // Fetch single invoice
  const useInvoice = (invoiceId: bigint) => {
    return useQuery({
      queryKey: ["invoice", invoiceId.toString()],
      queryFn: async () => {
        try {
          const tx = await invoiceClient.get_invoice({ invoice_id: invoiceId });
          const result = tx.result;
          
          if (result && typeof result === 'object' && 'value' in result) {
            return (result as any).value as InvoiceData;
          }
          return result as InvoiceData;
        } catch (error) {
          console.error(`Invoice ${invoiceId} not found:`, error);
          return null;
        }
      },
      enabled: !!invoiceId,
      retry: false,
    });
  };

  // Fetch marketplace invoices (only ListedFixed status)
  const useMarketplaceInvoices = () => {
    return useQuery({
      queryKey: ["marketplace-invoices"],
      queryFn: async () => {
        console.log("🔍 Fetching marketplace invoices...");
        const invoices: (InvoiceData & { id: bigint })[] = [];
        let consecutiveMisses = 0;
        const MAX_CONSECUTIVE_MISSES = 3;
        const MAX_ID_TO_CHECK = 100;
        
        for (let i = 1; i <= MAX_ID_TO_CHECK; i++) {
          try {
            const tx = await invoiceClient.get_invoice({ invoice_id: BigInt(i) });
            const result = tx.result;
            
            let invoice: InvoiceData | null = null;
            
            if (result && typeof result === 'object') {
              if ('error' in result) {
                consecutiveMisses++;
                if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;
                continue;
              }
              
              if ('value' in result) {
                invoice = (result as any).value;
              } else {
                invoice = result as InvoiceData;
              }
            }
            
            if (!invoice) {
              consecutiveMisses++;
              if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;
              continue;
            }
            
            consecutiveMisses = 0;
            
            if (invoice.status === InvoiceStatus.ListedFixed) {
              invoices.push({ ...invoice, id: BigInt(i) });
            }
          } catch (error) {
            consecutiveMisses++;
            if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;
          }
        }
        
        console.log(`📊 Found ${invoices.length} listed invoices`);
        return invoices;
      },
      refetchInterval: 30000,
    });
  };

  // Fetch ALL invoices (for portfolio - includes Sold, Settled, etc.)
  const useAllInvoices = () => {
    return useQuery({
      queryKey: ["all-invoices"],
      queryFn: async () => {
        console.log("🔍 Fetching all invoices...");
        const invoices: (InvoiceData & { id: bigint })[] = [];
        let consecutiveMisses = 0;
        const MAX_CONSECUTIVE_MISSES = 3;
        const MAX_ID_TO_CHECK = 100;
        
        for (let i = 1; i <= MAX_ID_TO_CHECK; i++) {
          try {
            const tx = await invoiceClient.get_invoice({ invoice_id: BigInt(i) });
            const result = tx.result;
            
            let invoice: InvoiceData | null = null;
            
            if (result && typeof result === 'object') {
              if ('error' in result) {
                consecutiveMisses++;
                if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;
                continue;
              }
              
              if ('value' in result) {
                invoice = (result as any).value;
              } else {
                invoice = result as InvoiceData;
              }
            }
            
            if (!invoice) {
              consecutiveMisses++;
              if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;
              continue;
            }
            
            consecutiveMisses = 0;
            invoices.push({ ...invoice, id: BigInt(i) });
          } catch (error) {
            consecutiveMisses++;
            if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;
          }
        }
        
        console.log(`📊 Found ${invoices.length} total invoices`);
        return invoices;
      },
      refetchInterval: 30000,
    });
  };

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (params: {
      faceAmount: bigint;
      asset: string;
      dueTimestamp: bigint;
      memo: string;
    }) => {
      if (!address || !signTransaction) throw new Error("Wallet not connected");
      
      const tx = await invoiceClient.create_invoice(
        {
          issuer: address,
          face_amount: params.faceAmount,
          asset: params.asset,
          due_timestamp: params.dueTimestamp,
          memo: params.memo,
        },
        {
          publicKey: address,
        }
      );

      const result = await tx.signAndSend({ signTransaction });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["marketplace-invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["all-invoices"] });
    },
    onError: (error) => {
      console.error("Create invoice error:", error);
      addNotification(
        error instanceof Error ? error.message : "Failed to create invoice",
        "error"
      );
    },
  });

  // List invoice mutation
  const listInvoice = useMutation({
    mutationFn: async (params: {
      invoiceId: bigint;
      discountAmount: bigint;
    }) => {
      if (!address || !signTransaction) throw new Error("Wallet not connected");

      const tx = await invoiceClient.list_fixed(
        {
          invoice_id: params.invoiceId,
          discount_amount: params.discountAmount,
        },
        {
          publicKey: address,
        }
      );

      return await tx.signAndSend({ signTransaction });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["marketplace-invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["all-invoices"] });
      addNotification("Invoice listed successfully! Check the Marketplace.", "success");
    },
    onError: (error) => {
      console.error("List invoice error:", error);
      addNotification(
        error instanceof Error ? error.message : "Failed to list invoice",
        "error"
      );
    },
  });

  // Buy invoice mutation
  const buyInvoice = useMutation({
    mutationFn: async (params: { invoiceId: bigint; assetContract: string }) => {
      if (!address || !signTransaction) throw new Error("Wallet not connected");
      
      
      try {
        console.log("Initializing token access for buyer...");
      } catch (error) {
        console.warn("Token initialization skipped:", error);
      }
      
      
      const tx = await invoiceClient.buy_now(
        {
          buyer: address,
          invoice_id: params.invoiceId,
        },
        {
          publicKey: address,
        }
      );

      return await tx.signAndSend({ signTransaction });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["marketplace-invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["all-invoices"] });
      addNotification("Invoice purchased successfully!", "success");
    },
    onError: (error) => {
      console.error("Buy invoice error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to purchase invoice";
      
      if (errorMsg.includes("MissingValue") || errorMsg.includes("trustline")) {
        addNotification(
          "Please fund your account with XLM first.",
          "error"
        );
      } else {
        addNotification(errorMsg, "error");
      }
    },
  });

  // Repay invoice mutation
  const repayInvoice = useMutation({
    mutationFn: async (invoiceId: bigint) => {
      if (!address || !signTransaction) throw new Error("Wallet not connected");
      
      const tx = await invoiceClient.repay(
        {
          payer: address,
          invoice_id: invoiceId,
        },
        {
          publicKey: address,
        }
      );

      return await tx.signAndSend({ signTransaction });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["marketplace-invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["all-invoices"] });
      addNotification("Invoice repaid successfully!", "success");
    },
    onError: (error) => {
      console.error("Repay invoice error:", error);
      addNotification(
        error instanceof Error ? error.message : "Failed to repay invoice",
        "error"
      );
    },
  });

  return {
    useInvoice,
    useMarketplaceInvoices,
    useAllInvoices,
    createInvoice,
    listInvoice,
    buyInvoice,
    repayInvoice,
  };
};
