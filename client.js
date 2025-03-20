function* uniqueNumberGenerator() {
  let i = 0;

  while (true) {
    yield i;
    i += 1;
  }
}

const idGenerator = uniqueNumberGenerator();

const uniqueId = () => idGenerator.next();

class Client {
  #decoder;
  #encoder;
  #connection;

  constructor(clientName = uniqueId(), port = 8000) {
    this.#encoder = new TextEncoder();
    this.#decoder = new TextDecoder();
    this.#connect(clientName, port);
  }

  async #connect(clientName, port) {
    try {
      this.#connection = await Deno.connect({ port });
      console.log("✅ Connected to server!");
      this.#registerName(clientName);
      this.#startCommunicating();
    } catch {
      console.log("🐞 Failed to Connect...");
    }
  }

  async #registerName(clientName) {
    await this.#connection.write(this.#encoder.encode(clientName));
  }

  async #startCommunicating() {
    while (true) {
      const clientMsg = prompt("📤 Enter Messsage: ");
      await this.#connection.write(this.#encoder.encode(clientMsg));
      const serverData = new Uint8Array(100);
      const msgSize = await this.#connection.read(serverData);
      const serverMsg = this.#decoder.decode(serverData.slice(0, msgSize));
      const { clientName, message } = JSON.parse(serverMsg);

      console.log(`📥 From ${clientName} : ${message}`);
    }
  }

  #display(message) {
    console.log(message);
  }
}

new Client(Deno.args);
