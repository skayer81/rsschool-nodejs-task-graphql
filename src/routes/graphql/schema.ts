import { GraphQLSchema } from 'graphql';
import { queryType } from './query.js'; // } from './queries'; // Импортируйте ваш queryType
import { mutationType } from './mutation.js'; // Импортируйте ваш mutationType

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

export default schema;
