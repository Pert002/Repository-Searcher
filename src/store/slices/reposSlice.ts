import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Repo } from "../../entities/repo";
import { AxiosError } from "axios";

interface ReposState {
  repos: Repo[];
  isLoading: boolean;
  error: number | null;
  endCursor: string | null;
  hasMorePages: boolean;
}

const initialState: ReposState = {
  repos: [],
  isLoading: false,
  error: null,
  endCursor: null,
  hasMorePages: true,
};

export const fetchRepos = createAsyncThunk(
  "repos/fetchRepos",
  async (
    { userName, cursor }: { userName: string; cursor?: string },
    { rejectWithValue }
  ) => {
    try {
      const query = `
                query ($userName: String!, $perPage: Int!, $cursor: String) {
                    user(login: $userName) {
                        repositories(first: $perPage, after: $cursor) {
                            pageInfo {
                                hasMorePages
                                endCursor
                            }
                            edges {
                                node {
                                    id
                                    name
                                    description
                                    stargazerCount
                                    url
                                }
                            }
                        }
                    }
                }
            `;

      const variables = {
        userName,
        perPage: 20,
        cursor,
      };

      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      const data = await response.json();

      if (data.errors) {
        return rejectWithValue(404);
      }

      if (!data.data.user) {
        return rejectWithValue(404);
      }

      const reposData = data.data.user.repositories;
      const repos = reposData.edges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        description: edge.node.description,
        stargazers_count: edge.node.stargazerCount,
        html_url: edge.node.url,
      }));

      return {
        repos,
        hasMorePages: reposData.pageInfo.hasMorePages,
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
      state.hasMorePages = true;
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
        state.hasMorePages = action.payload.hasMorePages;
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
