import axios from 'axios';

export function getRepos(username: string, page: number = 1) {
    return axios.get(`https://api.github.com/users/${username}/repos`, {
        params: {
            per_page: 20,
            page: page,
        }
    });
}



