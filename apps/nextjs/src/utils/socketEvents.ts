export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface UserSocket {
    name?: string; //* convert to required might be usefull later
    roomName: string;
}

// extends them later
export type SocketData = UserSocket;

export type MasterSocketData = UserSocket;
