import { GraphQLSchema } from 'graphql';
import { queryType } from './query.js';
import { mutationType } from './mutation.js';

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

export default schema;
