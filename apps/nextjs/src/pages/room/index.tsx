import React, { useEffect, useRef, useState } from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import io, { type Socket } from "socket.io-client";

import {
    type ClientToServerEvents,
    type MasterClientToServerEvents,
    type MasterServerToClientEvents,
    type ServerToClientEvents,
    type SharedClientToServerEvents,
    type SharedServerToClientEvents,
} from "~/utils/socketEvents";

const Home: NextPage = () => {
    const router = useRouter();
    const [users, setUsers] = useState<string[]>([]);
    const [room, setRoom] = useState<string>("");
    const [roomJoined, setRoomJoined] = useState<string>("");
    const [msg, setMsg] = useState<string>("");
    const [myId, setMyId] = useState<string>("");
    const socket = useRef<Socket<
        ServerToClientEvents,
        ClientToServerEvents
    > | null>(null);
    // sorry but i'm not in the mood to deal with ts
    const socketMaster = useRef<Socket<
        MasterServerToClientEvents,
        MasterClientToServerEvents
    > | null>(null);
    // useEffect(() => {
    //     socketInitializer().catch((e) => {
    //         console.log(e);
    //     });
    // }, []);

    const joinPlayer = async () => {
        await fetch("/api/socket");
        // normal play in main namespace FORNOW?
        socket.current = io();

        socket.current.on("connect", () => {
            console.log("connected");
            socket.current && setMyId(socket.current.id);
            socket.current && setMsg("connected as player");
        });
        //! this bad code delete me daddy
        // i'm just not in the mode to create middlewares to create rooms and all that shit so just events to proof the concept
        // what we need here to join the rooms and all that in connection not after
        socket.current.emit("joinRoom", room);

        socket.current.on("disconnect", (reason) => {
            console.warn(
                '🪵 file "index.tsx" ~  line "21" ~ token ~ \x1b[0;32mreason\x1b[0m = ',
                reason,
            );
        });
        // A must to handle socket connection error and good logging
        socket.current.on("connect_error", (err) => {
            console.error(
                '🪵 file "index.tsx" ~  line "35" ~ token ~ \x1b[0;32merr\x1b[0m = ',
                err,
            );
        });
        socket.current.on("masterLeft", async () => {
            console.warn("my master left so i can go home now");
            await router.push("/");
        });
        addSocketListen(socket.current);
    };

    const joinMaster = async () => {
        await fetch("/api/socket");
        // master join in master namespace
        socketMaster.current = io("/master");

        socketMaster.current.on("connect", () => {
            console.log("connected");
            socketMaster.current && setMyId(socketMaster.current.id);
            socketMaster.current && setMsg("connected as Master");
        });
        //! this bad code delete me daddy
        // i'm just not in the mode to create middlewares to create rooms and all that shit so just events to proof the concept
        // what we need here to join the rooms and all that in connection not after
        socketMaster.current.emit("createRoom", room);

        socketMaster.current.on("disconnect", (reason) => {
            console.warn(
                "🪵 [index.tsx:87] ~ token ~ \x1b[0;32mreason\x1b[0m = ",
                reason,
            );
        });
        // A must to handle socket connection error and good logging
        socketMaster.current.on("connect_error", (err) => {
            console.error(
                '🪵 file "index.tsx" ~  line "35" ~ token ~ \x1b[0;32merr\x1b[0m = ',
                err,
            );
        });
        addSocketListen(socketMaster.current);
    };

    const addSocketListen = (
        socket: Socket<SharedServerToClientEvents, SharedClientToServerEvents>,
    ) => {
        socket.on("roomInfo", (id) => {
            setRoomJoined(id);
            setMsg(`new room info are in`);
        });

        socket.on("userJoined", (id) => {
            setUsers((prev) => {
                prev.push(id);
                return prev;
            });
            setMsg(`nwe user ${id} joined`);
        });

        socket.on("userLeft", (id) => {
            setUsers((prev) => {
                const index = prev.findIndex((val) => val === id);
                if (index !== -1) {
                    prev.splice(index, 1);
                }
                return prev;
            });
            setMsg(`user ${id} left`);
        });
    };

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
        socket.current.on("connect_error", (err) => {
            console.log(
                '🪵 file "index.tsx" ~  line "35" ~ token ~ \x1b[0;32merr\x1b[0m = ',
                err,
            );
        });
    };

    return (
        <>
            <p className="block">
                Who Am I <span>{myId}</span>
            </p>
            <p>{roomJoined}</p>
            message from the server: <p>{msg}</p>
            <div className="m-3">
                <input
                    type="text"
                    className="m-3 border border-solid"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
                <button
                    className="border bg-slate-700 p-2"
                    // disabled={!!!socket.current}
                    onClick={() => {
                        joinPlayer().catch((err) => {
                            console.error(err);
                        });
                    }}
                >
                    join room
                </button>
            </div>
            <div className="m-3">
                <input
                    className="m-3 border border-solid"
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
                <button
                    className="border bg-slate-700 p-2"
                    // disabled={!!!socket.current}
                    onClick={() => {
                        joinMaster().catch((err) => {
                            console.error(err);
                        });
                    }}
                >
                    create Room
                </button>
            </div>
            users list
            {users.map((val, index) => (
                <p key={index}>{val}</p>
            ))}
        </>
    );
};

export default Home;
