// This module can be used to serve the GraphQL endpoint
// as a lambda function

const { ApolloServer } = require('apollo-server-lambda')
const { makeAugmentedSchema } = require('neo4j-graphql-js')
const neo4j = require('neo4j-driver')

// This module is copied during the build step
// Be sure to run `npm run build`
//const { typeDefs } = require('./graphql-schema')

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  ),
  {
    encrypted: process.env.NEO4J_ENCRYPTED ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
  }
)
import { makeAugmentedSchema } from 'neo4j-graphql-js'

const typeDefs = `
type Movie {
    movieId: ID!
    title: String @search
    year: Int
    imdbRating: Float
    genres: [Genre] @relation(name: "IN_GENRE", direction: OUT)
    similar: [Movie] @cypher(
        statement: """MATCH (this)<-[:RATED]-(:User)-[:RATED]->(s:Movie) 
                      WITH s, COUNT(*) AS score 
                      RETURN s ORDER BY score DESC LIMIT {first}""")
}

type Genre {
    name: String
    movies: [Movie] @relation(name: "IN_GENRE", direction: IN)
}`

const schema = makeAugmentedSchema({ typeDefs })
const server = new ApolloServer({
  schema: makeAugmentedSchema({ typeDefs }),
  context: { driver, neo4jDatabase: process.env.NEO4J_DATABASE },
})

exports.handler = server.createHandler()
