// Player-side PeerJS layer
// Connects to the host's peer (ID: "ut-{gameCode}") and relays game events.

import Peer from "peerjs";

export class PlayerPeer {
  constructor(callbacks) {
    // callbacks mirror socket event handlers in App.jsx:
    // onJoinAck, onPlayerJoined, onPlayerLeft, onStartQuestion,
    // onTick, onShowResults, onUpdateLeaderboard, onFinished, onHostLeft
    this.callbacks = callbacks;
    this.peer = null;
    this.conn = null;
  }

  join(gameCode, preferredName = "") {
    return new Promise((resolve, reject) => {
      const peer = new Peer();
      this.peer = peer;

      peer.on("open", () => {
        const conn = peer.connect(`ut-${gameCode}`, {
          metadata: { name: preferredName.trim().slice(0, 30) },
        });
        this.conn = conn;

        const timeout = setTimeout(() => {
          reject(new Error("Could not connect to game. Check the code and try again."));
          peer.destroy();
        }, 8000);

        conn.on("open", () => {
          clearTimeout(timeout);
          resolve();
        });

        conn.on("data", (msg) => this._handleMessage(msg));

        conn.on("close", () => this.callbacks.onHostLeft());
        conn.on("error", () => this.callbacks.onHostLeft());
      });

      peer.on("error", (err) => {
        reject(err);
      });
    });
  }

  _handleMessage(msg) {
    switch (msg.type) {
      case "player:joinAck":
        this.callbacks.onJoinAck(msg);
        break;
      case "game:playerJoined":
        this.callbacks.onPlayerJoined(msg);
        break;
      case "game:playerLeft":
        this.callbacks.onPlayerLeft(msg);
        break;
      case "game:startQuestion":
        this.callbacks.onStartQuestion(msg);
        break;
      case "game:tick":
        this.callbacks.onTick(msg);
        break;
      case "game:showResults":
        this.callbacks.onShowResults(msg);
        break;
      case "game:updateLeaderboard":
        this.callbacks.onUpdateLeaderboard(msg);
        break;
      case "game:finished":
        this.callbacks.onFinished(msg);
        break;
      case "game:hostLeft":
        this.callbacks.onHostLeft();
        break;
      default:
        break;
    }
  }

  submitAnswer(answerIndex) {
    if (this.conn?.open) {
      this.conn.send({ type: "player:submitAnswer", answerIndex });
    }
  }

  destroy() {
    this.conn?.close();
    this.peer?.destroy();
    this.conn = null;
    this.peer = null;
  }
}
