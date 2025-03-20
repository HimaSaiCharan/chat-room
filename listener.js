class Listener {
  #listener;
  #decoder;
  #connections = {};

  constructor(port = 8000) {
    this.#listener = Deno.listen({ port });
    this.#decoder = new TextDecoder();
  }

  async #handleConnection(connection) {
    console.log("🔄 Handling connection...");

    try {
      for await (const data of connection.readable) {
        console.log("📥 Received:", new TextDecoder().decode(data));

        await connection.write(data);
      }
    } catch {
      console.error("❌ Error handling connection ...");
    } finally {
      console.log("❌ Connection Closed ...");
      connection.close();
    }
  }

  #acknowledge() {}

  async #registerConnection(connection) {
    const clientData = new Uint8Array(100);
    const msgSize = await connection.read(clientData);
    const clientName = this.#decoder.decode(clientData.slice(0, msgSize));

    this.#connections[clientName] = connection;
  }

  async startListening() {
    console.log("🚀 Server is listening for connections...");

    for await (const connection of this.#listener) {
      console.log("🚀 New connection received!");

      this.#registerConnection(connection);
      this.#acknowledge(connection);

      this.#handleConnection(connection);
    }
  }
}

const listener = new Listener(8000);
listener.startListening();
