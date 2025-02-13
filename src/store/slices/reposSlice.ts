import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRepos } from '../../api/api';
import { Repo } from '../../entities/repo';
import { AxiosError } from 'axios';

interface ReposState {
    repos: Repo[];
    isLoading: boolean;
    error: number | null;
    currentPage: number;
    hasMorePages: boolean;
}

const initialState: ReposState = {
    repos: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    hasMorePages: true,
};

export const fetchRepos = createAsyncThunk(
    'repos/fetchRepos',
    async ({ userName, page }: { userName: string, page: number }, { rejectWithValue }) => {
        try {
            const { data } = await getRepos(userName, page);
            const hasMore = data.length === 20;
            return { repos: data, hasMorePages: hasMore };
        } catch (error: any) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.status || 500);
            }
            return rejectWithValue(500);
        }
    }
);

const reposSlice = createSlice({
    name: 'repos',
    initialState,
    reducers: {
        clearRepos: (state) => {
            state.repos = [];
            state.error = null;
            state.currentPage = 1;
            state.hasMorePages = true;
        },
        incrementPage: (state) => {
          state.currentPage += 1;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRepos.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRepos.fulfilled, (state, action) => {
                if (state.currentPage === 1) {
                    state.repos = action.payload.repos;
                  } else {
                    state.repos = [...state.repos, ...action.payload.repos];
                  }
                state.isLoading = false;
                state.error = null;
                state.hasMorePages = action.payload.hasMorePages;
            })
            .addCase(fetchRepos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as number;
            });
    },
});

export const { clearRepos, incrementPage } = reposSlice.actions;
export default reposSlice.reducer;