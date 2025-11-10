import * as Client from 'invoice_registry';

export default new Client.Client({
  networkPassphrase: 'Test SDF Future Network ; October 2022',
  contractId: 'CAUW3SVRZVIO5KHK3JOGMQ57PSYZMPXGZHPEY5HBUFI4CGTANNJWITVO',
  rpcUrl: 'https://rpc-futurenet.stellar.org',
  allowHttp: false,
  publicKey: undefined,
});
