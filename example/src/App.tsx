import { useState } from "react";
import {
  runGraphqlQuery,
  useCacheEvictor,
  useClient,
  useCrudActions,
  useGraphqlMutation,
  useGraphqlQuery,
  useLazyGraphqlQuery,
} from "@jesseteal/teal-graphql";
import {
  helperSnapshot,
  renameFirstUserMutation,
  userByIdQuery,
  usersQuery,
} from "./shared.js";
import type {
  User,
  UserByIdData,
  UserByIdVariables,
  UsersData,
} from "./shared.js";

type RenameFirstUserData = {
  renameFirstUser: User;
};

type RenameFirstUserVariables = {
  name: string;
};

type UserInput = {
  id?: string;
  name?: string;
  email?: string;
};

export const App = () => {
  const [selectedId, setSelectedId] = useState("1");
  const [name, setName] = useState("New Teal User");
  const [directQueryStatus, setDirectQueryStatus] = useState("Not run yet");
  const client = useClient();
  const evict = useCacheEvictor();
  const users = useGraphqlQuery<UsersData>(usersQuery);
  const [loadUser, lazyUser] = useLazyGraphqlQuery<
    UserByIdData,
    UserByIdVariables
  >(userByIdQuery);
  const [renameFirstUser, renameResult] = useGraphqlMutation<
    RenameFirstUserData,
    RenameFirstUserVariables
  >(renameFirstUserMutation);
  const { save, remove } = useCrudActions<UserInput, unknown>({
    resource: "User",
    evict: ["users", "user"],
  });

  const createUser = async () => {
    await save(
      {
        input: {
          email: "",
          name,
        },
      },
      { mode: "create" },
    );
    await users.refetch();
  };

  const updateFirstUser = async () => {
    const firstUser = users.data?.users[0];

    if (!firstUser) {
      return;
    }

    await save({
      input: {
        id: firstUser.id,
        name: `${firstUser.name}*`,
      },
    });
    await users.refetch();
  };

  const deleteLastUser = async () => {
    const userList = users.data?.users ?? [];
    const lastUser = userList[userList.length - 1];

    if (!lastUser) {
      return;
    }

    await remove({ input: { id: lastUser.id } });
    await users.refetch();
  };

  const runDirectQuery = async () => {
    const result = await runGraphqlQuery(client, usersQuery, {
      fetchPolicy: "network-only",
    });
    setDirectQueryStatus(`Loaded ${result.data.users.length} users directly.`);
  };

  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">Local example project</p>
        <h1>Teal GraphQL Feature Showcase</h1>
      </header>

      <section className="toolbar" aria-label="Actions">
        <input
          aria-label="New user name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="button" onClick={createUser}>
          Create via CRUD
        </button>
        <button type="button" onClick={updateFirstUser}>
          Update via CRUD
        </button>
        <button type="button" onClick={deleteLastUser}>
          Delete via CRUD
        </button>
        <button
          type="button"
          onClick={() =>
            renameFirstUser({
              variables: {
                name: "Renamed by useGraphqlMutation",
              },
            }).then(() => users.refetch())
          }
        >
          Rename via Mutation
        </button>
        <button
          type="button"
          onClick={() => {
            evict(["users", "user"]);
            users.refetch();
          }}
        >
          Evict Cache
        </button>
        <button type="button" onClick={runDirectQuery}>
          Direct Client Query
        </button>
      </section>

      <section className="content-grid">
        <article>
          <h2>useGraphqlQuery</h2>
          {users.loading ? <p>Loading users...</p> : null}
          {users.error ? <p className="error">{users.error.message}</p> : null}
          <ul className="user-list">
            {users.data?.users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(user.id);
                    loadUser({ variables: { id: user.id } });
                  }}
                >
                  <strong>{user.name}</strong>
                  <span>{user.email || "email normalized to null"}</span>
                  <small>updatedBy: {user.updatedBy ?? "none"}</small>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <h2>Lazy Query and Utilities</h2>
          <button
            type="button"
            onClick={() => loadUser({ variables: { id: selectedId } })}
          >
            Load selected user
          </button>
          <pre>
            {JSON.stringify(
              {
                directQueryStatus,
                helperSnapshot,
                lazyUser: lazyUser.data?.user ?? null,
                renameLoading: renameResult.loading,
              },
              null,
              2,
            )}
          </pre>
        </article>
      </section>
    </main>
  );
};
