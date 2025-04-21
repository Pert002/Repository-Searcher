import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Repo } from "../../entities/repo";
import { AxiosError } from "axios";

interface ReposState {
  repos: Repo[];
  isLoading: boolean;
  error: number | null;
  endCursor: string | null;
  hasNextPage: boolean;
}

const initialState: ReposState = {
  repos: [],
  isLoading: false,
  error: null,
  endCursor: null,
  hasNextPage: true,
};

export const fetchRepos = createAsyncThunk(
  "repos/fetchRepos",
  async (
    { userName, cursor }: { userName: string; cursor?: string | null },
    { rejectWithValue }
  ) => {
    try {
      const query = `
                query ($login: String!, $perPage: Int!, $cursor: String) {
                    repositoryOwner(login: $login) {
                        ... on User {
                            repositories(first: $perPage, after: $cursor) {
                                pageInfo { hasNextPage endCursor }
                                edges { node { id name description stargazerCount url } }
                            }
                        }
                        ... on Organization {
                            repositories(first: $perPage, after: $cursor) {
                                pageInfo { hasNextPage endCursor }
                                edges { node { id name description stargazerCount url } }
                            }
                        }
                    }
                }
            `;

      const variables = {
        login: userName,
        perPage: 20,
        cursor,
      };

      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      const data = await response.json();

      if (data.errors) {
        return rejectWithValue(404);
      }

      const ownerData = data.data.repositoryOwner;
      if (!ownerData) {
        return rejectWithValue(404);
      }

      const reposData = ownerData.repositories;
      const repos = reposData.edges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        description: edge.node.description,
        stargazers_count: edge.node.stargazerCount,
        html_url: edge.node.url,
      }));

      return {
        repos,
        hasNextPage: reposData.pageInfo.hasNextPage,
        endCursor: reposData.pageInfo.endCursor,
      };
    } catch (error: any) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.status || 500);
      }
      return rejectWithValue(500);
    }
  }
);

const reposSlice = createSlice({
  name: "repos",
  initialState,
  reducers: {
    clearRepos: (state) => {
      state.repos = [];
      state.error = null;
      state.endCursor = null;
      state.hasNextPage = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRepos.fulfilled, (state, action) => {
        if (!action.meta.arg.cursor) {
          state.repos = action.payload.repos;
        } else {
          state.repos = [...state.repos, ...action.payload.repos];
        }
        state.isLoading = false;
        state.error = null;
        state.hasNextPage = action.payload.hasNextPage;
        state.endCursor = action.payload.endCursor;
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as number;
      });
  },
});

export const { clearRepos } = reposSlice.actions;
export default reposSlice.reducer;
