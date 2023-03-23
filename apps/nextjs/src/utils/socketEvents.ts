export interface SharedServerToClientEvents {
    roomInfo: (id: string) => void;
    userJoined: (id: string) => void;
    userLeft: (id: string) => void;
}

export interface ServerToClientEvents  extends SharedServerToClientEvents {
    masterLeft: () => void; // only for acknowolodgment
    roomJoined: (id: string) => void;
}

export interface MasterServerToClientEvents extends SharedServerToClientEvents {
    roomCreated: (id: string) => void;
}

export interface SharedClientToServerEvents {
    hello: () => void;
}
export interface ClientToServerEvents extends SharedClientToServerEvents {
    joinRoom: (id: string) => void;
}

export interface MasterClientToServerEvents extends SharedClientToServerEvents {
    createRoom: (id: string) => void;
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
