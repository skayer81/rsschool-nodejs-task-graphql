import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';

import schema from './schema.js';
import depthLimit from 'graphql-depth-limit';
import {
  createMemberTypeLoader,
  createPostLoader,
  createSubscribedToUserLoader,
  createUserLoader,
  createUserSubscribedToLoader,
} from './loaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async handler(req) {
      const { query, variables } = req.body;

      try {
        const validationErrors = validate(schema, parse(query), [depthLimit(5)]);
        if (validationErrors.length > 0) {
          return {
            errors: validationErrors,
          };
        }

        const postLoader = createPostLoader(prisma);
        const memberTypeLoader = createMemberTypeLoader(prisma);
        const userSubscribedToLoader = createUserSubscribedToLoader(prisma);
        const subscribedToUserLoader = createSubscribedToUserLoader(prisma);
        const userLoader = createUserLoader(prisma);

        const result = await graphql({
          schema: schema,
          source: query,
          variableValues: variables,
          contextValue: {
            prisma,
            dataloaders: {
              postLoader,
              memberTypeLoader,
              userSubscribedToLoader,
              subscribedToUserLoader,
              userLoader,
            },
          },
        });
        return result;
      } catch (error) {
        console.error(error);
      }
    },
  });
};

export default plugin;
