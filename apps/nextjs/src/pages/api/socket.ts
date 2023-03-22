// serves as endpoint to make sure there's only one webSocket instance
import { type NextApiHandler } from "next";
import { Server } from "socket.io";

import {
    type ClientToServerEvents,
    type InterServerEvents,
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
            socket.use((e, next) => {
                return next(
                    new Error(
                        "error from socket middleware who catch this guess only the server",
                    ),
                );
                next();
            });
            console.log(`socket ${socket.id} connected`);
            console.log(
                `number of connected sockets ${io.of("/").sockets.size}`,
            );
            socket.on("hello", () => {
                console.log(`user ${socket.id} say hi`);
                console.log(`disconnect user ${socket.id}`);
                socket.disconnect(true);
            });
            socket.on("disconnect", (reason) => {
                console.log(`user ${socket.id} disconnected because ${reason}`);
            });

            socket.on("error", (err) => {
                console.log(
                    '🪵 file "socket.ts" ~  line "42" ~ token ~ \x1b[0;32merr\x1b[0m = ',
                    err.message,
                );
            });
        });
    }
    res.end();
};

export default handler;
