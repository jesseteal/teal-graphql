import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";

type User = {
  id: string;
  name: string;
  email: string;
  updatedBy?: string | null;
};

let nextId = 4;
const users: User[] = [
  {
    id: "1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    updatedBy: "seed",
  },
  {
    id: "2",
    name: "Grace Hopper",
    email: "grace@example.com",
    updatedBy: "seed",
  },
  {
    id: "3",
    name: "Katherine Johnson",
    email: "katherine@example.com",
    updatedBy: "seed",
  },
];

const readRequestBody = async (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk: Buffer) => {
      body += chunk;
    });
    request.on("end", () => {
      resolve(body);
    });
    request.on("error", reject);
  });

const sendGraphqlResponse = (response: ServerResponse, data: unknown) => {
  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ data }));
};

const readInput = (variables: Record<string, unknown>) =>
  (variables.input ?? {}) as Partial<User>;

const findUser = (id?: string) => users.find((user) => user.id === id);

const graphqlFixturePlugin = (): Plugin => ({
  name: "teal-graphql-fixture",
  configureServer(server) {
    server.middlewares.use("/graphql", async (request, response) => {
      if (request.method !== "POST") {
        response.statusCode = 405;
        response.end();
        return;
      }

      const body = await readRequestBody(request);
      const payload = JSON.parse(body || "{}") as {
        query?: string;
        variables?: Record<string, unknown>;
      };
      const query = payload.query ?? "";
      const variables = payload.variables ?? {};

      if (query.includes("query Users")) {
        sendGraphqlResponse(response, { users });
        return;
      }

      if (query.includes("query UserById")) {
        sendGraphqlResponse(response, {
          user: findUser(variables.id as string) ?? null,
        });
        return;
      }

      if (query.includes("mutation RenameFirstUser")) {
        const firstUser = users[0];
        firstUser.name = (variables.name as string) || firstUser.name;
        sendGraphqlResponse(response, { renameFirstUser: firstUser });
        return;
      }

      if (query.includes("mutation CreateUser")) {
        const input = readInput(variables);
        const user: User = {
          id: String(nextId++),
          name: input.name ?? "New user",
          email: input.email ?? "new@example.com",
          updatedBy: input.updatedBy ?? null,
        };
        users.unshift(user);
        sendGraphqlResponse(response, { createUser: user });
        return;
      }

      if (query.includes("mutation UpdateUser")) {
        const input = readInput(variables);
        const user = findUser(input.id);

        if (user) {
          user.name = input.name ?? user.name;
          user.email = input.email ?? user.email;
          user.updatedBy = input.updatedBy ?? user.updatedBy;
        }

        sendGraphqlResponse(response, { updateUser: user ?? null });
        return;
      }

      if (query.includes("mutation DeleteUser")) {
        const input = readInput(variables);
        const index = users.findIndex((user) => user.id === input.id);
        const [deleted] = index >= 0 ? users.splice(index, 1) : [];

        sendGraphqlResponse(response, { deleteUser: deleted ?? null });
        return;
      }

      response.statusCode = 400;
      response.end(
        JSON.stringify({
          errors: [{ message: "Unhandled example GraphQL operation." }],
        }),
      );
    });
  },
});

export default defineConfig({
  plugins: [react(), graphqlFixturePlugin()],
});
