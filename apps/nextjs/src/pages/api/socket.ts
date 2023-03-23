// serves as endpoint to make sure there's only one webSocket instance
import { type NextApiHandler } from "next";
import { Server, type Namespace } from "socket.io";

import {
    type ClientToServerEvents,
    type InterServerEvents,
    type MasterClientToServerEvents,
    type MasterServerToClientEvents,
    type MasterSocketData,
    type ServerToClientEvents,
    type SocketData,
} from "~/utils/socketEvents";

const handler: NextApiHandler = (req, res) => {
    // res.socket.server.io doesn't exist by default which indicate there's no instance
    // @ts-ignore
    if (res.socket && res.socket.server.io) {
        console.log("there is socket");
    } else {
        console.log("init socket instance");
        const io = new Server<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
            // @ts-ignore
        >(res.socket.server);
        const masterIO: Namespace<
            MasterClientToServerEvents,
            MasterServerToClientEvents,
            InterServerEvents,
            MasterSocketData
        > = io.of("/master");
        // @ts-ignore
        res.socket.server.io = io;
        // io.use((socket, next) => {
        //     next(
        //         new Error(
        //             "error from middle ware will the client get this error or what",
        //         ),
        //     );
        // });
        io.on("connection", (socket) => {
            console.log(`socket ${socket.id} connected`);
            console.log(
                `number of connected sockets ${io.of("/").sockets.size}`,
            );
            socket.on("joinRoom", async (id) => {
                await socket.join(id);
                socket.data.roomName = id;
                socket.emit("roomJoined", id);
                socket.emit("roomInfo", id);
                io.in(id).emit("userJoined", socket.id);
                io.of('master').in(id).emit("userJoined", socket.id);
            });
            socket.on("disconnect", (reason) => {
                console.log(`user ${socket.id} disconnected because ${reason}`);
                io.to(socket.data.roomName || '').emit("userLeft", socket.id);
                io.of('/master').to(socket.data.roomName || '').emit("userLeft", socket.id);
            });

            socket.on("error", (err) => {
                console.log(
                    "🪵 [socket.ts:53] ~ token ~ \x1b[0;32merr.message\x1b[0m = ",
                    err.message,
                );
            });
        });

        masterIO.on("connection", (socket) => {
            console.log(`NEW MASTER JOINED ${socket.id}`);
            socket.on("createRoom", async (id) => {
                await socket.join(id);
                socket.data.roomName = id;
                console.log(`master ${socket.id} created new room ${id}`);
                socket.emit('roomCreated', id);
                socket.emit('roomInfo', id);
            });
            socket.on('disconnecting', () => {
                io.of('/').to(socket.data.roomName || '').emit('masterLeft');
                io.of('/').in(socket.data.roomName || '').disconnectSockets(true);
            })
            socket.on("disconnect", (reason) => {
                console.log(`master ${socket.id} left their room MUST be deleted now`)
                console.log(`user ${socket.id} disconnected because ${reason}`);
            });

            socket.on("error", (err) => {
                console.log(
                    "🪵 [socket.ts:53] ~ token ~ \x1b[0;32merr.message\x1b[0m = ",
                    err.message,
                );
            });
        });
    }
    res.end();
};

export default handler;
