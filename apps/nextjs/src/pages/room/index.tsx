import React, { useEffect, useRef } from "react";
import { type NextPage } from "next";
import io, { type Socket } from "socket.io-client";

import {
    type ClientToServerEvents,
    type ServerToClientEvents,
} from "~/utils/socketEvents";

const Home: NextPage = () => {
    const socket = useRef<Socket<
        ServerToClientEvents,
        ClientToServerEvents
    > | null>(null);
    useEffect(() => {
        socketInitializer().catch((e) => {
            console.log(e);
        });
    }, []);

    const socketInitializer = async () => {
        await fetch("/api/socket");
        socket.current = io();

        socket.current.on("connect", () => {
            console.log("connected");
        });
        socket.current.on("disconnect", (reason) => {
            console.log(
                '🪵 file "index.tsx" ~  line "21" ~ token ~ \x1b[0;32mreason\x1b[0m = ',
                reason,
            );
        });
        // A must to handle socket connection error and good logging
        socket.current.on('connect_error', (err) => {
            console.log("🪵 file \"index.tsx\" ~  line \"35\" ~ token ~ \x1b[0;32merr\x1b[0m = ", err);
        })
    };

    return <>route</>;
};

export default Home;
