import { useMemo } from "react";
import { useApolloClient, useMutation as useApolloMutation } from "./apollo.js";
import type { MutationFunctionOptions, MutationResult } from "./apollo.js";
import { evictCacheFields } from "./cache.js";
import { useGraphqlConfig } from "./config.js";
import { createCrudDocuments, createGraphqlDocument } from "./documents.js";
import { sanitizeMutationInput } from "./input.js";
import type {
  CrudResourceConfig,
  GraphqlMutationOptions,
  GraphqlSchema,
  GraphqlVariables,
  MutationInput,
  RemovePayload,
  SaveOptions,
  SavePayload,
} from "./types.js";

/**
 * Wraps Apollo's mutation hook with memoized document creation.
 *
 * usage: `const [mutate] = useGraphqlMutation<Result, Vars>(source)`.
 */
export const useGraphqlMutation = <
  TData = unknown,
  TVariables extends GraphqlVariables = GraphqlVariables,
>(
  source: string,
  options: GraphqlMutationOptions<TVariables> = {},
): [
  (options?: MutationFunctionOptions<TData, TVariables>) => Promise<unknown>,
  MutationResult<TData>,
] => {
  const document = useMemo(() => createGraphqlDocument(source), [source]);
  const [mutate, result] = useApolloMutation(document, {
    variables: options.variables,
  });

  return [
    mutate as (
      options?: MutationFunctionOptions<TData, TVariables>,
    ) => Promise<unknown>,
    result as MutationResult<TData>,
  ];
};

const emptySchema: GraphqlSchema = {};

/**
 * Creates typed save and remove commands for a GraphQL CRUD resource.
 *
 * usage: `const { save, remove } = useCrudActions({ resource: "User" })`.
 */
export const useCrudActions = <
  TInput extends MutationInput = MutationInput,
  TResult = unknown,
>({
  resource,
  selection,
  evict,
}: CrudResourceConfig) => {
  const { audit, schema = emptySchema } = useGraphqlConfig();
  const client = useApolloClient();
  const documents = useMemo(
    () => createCrudDocuments(resource, selection ?? schema[resource]),
    [resource, schema, selection],
  );
  const [createMutation] = useApolloMutation(documents.create);
  const [updateMutation] = useApolloMutation(
    documents.update ?? documents.create,
  );
  const [deleteMutation] = useApolloMutation(documents.remove);

  const save = async (
    payload: SavePayload<TInput>,
    options: SaveOptions = {},
  ): Promise<TResult> => {
    const input = sanitizeMutationInput(payload.input, audit);
    const mode = options.mode ?? (documents.update ? "update" : "create");
    const mutation = mode === "update" ? updateMutation : createMutation;
    const result = await mutation({ variables: { input } });

    evictCacheFields(client.cache, evict);

    if (mode === "update") {
      return result.data?.[`update${resource}`] as TResult;
    }

    return result.data as TResult;
  };

  const remove = async (payload: RemovePayload<TInput>): Promise<TResult> => {
    const input = sanitizeMutationInput(payload.input);
    const result = await deleteMutation({ variables: { input } });

    evictCacheFields(client.cache, evict);

    return result.data as TResult;
  };

  return {
    remove,
    save,
  };
};
