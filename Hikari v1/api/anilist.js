import { GraphQLClient, gql } from "graphql-request";

const client = new GraphQLClient("https://graphql.anilist.co");

export const getTrendingAnime = async () => {
  const query = gql`
    query {
      Page(page: 1, perPage: 12) {
        media(sort: TRENDING_DESC, type: ANIME) {
          id
          title { romaji }
          coverImage { large }
        }
      }
    }
  `;
  const data = await client.request(query);
  return data.Page.media;
};
