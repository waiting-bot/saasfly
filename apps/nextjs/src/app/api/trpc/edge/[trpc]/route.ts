import type {NextRequest} from "next/server";
import {fetchRequestHandler} from "@trpc/server/adapters/fetch";

import {createTRPCContext} from "@saasfly/api";
import {edgeRouter} from "@saasfly/api/edge";
import { auth } from "@saasfly/auth/next-auth.config"

// export const runtime = "edge";
const createContext = async (req: NextRequest) => {
    try {
        const session = await auth()
        return createTRPCContext({
            headers: req.headers,
            auth: session?.user,
        });
    } catch (error) {
        console.log("Auth error, using empty context:", error instanceof Error ? error.message : String(error))
        return createTRPCContext({
            headers: req.headers,
            auth: null,
        });
    }
};

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: "/api/trpc/edge",
        router: edgeRouter,
        req: req,
        createContext: () => createContext(req),
        onError: ({error, path}) => {
            console.log("Error in tRPC handler (edge) on path", path);
            console.error(error);
        },
    });

export {handler as GET, handler as POST};
